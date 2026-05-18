import { createCommand, type LexicalCommand } from 'lexical';
import type { FileItem } from '../types';

export const OPEN_FILE_MANAGER_COMMAND: LexicalCommand<void> =
  createCommand('OPEN_FILE_MANAGER_COMMAND');

export const INSERT_FILE_COMMAND: LexicalCommand<FileItem> =
  createCommand('INSERT_FILE_COMMAND');
