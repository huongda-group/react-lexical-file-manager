import type { JSX } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LexicalFileManagerPlugin, FILE_MANAGER_NODES } from 'react-lexical-file-manager';
import { Toolbar } from './toolbar';

interface EditorProps {
  theme: 'light' | 'dark';
  language: string;
}

const editorTheme = {
  paragraph: 'editor-p',
  heading: { h1: 'editor-h1', h2: 'editor-h2', h3: 'editor-h3' },
  quote: 'editor-quote',
  list: { ul: 'editor-ul', ol: 'editor-ol', listitem: 'editor-li' },
  text: { bold: 'editor-bold', italic: 'editor-italic', underline: 'editor-underline', strikethrough: 'editor-strike' },
};

export function Editor(props: EditorProps): JSX.Element {
  const bg = props.theme === 'dark' ? '#1e2025' : '#ffffff';
  const color = props.theme === 'dark' ? '#e5e7eb' : '#111827';
  const borderColor = props.theme === 'dark' ? '#374151' : '#e5e7eb';
  const toolbarBg = props.theme === 'dark' ? '#161b22' : '#f9fafb';
  const toolbarBorder = props.theme === 'dark' ? '#30363d' : '#e5e7eb';
  const toolbarColor = props.theme === 'dark' ? '#c9d1d9' : '#374151';
  const toolbarActiveBg = props.theme === 'dark' ? '#1f3a5f' : '#dbeafe';
  const toolbarActiveColor = props.theme === 'dark' ? '#93c5fd' : '#1d4ed8';
  const toolbarActiveBorder = props.theme === 'dark' ? '#2563eb' : '#bfdbfe';
  const toolbarDisabledColor = props.theme === 'dark' ? '#4b5563' : '#d1d5db';
  const selectBg = props.theme === 'dark' ? '#21262d' : '#ffffff';

  return (
    <LexicalComposer initialConfig={{
      namespace: 'demo',
      nodes: [...FILE_MANAGER_NODES, HeadingNode, QuoteNode, ListNode, ListItemNode],
      onError: console.error,
      theme: editorTheme
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg, transition: 'background 0.25s' }}>
        <Toolbar
          theme={props.theme}
          colors={{ bg: toolbarBg, border: toolbarBorder, color: toolbarColor, activeBg: toolbarActiveBg, activeColor: toolbarActiveColor, activeBorder: toolbarActiveBorder, disabledColor: toolbarDisabledColor, selectBg }}
        />
        <div style={{ position: 'relative', flex: 1 }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable style={{
                outline: 'none',
                padding: '16px 20px',
                minHeight: 260,
                fontSize: 15,
                lineHeight: 1.7,
                color,
                transition: 'color 0.25s',
              }} data-testid="editor-content" />
            }
            placeholder={
              <div style={{ position: 'absolute', top: 16, left: 20, color: props.theme === 'dark' ? '#6b7280' : '#9ca3af', pointerEvents: 'none', fontSize: 15 }}>
                Start typing…
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LexicalFileManagerPlugin
            onFetchFiles={(path) => fetch(`http://localhost:4000/?path=${encodeURIComponent(path)}`).then((r) => r.json())}
            defaultDisplayMode="modal"
            appearance={{ theme: props.theme }}
            language={props.language}
          />
        </div>
        <style>{`
          .editor-h1 { font-size: 1.75em; font-weight: 700; margin: 0.5em 0 0.25em; color: ${color}; }
          .editor-h2 { font-size: 1.35em; font-weight: 600; margin: 0.5em 0 0.25em; color: ${color}; }
          .editor-h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.25em; color: ${color}; }
          .editor-quote { border-left: 3px solid ${borderColor}; margin: 0; padding: 4px 0 4px 14px; color: ${props.theme === 'dark' ? '#9ca3af' : '#6b7280'}; font-style: italic; }
          .editor-ul, .editor-ol { padding-left: 20px; margin: 4px 0; }
          .editor-li { margin: 2px 0; }
          .editor-bold { font-weight: 700; }
          .editor-italic { font-style: italic; }
          .editor-underline { text-decoration: underline; }
          .editor-strike { text-decoration: line-through; }
        `}</style>
      </div>
    </LexicalComposer>
  );
}
