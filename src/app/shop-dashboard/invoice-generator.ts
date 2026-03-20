import { Component, inject, signal, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  taxRate: number;
}

@Component({
  selector: 'app-invoice-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, CurrencyPipe],
  templateUrl: './invoice-generator.html',
  styleUrl: './invoice-generator.css'
})
export class InvoiceGeneratorComponent {
  authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  
  @ViewChild('invoicePreview') invoicePreview!: ElementRef;

  // Form State
  customerName = signal('');
  customerEmail = signal('');
  customerAddress = signal('');
  
  items = signal<InvoiceItem[]>([
    { id: '1', name: '', quantity: 1, price: 0, taxRate: 0 }
  ]);

  selectedTheme = signal<'modern' | 'classic' | 'bold'>('modern');

  // Computed/Static Data for Preview
  shopName = signal('AJR Digital Hub');
  shopAddress = signal('123 Tech Lane, Silicon Valley, CA 94025');
  shopEmail = signal('hello@ajrdigitalhub.com');
  invoiceNumber = signal('001');
  currentDate = new Date();
  dueDate = new Date(this.currentDate.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days

  // Totals
  subtotal = signal(0);
  taxTotal = signal(0);
  total = signal(0);

  addItem() {
    this.items.update(items => [...items, { id: Date.now().toString(), name: '', quantity: 1, price: 0, taxRate: 0 }]);
  }

  removeItem(index: number) {
    this.items.update(items => {
      const newItems = [...items];
      newItems.splice(index, 1);
      return newItems;
    });
    this.updateTotals();
  }

  updateTotals() {
    let sub = 0;
    let tax = 0;
    
    this.items().forEach(item => {
      const itemTotal = item.quantity * item.price;
      sub += itemTotal;
      tax += itemTotal * (item.taxRate / 100);
    });

    this.subtotal.set(sub);
    this.taxTotal.set(tax);
    this.total.set(sub + tax);
  }

  getThemeClasses() {
    // Return specific classes based on theme if needed for the container
    return {};
  }

  saveInvoice() {
    console.log('Saving invoice draft...');
    // Implement save to Firestore
  }

  async downloadPDF() {
    if (!isPlatformBrowser(this.platformId) || !this.invoicePreview) return;
    
    const element = this.invoicePreview.nativeElement;
    
    try {
      // Create a clone of the element to modify for PDF generation
      const clone = element.cloneNode(true) as HTMLElement;
      
      // html2canvas doesn't support oklch colors yet, which Tailwind uses.
      // We need to replace them with supported colors (e.g., hex or rgb) in the clone.
      // A simple workaround is to force a specific background color on the clone.
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#000000';
      
      // Append clone to body temporarily (off-screen) so html2canvas can render it
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff' // Force white background
      });
      
      // Remove the clone after rendering
      document.body.removeChild(clone);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${this.invoiceNumber()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }
}
