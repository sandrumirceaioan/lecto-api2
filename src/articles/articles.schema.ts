import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from "@nestjs/swagger";

export type ArticleDocument = Article & Document;

@Schema()
export class Article {
    @Prop({ required: true, unique: true })
    @ApiProperty({ example: 'buzzyusa.com/a-simple-article' })
    url: string;

    @Prop({ required: true })
    @ApiProperty({ example: 'A simple article' })
    title: string;

    @Prop({ required: true })
    @ApiProperty({ example: 'A simple article summary' })
    summary: string;

    @Prop({ required: false })
    @ApiProperty({ example: 'article.png' })
    thumbnail: string;

    @Prop({ required: true })
    @ApiProperty({ example: 'A simple article content' })
    content: string;

    @Prop({ required: true })
    @ApiProperty({ example: '6310afc511074333d19582ba' })
    category: string;

    @Prop({ required: true })
    @ApiProperty({ example: '4333d19582ba6310afc51107' })
    site: string;

    @ApiProperty({ example: 'buzzy, usa, other' })
    @Prop({ required: true })
    tags: string[];

    @ApiProperty({ example: 'true/false' })
    @Prop({ required: true, default: false })
    published: boolean;

    @Prop({})
    createdBy?: string;

    @Prop({ default: new Date() })
    createdAt?: Date;

    @Prop({ default: new Date() })
    updatedAt?: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);