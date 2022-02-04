import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationPortalComponent } from './validation-portal.component';

describe('ValidationPortalComponent', () => {
  let component: ValidationPortalComponent;
  let fixture: ComponentFixture<ValidationPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
