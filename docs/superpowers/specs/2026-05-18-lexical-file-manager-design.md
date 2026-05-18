# react-lexical-file-manager — Design Spec

**Date:** 2026-05-18  
**Status:** Approved  
**Author:** van.luong@onpoint.vn

---

## Overview

A TypeScript library that integrates `@huongda-group/react-file-manager` into the Lexical editor as a professional media/file management plugin — similar to WordPress Media Library. Published as a public npm package.

**Core goal:** Add two components to any Lexical editor setup and get a fully functional file manager with inline image viewer, video player, and generic file attachment.

---

## Architecture — Core + Preset Bundle (Approach C)

Two layers that share the same underlying code:

```
Consumer App
    ├── <Toolbar>
    │     └── <FileManagerToolbarButton />         ← consumer places explicitly
    └── <LexicalComposer>
          └── LexicalFileManagerPlugin (preset)    ← minimal setup
                  ├── FileManagerPlugin (core)     ← registers nodes + commands
                  └── FileManagerModal             ← wraps react-file-manager
                          ├── ImageNode / VideoNode / FileNode  (DecoratorNodes)
                          ├── OPEN_FILE_MANAGER_COMMAND
                          ├── INSERT_FILE_COMMAND
                          └── Adapters (RestAdapter | custom callbacks)
```

**Note:** Following Lexical conventions, the toolbar button is always rendered explicitly by the consumer in their toolbar — the preset does not auto-inject it via portals.

**Peer deps:** `lexical`, `@lexical/react`, `react`, `react-dom` — consumer installs, not bundled.  
**Bundled dep:** `@huongda-group/react-file-manager` — consumer does not need to install separately.

---

## File Types & Node Selection

All file types are supported. Node selection is based on `mimeType`:

| mimeType pattern | Lexical Node | Editor rendering |
|---|---|---|
| `image/*` | `ImageNode` | Inline image with caption bar |
| `video/*` | `VideoNode` | Inline HTML5 player with controls |
| anything else | `FileNode` | Icon + filename + size chip, click to download |

---

## Trigger & Display

- **Trigger:** Toolbar button (label: "Media", icon: FolderIcon — both overridable via props)
- **Display modes:** Modal overlay (default) + fullscreen — user can toggle between them inside the modal

---

## Component API

### `LexicalFileManagerPlugin` (preset)

Must be placed inside a `<LexicalComposer>`.

```tsx
<LexicalFileManagerPlugin
  // Data — option A: built-in REST adapter
  restConfig={{ baseUrl: 'https://api.example.com/files' }}

  // Data — option B: custom callbacks (override REST adapter)
  onFetchFiles={(path) => Promise<FileItem[]>}
  onUpload={(files) => Promise<FileItem[]>}
  onDelete={(items) => Promise<void>}
  onCreateFolder={(name, path) => Promise<void>}

  // Modal
  defaultDisplayMode="modal"      // 'modal' | 'fullscreen'

  // Insert — omit for auto-insert, provide to override
  onFileSelect={(file, editor) => void}

  // No toolbarAnchor — consumer renders <FileManagerToolbarButton> explicitly

  // i18n
  locale="en"
/>
```

### `FileManagerPlugin` (core — for advanced assembly)

```tsx
<FileManagerPlugin
  adapter={new RestAdapter({ baseUrl: '...' })}   // required
  onFileSelect={(file, editor) => void}            // optional
  defaultDisplayMode="modal"                       // optional
/>
```

### `FileManagerToolbarButton`

Must be rendered inside the same `<LexicalComposer>` tree (or a child that shares the context). Dispatches `OPEN_FILE_MANAGER_COMMAND` on click.

```tsx
<FileManagerToolbarButton
  label="Media"          // optional, default: 'Media'
  icon={<FolderIcon />}  // optional, default: FolderIcon
/>
```

### `RestAdapterConfig`

```ts
interface RestAdapterConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  endpoints?: {
    list?: string;        // default: GET /
    upload?: string;      // default: POST /upload
    delete?: string;      // default: DELETE /
    createFolder?: string; // default: POST /folder
  };
}
```

### `FileManagerAdapter` (interface for custom adapters)

```ts
interface FileManagerAdapter {
  fetchFiles(path: string): Promise<FileItem[]>;
  upload(files: File[]): Promise<FileItem[]>;
  delete(items: FileItem[]): Promise<void>;
  createFolder(name: string, path: string): Promise<void>;
}
```

### `FileItem`

```ts
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  mimeType?: string;
  url?: string;
  size?: number;
  thumbnailUrl?: string;
}
```

---

## Lexical Nodes

All three nodes extend `DecoratorNode<JSX.Element>` and implement `importJSON` / `exportJSON` for full editor state serialization.

### `ImageNode`

Props stored in node: `src`, `alt`, `width`, `height`, `caption`, `alignment: 'left' | 'center' | 'right'`

