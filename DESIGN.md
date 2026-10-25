---
name: Camellab
description: An AI research lab's site that runs like a live notebook.
colors:
  paper: "#fafaf9"
  ink: "#111318"
  ultra: "#2f3bd6"
  amber: "#f5a524"
  mist: "#edeef1"
  muted: "#4a4e57"
  rule: "#c2c5cc"
  text: "#22252b"
  border: "#dcdee3"
  white: "#ffffff"
  err-bg: "#fdecea"
  err-ink: "#8a1c0d"
typography:
  display:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18.9cqi"
    fontWeight: 800
    lineHeight: 0.82
    letterSpacing: "-0.04em"
    fontVariation: "\"wdth\" 118"
  headline:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 112"
  title:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
    fontVariation: "\"wdth\" 112"
  lead:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  code:
    fontFamily: "JetBrains Mono Variable, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  data:
    fontFamily: "JetBrains Mono Variable, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "\"tnum\""
rounded:
  bar: "2px"
  sm: "4px"
  md: "6px"
  full: "9999px"
spacing:
  edge-phone: "16px"
  edge: "32px"
  gutter: "88px"
  toolbar-h: "56px"
  cell-block: "12px"
  cell-gap: "24px"
  well: "11px 15px"
components:
  button-primary:
    backgroundColor: "{colors.ultra}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
  cell-input:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "{spacing.well}"
  cell-run:
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "25.6px"
  stdout:
    textColor: "{colors.ink}"
    typography: "{typography.code}"
  stderr:
    backgroundColor: "{colors.err-bg}"
    textColor: "{colors.err-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "{spacing.well}"
  dataframe-row-even:
    backgroundColor: "{colors.mist}"
    padding: "10px 14px"
  toolbar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "{spacing.toolbar-h}"
  lang-switch:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  lang-switch-active:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
---

# Design System: Camellab

## Overview

**Creative North Star: "The Live Notebook"**

The whole site is a Jupyter-style notebook that visibly computes itself. Every section is a cell: a left execution gutter with an `[n]:` counter and a run button, a mist code well, and an output beneath. Cells queue and run in document order as they scroll into view, the toolbar's kernel status reports honestly whether anything is running, and outputs (a giant wordmark, a pandas-style table, stdout lines, a form) arrive by pushing the cells below them down.

The surface is light paper, flat and full-width. Ink carries the words, ultramarine marks anything executed or active, and amber marks anything running. Type is one variable family, Archivo, set heavy and expanded for display and plain for reading, with JetBrains Mono reserved for code, counters and data. Every animation runs on one shared clock, the beat.

It rejects the AI-lab default (dark hero, gradient glow, particle fields) and the template default (centred headline, bento cards, fade-up reveals).

**Key Characteristics:**
- Every section is a notebook cell with gutter, run bar, input well and output.
- Five cell states for page cells and form submits alike: idle, queued, running, done, error.
- A locked flat palette: paper, ink, ultramarine, amber, mist, plus error colours used only inside error output.
- Archivo expanded heavy for display, JetBrains Mono only for code, counters and data.
- One 140ms beat drives every animation; outputs displace content instead of fading in.

## Colors

A locked, flat palette of paper and ink with one blue for "executed" and one amber for "running".

### Primary
- **Ultramarine** (ultra): executed and active things. Done-cell counters, function names in code, the idle kernel dot, the focused-cell bar, the active toolbar link, links, primary buttons, the plot curve, focus outlines, the input caret. Nuxt UI's `primary` is mapped to the `ultra` scale (50 to 950 in main.css).

### Secondary
- **Running Amber** (amber): the one "in progress" signal. The running-cell bar, the busy kernel dot, the plot's live head point, and text selection. Never decorative.

### Neutral
- **Paper** (paper): page, toolbar and html background.
- **Ink** (ink): headlines, code, table headers, axis lines, and the error-state run bar and counter. Nuxt UI's `neutral` is mapped to the `ink` scale.
- **Body Ink** (text): running text.
- **Muted Slate** (muted): gutter counters, timings, captions, secondary meta.
- **Mist** (mist): code wells, zebra rows in tables, hairline dividers under the toolbar and above the footer, the hover run bar, the language switch track.
- **Rule Grey** (rule): the queued-cell bar, the disabled hatch lines, hover underlines, scrollbar thumb.
- **Border** (border): Nuxt UI component borders and accented backgrounds.
- **White** (white): form field backgrounds and the pressed language button, so widgets read as editable against paper.

### Error
- **Error Wash** (err-bg) and **Error Oxide** (err-ink): the stderr block only.

