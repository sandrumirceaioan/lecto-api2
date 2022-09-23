import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountsController } from './discounts.controller';
import { Discount, DiscountSchema } from './discounts.schema';
import { DiscountsService } from './discounts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Discount.name, schema: DiscountSchema }
    ]),
  ],
  controllers: [DiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService]
})
export class DiscountsModule {}
