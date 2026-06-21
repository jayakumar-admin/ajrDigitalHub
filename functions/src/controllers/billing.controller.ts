import { Request, Response } from 'express';
import { query } from '../db';
import { billingService } from '../services/billingService';
import { whatsappService } from '../services/whatsappService';

export const billingController = {
  async runBilling(req: Request, res: Response) {
    try {
      const result = await billingService.runMonthlyBilling();
      res.json({ message: 'Billing run completed', result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getInvoices(req: Request, res: Response) {
    try {
      const result = await query(`
          SELECT b.*, a.name as app_name, a.domain 
          FROM billing b
          JOIN apps a ON b.app_id = a.id
          ORDER BY b.created_at DESC
      `);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async sendInvoiceWhatsApp(req: Request, res: Response) {
    try {
      const { phone, amount, url } = req.body;
      const result = await whatsappService.sendWhatsAppMessage(phone, [
        { type: 'text', text: amount.toString() },
        { type: 'text', text: url }
      ]);
      res.json({ message: 'WhatsApp reminder sent', result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async markPaid(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const updateResult = await query(`UPDATE billing SET status = 'paid' WHERE id = $1 RETURNING *`, [id]);
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      res.json(updateResult.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
