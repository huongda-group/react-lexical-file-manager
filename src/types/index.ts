import type { CSSProperties } from 'react';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  mimeType?: string;
  url?: string;
  size?: number;
  thumbnailUrl?: string;
}

export interface FileManagerPermissions {
  create?: boolean;
  upload?: boolean;
  move?: boolean;
  copy?: boolean;
  rename?: boolean;
  download?: boolean;
  delete?: boolean;
  chmod?: boolean;
  compress?: boolean;
  decompress?: boolean;
}

export interface FileManagerLabels {
  title?: string;
  insert?: string;
  retry?: string;
  fullscreen?: string;
  exitFullscreen?: string;
  close?: string;
}

export interface FileManagerAppearance {
  theme?: 'light' | 'dark';
  primaryColor?: string;
  fontFamily?: string;
  className?: string;
  style?: CSSProperties;
}
