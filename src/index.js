import {RouterProvider, createBrowserRouter} from 'react-router-dom'
import {createRoot} from 'react-dom/client'
import routes from '/src/routes'

document.body.innerHTML = '<div id="app"></div>'

const root = createRoot(document.getElementById('app'))
root.render(<RouterProvider router={createBrowserRouter(routes)} />)
