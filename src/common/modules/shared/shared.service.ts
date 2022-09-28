import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SharedService {
    private mailGun: any;

    constructor(
        private configService: ConfigService,
    ) {
        this.mailGun = {
            key: this.configService.get('MAILGUN_API_KEY'),
            domain: this.configService.get('MAILGUN_DOMAIN'),
            sender: `mailgun@${this.configService.get('MAILGUN_DOMAIN')}`
        }

    }

    public validateOptions(options) {
        return {
            limit: options && options.limit || null,
            skip: options && options.skip || 0,
            sort: options && options.sort || {},
            select: options && options.select || '',
            upsert: options && options.upsert || false,
            new: options && options.new || true
        }
    }

    public getOptions(params) {
        let { skip, limit, sort, direction } = params;

        let options: any = {
            skip: skip ? parseInt(skip) : 0,
            limit: limit ? parseInt(limit) : 10,
        };

        if (sort && direction) {
            if (sort === 'name') sort = 'lastName';
            options = Object.assign(options, {
                sort: {
                    [sort]: direction === 'asc' ? 1 : -1
                }
            });
        };

        return options;
    }
}
