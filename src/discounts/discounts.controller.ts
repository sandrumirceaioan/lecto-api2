import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, SetMetadata } from '@nestjs/common';
import { DiscountsService } from './discounts.service';

@SetMetadata('roles', 'admin')
@Controller('discounts')
export class DiscountsController {
    constructor(
        private discountsService: DiscountsService
    ) { }


}
