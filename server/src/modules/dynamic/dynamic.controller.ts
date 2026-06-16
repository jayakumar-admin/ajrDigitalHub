import { Request, Response } from 'express';
import { BaseService } from '../../core/base.service';
import { z } from 'zod';
import { successResponse, errorResponse } from '../../utils/response';

const CollectionSchema = z.string().regex(/^[a-z0-9_]+$/i);

export const dynamicController = {
  async getAll(req: Request, res: Response): Promise<any> {
    try {
      const col = CollectionSchema.parse(req.params['collection']);
      const service = new BaseService(col);
      
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const search = req.query['search'] as string;
      const sortBy = req.query['sortBy'] as string;
      const order = (req.query['order'] as string === 'ASC' ? 'ASC' : 'DESC');
      
      // Extract filters from query params (everything except our pagination/search/sort keys)
      const specialKeys = ['page', 'limit', 'search', 'sortBy', 'order'];
      const filters: Record<string, any> = {};
      Object.entries(req.query).forEach(([key, val]) => {
        if (!specialKeys.includes(key)) filters[key] = val;
      });

      const { data, meta } = await service.findAll({ page, limit, search, sortBy, order, filters });
      
      const singletonCollections = ['landing_config', 'website_config', 'rate_limiter', 'settings'];
      if (singletonCollections.includes(col)) {
        return res.json(successResponse(data[0] || {}));
      }

      return res.json({
        success: true,
        data,
        meta
      });
    } catch (err: any) {
      console.error(`Dynamic GET ALL error [${req.params['collection']}]:`, err);
      return res.json(successResponse([]));
    }
  },

  async getOne(req: Request, res: Response): Promise<any> {
    try {
      const col = CollectionSchema.parse(req.params['collection']);
      const id = req.params['id'] as string;
      const service = new BaseService(col);
      const data = await service.findOne(id);
      if (!data) return res.status(404).json(errorResponse('Record not found', 404));
      return res.json(successResponse(data));
    } catch (err: any) {
      const status = err instanceof z.ZodError ? 400 : 500;
      return res.status(status).json(errorResponse(err.message, status));
    }
  },

  async create(req: Request, res: Response): Promise<any> {
    try {
      const col = CollectionSchema.parse(req.params['collection']);
      const service = new BaseService(col);
      const data = await service.create(req.body);
      return res.status(201).json(successResponse(data));
    } catch (err: any) {
      const status = err instanceof z.ZodError ? 400 : 500;
      return res.status(status).json(errorResponse(err.message, status));
    }
  },

  async update(req: Request, res: Response): Promise<any> {
    try {
      const col = CollectionSchema.parse(req.params['collection']);
      const id = req.params['id'] as string;
      const service = new BaseService(col);
      const data = await service.update(id, req.body);
      if (!data) return res.status(404).json(errorResponse('Record not found', 404));
      return res.json(successResponse(data));
    } catch (err: any) {
      const status = err instanceof z.ZodError ? 400 : 500;
      return res.status(status).json(errorResponse(err.message, status));
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const col = CollectionSchema.parse(req.params['collection']);
      const id = req.params['id'] as string;
      const service = new BaseService(col);
      const success = await service.delete(id);
      return res.json(successResponse({ success }));
    } catch (err: any) {
      const status = err instanceof z.ZodError ? 400 : 500;
      return res.status(status).json(errorResponse(err.message, status));
    }
  }
};
