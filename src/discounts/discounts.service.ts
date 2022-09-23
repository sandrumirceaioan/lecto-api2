import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SharedService } from '../common/modules/shared/shared.service';
import { pick } from 'lodash';
import { Discount, DiscountDocument } from './discounts.schema';

@Injectable()
export class DiscountsService {
    constructor(
        @InjectModel(Discount.name) private discountModel: Model<DiscountDocument>,
        private sharedService: SharedService
    ) { }

    async save(user: Discount): Promise<Discount> {
        return new this.discountModel(user).save();
    }

    async find(query, options?): Promise<Discount[]> {
        options = this.sharedService.validateOptions(options);
        return this.discountModel.find(query).sort(options.sort).skip(options.skip).limit(options.limit).select(options.select).lean();
    }

    async findOne(query, options?): Promise<Discount> {
        options = this.sharedService.validateOptions(options);
        return this.discountModel.findOne(query).select(options.select).lean();
    }

    async findById(id, options?): Promise<Discount> {
        options = this.sharedService.validateOptions(options);
        return this.discountModel.findById(id).select(options.select).lean();
    }

    async findByIds(ids: string[], options?) {
        options = this.sharedService.validateOptions(options);
        return this.discountModel.find({ '_id': { $in: ids } }).sort(options.sort).skip(options.skip).limit(options.limit).select(options.select).lean();
    }

    async findOneAndUpdate(query, update, options?): Promise<Discount> {
        options = this.sharedService.validateOptions(options);
        return this.discountModel.findOneAndUpdate(query, update, pick(options, "new", "upsert")).lean();
    }

    async findByIdAndUpdate(id, update, options?): Promise<Discount> {
        options = this.sharedService.validateOptions(options);
        return this.discountModel.findByIdAndUpdate(id, update, pick(options, "new", "upsert")).lean();
    }

    async count(query): Promise<number> {
        return this.discountModel.countDocuments(query).lean();
    }

    async remove(id) {
        return this.discountModel.findByIdAndRemove(id);
    }
}
