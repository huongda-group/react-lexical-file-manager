import { describe, it, expect, beforeEach } from 'vitest';
import { createEditor } from 'lexical';
import { $createFileNode, FileNode } from '../../src/nodes/file-node';
import type { SerializedFileNode } from '../../src/nodes/file-node';

let editor: ReturnType<typeof createEditor>;

beforeEach(() => {
  editor = createEditor({ nodes: [FileNode] });
});

describe('FileNode', () => {
  it('getType returns file-manager-file', () => {
    expect(FileNode.getType()).toBe('file-manager-file');
  });

  it('exportJSON includes all fields', () => {
    let json: SerializedFileNode | null = null;

    editor.update(() => {
      const node = $createFileNode({
        url: 'https://cdn.example.com/report.pdf',
        name: 'Q4-Report.pdf',
        mimeType: 'application/pdf',
        size: 2516582
      });
      json = node.exportJSON();
    });

    expect(json).toMatchObject({
      type: 'file-manager-file',
      version: 1,
      url: 'https://cdn.example.com/report.pdf',
      name: 'Q4-Report.pdf',
      mimeType: 'application/pdf',
      size: 2516582
    });
  });

  it('importJSON roundtrip', () => {
    let result: SerializedFileNode | null = null;

    editor.update(() => {
      const original = $createFileNode({
        url: 'https://cdn.example.com/data.zip',
        name: 'data.zip',
        mimeType: 'application/zip'
      });
      const restored = FileNode.importJSON(original.exportJSON());
      result = restored.exportJSON();
    });

    expect(result).toMatchObject({
      type: 'file-manager-file',
      url: 'https://cdn.example.com/data.zip',
      name: 'data.zip'
    });
  });

  it('size and mimeType are optional', () => {
    let json: SerializedFileNode | null = null;

    editor.update(() => {
      const node = $createFileNode({ url: 'https://cdn.example.com/x', name: 'x' });
      json = node.exportJSON();
    });

    expect(json!.size).toBeUndefined();
    expect(json!.mimeType).toBeUndefined();
  });
});
