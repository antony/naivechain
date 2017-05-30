'use strict'

const Joi = require('joi')
const p2p = require('p2p')
const blockchain = require('blockchain')

module.exports = {
  method: 'POST',
  path: '/mineBlock',
  config: {
    validate: {
      payload: {
        data: Joi.string().required().description('Block data')
      }
    }
  },
  handler: (request, reply) => {
    const { data } = request.payload
    const newBlock = blockchain.mine(data)
    console.log(`block added: ${JSON.stringify(newBlock)}`)
    p2p.broadcastLatest()
    reply()
  }
}