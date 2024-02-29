import {useState} from 'react'
import {useIO} from 'react-io'
import Form from '/src/components/Form'

export default function SettingsScreen() {
  const io = useIO()
  const settings = useIO('/remote/api/settings')

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(settings)
  const [errors, setErrors] = useState(null)

  const handleSubmit = async ({formData}) => {
    setLoading(true)
    setErrors(null)

    try {
      await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 500)),
        io('/remote/api/settings', 'POST', {
          body: formData,
          headers: {'Content-Type': 'application/json'},
          returnStateWrapper: true,
        }),
      ])
    } catch (error) {
      setErrors({
        __errors: ['There was a problem saving your data. Please try again.'],
      })
    }

    setLoading(false)
  }

  const schema = {
    type: 'object',
    title: 'Global Settings',
    required: ['applicationId'],
    properties: {
      applicationId: {
        type: 'string',
        title: 'Teller Application Id',
      },
      fireflyToken: {
        type: 'string',
        title: 'Firefly III Token',
      },
      importerUrl: {
        type: 'string',
        title: 'Firefly III Importer Url',
      },
      enabledAccounts: {
        type: 'array',
        title: 'Accounts',
        uniqueItems: true,
        default: [],
        items: {
          type: 'string',
          oneOf: Object.keys(settings?.accounts).length
            ? Object.entries(settings.accounts).map(
                ([key, {institution, name, last_four}]) => ({
                  type: 'string',
                  enum: [key],
                  title: `${institution.name} ${name} (${last_four})`,
                })
              )
            : undefined,
        },
      },
      cron: {
        type: 'array',
        title: 'Cron Schedule',
        items: {
          type: 'string',
        },
      },
      sandbox: {
        type: 'boolean',
        title: 'Use Sandbox Environment',
      },
      proxy: {
        type: 'object',
        title: 'Proxy Settings',
        properties: {
          socks: {
            type: 'string',
            title: 'Proxy Url',
          },
          dns: {
            title: 'DNS Server',
            type: 'string',
          },
        },
      },
    },
  }

  const uiSchema = {
    sandbox: {
      'ui:help':
        'Connect to a sandbox Teller environment using fake/mocked data. Useful for debugging. See https://teller.io/docs/guides/sandbox for more info.',
    },
    proxy: {
      socks: {
        'ui:help':
          'Currently only SOCKS proxies are supported. Be sure to include protocol & port (e.g. socks5://192.168.1.10:1080)',
      },
      dns: {
        'ui:help':
          'Multiple DNS servers can be set by passing a comma-delimited list.',
      },
    },
    enabledAccounts: {
      'ui:widget': 'checkboxes',
    },
  }

  return (
    <section className="card">
      <Form
        className="override"
        schema={schema}
        uiSchema={uiSchema}
        disabled={loading}
        formData={formData}
        onChange={({formData}) => setFormData(formData)}
        extraErrors={errors}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
