import {createIO, routes, compose} from 'url-io'
import ignoreClearCache from '/src/io/ignoreClearCache'
import defaultBridge from '/src/io/defaultBridge'

export default createIO(
  routes({
    '/remote': compose(
      defaultBridge(),
      ignoreClearCache()
    )(({path, method, params: {headers, body, ...params}}) =>
      fetch(path, {
        method,
        headers: {...headers},
        body: JSON.stringify(body),
        ...params,
      })
        .then((res) => res.json())
        .then((res) => res)
    ),
  })
)
