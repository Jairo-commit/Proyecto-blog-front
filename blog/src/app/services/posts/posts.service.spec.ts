import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { PostsService } from './posts.service';
import { enviroment } from '@enviroments/enviroment';
import { CommentsAuthor, LikesAuthor, PaginatedPosts, Post, PostDTO } from '@models/post.model';

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  const mockCommentsAuthor: CommentsAuthor[] = [
    {
      id: 1,
      user: 'user1',
      post: '1',
      post_id: 1,
      content: 'Primer comentario',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      user: 'user2',
      post: '1',
      post_id: 1,
      content: 'Segundo comentario',
      created_at: new Date().toISOString()
    }
  ];
  
  const mockLikesAuthor: LikesAuthor[] = [
    {
      id: 1,
      post: '1',
      post_id: 1,
      user: 'user1'
    },
    {
      id: 2,
      post: '1',
      post_id: 1,
      user: 'user2'
    }
  ];
  const mockPosts: Post[] = [
    {
      id: 1,
      title: 'Primer Post',
      content: 'Contenido del primer post',
      excerpt: 'Resumen del primer post',
      author: 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_groups: ['grupo1', 'grupo2'],
      public_access: 'read',
      authenticated_access: 'read',
      group_access: 'write',
      author_access: 'admin',
      likes_author: mockLikesAuthor,
      Comments_author: mockCommentsAuthor,
      permission_level: 2
    },
    {
      id: 2,
      title: 'Segundo Post',
      content: 'Contenido del segundo post',
      excerpt: 'Resumen del segundo post',
      author: 'user2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_groups: ['grupo3'],
      public_access: 'none',
      authenticated_access: 'read',
      group_access: 'read',
      author_access: 'write',
      likes_author: [],
      Comments_author: [],
      permission_level: 1
    }
  ];
  const mockPaginatedPosts: PaginatedPosts = {
    current_page: 1,
    total_pages: 1,
    total_count: 2,
    next: null,
    previous: null,
    results: mockPosts
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PostsService
      ]
    });

    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch posts with token and update signals', () => {
    service.getPostsToken(1).subscribe(response => {
      expect(response.results.length).toBe(2);
      expect(service.posts()).toEqual(mockPosts);
      expect(service.pagination()).toEqual({
        current_page: 1,
        total_pages: 1,
        total_count: 2,
        next: null,
        previous: null
      });
    });

    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/?page=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPaginatedPosts);
  });

  it('should fetch posts without token and update state', () => {
    service.getPosts().subscribe(response => {
      expect(service.posts()).toEqual(mockPosts);
      expect(service.pagination()?.total_count).toBe(2);
    });

    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/?page=1`);
    req.flush(mockPaginatedPosts);
  });
  
  it('should handle error when fetching posts without token', () => {
    service.getPosts().subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });
  
    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/?page=1`);
    req.flush({ detail: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });
  });
  

  it('should fetch a post by ID and update `post` signal', () => {
    const mockPost: Post = mockPosts[0];

    service.getPostById('1').subscribe(response => {
      expect(response).toEqual(mockPost);
      expect(service.post()).toEqual(mockPost);
    });

    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/1`);
    req.flush(mockPost);
  });

  it('should send a POST request to create a new post and return the created post', () => {
    const newPost: Post = {
      id: 3,
      title: 'Nuevo post',
      content: 'Contenido',
      excerpt: 'Contenido',
      author: 'user3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_groups: [],
      public_access: 'read',
      authenticated_access: 'read',
      group_access: 'read',
      author_access: 'admin',
      likes_author: [],
      Comments_author: [],
      permission_level: 2
    };
  
    service.create({
      title: newPost.title,
      content: newPost.content,
      public_access: newPost.public_access,
      authenticated_access: newPost.authenticated_access,
      group_access: newPost.group_access,
      author_access: newPost.author_access
    }).subscribe(response => {
      expect(response).toEqual(newPost); // backend returns full Post object
    });
  
    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/`);
    expect(req.request.method).toBe('POST');
  
    // Aseguramos que el body solo tenga los campos esperados (PostDTO)
    expect(req.request.body).toEqual({
      title: newPost.title,
      content: newPost.content,
      public_access: newPost.public_access,
      authenticated_access: newPost.authenticated_access,
      group_access: newPost.group_access,
      author_access: newPost.author_access
    });
  
    req.flush(newPost); // Simula respuesta del backend
  });
  
  
  it('should update the post and return the updated post', () => {
    const updatedPostDTO: PostDTO = {
      title: 'Título actualizado',
      content: 'Contenido actualizado',
      public_access: 'read',
      authenticated_access: 'read',
      group_access: 'write',
      author_access: 'admin'
    };
  
    const updatedPostResponse: Post = {
      ...mockPosts[0],
      title: updatedPostDTO.title,
      content: updatedPostDTO.content,
      updated_at: new Date().toISOString()
    };
  
    service.update('1', updatedPostDTO).subscribe(response => {
      expect(response).toEqual(updatedPostResponse); 
    });
  
    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/1/`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedPostDTO);
    req.flush(updatedPostResponse); 
  });
  

  it('should delete a post', () => {
    service.eliminate(1).subscribe(response => {
      expect(response).toBeNull(); // si el backend devuelve 204
    });

    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/1/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle 400 Bad Request error when updating a post', () => {
    const invalidPostDTO: Partial<PostDTO> = {
      title: '',  // Campo inválido: vacío
      content: '' // Campo inválido: vacío
      // faltan los campos de acceso
    };
  
    service.update('1', invalidPostDTO as PostDTO).subscribe({
      next: () => fail('Expected a 400 error'),
      error: (error) => {
        expect(error.status).toBe(400); // no importa el error que me mande el back, lo maneja correctamente????
        expect(error.error).toEqual({ detail: 'No importa el mensaje' }); 
      }
    });
  
    const req = httpMock.expectOne(`${enviroment.API_URL}api/post/1/`);
    expect(req.request.method).toBe('PUT');
    req.flush(
      { detail: 'No importa el mensaje' }, // Simulamos una respuesta JSON de error
      { status: 400, statusText: 'Bad Request' }
    );
  });
  
})

