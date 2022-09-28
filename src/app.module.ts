import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './common/modules/shared/shared.module';
import { UsersModule } from './users/users.module';
import { AtGuard } from './common/guards/jwt-at.guard';
import { RolesGuard } from './common/guards/role.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DiscountsModule } from './discounts/discounts.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets/logos'),
      renderPath: '/logos'
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('CONNECTION_STRING'),
        useNewUrlParser: true,
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    DiscountsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule { }
