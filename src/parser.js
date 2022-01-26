import { marked } from 'marked';
import matter from 'gray-matter';

/**
 * Parse markdown string with frontmatter
 * @param {string} input Input markdown string
 * @returns {object} Parsed markdown with frontmatter metadata
 */
export function parse(input) {
  const { content, data } = matter(input);

  const { title, slug, date } = data;

  const parsed = marked.parse(content);

  return {
    content: parsed,
    metadata: {
      title,
      slug,
      date,
    },
  };
}
