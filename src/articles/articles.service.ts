import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './articles.schema';
import { SharedService } from '../common/modules/shared/shared.service';
import { pick } from 'lodash';
import { User } from '../users/users.schema';
import { Category } from '../categories/categories.schema';
import { CategoriesService } from '../categories/categories.service';
import * as _ from 'lodash';
import { UsersService } from '../users/users.service';
import { Request as ExpressRequest } from 'express';
import { Site, Users as SiteUser } from '../sites/sites.schema';
import { WidgetsService } from '../widgets/widgets.service';

@Injectable()
export class ArticlesService {
	constructor(
		@InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
		private sharedService: SharedService,
		private categoriesService: CategoriesService,
		private usersService: UsersService,
		private widgetsService: WidgetsService,
	) {}

	async save(user: Article): Promise<Article> {
		return new this.articleModel(user).save();
	}

	async find(query, options?): Promise<Article[]> {
		options = this.sharedService.validateOptions(options);
		return this.articleModel
			.find(query)
			.sort(options.sort)
			.skip(options.skip)
			.limit(options.limit)
			.select(options.select)
			.lean();
	}

	async findOne(query, options?): Promise<Article> {
		options = this.sharedService.validateOptions(options);
		return this.articleModel.findOne(query).select(options.select).lean();
	}

	async findById(id, options?): Promise<Article> {
		options = this.sharedService.validateOptions(options);
		return this.articleModel.findById(id).select(options.select).lean();
	}

	async findByIds(ids: string[], options?) {
		options = this.sharedService.validateOptions(options);
		return this.articleModel
			.find({ _id: { $in: ids } })
			.sort(options.sort)
			.skip(options.skip)
			.limit(options.limit)
			.select(options.select)
			.lean();
	}

	async findOneAndUpdate(query, update, options?): Promise<Article> {
		options = this.sharedService.validateOptions(options);
		return this.articleModel
			.findOneAndUpdate(query, update, pick(options, 'new', 'upsert'))
			.lean();
	}

	async findByIdAndUpdate(id, update, options?): Promise<Article> {
		options = this.sharedService.validateOptions(options);
		return this.articleModel
			.findByIdAndUpdate(id, update, pick(options, 'new', 'upsert'))
			.lean();
	}

	async count(query): Promise<number> {
		return this.articleModel.countDocuments(query).lean();
	}

	async remove(id) {
		return this.articleModel.findByIdAndRemove(id);
	}

	public async getArticlesCategories(
		articles: Article[],
	): Promise<Category[]> {
		const categoryIds: string[] = _.uniq(
			articles.map((article: Article) => {
				return article.category;
			}),
		);

		const categories: Category[] = await this.categoriesService.findByIds(
			categoryIds,
		);

		return categories;
	}

	public async attachCategoriesToArticles(
		articles: Article[],
	): Promise<Article[]> {
		const categories = await this.getArticlesCategories(articles);

		return articles.map((article) => {
			article.category = categories.find(
				(category: Category) =>
					(<any>category)._id.toString() === article.category,
			).name;

			return article;
		});
	}

	public async getArticlesUsers(articles: Article[]): Promise<User[]> {
		const userIds: string[] = _.uniq(
			articles.map((article: Article) => {
				return article.createdBy;
			}),
		);

		const users: User[] = await this.usersService.findByIds(userIds);

		return users;
	}

	public async attachUsersToArticles(
		articles: Article[],
	): Promise<Article[]> {
		const users: User[] = await this.getArticlesUsers(articles);

		return articles.map((article) => {
			article.createdBy = users.find(
				(user: User) =>
					(<any>user)._id.toString() === article.createdBy,
			).email;

			return article;
		});
	}

	public attachThumbnailsToArticles(
		articles: Article[],
		req: ExpressRequest,
		protocol,
	): Article[] {
		return articles.map((article: Article) => {
			const thumbnail = article.thumbnail;

			article.thumbnail = `${protocol}://${req.headers.host}/thumbnails/${
				thumbnail.split('.')[0]
			}-small.webp`;

			(<any>article).banner = `${protocol}://${
				req.headers.host
			}/thumbnails/${thumbnail.split('.')[0]}-banner.webp`;

			return article;
		});
	}

	public attachPermissionsToArticles(
		articles: Article[],
		sites: Site[],
		user: User,
	) {
		return articles.map((article: Article & { permission: string }) => {
			const articleSite: Site = sites.find(
				(site: Site) => article.site === (<any>site)._id.toString(),
			);

			if ((<any>user).id === articleSite.createdBy) {
				article.permission = 'all';
				return article;
			}

			article.permission = articleSite.users.find(
				(u: SiteUser) => u.email === user.email,
			).permission;

			return article;
		});
	}

	public attachSitesToArticles(articles: Article[], sites: Site[]) {
		return articles.map((article: Article & { permission: string }) => {
			const articleSite: Site = sites.find(
				(site: Site) => article.site === (<any>site)._id.toString(),
			);

			article.site = articleSite.domain;

			return article;
		});
	}

	public async attachWidgetsToArticle(
		articles: Article[],
	): Promise<Article[]> {
		const articleRegx = /[\[]{2}widget:[0-9a-zA-Z]{24}[\]]{2}/g;

		articles = await Promise.all(
			articles.map(async (article) => {
				let locations = _.uniq(article.content.match(articleRegx));
				const ids = locations.map((location: string) => {
					location = location
						.substring(2, location.length - 2)
						.split(':')[1];
					return location;
				});

				const widgetDetails = await Promise.all(
					ids.map(async (id: string) => {
						const widget = await this.widgetsService.findById(id, {
							select: '-createdBy -createdAt -updatedAt -__v -site',
						});

						return { ...widget, _id: (<any>widget)._id.toString() };
					}),
				);

				(<any>article).widgets = widgetDetails;

				return article;
			}),
		);

		return articles;
	}

	public async populateArticleFields(
		articles: Article[],
		...methods: Array<
			| string
			| {
					action: string;
					data: {
						req?: ExpressRequest;
						protocol?: string;
						sites?: Site[];
						user?: User;
					};
			  }
		>
	) {
		for await (const method of methods) {
			if (method === 'categories') {
				articles = await this.attachCategoriesToArticles(articles);
			}
			if (method === 'users') {
				articles = await this.attachUsersToArticles(articles);
			}
			if (method === 'widgets') {
				articles = await this.attachWidgetsToArticle(articles);
			}
			if (typeof method === 'object' && method.action === 'sites') {
				articles = await this.attachSitesToArticles(
					articles,
					method.data.sites,
				);
			}
			if (typeof method === 'object' && method.action === 'thumbnails') {
				articles = await this.attachThumbnailsToArticles(
					articles,
					method.data.req,
					method.data.protocol,
				);
			}
			if (typeof method === 'object' && method.action === 'permissions') {
				articles = await this.attachPermissionsToArticles(
					articles,
					method.data.sites,
					method.data.user,
				);
			}
		}

		return articles;
	}
}
