# Surface brief: landing, content and account pages

Scope: `/` (landing, Persuade), plus `/news`, `/articles` and post pages (Read) and `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/profile` (Operate). Everything is full-width.

Audience and job: anyone curious about Camellab, an AI research lab, and especially students and lecturers who use Colab and Jupyter every week. They should leave knowing what the lab is and where its news and articles live. Joining is secondary.

Content: the about text, lab line, news and articles all come from Nuxt Content and stay truthful. The plot is illustrative and labelled as such. English and Bahasa Indonesia, with a switch.

User constraints: very good and modern, lots of animation, no AI slop (no neon gradients, glow, particle networks, or dark-hero-plus-mission-line). Full screen.

## Direction contract

THESIS: The site runs like a live notebook. Every section is a cell with an execution gutter that runs as it scrolls into view, so the page visibly computes itself. It refuses the AI-lab default (dark hero, gradient glow, particle field) and the modern-template default (centred headline, bento cards, fade-up).

OWN-WORLD: Locked palette, no gradients or blends: paper #FAFAF9, ink #111318, ultramarine #2F3BD6 for executed and active things, amber #F5A524 for running, mist #EDEEF1 for code wells and rules, plus a functional error red only inside error output. Archivo for words (expanded heavy for display) and JetBrains Mono only for code, counters and data. Cells have a left execution gutter `[n]:`, a run bar, and outputs that look like pandas tables and stdout. Corners are 6px.

STORY: The visitor watches `camellab.about()` type, run, and output the lab. They scroll, and About renders, then `news.latest()` and `articles.latest()` stream their rows, then `lab.join()`. Raises: one shared beat drives every animation (Step Sequencer). Outputs displace the cells below rather than fading up (Ebru). The palette stays locked (Sixteen-Colour). States are idle, queued, running, done or error, for page cells and form submits alike (Glaze Shelf). Disabled controls are hatched (Quote Grammar).

FIRST VIEWPORT: A sticky toolbar (Camellab, a kernel status that is Idle or Running and honest to the scheduler, News, Articles, EN/ID, Sign in). Below it, the hero code cell fills the rest of the screen: the gutter counter goes from `[ ]` to `[*]` to `[1]`, the code types itself, and the output shows CAMELLAB in giant expanded Archivo across the full width, then the lab line and the primary "About the lab" action on the left, with an illustrative live loss plot on the right that keeps appending points on the beat. Signature interaction: Shift+Enter or the gutter play button re-runs any cell.

FORM: Live Notebook, position 6 on the ordered list, seed key 7613866e.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
