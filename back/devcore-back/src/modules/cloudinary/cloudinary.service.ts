import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { normalize } from 'path';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | undefined> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile_pictures',
          public_id: file.originalname.split('.')[0],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // Método Específico para Certificados
  async uploadCertificate(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | undefined> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'certificates', // Carpeta específica
          // Opcional: podrías querer permitir PDFs, etc.
          resource_type: 'auto',
          public_id: file.originalname,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | undefined> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'lessons_videos',
          public_id: file.originalname,
        },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadLessonDocument(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | undefined> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'lessons_documents',
          resource_type: 'auto',
          public_id: file.originalname,
        },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
