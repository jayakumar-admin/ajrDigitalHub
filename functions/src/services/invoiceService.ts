import puppeteer from 'puppeteer';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const invoiceService = {
  async generateInvoice(appId: string, usageData: any, amount: number) {
    // 1. Fetch template
    const templateResult = await query(
      `SELECT data FROM records WHERE collection = 'settings' AND data->>'key' = 'invoice_template'`
    );
    let htmlTemplate = '<h1>Invoice</h1><p>Amount: {{amount}}</p>';
    if (templateResult.rows.length > 0) {
      htmlTemplate = templateResult.rows[0].data.value || htmlTemplate;
    }

    // 2. Inject dynamic data
    let htmlContent = htmlTemplate
      .replace('{{appId}}', appId)
      .replace('{{amount}}', amount.toString())
      .replace('{{usage_api}}', usageData.api?.toString() || '0')
      .replace('{{usage_whatsapp}}', usageData.whatsapp?.toString() || '0');

    // 3. Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' as any });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 4. Store file URL
    const bucket = admin.storage().bucket();
    const filename = `invoices/${uuidv4()}.pdf`;
    const file = bucket.file(filename);
    await file.save(pdfBuffer, {
      metadata: { contentType: 'application/pdf' }
    });
    
    // Make public or get signed URL
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return publicUrl;
  }
};
