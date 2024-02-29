export default function ignoreClearCache() {
  return (source) => (request) => {
    const {method} = request

    // We use CLEAR_CACHE to manually clear items.
    if (method === 'CLEAR_CACHE') {
      return Promise.resolve()
    }

    return source(request)
  }
}
