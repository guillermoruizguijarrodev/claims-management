import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { getErrorMessage } from '../../shared/utils/error.helper';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DamageFields } from '../damage-fields/damage-fields';
import { TooltipModule } from 'primeng/tooltip';
import { Claim, Damage } from '../../core/generated';
import { ClaimsService, DamagesService } from '../../core/generated/api/api';

@Component({
  selector: 'app-claims-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    DamageFields,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './claims-detail.html'
})
export class ClaimsDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private claimsService = inject(ClaimsService);
  private damageService = inject(DamagesService);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // --- STATE ---
  claim = signal<Claim | null>(null);

  isEditable = computed(() => {
    const c = this.claim();
    return c ? c.status === 'PENDING' : false;
  });

  totalAmount = computed(() => {
    const currentClaim = this.claim();
    if (!currentClaim || !currentClaim.damages) return 0;
    return currentClaim.damages.reduce((acc, curr) => acc + (curr.price || 0), 0);
  });

  // --- STATUS CHANGE (REACTIVE FORM) ---
  displayStatusDialog = false;
  
  // Reactive control for status
  statusControl = new FormControl<string>('', { nonNullable: true });

  statusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Finished', value: 'FINISHED' }
  ];

  /**
   * Opens the status dialog and sets the current status in the control.
   */
  openStatusDialog() {
    const current = this.claim();
    if (current) {
        this.statusControl.setValue(current.status); 
        this.displayStatusDialog = true;
    }
  }

  /**
   * Saves the new status and updates the claim.
   */
  saveStatus() {
      const newStatus = this.statusControl.value;
      this.updateStatus(newStatus as "PENDING" | "FINISHED" | "IN_REVIEW");
      this.displayStatusDialog = false;
  }

  // --- DAMAGE DIALOG STATE ---
  displayDialog: boolean = false;
  isEditing: boolean = false;
  currentDamageId: string | null = null; 
  damageForm: FormGroup = DamageFields.createForm(this.fb);

  /**
   * Initializes the component and fetches the claim by ID.
   */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchClaim(id);
    }
  }

  /**
   * Fetches the claim details by ID.
   * @param id The ID of the claim to fetch.
   */
  fetchClaim(id: string) {
    this.claimsService.getClaimById(id).subscribe({
      next: (data) => this.claim.set(data),
      error: (err) => console.error('Error fetching claim', err)
    });
  }

  // --- ACTIONS ---

  /**
   * Opens the dialog to add a new damage.
   */
  showAddDialog() {
    this.isEditing = false;
    this.currentDamageId = null;
    this.damageForm.reset();
    this.displayDialog = true;
  }

  /**
   * Opens the dialog to edit an existing damage.
   * @param damage The damage to edit.
   */
  showEditDialog(damage: Damage) {
    this.isEditing = true;
    this.currentDamageId = damage.id || null; 
    this.damageForm.patchValue(damage);
    this.displayDialog = true;
  }

  /**
   * Saves a new or updated damage.
   */
  saveDamage() {
    if (this.damageForm.invalid || !this.isEditable()) {
      if (!this.isEditable()) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Only pending claims can be modified.' });
      }
      return;
    }

    const currentClaim = this.claim();
    if (!currentClaim) return;

    const formValue = this.damageForm.value;

    if (this.isEditing && this.currentDamageId) {
      this.damageService.updateDamage(currentClaim.id, this.currentDamageId, formValue)
        .subscribe({
          next: (updatedClaim) => {
            this.claim.set(updatedClaim); 
            this.displayDialog = false;
            this.messageService.add({severity:'success', summary:'Updated', detail:'Damage updated successfully'});
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity:'error',
              summary:'Error',
              detail: getErrorMessage(err)
            });
          }
        });

    } else {
      this.damageService.addDamage(currentClaim.id, formValue)
        .subscribe({
          next: (updatedClaim) => {
            this.claim.set(updatedClaim);
            this.displayDialog = false;
            this.messageService.add({severity:'success', summary:'Saved', detail:'New damage added successfully'});
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity:'error',
              summary:'Error',
              detail: getErrorMessage(err)});
          }
        });
    }
  }

  /**
   * Updates the status of the claim.
   * @param newStatus The new status to set.
   */
  updateStatus(newStatus: "PENDING" | "FINISHED" | "IN_REVIEW") {
    const currentClaim = this.claim();
    if (!currentClaim) return;
    if (currentClaim.status === newStatus) return;

    const updatedClaimPayload: Claim = {
      ...currentClaim,
      status: newStatus
    };

    this.claimsService.updateClaim(currentClaim.id, updatedClaimPayload).subscribe({
        next: (updatedClaim) => {
            this.claim.set(updatedClaim);
            this.messageService.add({
                severity: 'success', 
                summary: 'Status Updated', 
                detail: `Claim is now ${newStatus}`
            });
        },
        error: (err) => {
            console.error(err);
            this.messageService.add({
                severity: 'error', 
                summary: 'Error', 
                detail: getErrorMessage(err)
            });
        }
    });
  }

  /**
   * Deletes a damage from the claim.
   * @param damage The damage to delete.
   */
  deleteDamage(damage: Damage) {
    if (!this.isEditable()) return;
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this damage?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const currentClaim = this.claim();
        
        if (!currentClaim || !damage.id) {
             this.messageService.add({severity:'error', summary:'Error', detail:'Invalid Damage ID'});
             return;
        }

        this.damageService.deleteDamage(currentClaim.id, damage.id).subscribe({
            next: (updatedClaim) => {
                this.claim.set(updatedClaim);
                this.messageService.add({severity:'success', summary:'Deleted', detail:'Damage removed'});
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                  severity:'error',
                  summary:'Error',
                  detail: getErrorMessage(err)
                });
            }
        });
      }
    });
  }

  /**
   * Gets the color associated with a claim's status.
   * @param status The status of the claim.
   * @returns The color associated with the status.
   */
  getSeverityColor(status: string): 'success' | 'warn' | 'danger' | 'info' | undefined {
     const s = status ? status.toUpperCase() : '';
     if (s === 'FINISHED') return 'success';
     if (s === 'PENDING') return 'warn';
     if (s === 'IN_REVIEW') return 'info';
     return undefined; 
  }
}