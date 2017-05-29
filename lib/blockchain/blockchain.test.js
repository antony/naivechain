'use strict'

import test from 'ava'
import blockchain from '.'
import Block from './block'
import { stub } from 'sinon'
import { genesis } from './block'

test('invalid chain :: not genesis block', t => {
  const valid = blockchain.isValidChain([new Block()])
  t.false(valid)
})

test('valid chain', t => {
  const valid = blockchain.isValidChain([Block.genesis])
  t.true(valid)
})

test('invalid chain :: invalid next block', t => {
  const valid = blockchain.isValidChain([Block.genesis, new Block()])
  t.false(valid)
})

test('add block :: valid chain', t => {
  const firstBlock = new Block()
  stub(firstBlock, 'isValidChild').returns(true)
  blockchain.blockchain = [firstBlock]
  blockchain.addBlock('xyz')
  t.is(blockchain.blockchain.length, 2)
})

test('add block :: invalid chain', t => {
  const firstBlock = new Block()
  stub(firstBlock, 'isValidChild').returns(false)
  blockchain.blockchain = [firstBlock]
  blockchain.addBlock('xyz')
  t.is(blockchain.blockchain.length, 1)
})

test('replace chain :: invalid chain', t => {
  const originalChain = [Block.genesis]
  blockchain.blockchain = originalChain
  blockchain.replaceChain(originalChain.concat([new Block()]))
  t.is(blockchain.blockchain, originalChain)
})

test('replace chain :: chain too short', t => {
  const secondBlock = Block.genesis.generateChild('x')
  const originalChain = [Block.genesis, secondBlock]
  blockchain.blockchain = originalChain
  blockchain.replaceChain([Block.genesis])
  t.is(blockchain.blockchain, originalChain)
})

test('replace chain', t => {
  const secondBlock = Block.genesis.generateChild('x')
  const thirdBlock = secondBlock.generateChild('x')
  const fourthBlock = thirdBlock.generateChild('x')
  const originalChain = [Block.genesis, secondBlock]
  const replacementChain = [Block.genesis, secondBlock, thirdBlock, fourthBlock]
  blockchain.blockchain = originalChain
  blockchain.replaceChain(replacementChain)
  t.is(blockchain.blockchain, replacementChain)
})

test('latest block', t => {
  const secondBlock = 'b'
  blockchain.blockchain = ['a', secondBlock]
  t.is(blockchain.latestBlock, secondBlock)
})

test('mine', t => {
  const secondBlock = new Block()
  const mined = 'z'
  stub(secondBlock, 'generateChild').returns(mined)
  stub(secondBlock, 'isValidChild').returns(true)
  blockchain.blockchain = ['x', secondBlock]
  blockchain.mine('a')
  t.is(blockchain.blockchain.length, 3)
  t.is(blockchain.blockchain[2], mined)
})

test('mine :: invalid reward block', t => {
  const secondBlock = new Block()
  stub(secondBlock, 'generateChild').returns('z')
  stub(secondBlock, 'isValidChild').returns(false)
  blockchain.blockchain = ['x', secondBlock]
  blockchain.mine('a')
  t.is(blockchain.blockchain.length, 2)
})