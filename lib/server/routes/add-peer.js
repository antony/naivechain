'use strict'

const Joi = require('joi')
const p2p = require('p2p')

module.exports = {
  method: 'POST',
  path: '/addPeer',
  config: {
    validate: {
      payload: {
        peer: Joi.string().regex('[1-2]{1}[0-9]{0,2}\.').required().description('Peer address')
      }
    }
  },
  handler: (request, reply) => {
    const { peer } = request.payload
    p2p.connectToPeers([peer])
    reply().code(201)
  }
}
