import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirebaseButtonComponent } from './firebase-button.component';

describe('FirebaseButtonComponent', () => {
  let component: FirebaseButtonComponent;
  let fixture: ComponentFixture<FirebaseButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirebaseButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirebaseButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
