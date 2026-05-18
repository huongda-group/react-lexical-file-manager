# react-lexical-file-manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a TypeScript library that integrates `@huongda-group/react-file-manager` into Lexical as a professional media manager plugin with inline image viewer, video player, and file attachment nodes.

**Architecture:** Core + Preset Bundle (Approach C). `FileManagerPlugin` (core) registers Lexical nodes and commands; `FileManagerModal` wraps `@huongda-group/react-file-manager` with adapter-driven data; `LexicalFileManagerPlugin` (preset) composes all parts. Nodes are `DecoratorNode` subclasses — `ImageNode`, `VideoNode`, `FileNode`.

**Tech Stack:** TypeScript 5, React 18, Lexical 0.44, Vite 6 (library mode), vite-plugin-dts, Vitest 2, @testing-library/react 16, Playwright, MSW 2

---

## ⚠️ Code Style — MUST follow `.agent/code-style/`

All generated code MUST comply with `.agent/code-style/COMMON.md` and `.agent/code-style/FRONT-END-STYLE.md`. Code blocks in this plan are structural guides — correct any violations when implementing.

| Rule | Requirement |
|---|---|
| File names | kebab-case only — `image-node.tsx`, never `ImageNode.tsx` |
| Semicolons | Every statement ends with `;` |
| Trailing commas | NEVER — not in objects, arrays, or function params |
| Object properties | Each on its own line — never inline `{ a: 1, b: 2 }` |
| Array items | Each on its own line |
| Array of objects | `[{...}, {...}]` pattern — `}, {` on same line |
| Single quotes | Always in TS/TSX — never double quotes |
| No destructuring | `const editor = useLexicalComposerContext()[0]` — never `const [editor] = ...` |
| No `any` | Use `unknown` or concrete types |
| Import specifiers | Never break across lines — one line |
| JSX attributes | Keep all attributes on a single line |
| No intermediate vars for props | Use `obj.prop` inline unless the call repeats |
| Chained calls | First `.method()` stays on same line; wrap from second `.` |
| If braces | Always `{}` — never `if (x) return y` |

---

## File Map

| File | Responsibility |
|---|---|
| `src/types/index.ts` | `FileItem`, re-exports |
| `src/commands/index.ts` | `OPEN_FILE_MANAGER_COMMAND`, `INSERT_FILE_COMMAND` |
| `src/adapters/types.ts` | `FileManagerAdapter` interface, `RestAdapterConfig` |
| `src/adapters/rest-adapter.ts` | Built-in REST adapter |
| `src/nodes/image-node.tsx` | `DecoratorNode` for images |
| `src/nodes/video-node.tsx` | `DecoratorNode` for videos |
| `src/nodes/file-node.tsx` | `DecoratorNode` for generic files |
| `src/nodes/select-node.ts` | `$createNodeForFile(file)` — mimeType routing |
| `src/plugins/file-manager-plugin.tsx` | Core: registers nodes check, commands, modal state |
| `src/plugins/file-manager-modal.tsx` | Modal wrapper around `@huongda-group/react-file-manager` |
| `src/plugins/file-manager-toolbar-button.tsx` | Toolbar button — dispatches `OPEN_FILE_MANAGER_COMMAND` |
| `src/hooks/use-file-manager.ts` | `useFileManager()` — exposes `open()`, `close()`, `isOpen` |
| `src/preset.tsx` | `LexicalFileManagerPlugin` — composes core parts |
| `src/index.ts` | Public exports |
| `tests/setup.ts` | Vitest setup (jsdom + testing-library cleanup) |
| `tests/adapters/rest-adapter.test.ts` | RestAdapter unit tests |
| `tests/nodes/image-node.test.ts` | ImageNode serialization tests |
| `tests/nodes/video-node.test.ts` | VideoNode serialization tests |
| `tests/nodes/file-node.test.ts` | FileNode serialization tests |
| `tests/nodes/select-node.test.ts` | mimeType routing tests |
| `tests/plugins/file-manager-plugin.test.tsx` | Integration: commands registered, modal opens |
| `example/src/app.tsx` | Example app root |
| `example/src/editor.tsx` | LexicalComposer with all nodes registered |
| `example/src/toolbar.tsx` | Toolbar with FileManagerToolbarButton |
| `example/src/mock-server.ts` | MSW mock API (no real backend needed) |
| `example/vite.config.ts` | Example app Vite config |
| `e2e/file-manager.spec.ts` | Playwright E2E tests |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `vite.config.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "react-lexical-file-manager",
  "version": "0.1.0",
  "description": "Lexical plugin for professional file management — image viewer, video player, file attachments",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build && tsc -p tsconfig.build.json",
    "dev": "vite build --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "example": "vite --config example/vite.config.ts --root example"
  },
  "peerDependencies": {
    "lexical": ">=0.44.0",
    "@lexical/react": ">=0.44.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "@huongda-group/react-file-manager": "^2.0.1"
  },
  "devDependencies": {
    "@lexical/react": "^0.44.0",
    "@playwright/test": "^1.45.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "lexical": "^0.44.0",
    "msw": "^2.3.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "vite-plugin-dts": "^4.3.0",
    "vitest": "^2.1.0"
  },
  "keywords": ["lexical", "file-manager", "react", "editor", "media-library"],
  "license": "MIT"
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "declaration": true,
    "declarationDir": "./dist",
    "baseUrl": "."
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create `tsconfig.build.json`** (emits declarations only)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declarationDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'lexical', '@lexical/react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          lexical: 'Lexical',
        },
      },
    },
  },
})
```

- [ ] **Step 5: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json tsconfig.build.json vite.config.ts
git commit -m "chore: project scaffolding — package.json, tsconfig, vite library build"
```

---

## Task 2: Test Infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 2: Create `tests/setup.ts`**

```typescript
import '@testing-library/react/pure'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 3: Verify test runner works**

```bash
npx vitest run --reporter=verbose 2>&1 | head -10
```

Expected: "No test files found" (not a crash).

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts tests/setup.ts
git commit -m "chore: vitest + jsdom test infrastructure"
```

---

## Task 3: Types, Commands, Adapter Interface

**Files:**
- Create: `src/types/index.ts`
- Create: `src/commands/index.ts`
- Create: `src/adapters/types.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
export interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  mimeType?: string
  url?: string
  size?: number
  thumbnailUrl?: string
}
```

- [ ] **Step 2: Create `src/commands/index.ts`**

```typescript
import { createCommand, type LexicalCommand } from 'lexical'
import type { FileItem } from '../types'

export const OPEN_FILE_MANAGER_COMMAND: LexicalCommand<void> =
  createCommand('OPEN_FILE_MANAGER_COMMAND')

export const INSERT_FILE_COMMAND: LexicalCommand<FileItem> =
  createCommand('INSERT_FILE_COMMAND')
```

- [ ] **Step 3: Create `src/adapters/types.ts`**

```typescript
import type { FileItem } from '../types'

