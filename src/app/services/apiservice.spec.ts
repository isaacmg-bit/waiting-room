import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ApiService } from './apiservice';

const mockHttp = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    vi.clearAllMocks();

    Object.values(mockHttp).forEach((fn) => fn.mockReturnValue(of({})));

    TestBed.configureTestingModule({
      providers: [ApiService, { provide: HttpClient, useValue: mockHttp }],
    });

    service = TestBed.inject(ApiService);
  });

  it('should call http.get with the correct url', () => {
    service.get('/api/test');
    expect(mockHttp.get).toHaveBeenCalledWith('/api/test');
  });

  it('should call http.post with the correct url and body', () => {
    service.post('/api/test', { name: 'Alice' });
    expect(mockHttp.post).toHaveBeenCalledWith('/api/test', { name: 'Alice' });
  });

  it('should call http.put with the correct url and body', () => {
    service.put('/api/test', { name: 'Bob' });
    expect(mockHttp.put).toHaveBeenCalledWith('/api/test', { name: 'Bob' });
  });

  it('should call http.patch with the correct url and body', () => {
    service.patch('/api/test', { name: 'Charlie' });
    expect(mockHttp.patch).toHaveBeenCalledWith('/api/test', { name: 'Charlie' });
  });

  it('should call http.delete with the correct url', () => {
    service.delete('/api/test/1');
    expect(mockHttp.delete).toHaveBeenCalledWith('/api/test/1');
  });

  it('should return the observable from http.get', async () => {
    mockHttp.get.mockReturnValue(of({ id: 1 }));
    await new Promise<void>((resolve) => {
      service.get('/api/test').subscribe((result) => {
        expect(result).toEqual({ id: 1 });
        resolve();
      });
    });
  });

  it('should return the observable from http.post', async () => {
    mockHttp.post.mockReturnValue(of({ id: 2 }));
    await new Promise<void>((resolve) => {
      service.post('/api/test', {}).subscribe((result) => {
        expect(result).toEqual({ id: 2 });
        resolve();
      });
    });
  });
});
