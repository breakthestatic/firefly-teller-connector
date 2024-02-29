import RJSFForm from '@rjsf/mui'
import validator from '@rjsf/validator-ajv8'

const transformErrors = (errors) =>
  errors.map((error) => {
    if (error.name === 'required') {
      error.message = 'Required'
    }
    return error
  })

export default function Form(props) {
  return (
    <RJSFForm
      transformErrors={transformErrors}
      validator={validator}
      noHtml5Validate
      showErrorList={false}
      {...props}
    />
  )
}
