// Allow-list of URL schemes safe to render as <img src>, <video src>, or <a href>.
// Blocks javascript:, vbscript:, and data: (the latter enables data:text/html XSS via href).
// Relative and protocol-relative URLs are treated as safe.
const ALLOWED_SCHEMES = new Set([
  'http:',
  'https:',
  'blob:',
  'mailto:',
  'tel:'
]);

// Internal base used only to resolve relative URLs so they can be distinguished
// from absolute URLs carrying a dangerous scheme.
const RESOLVE_BASE = 'https://react-lexical-file-manager.invalid/';

/**
 * Returns the URL unchanged if its scheme is in the allow-list (or it is relative),
 * otherwise returns '' so the caller renders a broken-but-inert element instead of
 * an executable javascript:/data: link.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (url == null) {
    return '';
  }
  const trimmed = url.trim();
  if (trimmed === '') {
    return '';
  }
  try {
    // Resolving against a base means relative URLs adopt the base's https scheme
    // (→ allowed), while absolute URLs keep their own scheme for the check below.
    const parsed = new URL(trimmed, RESOLVE_BASE);
    if (!ALLOWED_SCHEMES.has(parsed.protocol)) {
      return '';
    }
    return trimmed;
  } catch {
    return '';
  }
}