export interface RestAdapterConfig {
  baseUrl: string
  headers?: Record<string, string>
  endpoints?: {
    list?: string
    upload?: string
    delete?: string
    createFolder?: string
  }
}

export interface FileManagerAdapter {
  fetchFiles(path: string): Promise<FileItem[]>
  upload(files: File[]): Promise<FileItem[]>
  delete(items: FileItem[]): Promise<void>
  createFolder(name: string, path: string): Promise<void>
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/commands/index.ts src/adapters/types.ts
git commit -m "feat: core types, Lexical commands, FileManagerAdapter interface"
```

---

## Task 4: RestAdapter (TDD)

**Files:**
- Create: `tests/adapters/rest-adapter.test.ts`
- Create: `src/adapters/rest-adapter.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/adapters/rest-adapter.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RestAdapter } from '../../src/adapters/rest-adapter'
import type { FileItem } from '../../src/types'

const mockFiles: FileItem[] = [
  {
    id: 'abc123',
    name: 'photo.jpg',
    type: 'file',
    path: '/',
    mimeType: 'image/jpeg',
    url: 'https://cdn.example.com/photo.jpg',
    size: 204800,
  },
]

describe('RestAdapter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('fetchFiles calls GET with path query param', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFiles,
    } as Response)

    const adapter = new RestAdapter({ baseUrl: 'https://api.example.com' })
    const result = await adapter.fetchFiles('/photos')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/?path=%2Fphotos',
      expect.objectContaining({ headers: {} }),
    )
    expect(result).toEqual(mockFiles)
  })

  it('fetchFiles throws on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 500 } as Response)
    const adapter = new RestAdapter({ baseUrl: 'https://api.example.com' })
    await expect(adapter.fetchFiles('/')).rejects.toThrow('fetchFiles failed: 500')
  })

  it('upload sends FormData POST to /upload', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFiles,
    } as Response)

    const adapter = new RestAdapter({ baseUrl: 'https://api.example.com' })
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await adapter.upload([file])

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/upload',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result).toEqual(mockFiles)
  })

  it('delete sends DELETE with ids JSON body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    const adapter = new RestAdapter({ baseUrl: 'https://api.example.com' })
    await adapter.delete([mockFiles[0]])

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ ids: ['abc123'] }),
      }),
    )
  })

  it('createFolder sends POST with name and path', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    const adapter = new RestAdapter({ baseUrl: 'https://api.example.com' })
    await adapter.createFolder('vacation', '/photos')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/folder',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'vacation', path: '/photos' }),
      }),
    )
  })

  it('forwards custom headers on every request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)

    const adapter = new RestAdapter({
      baseUrl: 'https://api.example.com',
      headers: { Authorization: 'Bearer token123' },
    })
    await adapter.fetchFiles('/')

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: { Authorization: 'Bearer token123' } }),
    )
  })

  it('uses custom endpoint paths when provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)

    const adapter = new RestAdapter({
      baseUrl: 'https://api.example.com',
      endpoints: { list: '/api/files' },
    })
    await adapter.fetchFiles('/')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/files?path=%2F',
      expect.any(Object),
    )
  })
})
```

- [ ] **Step 2: Run — verify all fail**

```bash
npx vitest run tests/adapters/rest-adapter.test.ts --reporter=verbose 2>&1 | tail -15
```

Expected: All 6 tests FAIL with "Cannot find module '../../src/adapters/rest-adapter'".

- [ ] **Step 3: Implement `src/adapters/rest-adapter.ts`**

```typescript
import type { FileManagerAdapter, RestAdapterConfig } from './types'
import type { FileItem } from '../types'

export class RestAdapter implements FileManagerAdapter {
  private base: string
  private headers: Record<string, string>
  private endpoints: Required<NonNullable<RestAdapterConfig['endpoints']>>

  constructor(config: RestAdapterConfig) {
    this.base = config.baseUrl.replace(/\/$/, '')
    this.headers = config.headers ?? {}
    this.endpoints = {
      list: config.endpoints?.list ?? '/',
      upload: config.endpoints?.upload ?? '/upload',
      delete: config.endpoints?.delete ?? '/',
      createFolder: config.endpoints?.createFolder ?? '/folder',
    }
  }

  async fetchFiles(path: string): Promise<FileItem[]> {
    const url = new URL(this.base + this.endpoints.list)
    url.searchParams.set('path', path)
    const res = await fetch(url.toString(), { headers: this.headers })
    if (!res.ok) throw new Error(`fetchFiles failed: ${res.status}`)
    return res.json() as Promise<FileItem[]>
  }

  async upload(files: File[]): Promise<FileItem[]> {
    const body = new FormData()
    files.forEach((f) => body.append('files', f))
    const res = await fetch(this.base + this.endpoints.upload, {
      method: 'POST',
      headers: this.headers,
      body,
    })
    if (!res.ok) throw new Error(`upload failed: ${res.status}`)
    return res.json() as Promise<FileItem[]>
  }

  async delete(items: FileItem[]): Promise<void> {
    const res = await fetch(this.base + this.endpoints.delete, {
      method: 'DELETE',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: items.map((i) => i.id) }),
    })
    if (!res.ok) throw new Error(`delete failed: ${res.status}`)
  }

  async createFolder(name: string, path: string): Promise<void> {
    const res = await fetch(this.base + this.endpoints.createFolder, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path }),
    })
    if (!res.ok) throw new Error(`createFolder failed: ${res.status}`)
  }
}
```

- [ ] **Step 4: Run — verify all pass**

```bash
npx vitest run tests/adapters/rest-adapter.test.ts --reporter=verbose 2>&1 | tail -15
```

Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/adapters/rest-adapter.ts tests/adapters/rest-adapter.test.ts
git commit -m "feat: RestAdapter with full TDD coverage"
```

---

## Task 5: ImageNode (TDD)

**Files:**
- Create: `tests/nodes/image-node.test.ts`
- Create: `src/nodes/image-node.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/nodes/image-node.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { $createImageNode, ImageNode } from '../../src/nodes/image-node'

describe('ImageNode', () => {
  it('getType returns file-manager-image', () => {
    expect(ImageNode.getType()).toBe('file-manager-image')
  })

  it('exportJSON includes all fields', () => {
    const node = $createImageNode({
      src: 'https://cdn.example.com/img.jpg',
      alt: 'A photo',
      width: 1920,
      height: 1080,
      caption: 'Sunset',
      alignment: 'center',
    })

    const json = node.exportJSON()

    expect(json).toMatchObject({
      type: 'file-manager-image',
      version: 1,
      src: 'https://cdn.example.com/img.jpg',
      alt: 'A photo',
      width: 1920,
      height: 1080,
      caption: 'Sunset',
      alignment: 'center',
    })
  })

  it('importJSON creates matching node (roundtrip)', () => {
    const original = $createImageNode({
      src: 'https://cdn.example.com/img.jpg',
      alt: 'A photo',
      width: 800,
      height: 600,
      caption: '',
      alignment: 'left',
    })

    const restored = ImageNode.importJSON(original.exportJSON())
    expect(restored.exportJSON()).toEqual(original.exportJSON())
  })

  it('defaults alt to empty string and alignment to left', () => {
    const node = $createImageNode({ src: 'https://cdn.example.com/img.jpg' })
    const json = node.exportJSON()
    expect(json.alt).toBe('')
    expect(json.alignment).toBe('left')
    expect(json.caption).toBe('')
  })

  it('clone produces identical node', () => {
    const node = $createImageNode({ src: 'https://cdn.example.com/x.jpg', alt: 'X' })
    const cloned = ImageNode.clone(node)
    expect(cloned.exportJSON()).toEqual(node.exportJSON())
  })
})
```

