'use strict'

const Block = require('./block')

class Blockchain {
  constructor () {
    this.blockchain = [Block.genesis]
  }

  get () {
    return this.blockchain
  }

  get latestBlock () {
    return this.blockchain[this.blockchain.length - 1]
  }

  mine (seed) {
    const newBlock = this.latestBlock.generateChild(seed)
    this.addBlock(newBlock)
  }

  replaceChain (newBlocks) {
    if (!this.isValidChain(newBlocks) || newBlocks.length <= this.blockchain.length) {
      console.log('Received blockchain invalid')
      return
    }

    console.log('Received blockchain is valid. Replacing current blockchain with received blockchain')
    this.blockchain = newBlocks
  }

  isValidChain (blockchainToValidate) {
    const validChain = blockchainToValidate.filter((block, i, chain) => {
      if (i === 0) {
        return block.isGenesisBlock()
      }

      const parent = chain[i - 1]
      return parent.isValidChild(block)
    })

    return validChain.length === blockchainToValidate.length
  }

  addBlock (newBlock) {
    if (this.latestBlock.isValidChild(newBlock)) {
      this.blockchain.push(newBlock)
    }
  }
}

module.exports = new Blockchain()
