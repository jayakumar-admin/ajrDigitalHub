import { query } from '../db';
import { invoiceService } from './invoiceService';
import { whatsappService } from './whatsappService';

const API_RATE = 0.01;
const WA_RATE = 0.05;

export const billingService = {
  async runMonthlyBilling() {
    console.log('Starting monthly billing job...');
    // 1. Get all active apps
    const appsResult = await query(`
        SELECT a.id, a.name, b.usage_json, w.phone_number
        FROM apps a
        LEFT JOIN billing b ON a.id = b.app_id AND b.status = 'pending'
        LEFT JOIN whatsapp_config w ON a.id = w.app_id
        WHERE a.status = 'active'
    `);
    const apps = appsResult.rows;

    const results = [];

    for (const app of apps) {
      const appId = app.id;
      
      // 2. Calculate usage (Parse usage_json if exists)
      const usage = typeof app.usage_json === 'string' ? JSON.parse(app.usage_json) : (app.usage_json || { api: 0, whatsapp: 0 });
      // Use limits from rate_limits table (simplified default for now)
      const limits = { api: 1000, whatsapp: 100 };

      const extra_api = Math.max(0, (usage.api || 0) - limits.api);
      const extra_wa = Math.max(0, (usage.whatsapp || 0) - limits.whatsapp);

      const amount = (extra_api * API_RATE) + (extra_wa * WA_RATE);

      try {
        // 3. Generate invoice
        const invoiceUrl = await invoiceService.generateInvoice(appId, usage, amount);

        // 4. Save billing record in the explicit table
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

        await query(
          `INSERT INTO billing (app_id, usage_json, amount, status, due_date) VALUES ($1, $2, $3, 'pending', $4) RETURNING *`,
          [appId, JSON.stringify({...usage, invoiceUrl}), amount, dueDate.toISOString()]
        );

        // 5. Send WhatsApp notification if configured
        if (app.phone_number) {
          await whatsappService.sendWhatsAppMessage(app.phone_number, [
            { type: 'text', text: amount.toString() },
            { type: 'text', text: invoiceUrl }
          ]);
        }

        results.push({ appId, status: 'success', amount });
      } catch (err: any) {
        console.error(`Failed billing for app ${appId}:`, err);
        results.push({ appId, status: 'error', error: err.message });
      }
    }

    console.log('Finished monthly billing job.');
    return results;
  }
};
