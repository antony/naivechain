'use strict'

const { SHA256 } = require('crypto-js')

module.exports = class Block {
  static get genesis () {
    return new Block(
      0,
      '0',
      1465154705,
      'my genesis block!!',
      '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7'
    )
  }

  constructor (
    index = 0,
    previousHash = '0',
    timestamp = new Date().getTime() / 1000,
    data = 'no data provied',
    hash = '') {
    this.index = index
    this.previousHash = previousHash.toString()
    this.timestamp = timestamp
    this.data = data
    this.hash = hash.toString()
  }

  calculateHash (
    index = this.index,
    previousHash = this.previousHash,
    timestamp = this.timestamp,
    data = this.data) {
    return SHA256(index + previousHash + timestamp + data).toString()
  }

  isValidChild (nextBlock) {
    if (this.index + 1 !== nextBlock.index) {
      console.log(`Block ${nextBlock.index} has an invalid index`)
      return false
    }

    if (this.hash !== nextBlock.previousHash) {
      console.log(`New block ${nextBlock.index}'s previousHash (${nextBlock.previousHash}) does not match previous block's hash ${this.hash}`)
      return false
    }

    const blockHash = nextBlock.calculateHash()
    if (blockHash !== nextBlock.hash) {
      console.log(`Block ${nextBlock.index} has an invalid hash. Calculated ${blockHash} but stored hash is ${nextBlock.hash}`)
      return false
    }

    return true
  }

  isGenesisBlock () {
    const serializedBlock = JSON.stringify(this)
    const serializedGenesis = JSON.stringify(Block.genesis)
    return serializedBlock === serializedGenesis
  }

  generateChild (seed) {
    const nextIndex = this.index + 1
    const nextTimestamp = new Date().getTime() / 1000
    const nextHash = this.calculateHash(nextIndex, this.hash, nextTimestamp, seed)
    return new Block(nextIndex, this.hash, nextTimestamp, seed, nextHash)
  }
}
