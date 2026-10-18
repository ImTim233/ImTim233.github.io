'use strict';

// Keep the vocabulary reference available alongside the current article.
hexo.extend.filter.register('after_render:html', html => html.replace(
  '<a href="/vokabeln/" rel="section">',
  '<a href="/vokabeln/" rel="noopener" target="_blank">'
));
