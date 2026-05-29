# react-lexical-file-manager

A Lexical editor plugin that brings a full media library experience — image viewer, video player, and file attachments — backed by your own data source.

## Features

- Insert images, videos, and file attachments directly into the Lexical editor
- Modal and fullscreen display modes
- Single-click selection with **Insert button**, or double-click to preview
- Callback-based data layer — return `FileItem[]` from your own API calls
- Custom adapter interface for full control
- Fine-grained `permissions` to enable/disable individual actions (copy, rename, compress, etc.)
- `appearance` prop for theme, primary color, font, and custom CSS
- `language` prop — 24 locales (ar, de, en, es, fr, ja, ko, ru, vi, zh-cn, and more)
- `labels` prop — override all modal UI strings for full i18n control
- Serializable Lexical nodes with full `importJSON` / `exportJSON` support
- TypeScript-first

## Installation

```bash
npm install @huongda-group/react-lexical-file-manager
```

Peer dependencies:

```bash
npm install lexical @lexical/react react react-dom
```

Import the styles in your app entry:

```ts
import '@huongda-group/react-lexical-file-manager/style.css';
```

## Quick Start

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import {
  LexicalFileManagerPlugin,
  FileManagerToolbarButton,
  FILE_MANAGER_NODES,
} from '@huongda-group/react-lexical-file-manager';
import type { FileItem } from '@huongda-group/react-lexical-file-manager';

async function fetchFiles(path: string): Promise<FileItem[]> {
  const res = await fetch(`/api/files?path=${path}`);
  const data = await res.json();
  // map your API shape to FileItem
  return data.map(f => ({
    id: f.id,
    name: f.name,
    type: f.isFolder ? 'folder' : 'file',
    path: f.directory,
    mimeType: f.mimeType,
    url: f.url,
    thumbnailUrl: f.thumbnail,
    size: f.size,
  }));
}