### Named Rules
**The Locked Palette Rule.** These colours, flat. No colour gradients, blends, glows, tints mixed on the fly, or syntax-highlighting palettes; code in posts stays ink on mist. The only `repeating-linear-gradient` allowed is the hard-stop hatch on disabled controls, which is a pattern, not a blend.

**The Red Stays In Stderr Rule.** Red appears only inside error output. A failed cell shows its failure with an ink run bar and a bold ink counter; the red lives in the stderr block it printed.

**The Two Signals Rule.** Ultramarine means done or active, amber means running. Don't swap them or use either as decoration.

## Typography

**Display Font:** Archivo Variable, width axis loaded (fallback ui-sans-serif, system-ui)
**Body Font:** Archivo Variable
**Label/Mono Font:** JetBrains Mono Variable (fallback ui-monospace, SFMono-Regular, Menlo)

**Character:** One grotesque stretched wide and heavy for headlines, and read plainly at body size, paired with a technical mono that only ever speaks for the machine.

### Hierarchy
- **Display** (800, wdth 118, 18.9cqi, 0.82): the hero wordmark only. It is sized in container units so it always spans its output's width.
- **Headline** (800, wdth 112, clamp(2.5rem, 7vw, 5.5rem), 0.95, max 20ch): page titles in markdown cells (section lists, posts, sign-in, profile).
- **Title** (800, wdth 112, 2rem, 1.1): section headings in markdown cells. Post h2s use 1.75rem, h3s use 1.2rem.
- **Lead** (500, 1.25rem, 1.45, max 34ch, balanced): the hero lab line.
- **Body** (400, 1.0625rem, 1.6; 1.7 in posts, max 68ch): running text and post prose.
- **Label** (600, 0.8125 to 0.875rem): toolbar links, buttons, the language switch, footer links. The toolbar brand is 800 at wdth 112.
- **Code** (mono, 0.9375rem, 1.55): input wells, stdout and stderr.
- **Data** (mono, 0.75 to 0.875rem, tabular figures): gutter counters, timings, table headers, row indexes, numeric columns, the row-count shape line, plot ticks, post meta.

### Named Rules
**The Mono Is The Machine Rule.** JetBrains Mono is used only for code, counters and data. Headlines, prose, buttons and labels are Archivo.

**The Width Axis Rule.** Display sizes always come with expanded width (wdth 108 to 118) and negative tracking. Body text stays at wdth 100.

## Layout

Full-width notebook. The page is a sticky 3.5rem toolbar, a `notebook` column padded by the edge, and a footer. Each cell is a two-column grid: an execution gutter (5.5rem on desktop, 0 on phones) and the content column. Cells sit 1.5rem apart with 0.75rem block padding; the notebook ends with 4rem of bottom space.

The edge is 1rem on phones and 2rem from 48rem up. Below 48rem the gutter collapses into a small row above the cell, markdown cells lose their gutter, the run button is always visible, and the date and read-time table columns fold into the title cell's meta line. The toolbar wraps on phones: brand, language and account on the first row, sections and kernel status beneath.

The hero output fills to the fold on desktop (100svh minus toolbar and well) with the wordmark on top and the log, lab line, action and plot anchored to the bottom; from 64rem the bottom row splits 5fr and 7fr. Widgets (forms) cap at 30rem, wide widgets at 44rem.

## Elevation & Depth

Flat. There are no shadows. Depth is tonal: mist wells and zebra rows sit on paper, form fields sit on white, and 1px mist hairlines separate the toolbar and footer. The sticky toolbar is separated by its hairline, not a shadow.

### Named Rules
**The Flat Paper Rule.** No box-shadows, glows or blurs. Use a mist fill or a 1px hairline instead.

## Shapes

Gentle 6px corners on wells, stderr blocks, buttons, inputs and the language switch; 4px on inline code and the pressed language segment; 2px on the 3px-wide run bar; full rounds only on the kernel dot and the gutter run button. Table header rules are a 1px ink line. Disabled controls are hatched with a 45 degree pattern of 1px rule-grey lines every 7px.

## Components

### The Cell (signature)
- **Anatomy:** a gutter holding the run bar (3px, left edge), the counter (`[ ]:`, `[*]:` while queued or running, `[n]:` once done), a round play button, and the elapsed time (`0.8s`) once finished; then the mist input well; then the output. Markdown cells have no code, counter or run button.
- **States:** idle (no bar; mist bar on hover), queued (rule bar, `[*]:`), running (amber bar, `[*]:`, kernel busy), done (ultramarine counter, no bar), error (ink bar, bold ink counter, stderr in the output). Focus shows an ultramarine bar.
- **Run button:** hidden until the cell has run or is hovered or focused; always visible on phones; mist hover fill. Shift+Enter in a cell re-runs it.
- **Code:** ink on mist; `name(` calls are ultramarine; nothing else is coloured.

