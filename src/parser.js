import matter from 'gray-matter';
import { marked } from 'marked';

/**
 * Parse markdown string with frontmatter
 * @param {string} input Input markdown string
 * @returns {object} Parsed markdown with frontmatter metadata
 */
export function parse(input) {
  const { content, data } = matter(input);

  const { title, slug, date } = data;

  const parsed = marked.parse(content);

  const metadata = {};

  if (title) {
    metadata.title = title;
  }

  if (slug) {
    metadata.slug = slug;
  }

  if (date) {
    metadata.date = date;
  }

  return {
    content: parsed,
    metadata,
  };
}
