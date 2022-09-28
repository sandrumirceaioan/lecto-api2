import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, SetMetadata } from '@nestjs/common';
import { GetCurrentUserId } from '../common/decorators/current-user-id.decorator';
import { SharedService } from '../common/modules/shared/shared.service';
import { Discount } from './discounts.schema';
import { DiscountsService } from './discounts.service';
import { DiscountsPaginated } from './discounts.types';

@SetMetadata('roles', 'admin')
@Controller('discounts')
export class DiscountsController {

    constructor(
        private discountsService: DiscountsService,
        private sharedService: SharedService
    ) { }

    // GET DISCOUNTS
    @HttpCode(HttpStatus.OK)
    @Get('/paginated')
    async getPaginatedDiscounts(@Query() params): Promise<DiscountsPaginated> {
        let { skip, limit, sort, direction, search } = params;

        let query: any = {};

        if (search) {
            query = Object.assign(query, {
                $or: [
                    { categorie: new RegExp(search, 'i') },
                    { descriere: new RegExp(search, 'i') },
                ],
            });
        }

        let options: any = {
            skip: skip ? parseInt(skip) : 0,
            limit: limit ? parseInt(limit) : 10,
        };

        if (sort && direction) {
            if (sort === 'category') sort = 'categorie';
            if (sort === 'status') sort = 'activ';
            options = Object.assign(options, {
                sort: {
                    [sort]: direction === 'asc' ? 1 : -1
                }
            });
        };

        let [discounts, total] = await Promise.all([
            this.discountsService.find(query, options),
            this.discountsService.count(query)
        ]);

        discounts = await this.discountsService.populateDiscountFields(discounts, 'users');

        return { discounts, total };
    }

    // GET ALL DISCOUNTS
    @HttpCode(HttpStatus.OK)
    @Get('/')
    async getDiscounts() {
        return await this.discountsService.find({});
    }

    // GET ONE DISCOUNT
    @HttpCode(HttpStatus.OK)
    @Get('/:id')
    async getDiscount(
        @Param('id') id: string,
    ) {
        return await this.discountsService.findById(id);
    }

    // CREATE DISCOUNT
    @HttpCode(HttpStatus.OK)
    @Post('/create')
    async createDiscount(
        @Body() body: Discount,
        @GetCurrentUserId() userId: string,
    ) {
        return await this.discountsService.save({
            ...body,
            createdBy: userId,
        });
    }

    // UPDATE DISCOUNT
    @HttpCode(HttpStatus.OK)
    @Put('/:id')
    async updateDiscount(
        @Param('id') id: string,
        @Body() body: Discount,
        @GetCurrentUserId() userId: string,
    ) {
        return await this.discountsService.findByIdAndUpdate(id, {
            ...body,
            createdBy: userId,
        });
    }

    // DELETE DISCOUNT
    @HttpCode(HttpStatus.OK)
    @Delete('/:id')
    async deleteDiscount(@Param('id') id: string) {
        return await this.discountsService.remove(id);
    }
}
