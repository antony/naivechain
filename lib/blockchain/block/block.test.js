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