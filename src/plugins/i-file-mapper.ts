import type { IFile } from '@huongda-group/react-file-manager';
import type { FileItem } from '../types';

export function fileItemToIFile(f: FileItem): IFile {
  // Strip trailing slashes so a parent like '/docs/' does not yield '/docs//name'.
  const parent = f.path === '/' ? '' : f.path.replace(/\/+$/, '');
  return {
    _id: f.id,
    name: f.name,
    isDirectory: f.type === 'folder',
    path: `${parent}/${f.name}`,
    updatedAt: '',
    size: f.size,
    mimeType: f.mimeType,
    url: f.url,
    thumbnailUrl: f.thumbnailUrl
  };
}

export function iFileToFileItem(f: IFile): FileItem {
  // Normalize trailing slashes so the parent of '/docs//x' or '/docs/' resolves
  // back to '/docs' rather than a slash-padded variant that breaks path equality.
  const normalized = (f.path ?? '').replace(/\/+$/, '');
  const lastSlash = normalized.lastIndexOf('/');
  const parentPath = lastSlash <= 0 ? '/' : normalized.substring(0, lastSlash);
  return {
    id: f._id,
    name: f.name,
    type: f.isDirectory ? 'folder' : 'file',
    path: parentPath,
    mimeType: typeof f['mimeType'] === 'string' ? f['mimeType'] : undefined,
    url: typeof f['url'] === 'string' ? f['url'] : undefined,
    size: f.size,
    thumbnailUrl: typeof f['thumbnailUrl'] === 'string' ? f['thumbnailUrl'] : undefined
  };
}
