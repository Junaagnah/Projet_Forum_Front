import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexCategoryComponent } from './index-category.component';

describe('CategoryComponent', () => {
  let component: IndexCategoryComponent;
  let fixture: ComponentFixture<IndexCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
