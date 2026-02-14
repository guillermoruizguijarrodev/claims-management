import { Routes } from '@angular/router';
import { ClaimsList } from './features/claims-list/claims-list';
import { ClaimsDetail } from './features/claims-detail/claims-detail';

export const routes: Routes = [
    {
      path: '',
      component: ClaimsList
    },
    {
      path: 'claims/new',
      loadComponent: () => import('./features/claim-form/claim-form').then(m => m.ClaimForm)
    },
    {
      path: 'claims/:id',
      component: ClaimsDetail
    },
    {
      path: '**',
      redirectTo: ''
    }
  ];