- [ ] **Step 2: Run — verify all fail**

```bash
npx vitest run tests/nodes/image-node.test.ts --reporter=verbose 2>&1 | tail -10
```

Expected: FAIL "Cannot find module '../../src/nodes/image-node'".

- [ ] **Step 3: Implement `src/nodes/image-node.tsx`**

```typescript
import { type JSX } from 'react'
import {
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'

export type SerializedImageNode = Spread<
  {
    src: string
    alt: string
    width?: number
    height?: number
    caption: string
    alignment: 'left' | 'center' | 'right'
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __alt: string
  __width: number | undefined
  __height: number | undefined
  __caption: string
  __alignment: 'left' | 'center' | 'right'

  static getType(): string {
    return 'file-manager-image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__alt,
      node.__width,
      node.__height,
      node.__caption,
      node.__alignment,
      node.__key,
    )
  }

  static importJSON(data: SerializedImageNode): ImageNode {
    return $createImageNode(data)
  }

  constructor(
    src: string,
    alt: string,
    width?: number,
    height?: number,
    caption = '',
    alignment: 'left' | 'center' | 'right' = 'left',
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__alt = alt
    this.__width = width
    this.__height = height
    this.__caption = caption
    this.__alignment = alignment
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
      alignment: this.__alignment,
    }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'contents'
    return span
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <ImageNodeComponent
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        caption={this.__caption}
        alignment={this.__alignment}
      />
    )
  }
}

function ImageNodeComponent({
  src,
  alt,
  width,
  height,
  caption,
  alignment,
}: {
  src: string
  alt: string
  width?: number
  height?: number
  caption: string
  alignment: 'left' | 'center' | 'right'
}) {
  const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' } as const

  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: justifyMap[alignment],
        margin: '8px 0',
      }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ maxWidth: '100%', borderRadius: 4 }}
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
        }}
      />
      {caption && (
        <span style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>{caption}</span>
      )}
    </span>
  )
}

export function $createImageNode(props: {
  src: string
  alt?: string
  width?: number
  height?: number
  caption?: string
  alignment?: 'left' | 'center' | 'right'
}): ImageNode {
  return new ImageNode(
    props.src,
    props.alt ?? '',
    props.width,
    props.height,
    props.caption ?? '',
    props.alignment ?? 'left',
  )
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
```

- [ ] **Step 4: Run — verify all pass**

```bash
npx vitest run tests/nodes/image-node.test.ts --reporter=verbose 2>&1 | tail -10
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/nodes/image-node.tsx tests/nodes/image-node.test.ts
git commit -m "feat: ImageNode DecoratorNode with serialization TDD"
```

---

## Task 6: VideoNode (TDD)

**Files:**
- Create: `tests/nodes/video-node.test.ts`
- Create: `src/nodes/video-node.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/nodes/video-node.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { $createVideoNode, VideoNode } from '../../src/nodes/video-node'

describe('VideoNode', () => {
  it('getType returns file-manager-video', () => {
    expect(VideoNode.getType()).toBe('file-manager-video')
  })

  it('exportJSON includes all fields', () => {
    const node = $createVideoNode({
      src: 'https://cdn.example.com/video.mp4',
      poster: 'https://cdn.example.com/thumb.jpg',
      controls: true,
      autoplay: false,
      loop: true,
    })

    expect(node.exportJSON()).toMatchObject({
      type: 'file-manager-video',
      version: 1,
      src: 'https://cdn.example.com/video.mp4',
      poster: 'https://cdn.example.com/thumb.jpg',
      controls: true,
      autoplay: false,
      loop: true,
    })
  })

  it('importJSON roundtrip', () => {
    const original = $createVideoNode({ src: 'https://cdn.example.com/clip.mp4' })
    const restored = VideoNode.importJSON(original.exportJSON())
    expect(restored.exportJSON()).toEqual(original.exportJSON())
  })

  it('defaults: controls true, autoplay false, loop false', () => {
    const node = $createVideoNode({ src: 'https://cdn.example.com/clip.mp4' })
    const json = node.exportJSON()
    expect(json.controls).toBe(true)
    expect(json.autoplay).toBe(false)
    expect(json.loop).toBe(false)
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npx vitest run tests/nodes/video-node.test.ts --reporter=verbose 2>&1 | tail -8
```

Expected: FAIL "Cannot find module".

- [ ] **Step 3: Implement `src/nodes/video-node.tsx`**

```typescript
import { type JSX } from 'react'
import {
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'

export type SerializedVideoNode = Spread<
  {
    src: string
    poster?: string
    controls: boolean
    autoplay: boolean
    loop: boolean
  },
  SerializedLexicalNode
>

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string
  __poster: string | undefined
  __controls: boolean
  __autoplay: boolean
  __loop: boolean

  static getType(): string {
    return 'file-manager-video'
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
      node.__src,
      node.__poster,
      node.__controls,
      node.__autoplay,
      node.__loop,
      node.__key,
    )
  }

  static importJSON(data: SerializedVideoNode): VideoNode {
    return $createVideoNode(data)
  }

  constructor(
    src: string,
    poster?: string,
    controls = true,
    autoplay = false,
    loop = false,
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__poster = poster
    this.__controls = controls
    this.__autoplay = autoplay
    this.__loop = loop
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
      loop: this.__loop,
    }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'contents'
    return span
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <span style={{ display: 'block', margin: '8px 0' }}>
        <video
          src={this.__src}
          poster={this.__poster}
          controls={this.__controls}
          autoPlay={this.__autoplay}
          loop={this.__loop}
          style={{ maxWidth: '100%', borderRadius: 4 }}
        />
      </span>
    )
  }
}

export function $createVideoNode(props: {
  src: string
  poster?: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
}): VideoNode {
  return new VideoNode(
    props.src,
    props.poster,
    props.controls ?? true,
    props.autoplay ?? false,
    props.loop ?? false,
  )
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode
}
```

- [ ] **Step 4: Run — verify all pass**

