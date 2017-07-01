'use strict'

exports.getLatestBlock = function (chain) {
  const sorted = chain.sort((b1, b2) => (b1.index - b2.index))
  return sorted[sorted.length - 1]
}