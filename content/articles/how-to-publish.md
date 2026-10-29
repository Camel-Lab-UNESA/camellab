---
title: "How to publish a post on Camellab"
description: "News and articles are plain Markdown files. Here is what goes at the top of one, and where it goes."
date: 2026-10-25
author: "Camellab"
visibility: public
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
visibility: public
---
```

`visibility` decides who can read the post:

- `public`: everyone (the default when it's left out)
- `members`: anyone who is signed in
- `students` or `lecturers`: only that role
- `internal`: only the internal team

The internal team can always read every post.

The file name becomes the address, so `content/articles/my-first-post.md` is published at `/articles/my-first-post`.

## Writing the post

Below that block, write normally. Use `##` for section headings, leave a blank line between paragraphs, and add links with `[text](https://example.com)`. Reading time is worked out for you.

## Images and videos

In the admin editor, **Image** uploads a PNG, JPEG, GIF or WebP file (up to 4 MB) and asks you to describe it for readers who can't see it. In a file, an image looks like `![What the picture shows](/uploads/file-name.png)`.

Videos come from YouTube only. Put the video's link on a line of its own and it plays in the post:

```md
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

A YouTube link inside a sentence stays a normal link.

[https://www.youtube.com/watch?v=dQw4w9WgXcQ](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