```bash
npx vitest run tests/nodes/video-node.test.ts --reporter=verbose 2>&1 | tail -8
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/nodes/video-node.tsx tests/nodes/video-node.test.ts
git commit -m "feat: VideoNode DecoratorNode with serialization TDD"
```

---

## Task 7: FileNode (TDD)

**Files:**
- Create: `tests/nodes/file-node.test.ts`
- Create: `src/nodes/file-node.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/nodes/file-node.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { $createFileNode, FileNode } from '../../src/nodes/file-node'

describe('FileNode', () => {
  it('getType returns file-manager-file', () => {
    expect(FileNode.getType()).toBe('file-manager-file')
  })

  it('exportJSON includes all fields', () => {
    const node = $createFileNode({
      url: 'https://cdn.example.com/report.pdf',
      name: 'Q4-Report.pdf',
      mimeType: 'application/pdf',
      size: 2516582,
    })

    expect(node.exportJSON()).toMatchObject({
      type: 'file-manager-file',
      version: 1,
      url: 'https://cdn.example.com/report.pdf',
      name: 'Q4-Report.pdf',
      mimeType: 'application/pdf',
      size: 2516582,
    })
  })

  it('importJSON roundtrip', () => {
    const original = $createFileNode({
      url: 'https://cdn.example.com/data.zip',
      name: 'data.zip',
      mimeType: 'application/zip',
    })
    const restored = FileNode.importJSON(original.exportJSON())
    expect(restored.exportJSON()).toEqual(original.exportJSON())
  })

  it('size and mimeType are optional', () => {
    const node = $createFileNode({ url: 'https://cdn.example.com/x', name: 'x' })
    const json = node.exportJSON()
    expect(json.size).toBeUndefined()
    expect(json.mimeType).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npx vitest run tests/nodes/file-node.test.ts --reporter=verbose 2>&1 | tail -8
```

- [ ] **Step 3: Implement `src/nodes/file-node.tsx`**

```typescript
import { type JSX } from 'react'
import {
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'

export type SerializedFileNode = Spread<
  {
    url: string
    name: string
    mimeType?: string
    size?: number
  },
  SerializedLexicalNode
>

export class FileNode extends DecoratorNode<JSX.Element> {
  __url: string
  __name: string
  __mimeType: string | undefined
  __size: number | undefined

  static getType(): string {
    return 'file-manager-file'
  }

  static clone(node: FileNode): FileNode {
    return new FileNode(node.__url, node.__name, node.__mimeType, node.__size, node.__key)
  }

  static importJSON(data: SerializedFileNode): FileNode {
    return $createFileNode(data)
  }

  constructor(
    url: string,
    name: string,
    mimeType?: string,
    size?: number,
    key?: NodeKey,
  ) {
    super(key)
    this.__url = url
    this.__name = name
    this.__mimeType = mimeType
    this.__size = size
  }

  exportJSON(): SerializedFileNode {
    return {
      ...super.exportJSON(),
      type: 'file-manager-file',
      version: 1,
      url: this.__url,
      name: this.__name,
      mimeType: this.__mimeType,
      size: this.__size,
    }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'contents'
    return span
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    const sizeLabel = this.__size != null ? ` · ${(this.__size / 1024).toFixed(0)} KB` : ''
    return (
      <a
        href={this.__url}
        download={this.__name}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          textDecoration: 'none',
          color: 'inherit',
          fontSize: 13,
          margin: '4px 0',
        }}
      >
        <span>📎</span>
        <span>{this.__name}</span>
        <span style={{ color: '#718096', fontSize: 11 }}>{sizeLabel}</span>
        <span>↓</span>
      </a>
    )
  }
}

export function $createFileNode(props: {
  url: string
  name: string
  mimeType?: string
  size?: number
}): FileNode {
  return new FileNode(props.url, props.name, props.mimeType, props.size)
}

export function $isFileNode(node: LexicalNode | null | undefined): node is FileNode {
  return node instanceof FileNode
}
```

- [ ] **Step 4: Run — verify all pass**

```bash
npx vitest run tests/nodes/file-node.test.ts --reporter=verbose 2>&1 | tail -8
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/nodes/file-node.tsx tests/nodes/file-node.test.ts
git commit -m "feat: FileNode DecoratorNode with serialization TDD"
```

---

## Task 8: Node Selection Utility (TDD)

**Files:**
- Create: `tests/nodes/select-node.test.ts`
- Create: `src/nodes/select-node.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/nodes/select-node.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { $createNodeForFile } from '../../src/nodes/select-node'
import { ImageNode } from '../../src/nodes/image-node'
import { VideoNode } from '../../src/nodes/video-node'
import { FileNode } from '../../src/nodes/file-node'
import type { FileItem } from '../../src/types'

const base: Omit<FileItem, 'mimeType'> = {
  id: '1',
  name: 'test',
  type: 'file',
  path: '/',
  url: 'https://cdn.example.com/test',
}

describe('$createNodeForFile', () => {
  it('image/jpeg → ImageNode', () => {
    const node = $createNodeForFile({ ...base, mimeType: 'image/jpeg' })
    expect(node).toBeInstanceOf(ImageNode)
  })

  it('image/png → ImageNode', () => {
    const node = $createNodeForFile({ ...base, mimeType: 'image/png' })
    expect(node).toBeInstanceOf(ImageNode)
  })

  it('video/mp4 → VideoNode', () => {
    const node = $createNodeForFile({ ...base, mimeType: 'video/mp4' })
    expect(node).toBeInstanceOf(VideoNode)
  })

  it('video/webm → VideoNode', () => {
    const node = $createNodeForFile({ ...base, mimeType: 'video/webm' })
    expect(node).toBeInstanceOf(VideoNode)
  })

  it('application/pdf → FileNode', () => {
    const node = $createNodeForFile({ ...base, mimeType: 'application/pdf' })
    expect(node).toBeInstanceOf(FileNode)
  })

  it('undefined mimeType → FileNode', () => {
    const node = $createNodeForFile({ ...base, mimeType: undefined })
    expect(node).toBeInstanceOf(FileNode)
  })

  it('ImageNode gets src from file.url', () => {
    const node = $createNodeForFile({ ...base, name: 'photo.jpg', mimeType: 'image/jpeg' }) as ImageNode
    expect(node.exportJSON().src).toBe('https://cdn.example.com/test')
  })

  it('VideoNode gets src from file.url', () => {
    const node = $createNodeForFile({ ...base, name: 'clip.mp4', mimeType: 'video/mp4' }) as VideoNode
    expect(node.exportJSON().src).toBe('https://cdn.example.com/test')
  })

  it('FileNode gets name and mimeType', () => {
    const node = $createNodeForFile({
      ...base,
      name: 'report.pdf',
      mimeType: 'application/pdf',
      size: 1024,
    }) as FileNode
    const json = node.exportJSON()
    expect(json.name).toBe('report.pdf')
    expect(json.mimeType).toBe('application/pdf')
    expect(json.size).toBe(1024)
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npx vitest run tests/nodes/select-node.test.ts --reporter=verbose 2>&1 | tail -8
```

