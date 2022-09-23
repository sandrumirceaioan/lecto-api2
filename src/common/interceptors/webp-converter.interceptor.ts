import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as sharp from 'sharp';

export const WebpInterceptor = (
	fileDestination: string,
	size: number = 400,
) => {
	let interceptor = class WebpInterceptor implements NestInterceptor {
		async intercept(
			context: ExecutionContext,
			next: CallHandler,
		): Promise<Observable<any>> {
			const reqFile = context.switchToHttp().getRequest().file;

			if (reqFile) {
				const photoName = reqFile.originalname.split('.')[0];

				await sharp(`${reqFile.destination}/${reqFile.originalname}`)
					.webp()
					.toFile(`${fileDestination}/${photoName}.webp`);

				await sharp(`${reqFile.destination}/${reqFile.originalname}`)
					.resize({
						width: size,
						fit: sharp.fit.cover
					})
					.webp()
					.toFile(
						`${fileDestination}/${photoName}-small.webp`,
					);

				await sharp(`${reqFile.destination}/${reqFile.originalname}`)
					.webp()
					.toFile(
						`${fileDestination}/${photoName}-banner.webp`,
					);
			}

			return next.handle();
		}
	};

	return interceptor;
};

export const WebpsInterceptor = (
	...fileDetails: { field: string; destination: string }[]
) => {
	let interceptor = class WebpInterceptor implements NestInterceptor {
		async intercept(
			context: ExecutionContext,
			next: CallHandler,
		): Promise<Observable<any>> {
			const reqFiles = context.switchToHttp().getRequest().files;

			if (reqFiles) {
				for (const fileDetail of fileDetails) {
					if (reqFiles[fileDetail.field]) {
						for(const reqFile of reqFiles[fileDetail.field]) {
						const photoName = reqFile.originalname.split('.')[0];

						await sharp(`${reqFile.destination}/${reqFile.originalname}`)
							.webp()
							.toFile(`${fileDetail.destination}/${photoName}.webp`);

						await sharp(`${reqFile.destination}/${reqFile.originalname}`)
							.resize({
								width: 400,
								fit: sharp.fit.cover
							})
							.webp()
							.toFile(
								`${fileDetail.destination}/${photoName}-small.webp`,
							);

						await sharp(`${reqFile.destination}/${reqFile.originalname}`)
							.resize({
								width: 950,
								height: 250,
								fit: sharp.fit.cover
							})
							.webp()
							.toFile(
								`${fileDetail.destination}/${photoName}-banner.webp`,
							);
						}
					}
				}
			}

			return next.handle();
		}
	};

	return interceptor;
};
