export default defineAppConfig({
  ui: {
    colors: { primary: 'ultra', neutral: 'ink' },
    button: { slots: { base: 'font-semibold' } },
    // Red lives only in error output: required marks are muted, field errors use the stderr ink.
    formField: {
      slots: { error: 'text-(--err-ink)' },
      variants: { required: { true: { label: 'after:text-(--muted)' } } }
    },
    input: { variants: { variant: { outline: 'bg-white' } } },
    textarea: { variants: { variant: { outline: 'bg-white' } } },
    selectMenu: { variants: { variant: { outline: 'bg-white' } } }
  }
})
