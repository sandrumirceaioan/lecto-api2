import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorators';
import { SharedService } from '../common/modules/shared/shared.service';
import { User } from './users.schema';
import { UsersService } from './users.service';
import { UsersPaginated } from './users.types';

@SetMetadata('roles', 'admin')
@Controller('users')

export class UsersController {

    constructor(
        private usersService: UsersService,
        private sharedService: SharedService
    ) { }

    // GET USERS
    @HttpCode(HttpStatus.OK)
    @Get('/paginated')
    async getPaginatedUsers(@Query() params): Promise<UsersPaginated> {
        const { search } = params;

        let query: any = {};

        if (search) {
            query = Object.assign(query, {
                $or: [
                    { firstName: new RegExp(search, 'i') },
                    { lastName: new RegExp(search, 'i') },
                    { email: new RegExp(search, 'i') },
                ],
            });
        }

        const options: any = this.sharedService.getOptions(params);

        const [users, total] = await Promise.all([
            this.usersService.find(query, options),
            this.usersService.count(query)
        ]);

        return { users, total };
    }

    // GET ALL USERS
    @HttpCode(HttpStatus.OK)
    @Get('/')
    async getUsers() {
        return await this.usersService.find({});
    }

    // GET ONE USER
    @HttpCode(HttpStatus.OK)
    @Get('/:id')
    async getUser(
        @Param('id') id: string,
    ) {
        return await this.usersService.findById(id);
    }

    // UPDATE USER
    @HttpCode(HttpStatus.OK)
    @Put('/:id')
    async updateUser(
        @Param('id') id: string,
        @Body() body: User,
    ) {
        return await this.usersService.findByIdAndUpdate(id, body);
    }

    // DELETE USER
    @HttpCode(HttpStatus.OK)
    @Delete('/:id')
    async deleteUser(@Param('id') id: string) {
        return await this.usersService.remove(id);
    }
}