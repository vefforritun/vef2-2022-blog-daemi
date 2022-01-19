import { join } from 'path';
import { writeFile, mkdir, readFile, readdir, stat } from 'fs/promises';

import graymatter from 'gray-matter';
import { marked } from 'marked';

import { blogTemplate, makeHTML, makeIndex } from './make-html.js';
import { parse } from './parser.js';

const BLOG_DIR = './blog';
const OUTPUT_DIR = './dist';

async function direxists(dir) {
  try {
    const info = await stat(dir);
    return info.isDirectory();
  } catch (e) {
    return false;
  }
}

async function main() {
  const files = await readdir(BLOG_DIR);

  if (!(await direxists(OUTPUT_DIR))) {
    await mkdir(OUTPUT_DIR);
  } 
  
  const blogs = [];

  for (const file of files) {
    const path = join(BLOG_DIR, file);
    const info = await stat(path);

    if (info.isDirectory()) {
      continue;
    }

    const data = await readFile(path);
    const str = data.toString('utf-8');

    const parsed = parse(str);
    const html = makeHTML(parsed);
    const blog = blogTemplate(parsed.metadata.title, html, true);
    const slug = parsed.metadata.slug;
    const filename = join(OUTPUT_DIR, `${slug}.html`);
    
    await writeFile(filename, blog, { flag: 'w+' });

    blogs.push(parsed.metadata);
  }

  const index = blogTemplate('Bloggið mitt!', makeIndex(blogs));
  await writeFile(join(OUTPUT_DIR, 'index.html'), index, { flag: 'w+' });
}

main().catch((err) => console.error(err));
