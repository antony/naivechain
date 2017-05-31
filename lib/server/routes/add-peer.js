'use strict'

const Joi = require('joi')
const p2p = require('p2p')

module.exports = {
  method: 'PUT',
  path: '/peer',
  config: {
    validate: {
      payload: {
        ip: Joi.string().ip({ cidr: 'forbidden' }).required().description('Peer IP'),
        port: Joi.number().min(0).max(65535).required().description('Peer port')
      }
    }
  },
  handler: (request, reply) => {
    const { ip, port } = request.payload
    const peer = `${ip}:${port}`
    p2p.connectToPeers([peer])
    reply().code(201)
  }
}
