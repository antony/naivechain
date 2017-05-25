'use strict'

import test from 'ava'
import blockchain from '.'
import Block from './block'
import { stub } from 'sinon'

import { genesis } from './block'

test('not genesis block', t => {
  const valid = blockchain.isValidChain([new Block()])
  t.false(valid)
})

test('is valid chain', t => {
  const valid = blockchain.isValidChain([Block.genesis])
  t.true(valid)
})

test('invalid chain (invalid next block)', t => {
  const valid = blockchain.isValidChain([Block.genesis, new Block()])
  t.false(valid)
})

// function macro(t, input, expected) {
//   blockchain.isValidNewBlock.returns(true)
//   blockchain.isValidNewBlock.returns(false)
//   const valid = blockchain.isValidChain([genesis, 'a', 'b'])
//   t.false(valid)
// }

// test('invalid second block', macro, { invalidBlockIndex: 0, validBlockIndex: 1 })
// test('invalid second block', macro, { invalidBlockIndex: 1, validBlockIndex: 0 })