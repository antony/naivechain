'use strict'

const CryptoJS = require('crypto-js')

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

  static generate (previousBlock, seed) {
    const nextIndex = previousBlock.index + 1
    const nextTimestamp = new Date().getTime() / 1000
    const nextHash = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, seed)
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, seed, nextHash)
  }

  constructor (
    index = 0,
    previousHash = '0',
    timestamp = new Date().getTime(),
    data = 'no data provied',
    hash = '') {
    this.index = index
    this.previousHash = previousHash.toString()
    this.timestamp = timestamp
    this.data = data
    this.hash = hash.toString()
  }

  calculateHash () {
    return CryptoJS.SHA256(this.index + this.previousHash + this.timestamp + this.data).toString()
  }

  isValidChild (nextBlock) {
    if (this.index + 1 !== nextBlock.index) {
      console.log(`Block ${nextBlock.index} has an invalid index`)
      return false
    }

    if (this.hash !== nextBlock.previousHash) {
      console.log(`New block ${nextBlock.index} does not match previous block's hash ${this.previousHash}`)
      return false
    }
    
    const blockHash = nextBlock.calculateHash()
    if (blockHash !== nextBlock.hash) {
      console.log(`Block ${nextBlock.index} has an invalid hash ${blockHash} ${nextBlock.hash}`)
      return false
    }

    return true
  }

  isGenesisBlock () {
    const serializedBlock = JSON.stringify(this)
    const serializedGenesis = JSON.stringify(Block.genesis)
    return serializedBlock === serializedGenesis
  }
}
