import { Request, Response } from 'express';
import { BaseService } from '../../core/base.service';

const settingsService = new BaseService('settings');

export const settingsController = {
  async getByKey(req: Request, res: Response): Promise<any> {
    try {
      const key = req.params['key'] as string;
      const data = await settingsService.findOne(key);
      if (!data) return res.status(404).json({ success: false, error: 'Settings not found' });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateAdmin(req: Request, res: Response): Promise<any> {
    try {
      const key = req.params['key'] as string;
      const existing = await settingsService.findOne(key);
      
      let result;
      if (existing) {
        result = await settingsService.update(existing.id, req.body);
      } else {
        result = await settingsService.create({ ...req.body, key });
      }
      
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
