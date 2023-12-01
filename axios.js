import {readFileSync} from 'fs'
import axios from 'axios'
import {SocksProxyAgent} from 'socks-proxy-agent'
import {Agent} from 'https'
import db from './db.js'
import dns from 'dns'

const proxy = db.get('proxy')
const tellerAgent = proxy?.socks
  ? new SocksProxyAgent(proxy.socks)
  : new Agent()

// Configure mutual TLS
tellerAgent.options.cert = readFileSync('data/cert.pem')
tellerAgent.options.key = readFileSync('data/key.pem')

export const tellerClient = axios.create({
  httpsAgent: tellerAgent,
  baseURL: 'https://api.teller.io',
})

const importerToken = db.get('importerToken')
const importerAgent = proxy?.socks
  ? new SocksProxyAgent(proxy.socks)
  : new Agent()

const resolver = new dns.Resolver()

// Set custom dns when specified
if (proxy?.dns) {
  resolver.setServers(proxy.dns)
}

export const importerClient = axios.create({
  httpsAgent: importerAgent,
  headers: {Authorization: `Bearer ${importerToken}`},
  lookup: (hostname, _, callback) => {
    resolver.resolve4(hostname, (err, addresses) => {
      if (!addresses[0]) {
        throw new Error(`No address found for DNS resolution on ${hostname}`)
      }

      callback(err, addresses[0], 4)
    })
  },
})