Renders: inline `<img>` with caption bar showing filename and dimensions. Selected state shows blue ring. Broken image shows placeholder.

### `VideoNode`

Props stored in node: `src`, `poster`, `controls`, `autoplay`, `loop`

Renders: native HTML5 `<video>` with controls bar (play, progress, volume, fullscreen).

### `FileNode`

Props stored in node: `url`, `name`, `mimeType`, `size`

Renders: icon chip (icon derived from mimeType) + filename + size + download arrow. Click triggers download.

---

## Data Flow

```
User clicks toolbar button
  → dispatch OPEN_FILE_MANAGER_COMMAND
  → FileManagerModal opens (overlay or fullscreen)
  → User browses / uploads via @huongda-group/react-file-manager
  → User selects file
  → dispatch INSERT_FILE_COMMAND with FileItem payload
  → If onFileSelect provided: call onFileSelect(file, editor), skip auto-insert
  → Else: detect mimeType → create ImageNode / VideoNode / FileNode → insert at selection
  → Modal closes
```

---

## Package Structure

```
react-lexical-file-manager/
├── src/
│   ├── nodes/
│   │   ├── ImageNode.tsx
│   │   ├── VideoNode.tsx
│   │   └── FileNode.tsx
│   ├── plugins/
│   │   ├── FileManagerPlugin.tsx
│   │   ├── FileManagerModal.tsx
│   │   └── FileManagerToolbarButton.tsx
│   ├── commands/
│   │   └── index.ts
│   ├── hooks/
│   │   └── useFileManager.ts
│   ├── adapters/
│   │   ├── types.ts
│   │   └── RestAdapter.ts
│   ├── types/
│   │   └── index.ts
│   ├── preset.tsx                 ← LexicalFileManagerPlugin
│   └── index.ts                   ← public exports
├── example/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── Editor.tsx
│   │   ├── Toolbar.tsx
│   │   └── mock-server.ts         ← MSW mock API (no real backend needed)
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── vite.config.ts                 ← library build config
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

### Build output

```
dist/
├── index.js        ← ESM
├── index.cjs       ← CJS
└── index.d.ts      ← TypeScript declarations
```

`package.json` exports map:
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### Public exports from `index.ts`

```ts
// Preset
export { LexicalFileManagerPlugin } from './preset'

// Core parts
export { FileManagerPlugin } from './plugins/FileManagerPlugin'
export { FileManagerToolbarButton } from './plugins/FileManagerToolbarButton'
export { FileManagerModal } from './plugins/FileManagerModal'

// Nodes
export { ImageNode } from './nodes/ImageNode'
export { VideoNode } from './nodes/VideoNode'
export { FileNode } from './nodes/FileNode'

// Commands
export { OPEN_FILE_MANAGER_COMMAND, INSERT_FILE_COMMAND } from './commands'

// Hook
export { useFileManager } from './hooks/useFileManager'

// Adapter
export { RestAdapter } from './adapters/RestAdapter'
export type { FileManagerAdapter, FileItem } from './types'
```

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Adapter fetch fails | Modal shows error state with retry button — editor unaffected |
| Upload fails | Inline error in modal, file not inserted |
| Unknown / missing mimeType | Fallback to `FileNode` — no throw |
| Image load fails in `ImageNode` | Render broken-image placeholder |
| Missing `LexicalComposer` context | `useLexicalComposerContext()` throws immediately — fail fast |
| `onFileSelect` callback throws | Caught, `console.warn` logged, modal does not crash |

---

## Testing Strategy

**Toolchain:** Vitest (unit + integration) · `@testing-library/react` · Playwright (e2e)

### Unit tests
- `ImageNode` / `VideoNode` / `FileNode`: `importJSON` → `exportJSON` roundtrip
- Node selection logic: correct node type chosen from mimeType
- `RestAdapter`: correct endpoints called, headers forwarded

### Integration tests (Vitest + testing-library)
- `FileManagerPlugin` mounts inside `LexicalComposer` without crash, commands registered
- `OPEN_FILE_MANAGER_COMMAND` dispatch → modal opens
- `INSERT_FILE_COMMAND` with image file → `ImageNode` in editor state
- `onFileSelect` callback invoked instead of auto-insert when provided
- Adapter fetch failure → modal renders error state, no crash

### E2E tests (Playwright on example app)
- Toolbar button click → file manager modal opens
- Select file → correct node renders in editor
- Modal toggle overlay ↔ fullscreen works
- Video node plays in editor

---

## Example App

Standalone Vite + React app in `example/`. Uses **MSW** to mock the file API — no real backend required to run the demo.

Demo scenarios covered:
1. Insert image → inline viewer
2. Insert video → inline player
3. Insert PDF → file chip with download
4. Custom `onFileSelect` callback (logs to console instead of inserting)
5. Fullscreen modal mode