export function Editor() {
  return (
    <LexicalComposer initialConfig={{ namespace: 'my-editor', nodes: [...FILE_MANAGER_NODES], onError: console.error }}>
      <FileManagerToolbarButton />
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Start typing…</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <LexicalFileManagerPlugin onFetchFiles={fetchFiles} />
    </LexicalComposer>
  );
}
```

`FILE_MANAGER_NODES` must be passed to `LexicalComposer` — it registers `ImageNode`, `VideoNode`, and `FileNode`.

## `LexicalFileManagerPlugin` Props

| Prop | Type | Description |
|------|------|-------------|
| `onFetchFiles` | `(path: string) => Promise<FileItem[]>` | **Required** (unless `adapter` is provided). Return files at the given path. |
| `onUpload` | `(files: File[]) => Promise<FileItem[]>` | Handle file uploads. Return the uploaded `FileItem[]`. |
| `onDelete` | `(items: FileItem[]) => Promise<void>` | Handle file/folder deletion. |
| `onCreateFolder` | `(name: string, path: string) => Promise<void>` | Handle folder creation. |
| `adapter` | `FileManagerAdapter` | Provide a fully custom adapter instead of individual callbacks. |
| `defaultDisplayMode` | `'modal' \| 'fullscreen'` | Initial display mode. Default: `'modal'`. |
| `onFileSelect` | `(file: FileItem, editor: LexicalEditor) => void` | Override default node insertion with custom logic. |
| `permissions` | `FileManagerPermissions` | Enable/disable individual actions. See [Permissions](#permissions). |
| `appearance` | `FileManagerAppearance` | Theme, color, and style overrides. See [Appearance](#appearance). |
| `language` | `string` | UI locale. See [Language](#language) for supported codes. |
| `labels` | `FileManagerLabels` | Override modal header strings. See [Labels](#labels). |

## `FileItem` Type

Map your API response to this shape:

```ts
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;            // parent directory, e.g. '/' or '/photos'
  mimeType?: string;       // drives which node gets inserted
  url?: string;
  size?: number;
  thumbnailUrl?: string;
}
```

Node selection by `mimeType`:
- `image/*` → `ImageNode` (inline `<img>`)
- `video/*` → `VideoNode` (inline `<video>`)
- anything else → `FileNode` (download link chip)

## Upload Example

```tsx
async function handleUpload(files: File[]): Promise<FileItem[]> {
  const form = new FormData();
  files.forEach(f => form.append('files', f));
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  const data = await res.json();
  return data.map(f => ({ id: f.id, name: f.name, type: 'file', path: f.path, mimeType: f.mimeType, url: f.url }));
}

<LexicalFileManagerPlugin onFetchFiles={fetchFiles} onUpload={handleUpload} />
```

## Permissions

Control which actions are available in the file manager UI. All permissions default to `true` (enabled).

```tsx
import type { FileManagerPermissions } from '@huongda-group/react-lexical-file-manager';

const permissions: FileManagerPermissions = {
  create: true,       // create folder
  upload: true,       // upload files
  move: true,         // cut / paste (move)
  copy: true,         // copy / paste
  rename: true,       // rename files and folders
  download: false,    // download button
  delete: true,       // delete files and folders
  chmod: false,       // change permissions (Unix-style)
  compress: false,    // compress to archive
  decompress: false,  // extract archive
};

<LexicalFileManagerPlugin onFetchFiles={fetchFiles} permissions={permissions} />
```

## Appearance

Customize the file manager's visual style.

```tsx
import type { FileManagerAppearance } from '@huongda-group/react-lexical-file-manager';

const appearance: FileManagerAppearance = {
  theme: 'dark',             // 'light' | 'dark'
  primaryColor: '#3182ce',   // accent color (buttons, highlights)
  fontFamily: 'Inter, sans-serif',
  className: 'my-fm',        // extra CSS class on the root element
  style: { borderRadius: 8 },
};

<LexicalFileManagerPlugin onFetchFiles={fetchFiles} appearance={appearance} />
```

## Language

Pass a locale code via the `language` prop to localize the file manager UI.

```tsx
<LexicalFileManagerPlugin onFetchFiles={fetchFiles} language="vi-vn" />
```

Supported locales:

| Code | Language |
|------|----------|
| `ar-sa` | العربية |
| `da-dk` | Dansk |
| `de-de` | Deutsch |
| `en-us` | English |
| `es-es` | Español |
| `fa-ir` | فارسی |
| `fi-fi` | Suomi |
| `fr-fr` | Français |
| `he-il` | עברית |
| `hi-in` | हिन्दी |
| `it-it` | Italiano |
| `ja-jp` | 日本語 |
| `ko-kr` | 한국어 |
| `nb-no` | Norsk bokmål |
| `pl-pl` | Polski |
| `pt-br` | Português (Brasil) |
| `pt-pt` | Português |
| `ru-ru` | Русский |
| `sv-se` | Svenska |
| `tr-tr` | Türkçe |
| `uk-ua` | Українська |
| `ur-ur` | اردو |
| `vi-vn` | Tiếng Việt |
| `zh-cn` | 中文 (简体) |

Default: `en-us`.

## Labels

Override the modal header strings added by this plugin (separate from the file manager's own i18n).

```tsx
import type { FileManagerLabels } from '@huongda-group/react-lexical-file-manager';

const labels: FileManagerLabels = {
  title: 'Thư viện media',
  insert: 'Chèn',
  fullscreen: 'Toàn màn hình',
  exitFullscreen: 'Thoát toàn màn hình',
  close: 'Đóng',
  retry: 'Thử lại',
};

<LexicalFileManagerPlugin onFetchFiles={fetchFiles} labels={labels} />
```

| Key | Default |
|-----|---------|
| `title` | `'Media Library'` |
| `insert` | `'Insert'` |
| `fullscreen` | `'Fullscreen'` |
| `exitFullscreen` | `'Exit fullscreen'` |
| `close` | `'Close'` |
| `retry` | `'Retry'` |

## Custom Adapter

For full control, implement `FileManagerAdapter` and pass it via the `adapter` prop:

```ts
import type { FileManagerAdapter } from '@huongda-group/react-lexical-file-manager';

const myAdapter: FileManagerAdapter = {
  fetchFiles: async (path) => { /* return FileItem[] */ },
  upload: async (files) => { /* return FileItem[] */ },
  delete: async (items) => { /* ... */ },
  createFolder: async (name, path) => { /* ... */ },
};

<LexicalFileManagerPlugin adapter={myAdapter} />
```

## Toolbar Button

`FileManagerToolbarButton` opens the file manager on click. Must render inside `LexicalComposer`.

```tsx
<FileManagerToolbarButton label="Media" icon={<MyIcon />} />
```

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | `'Media'` |
| `icon` | `ReactNode` | `'📁'` |
| `style` | `CSSProperties` | — |
| `className` | `string` | — |

## `useFileManager` Hook

Programmatic control from any component inside `LexicalComposer`:

```tsx
import { useFileManager } from '@huongda-group/react-lexical-file-manager';

function MyButton() {
  const { open, insert } = useFileManager();
  return <button onClick={open}>Open media library</button>;
}
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `() => void` | Open the file manager modal |
| `insert` | `(file: FileItem) => void` | Insert a file node at the current selection |

## Commands

Dispatch Lexical commands directly:

```ts
import { OPEN_FILE_MANAGER_COMMAND, INSERT_FILE_COMMAND } from '@huongda-group/react-lexical-file-manager';

editor.dispatchCommand(OPEN_FILE_MANAGER_COMMAND, undefined);
editor.dispatchCommand(INSERT_FILE_COMMAND, fileItem);
```

## Nodes

All three nodes are exported for custom serialization or transforms:

```ts
import {
  ImageNode, $createImageNode, $isImageNode,
  VideoNode, $createVideoNode, $isVideoNode,
  FileNode, $createFileNode, $isFileNode,
} from '@huongda-group/react-lexical-file-manager';
```

## Development

```bash
npm run dev          # build in watch mode
npm test             # unit tests
npm run test:e2e     # E2E tests (starts example app on :5176)
npm run example      # run example app
```
