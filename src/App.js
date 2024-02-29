import {Link, Outlet} from 'react-router-dom'
import {Icon} from '@iconify/react'
import {IOProvider} from 'react-io'
import io from '/src/io'

export default function App() {
  return (
    <IOProvider io={io}>
      <nav>
        <Link to="/">
          <Icon icon="mdi:home" className="icon" />
        </Link>
        <Link to="/settings">
          <Icon icon="mdi:cog" className="icon" />
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </IOProvider>
  )
}
