import { useMemo } from 'react';
import type { JSX } from 'react';
import type { LexicalEditor } from 'lexical';
import { FileManagerPlugin } from './plugins/file-manager-plugin';
import type { FileManagerAdapter } from './adapters/types';
import type { FileItem, FileManagerPermissions, FileManagerAppearance, FileManagerLabels } from './types';

interface LexicalFileManagerPluginProps {
  adapter?: FileManagerAdapter;
  onFetchFiles?: (path: string) => Promise<FileItem[]>;
  onUpload?: (files: File[]) => Promise<FileItem[]>;
  onDelete?: (items: FileItem[]) => Promise<void>;
  onCreateFolder?: (name: string, path: string) => Promise<void>;
  defaultDisplayMode?: 'modal' | 'fullscreen';
  onFileSelect?: (file: FileItem, editor: LexicalEditor) => void;
  permissions?: FileManagerPermissions;
  appearance?: FileManagerAppearance;
  language?: string;
  labels?: FileManagerLabels;
}

export function LexicalFileManagerPlugin(props: LexicalFileManagerPluginProps): JSX.Element | null {
  // Memoize so a fresh adapter identity is not produced on every render, which
  // would otherwise drive FileManagerModal's loadFiles effect to re-fetch on
  // each parent render (and let stale in-flight fetches race the latest result).
  const adapter: FileManagerAdapter = useMemo(
    () => props.adapter ?? buildAdapter({
      onFetchFiles: props.onFetchFiles,
      onUpload: props.onUpload,
      onDelete: props.onDelete,
      onCreateFolder: props.onCreateFolder
    }),
    [props.adapter, props.onFetchFiles, props.onUpload, props.onDelete, props.onCreateFolder]
  );

  return (
    <FileManagerPlugin adapter={adapter} onFileSelect={props.onFileSelect} defaultDisplayMode={props.defaultDisplayMode} permissions={props.permissions} appearance={props.appearance} language={props.language} labels={props.labels} />
  );
}

interface BuildAdapterOpts {
  onFetchFiles?: (path: string) => Promise<FileItem[]>;
  onUpload?: (files: File[]) => Promise<FileItem[]>;
  onDelete?: (items: FileItem[]) => Promise<void>;
  onCreateFolder?: (name: string, path: string) => Promise<void>;
}

function buildAdapter(opts: BuildAdapterOpts): FileManagerAdapter {
  if (opts.onFetchFiles == null) {
    throw new Error('[react-lexical-file-manager] Provide either adapter or onFetchFiles.');
  }

  return {
    fetchFiles: opts.onFetchFiles,
    upload: opts.onUpload ?? (() => Promise.resolve([])),
    delete: opts.onDelete ?? (() => Promise.resolve()),
    createFolder: opts.onCreateFolder ?? (() => Promise.resolve())
  };
}
