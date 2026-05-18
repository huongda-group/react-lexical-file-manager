import { describe, it, expect, beforeEach } from 'vitest';
import { createEditor } from 'lexical';
import { $createImageNode, ImageNode } from '../../src/nodes/image-node';

let editor: ReturnType<typeof createEditor>;

beforeEach(() => {
  editor = createEditor({ nodes: [ImageNode] });
});

describe('ImageNode', () => {
  it('getType returns file-manager-image', () => {
    expect(ImageNode.getType()).toBe('file-manager-image');
  });

  it('exportJSON includes all fields', () => {
    let json: ReturnType<InstanceType<typeof ImageNode>['exportJSON']> | null = null;

    editor.update(() => {
      const node = $createImageNode({
        src: 'https://cdn.example.com/img.jpg',
        alt: 'A photo',
        width: 1920,
        height: 1080,
        caption: 'Sunset',
        alignment: 'center'
      });
      json = node.exportJSON();
    });

    expect(json).toMatchObject({
      type: 'file-manager-image',
      version: 1,
      src: 'https://cdn.example.com/img.jpg',
      alt: 'A photo',
      width: 1920,
      height: 1080,
      caption: 'Sunset',
      alignment: 'center'
    });
  });

  it('importJSON creates matching node (roundtrip)', () => {
    let result: ReturnType<InstanceType<typeof ImageNode>['exportJSON']> | null = null;

    editor.update(() => {
      const original = $createImageNode({
        src: 'https://cdn.example.com/img.jpg',
        alt: 'A photo',
        width: 800,
        height: 600,
        caption: '',
        alignment: 'left'
      });

      const restored = ImageNode.importJSON(original.exportJSON());
      result = restored.exportJSON();
    });

    expect(result).toMatchObject({
      type: 'file-manager-image',
      src: 'https://cdn.example.com/img.jpg',
      alt: 'A photo',
      width: 800,
      height: 600,
      caption: '',
      alignment: 'left'
    });
  });

  it('defaults alt to empty string and alignment to left', () => {
    let json: ReturnType<InstanceType<typeof ImageNode>['exportJSON']> | null = null;

    editor.update(() => {
      const node = $createImageNode({ src: 'https://cdn.example.com/img.jpg' });
      json = node.exportJSON();
    });

    expect(json!.alt).toBe('');
    expect(json!.alignment).toBe('left');
    expect(json!.caption).toBe('');
  });

  it('clone produces identical node', () => {
    let originalJson: ReturnType<InstanceType<typeof ImageNode>['exportJSON']> | null = null;
    let clonedJson: ReturnType<InstanceType<typeof ImageNode>['exportJSON']> | null = null;

    editor.update(() => {
      const node = $createImageNode({ src: 'https://cdn.example.com/x.jpg', alt: 'X' });
      const cloned = ImageNode.clone(node);
      originalJson = node.exportJSON();
      clonedJson = cloned.exportJSON();
    });

    expect(clonedJson).toEqual(originalJson);
  });
});