- [ ] **Step 3: Implement `src/nodes/select-node.ts`**

```typescript
import type { FileItem } from '../types'
import { $createImageNode, ImageNode } from './ImageNode'
import { $createVideoNode, VideoNode } from './VideoNode'
import { $createFileNode, FileNode } from './FileNode'

export function $createNodeForFile(file: FileItem): ImageNode | VideoNode | FileNode {
  const mime = file.mimeType ?? ''
  const url = file.url ?? ''

  if (mime.startsWith('image/')) {
    return $createImageNode({ src: url, alt: file.name })
  }

  if (mime.startsWith('video/')) {
    return $createVideoNode({ src: url, poster: file.thumbnailUrl })
  }

  return $createFileNode({ url, name: file.name, mimeType: mime || undefined, size: file.size })
}
```

- [ ] **Step 4: Run — verify all pass**

```bash
npx vitest run tests/nodes/select-node.test.ts --reporter=verbose 2>&1 | tail -12
```

Expected: 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/nodes/select-node.ts tests/nodes/select-node.test.ts
git commit -m "feat: $createNodeForFile mimeType routing utility"
```

---

## Task 9: FileManagerPlugin Core (Integration TDD)

**Files:**
- Create: `tests/plugins/file-manager-plugin.test.tsx`
- Create: `src/plugins/file-manager-plugin.tsx`

- [ ] **Step 1: Write failing integration tests**

Create `tests/plugins/file-manager-plugin.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_LOW } from 'lexical'
import { useEffect } from 'react'
import { FileManagerPlugin } from '../../src/plugins/file-manager-plugin'
import { ImageNode } from '../../src/nodes/image-node'
import { VideoNode } from '../../src/nodes/video-node'
import { FileNode } from '../../src/nodes/file-node'
import { OPEN_FILE_MANAGER_COMMAND, INSERT_FILE_COMMAND } from '../../src/commands'
import type { FileItem } from '../../src/types'
import type { FileManagerAdapter } from '../../src/adapters/types'

const mockAdapter: FileManagerAdapter = {
  fetchFiles: vi.fn().mockResolvedValue([]),
  upload: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(undefined),
  createFolder: vi.fn().mockResolvedValue(undefined),
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'test',
        nodes: [ImageNode, VideoNode, FileNode],
        onError: (e) => { throw e },
        theme: {},
      }}
    >
      {children}
    </LexicalComposer>
  )
}

// Helper plugin — dispatches a command
function CommandDispatcher({ command, payload, onReady }: {
  command: typeof OPEN_FILE_MANAGER_COMMAND | typeof INSERT_FILE_COMMAND
  payload?: FileItem
  onReady: (dispatch: () => void) => void
}) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    onReady(() => {
      editor.dispatchCommand(command as typeof OPEN_FILE_MANAGER_COMMAND, payload as never)
    })
  }, [editor])
  return null
}

