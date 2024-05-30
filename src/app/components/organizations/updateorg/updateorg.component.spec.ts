import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateorgComponent } from './updateorg.component';

describe('UpdateorgComponent', () => {
  let component: UpdateorgComponent;
  let fixture: ComponentFixture<UpdateorgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateorgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateorgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
