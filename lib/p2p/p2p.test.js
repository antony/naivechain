'use strict'

import test from 'ava'
import p2p from '.'
import { stub } from 'sinon'
import messages from './messages'

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

