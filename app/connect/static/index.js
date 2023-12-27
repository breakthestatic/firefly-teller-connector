const {enrollmentId} = Object.fromEntries(new URLSearchParams(location.search))

document.addEventListener('DOMContentLoaded', function () {
  const connectButton = document.getElementById('teller-connect')
  const tellerConnect = TellerConnect.setup({
    applicationId,
    // Teller doesn't like passing a potentially undefined enrollmentId
    ...(enrollmentId ? {enrollmentId} : {}),
    onInit: function () {
      console.log('Teller Connect has initialized')
    },

    onSuccess: function (enrollment) {
      console.log('User enrolled successfully', enrollment.accessToken)
      navigator.clipboard.writeText(enrollment.accessToken)
      fetch('/api/enrollments', {
        method: 'POST',
        body: JSON.stringify(enrollment),
        headers: {'Content-Type': 'application/json'},
      })
    },
    onExit: function () {
      console.log('User closed Teller Connect')
    },
  })

  connectButton.addEventListener('click', function () {
    tellerConnect.open()
  })
})
