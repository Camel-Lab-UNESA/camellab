export function messageOf(error: unknown, fallback: string): string {
  const err = error as { data?: { statusMessage?: string }, statusMessage?: string, message?: string }
  return err.data?.statusMessage ?? err.statusMessage ?? err.message ?? fallback
}
