import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateCategoryComponent } from './admin-create-category.component';

describe('AdminCreateCategoryComponent', () => {
  let component: AdminCreateCategoryComponent;
  let fixture: ComponentFixture<AdminCreateCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCreateCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreateCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
