import { Request, Response } from 'express';
import { uploadService } from '../../services/upload.service';
import { successResponse, errorResponse } from '../../utils/response';

export const uploadController = {
  async uploadImage(req: Request, res: Response): Promise<any> {
    try {
      if (!req.file) {
        return res.status(400).json(errorResponse('No image provided', 400));
      }

      const url = await uploadService.uploadImage(req.file);
      return res.json(successResponse({ url }));
    } catch (err: any) {
      console.error('Upload error:', err);
      return res.status(500).json(errorResponse(err.message));
    }
  }
};
