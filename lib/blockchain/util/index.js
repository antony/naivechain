'use strict'

const Block = require('../block')

exports.getLatestBlock = function (chain) {
  const sorted = chain.sort((b1, b2) => (b1.index - b2.index))
  const latestBlockData = sorted[sorted.length - 1]
  return Block.of(latestBlockData)
}