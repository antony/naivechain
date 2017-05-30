'use strict'

const blockchain = require('blockchain')

module.exports = {
  method: 'GET',
  path: '/blocks',
  handler: (request, reply) => {
    const blocks =  JSON.stringify(blockchain.get())
    reply(blocks)
  }
}