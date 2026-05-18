import type { FileItem } from '../types';
import { $createImageNode, ImageNode } from './image-node';
import { $createVideoNode, VideoNode } from './video-node';
import { $createFileNode, FileNode } from './file-node';

export function $createNodeForFile(file: FileItem): ImageNode | VideoNode | FileNode {
  const mime = file.mimeType ?? '';
  const url = file.url ?? '';

  if (mime.startsWith('image/')) {
    return $createImageNode({ src: url, alt: file.name });
  }

  if (mime.startsWith('video/')) {
    return $createVideoNode({ src: url, poster: file.thumbnailUrl });
  }

  return $createFileNode({
    url: url,
    name: file.name,
    mimeType: mime || undefined,
    size: file.size
  });
}
