import type { JSX, ReactNode, CSSProperties } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OPEN_FILE_MANAGER_COMMAND } from '../commands';

interface FileManagerToolbarButtonProps {
  label?: string;
  icon?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function FileManagerToolbarButton(props: FileManagerToolbarButtonProps): JSX.Element {
  const editor = useLexicalComposerContext()[0];

  function handleClick(): void {
    editor.dispatchCommand(OPEN_FILE_MANAGER_COMMAND, undefined);
  }

  const label = props.label ?? 'Media';
  return (
    <button type="button" onClick={handleClick} className={props.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 4, background: 'transparent', cursor: 'pointer', fontSize: 13, ...props.style }} aria-label={label}>
      <span>{props.icon ?? '📁'}</span>
      <span>{label}</span>
    </button>
  );
}
