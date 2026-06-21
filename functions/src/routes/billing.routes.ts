import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';

const router = Router();

router.post('/run', billingController.runBilling);
router.get('/invoices', billingController.getInvoices);
router.post('/invoice/send', billingController.sendInvoiceWhatsApp);
router.post('/invoice/mark-paid', billingController.markPaid);

export default router;
