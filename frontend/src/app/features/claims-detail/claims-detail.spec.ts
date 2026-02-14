import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsDetail } from './claims-detail';

describe('ClaimsDetail', () => {
  let component: ClaimsDetail;
  let fixture: ComponentFixture<ClaimsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
