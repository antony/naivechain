'use strict'

import test from 'ava'
import p2p from '.'
import { stub } from 'sinon'
import messages from './messages'
import { QUERY_LATEST, QUERY_ALL, RESPONSE_BLOCKCHAIN } from './messages/message-type'
import Block, { genesis } from '../blockchain/block'
import { blockchain } from '../blockchain'

test.beforeEach(() => {
  p2p.sockets = []
})

test('takes peers from environment', t => {
  const peers = [
    'ws://127.0.0.1:3003',
    'ws://127.0.1.1:3304',
    'ws://127.0.1.2:3005'
  ]
  process.env.PEERS = peers.join(',')
  p2p.bootstrap()
  t.deepEqual(p2p.peers, peers)
  process.env.PEERS = ''
})

test('#initConnection :: add event hooks', t => {
  const ws = { on: stub(), send: stub() }
  p2p.initConnection(ws)
  t.deepEqual(p2p.sockets, [ws])
  t.is(ws.on.callCount, 3)
  t.is(ws.on.firstCall.args[0], 'message')
  t.is(ws.on.secondCall.args[0], 'close')
  t.is(ws.on.thirdCall.args[0], 'error')
})

test('#initConnection :: send event', t => {
  const ws = { on: stub(), send: stub() }
  const payload = JSON.stringify(messages.getQueryChainLengthMsg())
  p2p.initConnection(ws)
  t.is(ws.send.callCount, 1)
  t.is(ws.send.firstCall.args[0], payload)
})

test('#initMessageHandler()', t => {
  const ws = { on: stub() }
  p2p.initMessageHandler(ws)
  t.is(ws.on.callCount, 1)
})

test.serial('#handleMessage :: QUERY_LATEST', t => {
  const message = { x: 'y' }
  stub(p2p, 'write')
  stub(messages, 'getResponseLatestMsg').returns(message)
  p2p.handleMessage(null, { type: QUERY_LATEST })
  t.is(p2p.write.callCount, 1)
  t.is(p2p.write.firstCall.args[1], message)
  p2p.write.restore()
  messages.getResponseLatestMsg.restore()
})

test.serial('#handleMessage :: QUERY_ALL', t => {
  const message = { x: 'y' }
  stub(p2p, 'write')
  stub(messages, 'getResponseChainMsg').returns(message)
  p2p.handleMessage(null, { type: QUERY_ALL })
  t.is(p2p.write.callCount, 1)
  t.is(p2p.write.firstCall.args[1], message)
  p2p.write.restore()
  messages.getResponseChainMsg.restore()
})

test.serial('#handleMessage :: RESPONSE_BLOCKCHAIN', t => {
  stub(p2p, 'handleBlockchainResponse')
  p2p.handleMessage(null, { type: RESPONSE_BLOCKCHAIN, data: [] })
  t.is(p2p.handleBlockchainResponse.callCount, 1)
  p2p.handleBlockchainResponse.restore()
})

test('#closeConnection', t => {
  const a = { url: 'a' }
  const c = { url: 'c' }
  const disconnected = { url: 'b' }
  p2p.sockets = [a, disconnected, c]
  p2p.closeConnection(disconnected)
  t.is(p2p.sockets.length, 2)
  t.deepEqual(p2p.sockets, [a, c])
})

test('#handleBlockchainResponse :: shorter blockchain', t => {
  const newChain = JSON.stringify([new Block(7), new Block(8)])
  blockchain.latestBlock = new Block(9)
  const result = p2p.handleBlockchainResponse({ data: newChain })
  t.is(result, undefined)
})

test.only('#handleBlockchainResponse :: can add block', t => {
  const secondBlock = new Block(1, genesis.hash, null, null, null)
  secondBlock.hash = secondBlock.calculateHash()
  const newChain = JSON.stringify([genesis, secondBlock])
  blockchain.latestBlock = genesis
  p2p.handleBlockchainResponse({ data: newChain })
  t.is(blockchain.latestBlock, secondBlock)
})


