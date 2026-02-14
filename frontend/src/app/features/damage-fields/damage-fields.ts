import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DamageSeverity } from '../../core/generated';

@Component({
  selector: 'app-damage-fields',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule
  ],
  templateUrl: './damage-fields.html'
})
export class DamageFields {

  @Input({ required: true }) group!: FormGroup;

  severityOptions = [
    { label: 'Low', value: DamageSeverity.Low },
    { label: 'Mid', value: DamageSeverity.Mid },
    { label: 'High', value: DamageSeverity.High }
  ];

  /**
   * Form structure for a single damage entry. This can be used to create new FormGroups for each damage in the ClaimForm.
   * @param fb 
   * @returns 
   */
  static createForm(fb: FormBuilder): FormGroup {
    return fb.group({
      part: ['', Validators.required],
      severity: [null, Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required]
    });
  }
}