describe('FileManagerPlugin', () => {
  it('renders without crashing inside LexicalComposer', () => {
    expect(() =>
      render(
        <TestWrapper>
          <FileManagerPlugin adapter={mockAdapter} />
        </TestWrapper>,
      ),
    ).not.toThrow()
  })

  it('modal opens when OPEN_FILE_MANAGER_COMMAND is dispatched', async () => {
    let dispatch: (() => void) | undefined

    render(
      <TestWrapper>
        <FileManagerPlugin adapter={mockAdapter} />
        <CommandDispatcher
          command={OPEN_FILE_MANAGER_COMMAND}
          onReady={(fn) => { dispatch = fn }}
        />
      </TestWrapper>,
    )

    await act(async () => { dispatch?.() })

    // Modal container should appear
    expect(document.querySelector('[data-testid="file-manager-modal"]')).not.toBeNull()
  })

  it('calls onFileSelect when INSERT_FILE_COMMAND is dispatched and onFileSelect is provided', async () => {
    const onFileSelect = vi.fn()
    let dispatch: (() => void) | undefined

    const file: FileItem = {
      id: '1',
      name: 'photo.jpg',
      type: 'file',
      path: '/',
      mimeType: 'image/jpeg',
      url: 'https://cdn.example.com/photo.jpg',
    }

    render(
      <TestWrapper>
        <FileManagerPlugin adapter={mockAdapter} onFileSelect={onFileSelect} />
        <CommandDispatcher
          command={INSERT_FILE_COMMAND}
          payload={file}
          onReady={(fn) => { dispatch = fn }}
        />
      </TestWrapper>,
    )

    await act(async () => { dispatch?.() })

    expect(onFileSelect).toHaveBeenCalledWith(file, expect.any(Object))
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
npx vitest run tests/plugins/file-manager-plugin.test.tsx --reporter=verbose 2>&1 | tail -12
```

Expected: FAIL "Cannot find module '../../src/plugins/file-manager-plugin'".

- [ ] **Step 3: Create placeholder `src/plugins/file-manager-modal.tsx`** (needed by plugin)

```typescript
import type { FileManagerAdapter } from '../adapters/types'

interface FileManagerModalProps {
  adapter: FileManagerAdapter
  displayMode: 'modal' | 'fullscreen'
  onDisplayModeChange: (mode: 'modal' | 'fullscreen') => void
  onClose: () => void
}

export function FileManagerModal({ onClose }: FileManagerModalProps) {
  return (
    <div data-testid="file-manager-modal" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/plugins/file-manager-plugin.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_EDITOR, $insertNodes } from 'lexical'
import { ImageNode } from '../nodes/image-node'
import { VideoNode } from '../nodes/video-node'
import { FileNode } from '../nodes/file-node'
import { OPEN_FILE_MANAGER_COMMAND, INSERT_FILE_COMMAND } from '../commands'
import { $createNodeForFile } from '../nodes/select-node'
import { FileManagerModal } from './file-manager-modal'
import type { FileManagerAdapter } from '../adapters/types'
import type { FileItem } from '../types'

export const FILE_MANAGER_NODES = [ImageNode, VideoNode, FileNode] as const

interface FileManagerPluginProps {
  adapter: FileManagerAdapter
  onFileSelect?: (file: FileItem, editor: ReturnType<typeof useLexicalComposerContext>[0]) => void
  defaultDisplayMode?: 'modal' | 'fullscreen'
}

export function FileManagerPlugin({
  adapter,
  onFileSelect,
  defaultDisplayMode = 'modal',
}: FileManagerPluginProps) {
  const [editor] = useLexicalComposerContext()
  const [isOpen, setIsOpen] = useState(false)
  const [displayMode, setDisplayMode] = useState<'modal' | 'fullscreen'>(defaultDisplayMode)

  useEffect(() => {
    if (!editor.hasNode(ImageNode) || !editor.hasNode(VideoNode) || !editor.hasNode(FileNode)) {
      throw new Error(
        '[react-lexical-file-manager] Add FILE_MANAGER_NODES to your LexicalComposer initialConfig.nodes array.',
      )
    }
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      OPEN_FILE_MANAGER_COMMAND,
      () => {
        setIsOpen(true)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      INSERT_FILE_COMMAND,
      (file) => {
        if (onFileSelect) {
          try {
            onFileSelect(file, editor)
          } catch (err) {
            console.warn('[react-lexical-file-manager] onFileSelect threw:', err)
          }
        } else {
          editor.update(() => {
            $insertNodes([$createNodeForFile(file)])
          })
        }
        setIsOpen(false)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor, onFileSelect])

  if (!isOpen) return null

  return (
    <FileManagerModal
      adapter={adapter}
      displayMode={displayMode}
      onDisplayModeChange={setDisplayMode}
      onClose={() => setIsOpen(false)}
    />
  )
}
```

- [ ] **Step 5: Run — verify all pass**

```bash
npx vitest run tests/plugins/file-manager-plugin.test.tsx --reporter=verbose 2>&1 | tail -12
```

Expected: 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/plugins/file-manager-plugin.tsx src/plugins/file-manager-modal.tsx tests/plugins/file-manager-plugin.test.tsx
git commit -m "feat: FileManagerPlugin core — command registration, modal state, insert handling"
```

---

## Task 10: FileManagerToolbarButton

**Files:**
- Create: `src/plugins/file-manager-toolbar-button.tsx`

> No separate test file — tested via integration in example app E2E.

- [ ] **Step 1: Implement `src/plugins/file-manager-toolbar-button.tsx`**

```typescript
import { type ReactNode } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_LOW } from 'lexical'
import { OPEN_FILE_MANAGER_COMMAND } from '../commands'

interface FileManagerToolbarButtonProps {
  label?: string
  icon?: ReactNode
}

export function FileManagerToolbarButton({
  label = 'Media',
  icon = '📁',
}: FileManagerToolbarButtonProps) {
  const [editor] = useLexicalComposerContext()

  const handleClick = () => {
    editor.dispatchCommand(OPEN_FILE_MANAGER_COMMAND, undefined)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        border: '1px solid #e2e8f0',
        borderRadius: 4,
        background: 'transparent',
        cursor: 'pointer',
        fontSize: 13,
      }}
      aria-label="Open file manager"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/plugins/file-manager-toolbar-button.tsx
git commit -m "feat: FileManagerToolbarButton — dispatches OPEN_FILE_MANAGER_COMMAND"
```

---

## Task 11: FileManagerModal (full implementation)

**Files:**
- Modify: `src/plugins/file-manager-modal.tsx`

The modal wraps `@huongda-group/react-file-manager`. It uses the adapter to fetch files, maps between `FileItem` ↔ `IFile`, and dispatches `INSERT_FILE_COMMAND` on file open.

> **Note on `IFile`:** The `@huongda-group/react-file-manager` package uses `IFile` with `_id` (not `id`), `isDirectory`, and custom fields via `[key: string]: any`. Map between `FileItem` and `IFile` carefully.

- [ ] **Step 1: Create mapper utility `src/plugins/i-file-mapper.ts`**

```typescript
import type { IFile } from '@huongda-group/react-file-manager'
import type { FileItem } from '../types'

export function fileItemToIFile(f: FileItem): IFile {
  return {
    _id: f.id,
    name: f.name,
    isDirectory: f.type === 'folder',
    path: f.path,
    updatedAt: '',
    size: f.size,
    mimeType: f.mimeType,
    url: f.url,
    thumbnailUrl: f.thumbnailUrl,
  }
}

export function iFileToFileItem(f: IFile): FileItem {
  return {
    id: f._id,
    name: f.name,
    type: f.isDirectory ? 'folder' : 'file',
    path: f.path,
    mimeType: f.mimeType as string | undefined,
    url: f.url as string | undefined,
    size: f.size,
    thumbnailUrl: f.thumbnailUrl as string | undefined,
  }
}
```

- [ ] **Step 2: Replace `src/plugins/file-manager-modal.tsx` with full implementation**

```typescript
import { useEffect, useState, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { FileManager, type IFile } from '@huongda-group/react-file-manager'
import { INSERT_FILE_COMMAND } from '../commands'
import { fileItemToIFile, iFileToFileItem } from './i-file-mapper'
import type { FileManagerAdapter } from '../adapters/types'

interface FileManagerModalProps {
  adapter: FileManagerAdapter
  displayMode: 'modal' | 'fullscreen'
  onDisplayModeChange: (mode: 'modal' | 'fullscreen') => void
  onClose: () => void
}

export function FileManagerModal({
  adapter,
  displayMode,
  onDisplayModeChange,
  onClose,
}: FileManagerModalProps) {
  const [editor] = useLexicalComposerContext()
  const [files, setFiles] = useState<IFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState('/')

  const fetchFiles = useCallback(
    async (path: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const items = await adapter.fetchFiles(path)
        setFiles(items.map(fileItemToIFile))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files')
      } finally {
        setIsLoading(false)
      }
    },
    [adapter],
  )

  useEffect(() => {
    fetchFiles(currentPath)
  }, [fetchFiles, currentPath])

  const handleFileOpen = (file: IFile) => {
    if (file.isDirectory) return
    editor.dispatchCommand(INSERT_FILE_COMMAND, iFileToFileItem(file))
  }

  const handleFolderChange = (path: string) => {
    setCurrentPath(path)
  }

  const isFullscreen = displayMode === 'fullscreen'

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: isFullscreen ? 'stretch' : 'center',
    justifyContent: 'center',
  }

  const containerStyle: React.CSSProperties = isFullscreen
    ? { width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }
    : { width: '90vw', maxWidth: 1100, height: '80vh', background: '#fff', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }

  return (
    <div
      data-testid="file-manager-modal"
      style={overlayStyle}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Media Library</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => onDisplayModeChange(isFullscreen ? 'modal' : 'fullscreen')}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
            >
              {isFullscreen ? '⊡' : '⛶'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <span style={{ color: '#e53e3e' }}>{error}</span>
              <button type="button" onClick={() => fetchFiles(currentPath)}>Retry</button>
            </div>
          ) : (
            <FileManager
              files={files}
              isLoading={isLoading}
              height="100%"
              onFileOpen={handleFileOpen}
              onFolderChange={handleFolderChange}
              onUpload={async (file) => {
                const results = await adapter.upload([file])
                const mapped = results.map(fileItemToIFile)
                setFiles((prev) => [...prev, ...mapped])
                return mapped[0]
              }}
              onDelete={(items, _trash) => {
                adapter.delete(items.map(iFileToFileItem)).then(() => {
                  const ids = new Set(items.map((f) => f._id))
                  setFiles((prev) => prev.filter((f) => !ids.has(f._id)))
                })
              }}
              onCreateFolder={(name, parent) => {
                const path = parent?.path ?? currentPath
                adapter.createFolder(name, path).then(() => fetchFiles(currentPath))
              }}
              onRefresh={() => fetchFiles(currentPath)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run existing plugin test — confirm still passes**

```bash
npx vitest run tests/plugins/file-manager-plugin.test.tsx --reporter=verbose 2>&1 | tail -8
```

Expected: 3 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/plugins/file-manager-modal.tsx src/plugins/i-file-mapper.ts
git commit -m "feat: FileManagerModal — full react-file-manager integration, overlay/fullscreen toggle"
```

---

## Task 12: useFileManager Hook

**Files:**
- Create: `src/hooks/use-file-manager.ts`

- [ ] **Step 1: Implement `src/hooks/use-file-manager.ts`**

```typescript
import { useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { OPEN_FILE_MANAGER_COMMAND, INSERT_FILE_COMMAND } from '../commands'
import type { FileItem } from '../types'

export function useFileManager() {
  const [editor] = useLexicalComposerContext()

  const open = useCallback(() => {
    editor.dispatchCommand(OPEN_FILE_MANAGER_COMMAND, undefined)
  }, [editor])

  const insert = useCallback(
    (file: FileItem) => {
      editor.dispatchCommand(INSERT_FILE_COMMAND, file)
    },
    [editor],
  )

  return { open, insert }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-file-manager.ts
git commit -m "feat: useFileManager hook — open() and insert() commands"
```

---

## Task 13: Preset + Public Exports

**Files:**
- Create: `src/preset.tsx`
- Create: `src/index.ts`

- [ ] **Step 1: Create `src/preset.tsx`**

```typescript
import { RestAdapter } from './adapters/RestAdapter'
import { FileManagerPlugin, FILE_MANAGER_NODES } from './plugins/FileManagerPlugin'
import { FileManagerToolbarButton } from './plugins/FileManagerToolbarButton'
import type { RestAdapterConfig } from './adapters/types'
import type { FileManagerAdapter } from './adapters/types'
import type { FileItem } from './types'
import type { ReactNode } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

interface LexicalFileManagerPluginProps {
  // Data — provide one of: restConfig OR custom callbacks
  restConfig?: RestAdapterConfig
  adapter?: FileManagerAdapter
  onFetchFiles?: (path: string) => Promise<FileItem[]>
  onUpload?: (files: File[]) => Promise<FileItem[]>
  onDelete?: (items: FileItem[]) => Promise<void>
  onCreateFolder?: (name: string, path: string) => Promise<void>

  // Modal
  defaultDisplayMode?: 'modal' | 'fullscreen'

  // Insert override
  onFileSelect?: (file: FileItem, editor: ReturnType<typeof useLexicalComposerContext>[0]) => void

  // Toolbar button (not rendered by preset — consumer places <FileManagerToolbarButton> explicitly)

  // i18n (passed through)
  locale?: string
}

export function LexicalFileManagerPlugin({
  restConfig,
  adapter: adapterProp,
  onFetchFiles,
  onUpload,
  onDelete,
  onCreateFolder,
  defaultDisplayMode,
  onFileSelect,
}: LexicalFileManagerPluginProps) {
  const adapter: FileManagerAdapter = adapterProp ?? buildAdapter({ restConfig, onFetchFiles, onUpload, onDelete, onCreateFolder })

  return (
    <FileManagerPlugin
      adapter={adapter}
      onFileSelect={onFileSelect}
      defaultDisplayMode={defaultDisplayMode}
    />
  )
}

function buildAdapter(opts: {
  restConfig?: RestAdapterConfig
  onFetchFiles?: (path: string) => Promise<FileItem[]>
  onUpload?: (files: File[]) => Promise<FileItem[]>
  onDelete?: (items: FileItem[]) => Promise<void>
  onCreateFolder?: (name: string, path: string) => Promise<void>
}): FileManagerAdapter {
  if (opts.restConfig) {
    const base = new RestAdapter(opts.restConfig)
    return {
      fetchFiles: opts.onFetchFiles ?? base.fetchFiles.bind(base),
      upload: opts.onUpload ?? base.upload.bind(base),
      delete: opts.onDelete ?? base.delete.bind(base),
      createFolder: opts.onCreateFolder ?? base.createFolder.bind(base),
    }
  }

  // Custom-only adapter — all callbacks required
  if (!opts.onFetchFiles) {
    throw new Error('[react-lexical-file-manager] Provide either restConfig or onFetchFiles.')
  }

  return {
    fetchFiles: opts.onFetchFiles,
    upload: opts.onUpload ?? (() => Promise.resolve([])),
    delete: opts.onDelete ?? (() => Promise.resolve()),
    createFolder: opts.onCreateFolder ?? (() => Promise.resolve()),
  }
}
```

- [ ] **Step 2: Create `src/index.ts`**

```typescript
// Preset
export { LexicalFileManagerPlugin } from './preset'

// Core parts
export { FileManagerPlugin, FILE_MANAGER_NODES } from './plugins/FileManagerPlugin'
export { FileManagerToolbarButton } from './plugins/FileManagerToolbarButton'
export { FileManagerModal } from './plugins/FileManagerModal'

// Nodes
export { ImageNode, $createImageNode, $isImageNode } from './nodes/ImageNode'
export { VideoNode, $createVideoNode, $isVideoNode } from './nodes/VideoNode'
export { FileNode, $createFileNode, $isFileNode } from './nodes/FileNode'

// Commands
export { OPEN_FILE_MANAGER_COMMAND, INSERT_FILE_COMMAND } from './commands'

// Hook
export { useFileManager } from './hooks/useFileManager'

// Adapter
export { RestAdapter } from './adapters/RestAdapter'

// Types
export type { FileManagerAdapter, RestAdapterConfig } from './adapters/types'
export type { FileItem } from './types'
export type { SerializedImageNode } from './nodes/ImageNode'
export type { SerializedVideoNode } from './nodes/VideoNode'
export type { SerializedFileNode } from './nodes/FileNode'
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run --reporter=verbose 2>&1 | tail -20
```

Expected: All tests PASS.

- [ ] **Step 4: Build library**

```bash
npm run build 2>&1 | tail -20
```

Expected: `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts` created. No errors.

- [ ] **Step 5: Commit**

```bash
git add src/preset.tsx src/index.ts dist/
git commit -m "feat: LexicalFileManagerPlugin preset + public exports + dist build"
```

---

## Task 14: Example App Scaffolding

> `example/` uses root `node_modules` — no separate `package.json`. All example deps (msw, lexical, etc.) are already in root `devDependencies` from Task 1.

**Files:**
- Create: `example/vite.config.ts`
- Create: `example/index.html`
- Create: `example/src/mock-server.ts`

- [ ] **Step 1: Create `example/vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-lexical-file-manager': resolve(__dirname, '../src/index.ts'),
    },
  },
})
```

- [ ] **Step 2: Create `example/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>react-lexical-file-manager demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `example/src/main.tsx`**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { worker } from './mock-server'

worker.start({ onUnhandledRequest: 'bypass' }).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

- [ ] **Step 4: Create `example/src/mock-server.ts`**

```typescript
import { setupWorker, http, HttpResponse } from 'msw/browser'
import type { FileItem } from 'react-lexical-file-manager'

const FILES: FileItem[] = [
  {
    id: '1',
    name: 'photos',
    type: 'folder',
    path: '/',
  },
  {
    id: '2',
    name: 'banner.jpg',
    type: 'file',
    path: '/',
    mimeType: 'image/jpeg',
    url: 'https://picsum.photos/seed/banner/1200/600',
    thumbnailUrl: 'https://picsum.photos/seed/banner/300/150',
    size: 204800,
  },
  {
    id: '3',
    name: 'demo-video.mp4',
    type: 'file',
    path: '/',
    mimeType: 'video/mp4',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/video/300/150',
    size: 1048576,
  },
  {
    id: '4',
    name: 'report.pdf',
    type: 'file',
    path: '/',
    mimeType: 'application/pdf',
    url: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
    size: 2516582,
  },
]

export const worker = setupWorker(
  http.get('http://localhost:4000/', () => HttpResponse.json(FILES)),
  http.post('http://localhost:4000/upload', () => HttpResponse.json([])),
  http.delete('http://localhost:4000/', () => new HttpResponse(null, { status: 204 })),
  http.post('http://localhost:4000/folder', () => new HttpResponse(null, { status: 201 })),
)
```

- [ ] **Step 5: Commit**

```bash
git add example/
git commit -m "feat: example app scaffolding with MSW mock API"
```

---

## Task 15: Example Editor + Toolbar

**Files:**
- Create: `example/src/app.tsx`
- Create: `example/src/editor.tsx`
- Create: `example/src/toolbar.tsx`

- [ ] **Step 1: Create `example/src/toolbar.tsx`**

```typescript
import { FileManagerToolbarButton } from 'react-lexical-file-manager'

export function Toolbar() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '8px 12px',
        border: '1px solid #e2e8f0',
        borderBottom: 'none',
        borderRadius: '6px 6px 0 0',
        background: '#f7fafc',
      }}
    >
      <FileManagerToolbarButton label="Media" />
    </div>
  )
}
```

- [ ] **Step 2: Create `example/src/editor.tsx`**

```typescript
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import {
  LexicalFileManagerPlugin,
  FILE_MANAGER_NODES,
} from 'react-lexical-file-manager'
import { Toolbar } from './Toolbar'

const theme = {
  paragraph: 'editor-paragraph',
}

export function Editor() {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'demo',
        nodes: [...FILE_MANAGER_NODES],
        onError: console.error,
        theme,
      }}
    >
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, maxWidth: 860, margin: '0 auto' }}>
        <Toolbar />
        <div style={{ position: 'relative', minHeight: 400 }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{ outline: 'none', padding: 16, minHeight: 400 }}
                data-testid="editor-content"
              />
            }
            placeholder={
              <div style={{ position: 'absolute', top: 16, left: 16, color: '#a0aec0', pointerEvents: 'none' }}>
                Start typing or click Media to insert files...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <LexicalFileManagerPlugin
            restConfig={{ baseUrl: 'http://localhost:4000' }}
            defaultDisplayMode="modal"
          />
        </div>
      </div>
    </LexicalComposer>
  )
}
```

- [ ] **Step 3: Create `example/src/app.tsx`**

```typescript
import { Editor } from './Editor'

