import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_EDITOR, $insertNodes } from 'lexical';
import { ImageNode } from '../nodes/image-node';
import { VideoNode } from '../nodes/video-node';
import { FileNode } from '../nodes/file-node';
import { OPEN_FILE_MANAGER_COMMAND, INSERT_FILE_COMMAND } from '../commands';
import { $createNodeForFile } from '../nodes/select-node';
import { FileManagerModal } from './file-manager-modal';
import type { FileManagerAdapter } from '../adapters/types';
import type { FileItem, FileManagerPermissions, FileManagerAppearance, FileManagerLabels } from '../types';
import type { LexicalEditor } from 'lexical';

export const FILE_MANAGER_NODES = [
  ImageNode,
  VideoNode,
  FileNode
] as const;

interface FileManagerPluginProps {
  adapter: FileManagerAdapter;
  onFileSelect?: (file: FileItem, editor: LexicalEditor) => void;
  defaultDisplayMode?: 'modal' | 'fullscreen';
  permissions?: FileManagerPermissions;
  appearance?: FileManagerAppearance;
  language?: string;
  labels?: FileManagerLabels;
}

export function FileManagerPlugin(props: FileManagerPluginProps): JSX.Element | null {
  const editor = useLexicalComposerContext()[0];
  const [isOpen, setIsOpen] = useState(false);
  const defaultDisplayMode = props.defaultDisplayMode ?? 'modal';
  const [displayMode, setDisplayMode] = useState<'modal' | 'fullscreen'>(defaultDisplayMode);

  // Keep the latest onFileSelect in a ref so the INSERT command registers once
  // (an inline onFileSelect would otherwise re-register on every render).
  const onFileSelectRef = useRef(props.onFileSelect);
  onFileSelectRef.current = props.onFileSelect;

  useEffect(() => {
    if (!editor.hasNode(ImageNode) || !editor.hasNode(VideoNode) || !editor.hasNode(FileNode)) {
      throw new Error('[react-lexical-file-manager] Add FILE_MANAGER_NODES to your LexicalComposer initialConfig.nodes array.');
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      OPEN_FILE_MANAGER_COMMAND,
      () => {
        // Reset to the configured default each open so a prior fullscreen toggle
        // does not leak into the next session.
        setDisplayMode(defaultDisplayMode);
        setIsOpen(true);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, defaultDisplayMode]);

  useEffect(() => {
    return editor.registerCommand(
      INSERT_FILE_COMMAND,
      (file) => {
        const onFileSelect = onFileSelectRef.current;
        if (onFileSelect) {
          try {
            onFileSelect(file, editor);
          } catch (err) {
            console.warn('[react-lexical-file-manager] onFileSelect threw:', err);
          }
        } else if (file.url == null || file.url === '') {
          console.warn('[react-lexical-file-manager] Skipped insert: file has no url.', file);
        } else {
          editor.update(() => {
            $insertNodes([$createNodeForFile(file)]);
          });
        }
        setIsOpen(false);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  if (!isOpen) {
    return null;
  }

  return (
    <FileManagerModal adapter={props.adapter} displayMode={displayMode} onDisplayModeChange={setDisplayMode} onClose={() => { setIsOpen(false); }} permissions={props.permissions} appearance={props.appearance} language={props.language} labels={props.labels} />
  );
}
