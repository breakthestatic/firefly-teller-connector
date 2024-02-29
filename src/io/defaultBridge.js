import {bridgeNonReactiveSource} from 'url-io'
import stringify from 'fast-json-stable-stringify'

// Configure bridge (allows reading REST API as observable).
export default function defaultBridge() {
  return bridgeNonReactiveSource({
    // Ignore headers when building cache key.
    requestCacheKey({path, params}) {
      const {headers, cacheTime, ...cleanedParams} = params
      return path + stringify(cleanedParams)
    },
    requestCacheTime({method, params}) {
      // Allow request to specify own cache time.
      if (Object.prototype.hasOwnProperty.call(params, 'cacheTime'))
        return params.cacheTime
      if (method === 'GET') return 2 * 60 * 60 * 1000
    },
    requestCacheInvalidationIterator({
      path,
      method,
      params: {invalidatesKey},
      originalPath,
    }) {
      // Allow caller to pass function to decide what is invalidated.
      if (typeof invalidatesKey === 'function') return invalidatesKey

      // Allow caller to pass string to decide what is invalidated.
      if (typeof invalidatesKey === 'string') {
        // Remove path prefix that is not part of cache key.
        // Allows passing URL in the same format as requests are defined.
        const prefix = originalPath.slice(0, originalPath.indexOf(path))
        // istanbul ignore else
        if (invalidatesKey.startsWith(prefix)) {
          invalidatesKey = invalidatesKey.slice(prefix.length)
        }

        return (key) => key.startsWith(invalidatesKey)
      }

      // Default invalidates anything under path.
      if (method !== 'GET') return (key) => key.startsWith(path)
    },
  })
}
