import '@huongda-group/react-file-manager/dist/style.css';
import { useEffect, useState, useCallback } from 'react';
import type { JSX } from 'react';
import type { CSSProperties } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FileManager } from '@huongda-group/react-file-manager';
import type { IFile } from '@huongda-group/react-file-manager';
import { INSERT_FILE_COMMAND } from '../commands';
import { fileItemToIFile, iFileToFileItem } from './i-file-mapper';
import type { FileManagerAdapter } from '../adapters/types';
import type { FileManagerPermissions, FileManagerAppearance, FileManagerLabels } from '../types';

interface FileManagerModalProps {
  adapter: FileManagerAdapter;
  displayMode: 'modal' | 'fullscreen';
  onDisplayModeChange: (mode: 'modal' | 'fullscreen') => void;
  onClose: () => void;
  permissions?: FileManagerPermissions;
  appearance?: FileManagerAppearance;
  language?: string;
  labels?: FileManagerLabels;
}

export function FileManagerModal(props: FileManagerModalProps): JSX.Element {
  const editor = useLexicalComposerContext()[0];
  const [files, setFiles] = useState<IFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);

  const loadFiles = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await props.adapter.fetchFiles(path);
      setFiles(items.map(fileItemToIFile));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [props.adapter]);

  useEffect(() => {
    loadFiles(currentPath);
  }, [loadFiles, currentPath]);

  function handleFolderChange(path: string): void {
    // react-file-manager passes "" for root; normalize to "/" for the adapter
    setCurrentPath(path === '' ? '/' : path);
    setSelectedFile(null);
  }

  function handleSelectionChange(selected: IFile[]): void {
    if (selected.length === 1 && !selected[0].isDirectory) {
      setSelectedFile(selected[0]);
    } else {
      setSelectedFile(null);
    }
  }

  function handleInsert(): void {
    if (selectedFile != null) {
      editor.dispatchCommand(INSERT_FILE_COMMAND, iFileToFileItem(selectedFile));
    }
  }

  async function handleUpload(file: File): Promise<IFile> {
    const results = await props.adapter.upload([file]);
    if (results.length === 0) {
      throw new Error('[react-lexical-file-manager] Upload returned no files.');
    }

    const mapped = results.map(fileItemToIFile);
    setFiles((prev) => [
      ...prev,
      ...mapped
    ]);
    return mapped[0];
  }

  function handleDelete(items: IFile[], _trash: boolean): void {
    props.adapter.delete(items.map(iFileToFileItem))
      .then(() => {
        const ids = new Set(items.map((f) => f._id));
        setFiles((prev) => prev.filter((f) => !ids.has(f._id)));
      })
      .catch(console.error);
  }

  function handleCreateFolder(name: string, parent: IFile | null): void {
    // parent.path is the third-party full IFile path; normalize to the adapter's
    // '/'-rooted FileItem convention (strip trailing slash, blank → root).
    const path = parent != null ? (parent.path.replace(/\/+$/, '') || '/') : currentPath;
    props.adapter.createFolder(name, path)
      .then(() => loadFiles(currentPath))
      .catch(console.error);
  }

  const isFullscreen = props.displayMode === 'fullscreen';

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: isFullscreen ? 'stretch' : 'center',
    justifyContent: 'center'
  };

  const containerStyle: CSSProperties = isFullscreen
    ? {
      width: '100%',
      height: '100%',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column'
    } : {
      width: '90vw',
      maxWidth: 1100,
      height: '80vh',
      background: '#fff',
      borderRadius: 8,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    };

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  }

  function handleToggleFullscreen(): void {
    props.onDisplayModeChange(isFullscreen ? 'modal' : 'fullscreen');
  }

  return (
    <div data-testid="file-manager-modal" style={overlayStyle} onClick={handleOverlayClick}>
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{props.labels?.title ?? 'Media Library'}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {selectedFile != null && (
              <button type="button" onClick={handleInsert} style={{ background: '#3182ce', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{props.labels?.insert ?? 'Insert'}</button>
            )}
            <button type="button" onClick={handleToggleFullscreen} aria-label={isFullscreen ? (props.labels?.exitFullscreen ?? 'Exit fullscreen') : (props.labels?.fullscreen ?? 'Fullscreen')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{isFullscreen ? '⊡' : '⛶'}</button>
            <button type="button" onClick={props.onClose} aria-label={props.labels?.close ?? 'Close'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {error != null ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <span style={{ color: '#e53e3e' }}>{error}</span>
              <button type="button" onClick={() => { loadFiles(currentPath); }}>{props.labels?.retry ?? 'Retry'}</button>
            </div>
          ) : (
            <FileManager files={files} isLoading={isLoading} height="100%" onFolderChange={handleFolderChange} onUpload={handleUpload} onDelete={handleDelete} onCreateFolder={handleCreateFolder} onRefresh={() => { loadFiles(currentPath); }} onSelectionChange={handleSelectionChange} permissions={props.permissions} theme={props.appearance?.theme} primaryColor={props.appearance?.primaryColor} fontFamily={props.appearance?.fontFamily} className={props.appearance?.className} style={props.appearance?.style} language={props.language} />
          )}
        </div>
      </div>
    </div>
  );
}
