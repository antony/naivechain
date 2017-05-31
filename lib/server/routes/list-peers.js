'use strict'

const p2p = require('p2p')

module.exports = {
  method: 'GET',
  path: '/peers',
  handler: (request, reply) => {
    const peers = p2p.sockets.map(s => {
      const { remoteAddress, remotePort } = s._socket
      return `${remoteAddress}:${remotePort}`
    })
    reply(peers)
  }
}
