import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreatePostButtonComponent } from './create-post-button.component';
import { provideRouter } from '@angular/router';
import { Routes } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

// Dummy component for routing
@Component({ template: '' })
class DummyCreatePostComponent {}

const routes: Routes = [
  { path: 'create-post', component: DummyCreatePostComponent }
];

describe('CreatePostButtonComponent', () => {
  let fixture: ComponentFixture<CreatePostButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePostButtonComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePostButtonComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render an SVG element', () => {
    const svgEl = fixture.debugElement.query(By.css('svg'));
    expect(svgEl).toBeTruthy();
  });

  it('should contain a routerLink to ./create-post', () => {
    const svgEl = fixture.debugElement.query(By.css('svg'));
    const reflectAttr = svgEl.nativeElement.getAttribute('ng-reflect-router-link');
  
    expect(reflectAttr).toBe('./create-post');
  });
  
});
