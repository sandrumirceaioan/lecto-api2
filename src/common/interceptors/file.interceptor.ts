import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HttpException, HttpStatus } from '@nestjs/common';

export const fileInterceptor = (
	fileName: string,
	location: string,
) => {
	return FileInterceptor(fileName, {
		storage: diskStorage({
			destination: function (req, file, callback) {
				callback(null, location);
			},
			filename: (req, file, cb) => {
				// const datetimestamp = Date.now();
				cb(null, file.originalname);
			},
		}),
		fileFilter: (req, file, callback) => {
			if (!file.originalname.match(/\.(jpg|jpeg|png|ico)$/)) {
				return callback(
					new HttpException(
						'Only image files are allowed',
						HttpStatus.BAD_REQUEST,
					),
					false,
				);
			}
			callback(null, true);
		},
	});
};

export const filesInterceptor = (
	...files: { name: string, location: string, maxCount: 1 }[]
) => {
	return FileFieldsInterceptor(files, {
		storage: diskStorage({
			destination: function (req, file, callback) {
				callback(null, files.find(f => f.name == file.fieldname).location);
			},
			filename: (req, file, cb) => {
				// const datetimestamp = Date.now();
				cb(null, file.originalname);
			},
		}),
		fileFilter: (req, file, callback) => {
			if (!file.originalname.match(/\.(jpg|jpeg|png|ico)$/)) {
				return callback(
					new HttpException(
						'Only image files are allowed',
						HttpStatus.BAD_REQUEST,
					),
					false,
				);
			}
			callback(null, true);
		},
	});
};
