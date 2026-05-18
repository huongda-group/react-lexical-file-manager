import { describe, it, expect, beforeEach } from 'vitest';
import { createEditor } from 'lexical';
import { $createNodeForFile } from '../../src/nodes/select-node';
import { ImageNode } from '../../src/nodes/image-node';
import { VideoNode } from '../../src/nodes/video-node';
import { FileNode } from '../../src/nodes/file-node';
import type { FileItem } from '../../src/types';

const base: Omit<FileItem, 'mimeType'> = {
  id: '1',
  name: 'test',
  type: 'file',
  path: '/',
  url: 'https://cdn.example.com/test'
};

let editor: ReturnType<typeof createEditor>;

beforeEach(() => {
  editor = createEditor({ nodes: [ImageNode, VideoNode, FileNode] });
});

describe('$createNodeForFile', () => {
  it('image/jpeg → ImageNode', () => {
    let node: ReturnType<typeof $createNodeForFile> | null = null;
    editor.update(() => {
      node = $createNodeForFile({ ...base, mimeType: 'image/jpeg' });
    });
    expect(node).toBeInstanceOf(ImageNode);
  });

  it('image/png → ImageNode', () => {
    let node: ReturnType<typeof $createNodeForFile> | null = null;
    editor.update(() => {
      node = $createNodeForFile({ ...base, mimeType: 'image/png' });
    });
    expect(node).toBeInstanceOf(ImageNode);
  });

  it('video/mp4 → VideoNode', () => {
    let node: ReturnType<typeof $createNodeForFile> | null = null;
    editor.update(() => {
      node = $createNodeForFile({ ...base, mimeType: 'video/mp4' });
    });
    expect(node).toBeInstanceOf(VideoNode);
  });

  it('video/webm → VideoNode', () => {
    let node: ReturnType<typeof $createNodeForFile> | null = null;
    editor.update(() => {
      node = $createNodeForFile({ ...base, mimeType: 'video/webm' });
    });
    expect(node).toBeInstanceOf(VideoNode);
  });

  it('application/pdf → FileNode', () => {
    let node: ReturnType<typeof $createNodeForFile> | null = null;
    editor.update(() => {
      node = $createNodeForFile({ ...base, mimeType: 'application/pdf' });
    });
    expect(node).toBeInstanceOf(FileNode);
  });

  it('undefined mimeType → FileNode', () => {
    let node: ReturnType<typeof $createNodeForFile> | null = null;
    editor.update(() => {
      node = $createNodeForFile({ ...base, mimeType: undefined });
    });
    expect(node).toBeInstanceOf(FileNode);
  });

  it('ImageNode gets src from file.url', () => {
    let src: string | null = null;
    editor.update(() => {
      const node = $createNodeForFile({ ...base, name: 'photo.jpg', mimeType: 'image/jpeg' }) as ImageNode;
      src = node.exportJSON().src;
    });
    expect(src).toBe('https://cdn.example.com/test');
  });

  it('VideoNode gets src from file.url', () => {
    let src: string | null = null;
    editor.update(() => {
      const node = $createNodeForFile({ ...base, name: 'clip.mp4', mimeType: 'video/mp4' }) as VideoNode;
      src = node.exportJSON().src;
    });
    expect(src).toBe('https://cdn.example.com/test');
  });

  it('FileNode gets name and mimeType', () => {
    let name: string | null = null;
    let mimeType: string | null = null;
    let size: number | undefined = undefined;
    editor.update(() => {
      const node = $createNodeForFile({
        ...base,
        name: 'report.pdf',
        mimeType: 'application/pdf',
        size: 1024
      }) as FileNode;
      const json = node.exportJSON();
      name = json.name;
      mimeType = json.mimeType ?? null;
      size = json.size;
    });
    expect(name).toBe('report.pdf');
    expect(mimeType).toBe('application/pdf');
    expect(size).toBe(1024);
  });
});
