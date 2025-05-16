import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailpostComponent } from './detailpost.component';

describe('DetailpostComponent', () => {
  let component: DetailpostComponent;
  let fixture: ComponentFixture<DetailpostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailpostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailpostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
