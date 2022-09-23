import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CategorieDiscount, DiscountFidelitate, DiscountInscriere, DiscountVolum } from './discounts.types';

export type DiscountDocument = Discount & Document;

@Schema()
export class Discount {
    @Prop({ required: true })
    categorie: CategorieDiscount;

    @Prop()
    volum?: DiscountVolum[];

    @Prop()
    inscriere?: DiscountInscriere[];

    @Prop()
    fidelitate?: DiscountFidelitate[];

    @Prop()
    descriere: string;

    @Prop()
    createdBy?: string;

    @Prop({ default: new Date() })
    createdAt?: Date;

    @Prop({ default: new Date() })
    updatedAt?: Date;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);