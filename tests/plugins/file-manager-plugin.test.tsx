import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { FileManagerPlugin } from '../../src/plugins/file-manager-plugin';
import { ImageNode } from '../../src/nodes/image-node';
import { VideoNode } from '../../src/nodes/video-node';
import { FileNode } from '../../src/nodes/file-node';
import { OPEN_FILE_MANAGER_COMMAND, INSERT_FILE_COMMAND } from '../../src/commands';
import type { FileItem } from '../../src/types';
import type { FileManagerAdapter } from '../../src/adapters/types';

const mockAdapter: FileManagerAdapter = {
  fetchFiles: vi.fn().mockResolvedValue([]),
  upload: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(undefined),
  createFolder: vi.fn().mockResolvedValue(undefined)
};

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LexicalComposer initialConfig={{ namespace: 'test', nodes: [ImageNode, VideoNode, FileNode], onError: (e: Error) => { throw e; }, theme: {} }}>
      {children}
    </LexicalComposer>
  );
}

function CommandDispatcher({ command, payload, onReady }: { command: typeof OPEN_FILE_MANAGER_COMMAND | typeof INSERT_FILE_COMMAND; payload?: FileItem; onReady: (dispatch: () => void) => void }) {
  const editor = useLexicalComposerContext()[0];
  useEffect(() => {
    onReady(() => {
      editor.dispatchCommand(command as typeof OPEN_FILE_MANAGER_COMMAND, payload as undefined);
    });
  }, [editor]);
  return null;
}

describe('FileManagerPlugin', () => {
  it('renders without crashing inside LexicalComposer', () => {
    expect(() =>
      render(
        <TestWrapper>
          <FileManagerPlugin adapter={mockAdapter} />
        </TestWrapper>
      )
    ).not.toThrow();
  });

  it('modal opens when OPEN_FILE_MANAGER_COMMAND is dispatched', async () => {
    let dispatch: (() => void) | undefined;

    render(
      <TestWrapper>
        <FileManagerPlugin adapter={mockAdapter} />
        <CommandDispatcher command={OPEN_FILE_MANAGER_COMMAND} onReady={(fn) => { dispatch = fn; }} />
      </TestWrapper>
    );

    await act(async () => { dispatch?.(); });

    expect(document.querySelector('[data-testid="file-manager-modal"]')).not.toBeNull();
  });

  it('calls onFileSelect when INSERT_FILE_COMMAND is dispatched and onFileSelect is provided', async () => {
    const onFileSelect = vi.fn();
    let dispatch: (() => void) | undefined;

    const file: FileItem = {
      id: '1',
      name: 'photo.jpg',
      type: 'file',
      path: '/',
      mimeType: 'image/jpeg',
      url: 'https://cdn.example.com/photo.jpg'
    };

    render(
      <TestWrapper>
        <FileManagerPlugin adapter={mockAdapter} onFileSelect={onFileSelect} />
        <CommandDispatcher command={INSERT_FILE_COMMAND} payload={file} onReady={(fn) => { dispatch = fn; }} />
      </TestWrapper>
    );

    await act(async () => { dispatch?.(); });

    expect(onFileSelect).toHaveBeenCalledWith(file, expect.any(Object));
  });
});
