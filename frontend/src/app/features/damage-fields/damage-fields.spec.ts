import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamageFields } from './damage-fields';

describe('DamageFields', () => {
  let component: DamageFields;
  let fixture: ComponentFixture<DamageFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DamageFields]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DamageFields);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
