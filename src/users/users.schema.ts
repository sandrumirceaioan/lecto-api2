import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from "@nestjs/swagger";

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'John' })
  firstName: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'user' })
  @Prop({ required: false })
  role: 'admin' | 'user';

  @Prop({ required: false })
  status: boolean;

  @Prop({ required: true })
  atHash: string;

  @Prop({ required: false })
  rtHash?: string;

  @Prop({})
  createdBy?: string;

  @Prop({ default: new Date() })
  createdAt?: Date;

  @Prop({ default: new Date() })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);