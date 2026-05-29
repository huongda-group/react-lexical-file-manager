import type { JSX } from 'react';
import { DecoratorNode, type EditorConfig, type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread } from 'lexical';
import { sanitizeUrl } from '../utils/sanitize-url';

export type SerializedVideoNode = Spread<{
  src: string;
  poster?: string;
  controls: boolean;
  autoplay: boolean;
  loop: boolean;
}, SerializedLexicalNode>;

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __poster: string | undefined;
  __controls: boolean;
  __autoplay: boolean;
  __loop: boolean;

  static getType(): string {
    return 'file-manager-video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.__poster, node.__controls, node.__autoplay, node.__loop, node.__key);
  }

  static importJSON(data: SerializedVideoNode): VideoNode {
    return $createVideoNode(data);
  }

  constructor(
    src: string,
    poster?: string,
    controls = true,
    autoplay = false,
    loop = false,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__poster = poster;
    this.__controls = controls;
    this.__autoplay = autoplay;
    this.__loop = loop;
  }

  exportJSON(): SerializedVideoNode {
    return {
      ...super.exportJSON(),
      type: 'file-manager-video',
      version: 1,
      src: this.__src,
      poster: this.__poster,
      controls: this.__controls,
      autoplay: this.__autoplay,
      loop: this.__loop
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
      <span style={{ display: 'block', margin: '8px 0' }}>
        <video src={sanitizeUrl(this.__src)} poster={this.__poster ? sanitizeUrl(this.__poster) : undefined} controls={this.__controls} autoPlay={this.__autoplay} muted={this.__autoplay} loop={this.__loop} style={{ maxWidth: '100%', borderRadius: 4 }} />
      </span>
    );
  }
}

export function $createVideoNode(props: {
  src: string;
  poster?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
}): VideoNode {
  return new VideoNode(typeof props.src === 'string' ? props.src : '', typeof props.poster === 'string' ? props.poster : undefined, props.controls !== false, props.autoplay === true, props.loop === true);
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}
