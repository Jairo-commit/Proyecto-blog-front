import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LikesComponent } from './likes.component';
import { By } from '@angular/platform-browser';

describe('LikesComponent', () => {
  let fixture: ComponentFixture<LikesComponent>;
  let component: LikesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikesComponent], // ✅ Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(LikesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the user name from the like', () => {
    component.likes = {
      id: 1,
      post: 'post-slug',
      post_id: 1,
      user: 'Alice Doe'
    };

    fixture.detectChanges();

    const li = fixture.debugElement.query(By.css('li')).nativeElement;
    expect(li.textContent.trim()).toBe('Alice Doe');
  });
});
