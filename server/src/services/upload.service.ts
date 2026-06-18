import { bucket } from '../config/firebase';
import { randomUUID } from 'node:crypto';

export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!bucket) {
      throw new Error('Firebase Storage bucket not initialized');
    }

    const fileName = `uploads/${randomUUID()}_${file.originalname}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      },
      resumable: false
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err: any) => {
        reject(err);
      });

      blobStream.on('finish', async () => {
        try {
          // Make the file public
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(publicUrl);
        } catch (err) {
          reject(err);
        }
      });

      blobStream.end(file.buffer);
    });
  }
}

export const uploadService = new UploadService();
