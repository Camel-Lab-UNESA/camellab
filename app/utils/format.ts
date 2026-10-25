export function formatDate(value: string | Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}
