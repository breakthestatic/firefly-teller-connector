import {useIO} from 'react-io'
import {useTellerConnect} from 'teller-connect-react'

export default function ConnectScreen() {
  const io = useIO()
  const {applicationId, sandbox} = useIO('/remote/api/settings')

  const {open, ready} = useTellerConnect({
    applicationId,
    environment: sandbox ? 'sandbox' : 'production',
    onSuccess: (enrollment) => {
      io('/remote/api/enrollments', {
        method: 'POST',
        body: enrollment,
        headers: {'Content-Type': 'application/json'},
      }).then(() => {
        io('/remote/api/settings', 'CLEAR_CACHE')
      })
    },
  })

  return (
    <div className="connect">
      <button
        className="connect-button"
        id="teller-connect"
        onClick={open}
        disabled={!ready}
      >
        Connect to your bank
      </button>
    </div>
  )
}
