import {RouterProvider, createBrowserRouter} from 'react-router-dom'
import {createRoot} from 'react-dom/client'
import routes from '/src/routes'

const root = createRoot(document.getElementById('app'))
root.render(<RouterProvider router={createBrowserRouter(routes)} />)
