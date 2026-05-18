import type { JSX } from 'react';
import { useState } from 'react';
import { Sun, Moon, Github, Globe } from 'lucide-react';
import { Editor } from './editor';
import hdgLogo from './assets/hdg.svg';
import './app.css';

const LANGUAGES = [
  { code: 'ar-sa', label: 'العربية' },
  { code: 'da-dk', label: 'Dansk' },
  { code: 'de-de', label: 'Deutsch' },
  { code: 'en-us', label: 'English' },
  { code: 'es-es', label: 'Español' },
  { code: 'fa-ir', label: 'فارسی' },
  { code: 'fi-fi', label: 'Suomi' },
  { code: 'fr-fr', label: 'Français' },
  { code: 'he-il', label: 'עברית' },
  { code: 'hi-in', label: 'हिन्दी' },
  { code: 'it-it', label: 'Italiano' },
  { code: 'ja-jp', label: '日本語' },
  { code: 'ko-kr', label: '한국어' },
  { code: 'nb-no', label: 'Norsk' },
  { code: 'pl-pl', label: 'Polski' },
  { code: 'pt-br', label: 'Português (BR)' },
  { code: 'pt-pt', label: 'Português (PT)' },
  { code: 'ru-ru', label: 'Русский' },
  { code: 'sv-se', label: 'Svenska' },
  { code: 'tr-tr', label: 'Türkçe' },
  { code: 'uk-ua', label: 'Українська' },
  { code: 'ur-ur', label: 'اردو' },
  { code: 'vi-vn', label: 'Tiếng Việt' },
  { code: 'zh-cn', label: '简体中文' },
];

export function App(): JSX.Element {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState('vi-vn');

  return (
    <div className={`demo-app demo-${theme}`}>
      <header className="demo-header">
        <div />
        <div className="demo-header-brand">
          <img src={hdgLogo} alt="HDG Logo" className="demo-logo" />
          <h1 className="demo-title">react-lexical-file-manager</h1>
        </div>
        <div className="demo-controls">
          <div className="demo-lang-wrapper">
            <Globe size={15} className="demo-lang-icon" />
            <select
              className="demo-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <button
            className="demo-theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      <main className="demo-main">
        <p className="demo-hint">Click <strong>Media</strong> in the toolbar to open the file manager.</p>
        <div className="demo-editor-wrapper">
          <Editor theme={theme} language={language} />
        </div>
      </main>

      <footer className="demo-footer">
        <a
          href="https://github.com/huongda-group/react-lexical-file-manager"
          target="_blank"
          rel="noopener noreferrer"
          className="demo-github-link"
        >
          <Github size={16} />
          <span>View on GitHub</span>
        </a>
      </footer>
    </div>
  );
}
