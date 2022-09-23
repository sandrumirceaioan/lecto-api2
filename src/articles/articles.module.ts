import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { CategoriesModule } from '../categories/categories.module';
import { ArticlesController } from './articles.controller';
import { Article, ArticleSchema } from './articles.schema';
import { ArticlesService } from './articles.service';
import { SitesModule } from '../sites/sites.module';
import { WidgetsModule } from '../widgets/widgets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema }
    ]),
    forwardRef(() => CategoriesModule),
    forwardRef(() => UsersModule),
    forwardRef(() => SitesModule),
    forwardRef(() => WidgetsModule),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService]
})
export class ArticlesModule { }
