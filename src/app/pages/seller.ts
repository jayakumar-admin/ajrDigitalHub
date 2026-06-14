import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seller-portal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './seller.html'
})
export class SellerPortalComponent {
  isSubmitted = signal(false);

  submitAsset() {
    this.isSubmitted.set(true);
    setTimeout(() => {
      this.isSubmitted.set(false);
    }, 2000);
  }
}
