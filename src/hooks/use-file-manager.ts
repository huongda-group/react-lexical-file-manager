import { useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OPEN_FILE_MANAGER_COMMAND, INSERT_FILE_COMMAND } from '../commands';
import type { FileItem } from '../types';

export function useFileManager(): { open: () => void; insert: (file: FileItem) => void } {
  const editor = useLexicalComposerContext()[0];

  const open = useCallback(() => {
    editor.dispatchCommand(OPEN_FILE_MANAGER_COMMAND, undefined);
  }, [editor]);

  const insert = useCallback((file: FileItem) => {
    editor.dispatchCommand(INSERT_FILE_COMMAND, file);
  }, [editor]);

  return {
    open: open,
    insert: insert
  };
}
