import { describe, it, expect, beforeEach } from 'vitest';
import { createEditor } from 'lexical';
import { $createVideoNode, VideoNode } from '../../src/nodes/video-node';
import type { SerializedVideoNode } from '../../src/nodes/video-node';

let editor: ReturnType<typeof createEditor>;

beforeEach(() => {
  editor = createEditor({ nodes: [VideoNode] });
});

describe('VideoNode', () => {
  it('getType returns file-manager-video', () => {
    expect(VideoNode.getType()).toBe('file-manager-video');
  });

  it('exportJSON includes all fields', () => {
    let json: SerializedVideoNode | null = null;

    editor.update(() => {
      const node = $createVideoNode({
        src: 'https://cdn.example.com/video.mp4',
        poster: 'https://cdn.example.com/thumb.jpg',
        controls: true,
        autoplay: false,
        loop: true
      });
      json = node.exportJSON();
    });

    expect(json).toMatchObject({
      type: 'file-manager-video',
      version: 1,
      src: 'https://cdn.example.com/video.mp4',
      poster: 'https://cdn.example.com/thumb.jpg',
      controls: true,
      autoplay: false,
      loop: true
    });
  });

  it('importJSON roundtrip', () => {
    let result: SerializedVideoNode | null = null;

    editor.update(() => {
      const original = $createVideoNode({ src: 'https://cdn.example.com/clip.mp4' });
      const restored = VideoNode.importJSON(original.exportJSON());
      result = restored.exportJSON();
    });

    expect(result).toMatchObject({
      type: 'file-manager-video',
      src: 'https://cdn.example.com/clip.mp4'
    });
  });

  it('defaults: controls true, autoplay false, loop false', () => {
    let json: SerializedVideoNode | null = null;

    editor.update(() => {
      const node = $createVideoNode({ src: 'https://cdn.example.com/clip.mp4' });
      json = node.exportJSON();
    });

    expect(json!.controls).toBe(true);
    expect(json!.autoplay).toBe(false);
    expect(json!.loop).toBe(false);
  });
});
