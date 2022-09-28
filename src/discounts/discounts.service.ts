import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SharedService } from '../common/modules/shared/shared.service';
import { pick } from 'lodash';
import { Discount, DiscountDocument } from './discounts.schema';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.schema';

@Injectable()
export class DiscountsService {
    constructor(
        @InjectModel(Discount.name) private discountModel: Model<DiscountDocument>,
        private sharedService: SharedService,
        private usersService: UsersService
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

    // HELPERS

    public async populateDiscountFields(discounts: Discount[], ...methods: Array<string>) {
        for await (const method of methods) {
            if (method === 'users') {
                discounts = await this.attachUsersToDiscounts(discounts);
            }
        }
        return discounts;
    }

    public async attachUsersToDiscounts(discounts: Discount[]): Promise<Discount[]> {
        const users: User[] = await this.usersService.find({}, { select: 'email' });

        return discounts.map((discount) => {
            discount.createdBy = users.find((user: User) => (<any>user)._id.toString() === discount.createdBy).email;
            return discount;
        });
    }
}