export function App() {
  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 8, fontSize: 20 }}>react-lexical-file-manager demo</h1>
      <p style={{ color: '#718096', marginBottom: 24, fontSize: 14 }}>
        Click <strong>Media</strong> in the toolbar to open the file manager.
      </p>
      <Editor />
    </div>
  )
}
```

- [ ] **Step 4: Start example app and manually verify**

```bash
npm run example
```

Open http://localhost:5173. Verify:
- Editor renders with toolbar
- "Media" button visible
- Click Media → file manager modal opens
- Click an image → ImageNode appears in editor
- Click a video → VideoNode appears in editor
- Click a PDF → FileNode chip appears in editor
- Toggle fullscreen button works
- Close button works

- [ ] **Step 5: Commit**

```bash
git add example/src/app.tsx example/src/editor.tsx example/src/toolbar.tsx
git commit -m "feat: example app — Editor, Toolbar, full demo integration"
```

---

## Task 16: E2E Tests (Playwright)

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/file-manager.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

```bash
npx playwright install chromium
```

Expected: Chromium browser downloaded.

- [ ] **Step 2: Create `playwright.config.ts`**

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: {
    command: 'npm run example -- --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
```

- [ ] **Step 3: Create `e2e/file-manager.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test('toolbar button opens file manager modal', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /media/i }).click()
  await expect(page.getByTestId('file-manager-modal')).toBeVisible()
})

test('close button dismisses modal', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /media/i }).click()
  await page.getByRole('button', { name: /close/i }).click()
  await expect(page.getByTestId('file-manager-modal')).not.toBeVisible()
})

test('clicking overlay backdrop dismisses modal', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /media/i }).click()
  // Click the overlay (outside the modal container)
  await page.mouse.click(10, 10)
  await expect(page.getByTestId('file-manager-modal')).not.toBeVisible()
})

test('fullscreen toggle button changes modal size', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /media/i }).click()
  const modal = page.getByTestId('file-manager-modal')
  await expect(modal).toBeVisible()
  await page.getByRole('button', { name: /fullscreen/i }).click()
  // In fullscreen mode the inner container should fill viewport width
  const box = await modal.boundingBox()
  expect(box?.width).toBeGreaterThan(page.viewportSize()!.width * 0.95)
})

test('editor content area is accessible via data-testid', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('editor-content')).toBeVisible()
})
```

- [ ] **Step 4: Run E2E tests**

```bash
npm run test:e2e 2>&1 | tail -20
```

Expected: All 5 tests PASS. If any fail, inspect with `npx playwright test --headed` to debug.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e/file-manager.spec.ts
git commit -m "test: Playwright E2E — modal open/close, overlay dismiss, fullscreen toggle"
```

---

## Task 17: Run Full Test Suite + Final Build

- [ ] **Step 1: Run all unit + integration tests**

```bash
npx vitest run --reporter=verbose 2>&1
```

Expected: All tests PASS. No failures.

- [ ] **Step 2: Run E2E**

```bash
npm run test:e2e
```

Expected: All 5 E2E tests PASS.

- [ ] **Step 3: Clean build**

```bash
rm -rf dist && npm run build
```

Expected: `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts` generated. No TypeScript errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: v0.1.0 — full test suite passing, dist build clean"
```
