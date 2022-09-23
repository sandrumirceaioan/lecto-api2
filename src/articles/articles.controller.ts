import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Inject,
	Param,
	Post,
	Put,
	Query,
	Req,
	Request,
	SetMetadata,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';

import { Public } from '../common/decorators/public.decorators';

import { SharedService } from '../common/modules/shared/shared.service';
import { Article } from './articles.schema';
import { ArticlesService } from './articles.service';


import { GetCurrentUserId } from '../common/decorators/current-user-id.decorator';
import { fileInterceptor } from '../common/interceptors/file.interceptor';
import * as _ from 'lodash';
import { Request as ExpressRequest } from 'express';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { WebpInterceptor } from '../common/interceptors/webp-converter.interceptor';

import { GetCurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/users.schema';


@SetMetadata('roles', 'admin')
@Controller('articles')
export class ArticlesController {
	protocol: string;

	constructor(
		private articlesService: ArticlesService,
		private sharedService: SharedService,
		private usersService: UsersService,
		private configService: ConfigService,
	) {
		this.protocol = this.configService.get('PROTOCOL');
	}

	async onModuleInit() {
		// cu asta am incercat: https://www.npmjs.com/package/ssh2-sftp-client
		//await this.prerenderArticles();
	}

	// GET ARTICLES
	@HttpCode(HttpStatus.OK)
	@Get('/paginated')
	async getSites(
		@Query() params,
		@Request() req: ExpressRequest,
		@GetCurrentUser() user: User,
	) {
		// let { search } = params;

		// const { sites: userSites } = await this.sitesService.getUserSites(
		// 	(<any>user).id,
		// 	(<any>user).email,
		// );

		// let query: any = {
		// 	site: {
		// 		$in: userSites.map((site: any) => site._id),
		// 	},
		// };

		// if (search) {
		// 	query = Object.assign(query, {
		// 		$or: [
		// 			{ title: new RegExp(search, 'i') },
		// 			{ url: new RegExp(search, 'i') },
		// 		],
		// 	});
		// }

		// const options: any = this.sharedService.getOptions(params);

		// let articles = await this.articlesService.find(query, options);
		// const total = await this.articlesService.find(query);

		// articles = await this.articlesService.populateArticleFields(
		// 	articles,
		// 	'categories',
		// 	{ action: 'permissions', data: { sites: userSites, user } },
		// 	'users',
		// 	{ action: 'thumbnails', data: { req, protocol: this.protocol } },
		// 	{ action: 'sites', data: { sites: userSites } },
		// );

		// return { articles, total };
	}

	// GET ALL ARTICLES
	@HttpCode(HttpStatus.OK)
	@Get('/')
	async getAllArticles(@GetCurrentUser() user: User, @Request() req) {



		return;
	}

	// GET ONE ARTICLE
	@HttpCode(HttpStatus.OK)
	@Get('/:id')
	async getArticle(@Param('id') id: string, @Request() req) {
		let article = await this.articlesService.findById({ _id: id });
		article = (
			await this.articlesService.populateArticleFields(
				[article],
				'widgets',
				{
					action: 'thumbnails',
					data: { req, protocol: this.protocol },
				},
			)
		)[0];

		return article;
	}

	// CREATE ARTICLE
	@UseInterceptors(
		fileInterceptor('thumbnail', 'assets/articles'),
		WebpInterceptor('assets/public/articles'),
	)
	@HttpCode(HttpStatus.OK)
	@Post('/create')
	async createArticle(
		@Body() body: any,
		@UploadedFile() file: { logo: Express.Multer.File },
		@GetCurrentUserId() userId: string,
	) {
		body.thumbnail = file ? file['originalname'] : null;

		if (body.content && body.content.indexOf('<p data-f-id')) {
			body.content = body.content.split('<p data-f-id')[0];
		}

		return await this.articlesService.save({ ...body, createdBy: userId });
	}

	// UPLOAD ARTICLE IMAGE
	@UseInterceptors(
		fileInterceptor('file', 'assets/articles'),
		WebpInterceptor('assets/public/articles'),
	)
	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('/image')
	async uploadImage(
		@Body() body,
		@UploadedFile() file: { logo: Express.Multer.File },
		@Request() req: ExpressRequest,
	) {
		return {
			link: `${this.protocol}://${req.headers.host}/thumbnails/${
				file['originalname'].split('.')[0]
			}.webp`,
		};
	}

	// UPDATE ARTICLE
	@UseInterceptors(
		fileInterceptor('thumbnail', 'assets/articles'),
		WebpInterceptor('assets/public/articles'),
	)
	@HttpCode(HttpStatus.OK)
	@Post('/update/:id')
	async updateArticle(
		@Param('id') id: string,
		@Body() body: any,
		@UploadedFile() file: { logo: Express.Multer.File },
	) {
		console.log('BODY: ', id, body, file);
		body.thumbnail = file ? file['originalname'] : null;

		if (!body.thumbnail) {
			const thumbnail = (await this.articlesService.findById(id))
				?.thumbnail;
			body.thumbnail = thumbnail;
		}

		if (body.content && body.content.indexOf('<p data-f-id')) {
			body.content = body.content.split('<p data-f-id')[0];
		}

		return await this.articlesService.findByIdAndUpdate(id, body);
	}

	// DELETE ARTICLE
	@HttpCode(HttpStatus.OK)
	@Delete('/:id')
	async deleteArticle(@Param('id') id: string) {
		return await this.articlesService.remove(id);
	}

	// PUBLIC
	@Public()
	@HttpCode(HttpStatus.OK)
	@Get('/latest/:siteId/:limit')
	async getLatestNineArticles(
		@Param('siteId') siteId: string,
		@Param('limit') limit: string,
		@Request() req,
	) {
		let articles: Article[] = await this.articlesService.find(
			{ site: siteId },
			{
				sort: 'createdBy',
				direction: 'desc',
				limit,
			},
		);

		articles = await this.articlesService.populateArticleFields(
			articles,
			'categories',
			{ action: 'thumbnails', data: { req, protocol: this.protocol } },
		);

		return articles;
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Get('/one/:siteId/:articleUrl/')
	async getOneArticle(
		@Request() req,
		@Param('siteId') siteId: string,
		@Param('articleUrl') articleUrl: string,
	): Promise<Article> {
		let article: Article = await this.articlesService.findOne({
			site: siteId,
			url: articleUrl,
		});

		if (!article) {
			throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
		}

		article = (
			await this.articlesService.populateArticleFields(
				[article],
				'widgets',
				'categories',
				{
					action: 'thumbnails',
					data: { req, protocol: this.protocol },
				},
			)
		)[0];

		return article;
	}
}
