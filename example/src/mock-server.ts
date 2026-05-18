import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import type { FileItem } from 'react-lexical-file-manager';

let idCounter = 100;
function nextId(): string {
  return String(++idCounter);
}

const FILES_BY_PATH: Record<string, FileItem[]> = {
  '/': [
    { id: '1', name: 'photos', type: 'folder', path: '/' },
    { id: '2', name: 'videos', type: 'folder', path: '/' },
    { id: '3', name: 'documents', type: 'folder', path: '/' },
    {
      id: '4',
      name: 'hero-banner.jpg',
      type: 'file',
      path: '/',
      mimeType: 'image/jpeg',
      url: 'https://picsum.photos/seed/hero/1200/600',
      thumbnailUrl: 'https://picsum.photos/seed/hero/300/150',
      size: 204800
    },
    {
      id: '5',
      name: 'promo-video.mp4',
      type: 'file',
      path: '/',
      mimeType: 'video/mp4',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/promo/300/150',
      size: 1048576
    }
  ],
  '/photos': [
    {
      id: '10',
      name: 'product-1.jpg',
      type: 'file',
      path: '/photos',
      mimeType: 'image/jpeg',
      url: 'https://picsum.photos/seed/product1/800/800',
      thumbnailUrl: 'https://picsum.photos/seed/product1/150/150',
      size: 102400
    },
    {
      id: '11',
      name: 'product-2.jpg',
      type: 'file',
      path: '/photos',
      mimeType: 'image/jpeg',
      url: 'https://picsum.photos/seed/product2/800/800',
      thumbnailUrl: 'https://picsum.photos/seed/product2/150/150',
      size: 98304
    },
    {
      id: '12',
      name: 'product-3.png',
      type: 'file',
      path: '/photos',
      mimeType: 'image/png',
      url: 'https://picsum.photos/seed/product3/800/800',
      thumbnailUrl: 'https://picsum.photos/seed/product3/150/150',
      size: 131072
    },
    {
      id: '13',
      name: 'lifestyle-1.jpg',
      type: 'file',
      path: '/photos',
      mimeType: 'image/jpeg',
      url: 'https://picsum.photos/seed/life1/1200/800',
      thumbnailUrl: 'https://picsum.photos/seed/life1/300/200',
      size: 256000
    },
    {
      id: '14',
      name: 'lifestyle-2.jpg',
      type: 'file',
      path: '/photos',
      mimeType: 'image/jpeg',
      url: 'https://picsum.photos/seed/life2/1200/800',
      thumbnailUrl: 'https://picsum.photos/seed/life2/300/200',
      size: 245760
    },
    {
      id: '15',
      name: 'banner-square.jpg',
      type: 'file',
      path: '/photos',
      mimeType: 'image/jpeg',
      url: 'https://picsum.photos/seed/square/600/600',
      thumbnailUrl: 'https://picsum.photos/seed/square/150/150',
      size: 153600
    }
  ],
  '/videos': [
    {
      id: '20',
      name: 'big-buck-bunny.mp4',
      type: 'file',
      path: '/videos',
      mimeType: 'video/mp4',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/bbb/300/170',
      size: 5242880
    },
    {
      id: '21',
      name: 'product-demo.mp4',
      type: 'file',
      path: '/videos',
      mimeType: 'video/mp4',
      url: 'https://www.w3schools.com/html/movie.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/demo/300/170',
      size: 2097152
    },
    {
      id: '22',
      name: 'brand-spot.webm',
      type: 'file',
      path: '/videos',
      mimeType: 'video/webm',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/brand/300/170',
      size: 3145728
    }
  ],
  '/documents': [
    {
      id: '30',
      name: 'brand-guidelines.pdf',
      type: 'file',
      path: '/documents',
      mimeType: 'application/pdf',
      url: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
      size: 2516582
    },
    {
      id: '31',
      name: 'product-spec.pdf',
      type: 'file',
      path: '/documents',
      mimeType: 'application/pdf',
      url: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
      size: 1048576
    },
    {
      id: '32',
      name: 'price-list.xlsx',
      type: 'file',
      path: '/documents',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 51200
    }
  ]
};

const mutableFiles: Record<string, FileItem[]> = Object.fromEntries(
  Object.entries(FILES_BY_PATH).map(([k, v]) => [k, [...v]])
);

function getFiles(path: string): FileItem[] {
  return mutableFiles[path] ?? [];
}

export const worker = setupWorker(
  http.get('http://localhost:4000/', ({ request }) => {
    const url = new URL(request.url);
    const path = url.searchParams.get('path') ?? '/';
    return HttpResponse.json(getFiles(path));
  }),

  http.post('http://localhost:4000/upload', async ({ request }) => {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (file == null) return HttpResponse.json([]);
    const id = nextId();
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const objectUrl = URL.createObjectURL(file);
    const newItem: FileItem = {
      id,
      name: file.name,
      type: 'file',
      path: '/',
      mimeType: file.type,
      url: objectUrl,
      thumbnailUrl: isImage || isVideo ? objectUrl : undefined,
      size: file.size
    };
    mutableFiles['/'] = [...(mutableFiles['/'] ?? []), newItem];
    return HttpResponse.json([newItem]);
  }),

  http.delete('http://localhost:4000/', () => new HttpResponse(null, { status: 204 })),

  http.post('http://localhost:4000/folder', async ({ request }) => {
    const body = await request.json() as { name?: string; path?: string };
    const parentPath = body.path ?? '/';
    const name = body.name ?? 'New Folder';
    const folderPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    const newFolder: FileItem = { id: nextId(), name, type: 'folder', path: parentPath };
    mutableFiles[parentPath] = [...(mutableFiles[parentPath] ?? []), newFolder];
    mutableFiles[folderPath] = [];
    return new HttpResponse(null, { status: 201 });
  })
);
