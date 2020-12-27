export const assert = (predicate: unknown, message?: string, extra = {}) => {
  if (!predicate) {
    console.error('AssertionError:', message, extra)
    const error = new Error(message)
    error.name = 'AssertionError'
    error.extra = extra
    throw error
  }
}
