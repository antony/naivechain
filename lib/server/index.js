'use strict'

const Hapi = require('hapi')

const addPeer = require('./routes/add-peer')
const listBlocks = require('./routes/list-blocks')
const listPeers = require('./routes/list-peers')
const mineBlock = require('./routes/mine-block')

const server = new Hapi.Server()
server.connection({ port: 3001, host: 'localhost' })

server.route([
  addPeer,
  listBlocks,
  listPeers,
  mineBlock
])

exports.connector = server

exports.start = async () => {
  await server.start()
  console.log(`Server running on ${server.info.uri}`)
}
