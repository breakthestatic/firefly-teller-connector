import {readFileSync} from 'fs'
import axios from 'axios'
import {SocksProxyAgent} from 'socks-proxy-agent'
import {Agent} from 'https'
import db from './db.js'
import dns from 'dns'

const proxy = db.get('proxy')
const fireflyToken = db.get('fireflyToken')
const apiUrl = db.get('apiUrl')

const createAgent = () =>
  proxy?.socks ? new SocksProxyAgent(proxy.socks) : new Agent()

// Set custom dns when specified
const resolver = new dns.Resolver()
if (proxy?.dns) resolver.setServers(proxy.dns)

const lookup = (hostname, _, callback) => {
  resolver.resolve4(hostname, (err, addresses) => {
    if (!addresses[0]) {
      throw new Error(`No address found for DNS resolution on ${hostname}`)
    }
    callback(err, addresses[0], 4)
  })
}

const tellerAgent = createAgent()
// Configure mutual TLS
tellerAgent.options.cert = readFileSync('data/cert.pem')
tellerAgent.options.key = readFileSync('data/key.pem')

export const tellerClient = axios.create({
  httpsAgent: tellerAgent,
  baseURL: 'https://api.teller.io',
})

export const importerClient = axios.create({
  httpsAgent: createAgent(),
  headers: {Authorization: `Bearer ${fireflyToken}`},
  lookup,
})

export const apiClient = axios.create({
  httpsAgent: createAgent(),
  headers: {Authorization: `Bearer ${fireflyToken}`},
  baseURL: apiUrl,
  lookup,
})
