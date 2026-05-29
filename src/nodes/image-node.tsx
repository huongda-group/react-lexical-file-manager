import type { JSX } from 'react';
import { DecoratorNode, type EditorConfig, type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread } from 'lexical';
import { sanitizeUrl } from '../utils/sanitize-url';

type Alignment = 'left' | 'center' | 'right';

function normalizeAlignment(value: unknown): Alignment {
  return value === 'center' || value === 'right' ? value : 'left';
}

function normalizeDimension(value: unknown): number | undefined {
  const num = typeof value === 'string' ? Number(value) : value;
  return typeof num === 'number' && Number.isFinite(num) && num > 0 ? num : undefined;
}

export type SerializedImageNode = Spread<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption: string;
  alignment: 'left' | 'center' | 'right';
}, SerializedLexicalNode>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string;
  __width: number | undefined;
  __height: number | undefined;
  __caption: string;
  __alignment: 'left' | 'center' | 'right';

  static getType(): string {
    return 'file-manager-image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__width, node.__height, node.__caption, node.__alignment, node.__key);
  }

  static importJSON(data: SerializedImageNode): ImageNode {
    return $createImageNode(data);
  }

  constructor(
    src: string,
    alt: string,
    width?: number,
    height?: number,
    caption = '',
    alignment: 'left' | 'center' | 'right' = 'left',
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
    this.__caption = caption;
    this.__alignment = alignment;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: 'file-manager-image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
      alignment: this.__alignment
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
    return (
      <ImageNodeComponent src={this.__src} alt={this.__alt} width={this.__width} height={this.__height} caption={this.__caption} alignment={this.__alignment} />
    );
  }
}

interface ImageNodeComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption: string;
  alignment: 'left' | 'center' | 'right';
}

const JUSTIFY_MAP: Record<'left' | 'center' | 'right', string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end'
};

function ImageNodeComponent(props: ImageNodeComponentProps): JSX.Element {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: JUSTIFY_MAP[props.alignment], margin: '8px 0' }}>
      <img src={sanitizeUrl(props.src)} alt={props.alt} width={props.width} height={props.height} style={{ maxWidth: '100%', borderRadius: 4 }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      {props.caption && (
        <span style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>{props.caption}</span>
      )}
    </span>
  );
}

export function $createImageNode(props: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  alignment?: 'left' | 'center' | 'right';
}): ImageNode {
  return new ImageNode(typeof props.src === 'string' ? props.src : '', props.alt ?? '', normalizeDimension(props.width), normalizeDimension(props.height), props.caption ?? '', normalizeAlignment(props.alignment));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
