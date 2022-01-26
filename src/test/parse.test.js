import { describe, expect, it } from '@jest/globals';
import { parse } from '../parser';

describe('parser', () => {
  it('parses a markdown file', () => {
    const input = '# hello world';

    const parsed = parse(input);

    expect(parsed.content).toBe('<h1 id="hello-world">hello world</h1>\n');
  });

  it('parses a markdown file 2', () => {
    const input = '# hello world!';

    const parsed = parse(input);

    expect(parsed.content).toBe('<h1 id="hello-world">hello world!</h1>\n');
  });

  it('parses a markdown file 3', () => {
    const input = `---
title: title
slug: xxx
---`;

    const parsed = parse(input);

    expect(parsed.content).toBe('');
    expect(parsed.metadata.title).toBe('title');
  });

  it.skip('parses a markdown file 4', () => {
    const input = `---
date: some-date
---`;

    const parsed = parse(input);

    expect(parsed.content).toBe('');
    expect(parsed.metadata.title).toBe('title');
  });

  it('should always have at least a slug', () => {
    const input = `---
slug: foo
---`;

    const parsed = parse(input);

    expect(parsed.content).toBe('');
    expect(parsed.metadata.slug).toBe('foo');
  });

  it('should not return a metadata key that is not included in the frontmatter', () => {
    const input = `---
---`;

    const parsed = parse(input);

    expect(parsed.content).toBe('');
    expect('slug' in parsed.metadata).toBe(false);
  });
});
