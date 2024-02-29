import App from '/src/App'
import ConnectScreen from '/src/screens/ConnectScreen'
import SettingsScreen from '/src/screens/SettingsScreen'

export default [
  {
    path: '/',
    element: <App />,
    children: [
      {
        children: [
          {
            path: '/',
            element: <ConnectScreen />,
          },
          {
            path: 'settings',
            element: <SettingsScreen />,
          },
        ],
      },
    ],
  },
]
