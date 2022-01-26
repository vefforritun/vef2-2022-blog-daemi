import { join } from 'path';

export function blogFilename(slug, basePath = '') {
  if (typeof slug !== 'string') {
    return null;
  }

  if (slug === '') {
    return null;
  }

  const filename = join(basePath, `${slug}.html`);

  return filename;
}
