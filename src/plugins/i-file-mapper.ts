import type { IFile } from '@huongda-group/react-file-manager';
import type { FileItem } from '../types';

export function fileItemToIFile(f: FileItem): IFile {
  const parent = f.path === '/' ? '' : f.path;
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
  const lastSlash = f.path.lastIndexOf('/');
  const parentPath = lastSlash <= 0 ? '/' : f.path.substring(0, lastSlash);
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
