import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from 'lexical';
import { $isHeadingNode, $createHeadingNode, HeadingTagType, $isQuoteNode, $createQuoteNode } from '@lexical/rich-text';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, ListNode } from '@lexical/list';
import { $getNearestNodeOfType } from '@lexical/utils';
import { FileManagerToolbarButton } from 'react-lexical-file-manager';

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'quote' | 'bullet' | 'number';

const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: 'Normal',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  quote: 'Quote',
  bullet: 'Bullet List',
  number: 'Numbered List',
};

interface ToolbarColors {
  bg: string; border: string; color: string;
  activeBg: string; activeColor: string; activeBorder: string;
  disabledColor: string; selectBg: string;
}

interface ToolbarProps {
  theme: 'light' | 'dark';
  colors: ToolbarColors;
}

function mkDivider(colors: ToolbarColors) {
  return <span style={{ width: 1, height: 20, background: colors.border, margin: '0 4px', flexShrink: 0 }} />;
}

interface ToolbarBtnProps {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  colors: ToolbarColors;
}

function Btn(props: ToolbarBtnProps): JSX.Element {
  return (
    <button
      type="button"
      title={props.title}
      disabled={props.disabled}
      onClick={props.onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 28,
        height: 28,
        padding: '0 5px',
        background: props.active ? props.colors.activeBg : 'none',
        color: props.active ? props.colors.activeColor : props.disabled ? props.colors.disabledColor : props.colors.color,
        border: props.active ? `1px solid ${props.colors.activeBorder}` : '1px solid transparent',
        borderRadius: 5,
        cursor: props.disabled ? 'default' : 'pointer',
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {props.children}
    </button>
  );
}

export function Toolbar(props: ToolbarProps): JSX.Element {
  const editor = useLexicalComposerContext()[0];
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [blockType, setBlockType] = useState<BlockType>('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsUnderline(selection.hasFormat('underline'));
    setIsStrike(selection.hasFormat('strikethrough'));

    const anchorNode = selection.anchor.getNode();
    const element = anchorNode.getKey() === 'root'
      ? anchorNode
      : anchorNode.getTopLevelElementOrThrow();

    if ($isListNode(element)) {
      const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
      const type = parentList != null ? parentList.getListType() : element.getListType();
      setBlockType(type === 'bullet' ? 'bullet' : 'number');
    } else if ($isHeadingNode(element)) {
      setBlockType(element.getTag() as BlockType);
    } else if ($isQuoteNode(element)) {
      setBlockType('quote');
    } else {
      setBlockType('paragraph');
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(updateToolbar);
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(CAN_UNDO_COMMAND, (v) => { setCanUndo(v); return false; }, COMMAND_PRIORITY_CRITICAL);
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(CAN_REDO_COMMAND, (v) => { setCanRedo(v); return false; }, COMMAND_PRIORITY_CRITICAL);
  }, [editor]);

  function setBlock(type: BlockType): void {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (type === 'bullet') {
        if (blockType === 'bullet') {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        } else {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }
        return;
      }
      if (type === 'number') {
        if (blockType === 'number') {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        } else {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }
        return;
      }

      const nodes = selection.getNodes();
      const elements = new Set(nodes.map((n) => n.getTopLevelElementOrThrow()));
      elements.forEach((el) => {
        if (type === 'paragraph') {
          el.replace($createParagraphNode());
        } else if (type === 'quote') {
          el.replace($createQuoteNode());
        } else {
          el.replace($createHeadingNode(type as HeadingTagType));
        }
      });
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, padding: '6px 10px', background: props.colors.bg, borderBottom: `1px solid ${props.colors.border}`, minHeight: 42, transition: 'background 0.25s, border-color 0.25s' }}>
      <Btn colors={props.colors} title="Undo (⌘Z)" disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>↩</Btn>
      <Btn colors={props.colors} title="Redo (⌘⇧Z)" disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>↪</Btn>
      {mkDivider(props.colors)}
      <select
        value={blockType}
        onChange={(e) => setBlock(e.target.value as BlockType)}
        style={{ height: 28, border: `1px solid ${props.colors.border}`, borderRadius: 5, background: props.colors.selectBg, color: props.colors.color, fontSize: 12, padding: '0 4px', cursor: 'pointer', outline: 'none', transition: 'background 0.25s, color 0.25s' }}
      >
        {(Object.keys(BLOCK_LABELS) as BlockType[]).map((k) => (
          <option key={k} value={k}>{BLOCK_LABELS[k]}</option>
        ))}
      </select>
      {mkDivider(props.colors)}
      <Btn colors={props.colors} title="Bold (⌘B)" active={isBold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}><b>B</b></Btn>
      <Btn colors={props.colors} title="Italic (⌘I)" active={isItalic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}><i>I</i></Btn>
      <Btn colors={props.colors} title="Underline (⌘U)" active={isUnderline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}><u>U</u></Btn>
      <Btn colors={props.colors} title="Strikethrough" active={isStrike} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}><s>S</s></Btn>
      {mkDivider(props.colors)}
      <Btn colors={props.colors} title="Align Left" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}>⬅</Btn>
      <Btn colors={props.colors} title="Align Center" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}>↔</Btn>
      <Btn colors={props.colors} title="Align Right" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}>➡</Btn>
      <Btn colors={props.colors} title="Justify" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}>≡</Btn>
      {mkDivider(props.colors)}
      <FileManagerToolbarButton label="Media" style={{ border: `1px solid ${props.colors.border}`, color: props.colors.color }} />
    </div>
  );
}
