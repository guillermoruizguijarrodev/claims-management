import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClaimsService } from '../../core/generated/api/api';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Observable } from 'rxjs';
import { Claim } from '../../core/generated';

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule
  ],
  templateUrl: './claims-list.html'
})
export class ClaimsList {
  private claimsService = inject(ClaimsService);
  claims$: Observable<Claim[]> = this.claimsService.getClaims();


  /**
   * Helper function to determine the severity (color) of the status tag.
   * PrimeNG severities: 'success' | 'info' | 'warning' | 'danger'
   */
  getSeverity(status: string): 'success' | 'warn' | 'danger' | undefined {
    if (status === 'FINISHED') return 'success';
    if (status === 'PENDING') return 'warn';
    return undefined; // Default color
  }
}