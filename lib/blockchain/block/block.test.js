'use strict'

import test from 'ava'
import Block from '.'

test('not genesis block', t => {
  const genesis = Block.genesis
  t.true(genesis.isGenesisBlock())
})

test('not genesis block', t => {
  const block = new Block()
  t.false(block.isGenesisBlock())
})

test('next block has correct data', t => {
  const seed = 'xyz'
  const block = new Block()
  const next = block.generateChild(seed)
  t.is(next.data, seed)
})

test('next block has previous block hash', t => {
  const block = new Block()
  const next = block.generateChild('xyz')
  t.is(next.previousHash, block.hash)
})

test('next block has correct index', t => {
  const block = new Block()
  const next = block.generateChild('xyz')
  t.is(next.index, block.index + 1)
})

test('hash stored', t => {
  const hash = '63e1bfa22a349803216946f9a6e58faad3da1a2e871e3af86476df6e2976b779'
  const block = new Block(47, 'd34db33f', 9876543210, 'some string', hash)
  t.is(block.hash, hash)
})

test('correct hash generated', t => {
  const hash = '63e1bfa22a349803216946f9a6e58faad3da1a2e871e3af86476df6e2976b779'
  const block = new Block(47, 'd34db33f', 9876543210, 'some string')
  t.is(block.calculateHash(), hash)
})

test('invalid child :: incorrect blockhash', t => {

})

test('valid child :: matching blockhash', t => {

})
