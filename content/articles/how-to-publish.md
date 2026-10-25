---
title: How to publish a post on Camellab
description: News and articles are plain Markdown files. Here is what goes at the top of one, and where it goes.
date: 2026-10-25
author: Camellab
---

Every post on this site is a Markdown file in the project's `content` folder. News goes in `content/news`, articles in `content/articles`.

## The top of the file

Each file starts with a short block that describes the post:

```md
---
title: What the post is called
description: One or two sentences shown in lists.
date: 2026-10-25
author: Your name
---
```

The file name becomes the address, so `content/articles/my-first-post.md` is published at `/articles/my-first-post`.

## Writing the post

Below that block, write normally. Use `##` for section headings, leave a blank line between paragraphs, and add links with `[text](https://example.com)`. Reading time is worked out for you.
