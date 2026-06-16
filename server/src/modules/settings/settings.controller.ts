import { Request, Response } from 'express';
import { BaseService } from '../../core/base.service';

const settingsService = new BaseService('settings');

function getDefaultSettings(key: string): any {
  if (key === 'website_config') {
    return {
      key: 'website_config',
      siteName: 'AJR Hub',
      logoUrl: '',
      theme: 'light',
      globalFeatures: { maintenanceMode: false, userRegistration: true },
      features: { marketplace: true, services: true, analytics: true }
    };
  }
  if (key === 'rate_limiter') {
    return {
      key: 'rate_limiter',
      rpm: 1000,
      rph: 50000,
      burst: 200,
      enabled: true,
      status: 'safe'
    };
  }
  if (key === 'landing_config') {
    return {
      key: 'landing_config',
      heroTitle: 'Welcome to AJR Digital HUB',
      cta: 'Provision App Now',
      maintenance: false
    };
  }
  return null;
}

export const settingsController = {
  async getByKey(req: Request, res: Response): Promise<any> {
    try {
      const key = req.params['key'] as string;
      let data = await settingsService.findOne(key);
      if (!data) {
        const defaultVal = getDefaultSettings(key);
        if (defaultVal) {
          data = await settingsService.create(defaultVal);
        } else {
          return res.status(404).json({ success: false, error: 'Settings not found' });
        }
      }
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
