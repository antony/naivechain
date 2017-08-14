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
    const block = this.latestBlock.generateChild(seed)
    this.addBlock(newBlock)
  }

  replaceChain (newBlocks) {
    if (!this.isValidChain(newBlocks)) {
      console.log("Won't replace existing blockchain. Replacement chain is not valid.")
      return
    }

    if (newBlocks.length <= this.blockchain.length) {
      console.log("Won't replace existing blockchain. Replacement chain is shorter than original")
      return
    }

    console.log('Received blockchain is valid. Replacing current blockchain with received blockchain')
    this.blockchain = newBlocks
  }

  isValidChain (blockchainToValidate) {
    const validChain = blockchainToValidate.filter((data, i, chain) => {
      const block = Block.of(data)

      if (i === 0) {
        return block.isGenesisBlock()
      }

      const parentData = chain[i - 1]
      const parent = Block.of(parentData)
      return parent.isValidChild(block)
    })

    return validChain.length === blockchainToValidate.length
  }

  addBlock (newBlock) {
    if (this.latestBlock.isValidChild(newBlock)) {
      this.blockchain.push(newBlock)
    }
  }

  isMoreRecentBlock () {
    
  }
}

module.exports = new Blockchain()
