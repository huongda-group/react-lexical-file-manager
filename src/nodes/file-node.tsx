import type { JSX } from 'react';
import { DecoratorNode, type EditorConfig, type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread } from 'lexical';

export type SerializedFileNode = Spread<{
  url: string;
  name: string;
  mimeType?: string;
  size?: number;
}, SerializedLexicalNode>;

export class FileNode extends DecoratorNode<JSX.Element> {
  __url: string;
  __name: string;
  __mimeType: string | undefined;
  __size: number | undefined;

  static getType(): string {
    return 'file-manager-file';
  }

  static clone(node: FileNode): FileNode {
    return new FileNode(node.__url, node.__name, node.__mimeType, node.__size, node.__key);
  }

  static importJSON(data: SerializedFileNode): FileNode {
    return $createFileNode(data);
  }

  constructor(
    url: string,
    name: string,
    mimeType?: string,
    size?: number,
    key?: NodeKey
  ) {
    super(key);
    this.__url = url;
    this.__name = name;
    this.__mimeType = mimeType;
    this.__size = size;
  }

  exportJSON(): SerializedFileNode {
    return {
      ...super.exportJSON(),
      type: 'file-manager-file',
      version: 1,
      url: this.__url,
      name: this.__name,
      mimeType: this.__mimeType,
      size: this.__size
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    span.style.display = 'contents';
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    const sizeLabel = this.__size != null ? ` · ${(this.__size / 1024).toFixed(0)} KB` : '';
    return (
      <a href={this.__url} download={this.__name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, textDecoration: 'none', color: 'inherit', fontSize: 13, margin: '4px 0' }}>
        <span>📎</span>
        <span>{this.__name}</span>
        <span style={{ color: '#718096', fontSize: 11 }}>{sizeLabel}</span>
        <span>↓</span>
      </a>
    );
  }
}

export function $createFileNode(props: {
  url: string;
  name: string;
  mimeType?: string;
  size?: number;
}): FileNode {
  return new FileNode(props.url, props.name, props.mimeType, props.size);
}

export function $isFileNode(node: LexicalNode | null | undefined): node is FileNode {
  return node instanceof FileNode;
}
