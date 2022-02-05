import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetamaskMissingComponent } from './metamask-missing.component';

describe('MetamaskMissingComponent', () => {
  let component: MetamaskMissingComponent;
  let fixture: ComponentFixture<MetamaskMissingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetamaskMissingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetamaskMissingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