### Outputs
- **DataFrame:** full-width table. Mono bold header labels over a 1px ink rule, a mono row index, zebra mist even rows, mono right-aligned numeric columns, and a `[n rows]` shape line beneath. The row title is the link, bold ink turning ultramarine and underlined on hover, and its hit area covers the whole row; keyboard focus outlines the row in ultramarine. With `lead`, the first row's title grows to 1.375rem at wdth 108 and shows its description.
- **stdout:** mono ink, pre-wrapped. Success marks are ultramarine; log lines take an ultramarine `> ` prompt.
- **stderr:** mono error-oxide text on an error-wash block, padded like the input well.
- **Plot:** SVG with an ink axis, mist gridlines, mono ticks, a 2.5px ultramarine curve and an amber head point, captioned as illustrative.

### Toolbar
- **Style:** paper background, mist hairline below, sticky. Brand in 800 Archivo with a muted mono `.ipynb` suffix.
- **Kernel status:** a dot and a label, "Idle" with an ultramarine dot or "Running" with a pulsing amber dot. It is true to the scheduler: busy while any cell is queued or running and while a form submits.
- **Run all:** a ghost button that re-runs every cell in order (desktop only).
- **Navigation:** 600 ink links with a 2px underline that turns rule grey on hover and ultramarine on the active route, which also turns the text ultramarine.
- **Language switch:** a segmented mist track; the pressed segment is white with ink text.

### Buttons
- **Shape:** 6px corners.
- **Primary:** ultramarine fill, white 600 label (Nuxt UI `primary`).
- **Ghost / Outline:** `neutral` ghost for Run all and Sign out, `neutral` outline for the profile link.
- **Disabled:** hatched, not just faded.

### Widgets (forms)
Account forms are the output of a code cell (`auth.sign_in()`, `profile.update()`), so a submit is one execution of that cell: running while in flight, then done with a new counter, or error with the message in stderr. Fields are Nuxt UI inputs on white. Outputs stay open after a run, so values survive the submit. A widget foot sits under a mist hairline.

### Motion (the kernel clock)

- **One clock:** `--beat` (140ms) times every transition and animation, and `useKernel` reads the same value. Durations are multiples of it; state colour changes are one linear beat.
- **Ordering:** cells queue themselves on entering the viewport (15%) and run one at a time in document order. Running a cell first runs every unrun cell above it.
- **Typed code:** typed cells type their code at a quarter beat per character with a blinking ink caret, then wait two beats before output.
- **Displacement:** output opens by animating grid rows from 0fr to 1fr over four beats with `--ease-out` (cubic-bezier(0.16, 1, 0.3, 1)), pushing later cells down. Nothing fades up.
- **Sweep:** table rows, log lines and stream items reveal left to right with a clip-path over two beats, staggered one beat per item index.
- **Plot:** the curve draws over ten beats, then appends a point every four beats while on screen.
- **Pulse and blink:** stepped (`steps(2)`) on a four-beat cycle, never eased.
- **Reduced motion:** all durations and delays go to zero, typing and waits are skipped, and the plot stays still. The order and states still happen.
- **No-JS:** the collapsed, hidden and unswept starting states apply only under the `nb-js` class set in the head, so without JavaScript every output is visible.

## Do's and Don'ts

### Do:
- **Do** put every new section in a cell: markdown cells for headings and prose, code cells (`thing.verb()`) for data, actions and forms.
- **Do** drive state through idle, queued, running, done and error, including form submits, and keep the kernel status honest.
- **Do** time every animation in multiples of `--beat` and gate starting states behind `nb-js`.
- **Do** reveal output by displacing the content below (grid rows), and stream rows left to right on the beat.
- **Do** render lists of posts as a DataFrame with a row index and a shape line.
- **Do** hatch disabled controls.

### Don't:
- **Don't** add colours, gradients, blends, glows or shadows outside the locked palette.
- **Don't** use red anywhere but inside error output.
- **Don't** set prose, headings, buttons or labels in mono; mono is only for code, counters and data.
- **Don't** fade or slide content up into place, or run animations on their own timers.
- **Don't** fake kernel activity: the status reads Running only while the scheduler or a submit is working.
- **Don't** colour code beyond ultramarine function names.
