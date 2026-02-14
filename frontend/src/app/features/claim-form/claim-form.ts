import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClaimsService } from '../../core/generated/api/api';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { DamageFields } from '../damage-fields/damage-fields';

@Component({
  selector: 'app-claim-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputNumberModule,
    DividerModule,
    DamageFields
  ],
  templateUrl: './claim-form.html'
})
export class ClaimForm {
  private fb = inject(FormBuilder);
  private claims = inject(ClaimsService);
  private router = inject(Router);

  // Main Form Group
  claimForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    // FormArray for dynamic damages
    damages: this.fb.array([]) 
  });

  // Helper to get the FormArray as a typed object in the template
  get damagesArray(): FormArray {
    return this.claimForm.get('damages') as FormArray;
  }

  /**
   * Adds a new Damage FormGroup to the Array
   */
  addDamage() {
    const damageGroup = DamageFields.createForm(this.fb);
    this.damagesArray.push(damageGroup);
  }

  /**
   * Removes a damage by index
   */
  removeDamage(index: number) {
    this.damagesArray.removeAt(index);
  }

  /**
   * Submits the form
   */
  onSubmit() {
    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    // Prepare the payload
    const formValue = this.claimForm.value;
    
    // Call the service
    this.claims.createClaim(formValue).subscribe({
      next: (createdClaim) => {
        console.log('Created:', createdClaim);
        // Navigate back to the list
        this.router.navigate(['/']);
      },
      error: (err) => console.error('Error creating claim', err)
    });
  }
}