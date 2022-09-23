import { Body, Controller, Get, HttpException, HttpStatus, Post, HttpCode } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";

import { Public } from '../common/decorators/public.decorators';
import { AuthService } from './auth.service';

import { authSwagger } from './types/auth.swagger.types';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types/auth.types';
import { JwtPayload } from './types/jwt-payload.types';
import { JwtService } from '@nestjs/jwt';
import { GetCurrentUserId } from '../common/decorators/current-user-id.decorator';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private configService: ConfigService,
        private jwtService: JwtService
    ) {
    }

    // *** LOCAL AUTH *** //

    // register
    @Public()
    @ApiBody(authSwagger.register.req)
    @ApiResponse(authSwagger.register.res)
    @ApiOperation({
        summary: ' - register user'
    })
    @HttpCode(HttpStatus.CREATED)
    @Post('/local/register')
    async localRegister(@Body() body: RegisterRequest): Promise<RegisterResponse> {
        return await this.authService.localRegister(body);
    }

    // login
    @Public()
    @ApiBody(authSwagger.login.req)
    @ApiResponse(authSwagger.login.res)
    @ApiOperation({
        summary: ' - login user'
    })
    @HttpCode(HttpStatus.OK)
    @Post('/local/login')
    async localLogin(@Body() body: LoginRequest) {
        return await this.authService.localLogin(body);
    }

    // logout
    @ApiBearerAuth('JWT')
    @ApiOperation({
        summary: ' - logout user'
    })
    @Post('/local/logout')
    async logout(@GetCurrentUserId() userId: string) {
        return await this.authService.logout(userId);
    }

    // refresh
    @Public()
    @ApiBearerAuth('JWT')
    @ApiBody(authSwagger.refresh.req)
    @ApiResponse(authSwagger.refresh.res)
    @ApiOperation({
        summary: ' - refresh user'
    })
    @Post('/local/refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(
        @Body() body: any,
    ): Promise<LoginResponse> {
        if (body.refreshToken) {
            return this.jwtService.verifyAsync(body.refreshToken, { secret: this.configService.get<any>('RT_SECRET') }).then((payload: JwtPayload) => {
                return this.authService.refreshTokens(payload.id, body.refreshToken);
            }).catch(error => {
                console.log('REFRESH ERROR: ', error.message);
                throw new HttpException('Refresh token expired', HttpStatus.BAD_REQUEST);
            });
        } else {
            throw new HttpException('Could not refresh tokens', HttpStatus.BAD_REQUEST);
        }
    }

    // verify
    @ApiBearerAuth('JWT')
    @ApiOperation({
        summary: ' - verify user'
    })
    @Post('/local/verify')
    @HttpCode(HttpStatus.OK)
    async verifyToken(
        @GetCurrentUserId() userId: string
    ) {
        return await this.usersService.findById(userId);
    }





}


