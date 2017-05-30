'use strict'

const Joi = require('joi')
const p2p = require('p2p')

module.exports = {
  method: 'POST',
  path: '/addPeer',
  config: {
    validate: {
      payload: {
        peer: Joi.string().required().description('Peer address')
      }
    }
  },
  handler: (request, reply) => {
    const { peer } = request.payload
    p2p.connectToPeers([peer])
    reply()
  }
}
