import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shop-overview',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './shop-overview.html',
  styleUrl: './shop-overview.css'
})
export class ShopOverviewComponent {}
