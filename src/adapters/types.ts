import type { FileItem } from '../types';

export interface FileManagerAdapter {
  fetchFiles(path: string): Promise<FileItem[]>;
  upload(files: File[]): Promise<FileItem[]>;
  delete(items: FileItem[]): Promise<void>;
  createFolder(name: string, path: string): Promise<void>;
}
