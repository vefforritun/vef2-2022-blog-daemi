import { join } from 'path';
import { writeFile, readFile, readdir, stat } from 'fs/promises';

import graymatter from 'gray-matter';
import { marked } from 'marked';

import { blogTemplate, makeHTML } from './make-html.js';
import { parse } from './parser.js';

const BLOG_DIR = './blog';
const OUTPUT_DIR = './dist';

async function main() {
  const files = await readdir(BLOG_DIR);
  
  for (const file of files) {
    const path = join(BLOG_DIR, file);
    const info = await stat(path);

    if (info.isDirectory()) {
      continue;
    }

    const data = await readFile(path);
    const str = data.toString('utf-8');

    const parsed = parse(str);
    
    console.log('parsed :>> ', parsed);

    const html = makeHTML(parsed);

    console.log('html :>> ', html);

    const blog = blogTemplate(parsed.metadata.title, html);
    const slug = parsed.metadata.slug;
    const filename = join(OUTPUT_DIR, `${slug}.html`);
    
    await writeFile(filename, blog, { flag: 'w+' });
  }

}

main().catch((err) => console.error(err));
