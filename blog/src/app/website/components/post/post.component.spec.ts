import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PostComponent } from './post.component';
import { LikeService } from '@services/like/like.service';
import { AuthService } from '@services/auth/auth.service';
import { PostsService } from '@services/posts/posts.service';
import { EditModeService } from '@services/edit-mode/edit-mode.service';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { LikesComponent } from '../likes/likes.component';
import { By } from '@angular/platform-browser';

import { Post } from '@models/post.model';
import { LikePaginationResponse } from '@models/like.model';
import { User } from '@models/user.model';

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;

  let likeServiceSpy: jasmine.SpyObj<LikeService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;
  let editModeServiceSpy: jasmine.SpyObj<EditModeService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPost: Post = {
    id: 1,
    title: 'Sample Post',
    content: 'Sample full content',
    excerpt: '<p>Sample excerpt</p>',
    author: 'testuser',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_groups: ['TestGroup'],
    public_access: 'all',
    authenticated_access: 'registered',
    group_access: 'group1',
    author_access: 'private',
    permission_level: 3,
    likes_author: [{ id: 101, post: '', post_id: 1, user: 'testuser' }],
    Comments_author: [{
      id: 1,
      user: 'commenter',
      post: '',
      post_id: 1,
      content: 'Great post!',
      created_at: new Date().toISOString()
    }]
  };

  const mockUser: User = { id: 0, username: 'testuser', password: 'secreto' };

  const mockLikesResponse: LikePaginationResponse = {
    total_count: 1,
    current_page: 1,
    total_pages: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 101,
        post: '',
        post_id: 1,
        user: 'testuser'
      }
    ]
  };

  beforeEach(async () => {
    likeServiceSpy = jasmine.createSpyObj('LikeService', ['getLikes', 'getLikesToken', 'addLike']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['currentUserSignal', 'isLoggedInSignal']);
    postsServiceSpy = jasmine.createSpyObj('PostsService', ['pagination', 'eliminate', 'triggerRefresh']);
    editModeServiceSpy = jasmine.createSpyObj('EditModeService', ['setEditMode']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, DatePipe, LikesComponent, RouterModule.forRoot([]), PostComponent],
      providers: [
        { provide: LikeService, useValue: likeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PostsService, useValue: postsServiceSpy },
        { provide: EditModeService, useValue: editModeServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    component.post = mockPost;

    authServiceSpy.currentUserSignal.and.returnValue(mockUser);
    authServiceSpy.isLoggedInSignal.and.returnValue(true);
    likeServiceSpy.getLikesToken.and.returnValue(of(mockLikesResponse));
    likeServiceSpy.getLikes.and.returnValue(of(mockLikesResponse));
    likeServiceSpy.addLike.and.returnValue(of({}));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set _hasLiked to true if user has liked', fakeAsync(() => {
    tick();
    expect(component._hasLiked()).toBeTrue();
  }));

  it('should show edit and delete buttons if permissionLevel > 2', () => {
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('svg'));
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should toggle showLikes on toggleLikesPopover()', () => {
    const initialState = component.showLikes();
    component.toggleLikesPopover();
    expect(component.showLikes()).toBe(!initialState);
  });

  it('should call addLike and update like data on likePost()', fakeAsync(() => {
    component._hasLiked.set(false);
    component.likePost();
    tick();
    expect(likeServiceSpy.addLike).toHaveBeenCalledWith(mockPost.id);
    expect(component._hasLiked()).toBeTrue();
    expect(component.likesPost()?.total_count).toBe(2);
  }));

  it('should navigate to edit post on goToEditPost()', () => {
    component.goToEditPost();
    expect(editModeServiceSpy.setEditMode).toHaveBeenCalledWith(true);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/posts', component.postId, 'edit-post']);
  });

  it('should toggle deleting signal', () => {
    const before = component.deleting();
    component.toggleDeleting();
    expect(component.deleting()).toBe(!before);
  });

  it('should call eliminate and refresh posts on deletePost()', fakeAsync(() => {
    postsServiceSpy.eliminate.and.returnValue(of({}));
    component.deletePost();
    tick();
    expect(postsServiceSpy.eliminate).toHaveBeenCalledWith(component.postId);
    expect(postsServiceSpy.triggerRefresh).toHaveBeenCalled();
  }));
});