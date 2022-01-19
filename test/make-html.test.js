
import { describe, expect, it } from '@jest/globals';
import { blogTemplate, makeHTML } from '../src/make-html';

describe('html', () => {
  it('creates a html string', () => {
    const input = {
      content: '<strong>hi</strong>',
      metadata: {
        date: 'DATE',
      },
    };

    const parsed = makeHTML(input);

    const output = `
    <section>
      <strong>hi</strong>
      <p>Skrifað: DATE</p>
    </section>
  `
    expect(parsed).toBe(output)
  });

  it('creates a html template', () => {
    const parsed = blogTemplate('');

    const output = `
  <!doctype html>
  <html>
    <head>
      <title></title>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      
    </body>
  </html>`
    expect(parsed).toBe(output)
  });

});
