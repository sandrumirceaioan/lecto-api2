import { Body, Controller, Get, HttpException, HttpStatus, Post, HttpCode } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorators';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types/auth.types';
import { JwtPayload } from './types/jwt-payload.types';
import { JwtService } from '@nestjs/jwt';
import { GetCurrentUserId } from '../common/decorators/current-user-id.decorator';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

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
    @HttpCode(HttpStatus.CREATED)
    @Post('/local/register')
    async localRegister(@Body() body: RegisterRequest): Promise<RegisterResponse> {
        return await this.authService.localRegister(body);
    }

    // login
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('/local/login')
    async localLogin(@Body() body: LoginRequest) {
        return await this.authService.localLogin(body);
    }

    // logout
    @Post('/local/logout')
    async logout(@GetCurrentUserId() userId: string) {
        return await this.authService.logout(userId);
    }

    // refresh
    @Public()
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
    @Post('/local/verify')
    @HttpCode(HttpStatus.OK)
    async verifyToken(
        @GetCurrentUserId() userId: string
    ) {
        return await this.usersService.findById(userId);
    }





}


