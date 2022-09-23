import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from './users.service';
import { usersSwagger } from './types/swagger.types';

@ApiTags('User Module Api')
@ApiBearerAuth('JWT')
@SetMetadata('roles', 'admin')
@Controller('users')

export class UsersController {

    constructor(
        private usersService: UsersService,
    ) { }

    @ApiResponse(usersSwagger.all.res)
    @ApiOperation({
        summary: ' - all users'
    })
    @Get('/')
    async allUsers(
    ) {
        return await this.usersService.find({});
    }

}