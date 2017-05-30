'use strict'

import test from 'ava'
import messages from '.'
import { stub } from 'sinon'
import blockchain from 'blockchain'
import app from './'

before(async t => {
  server = await app.start()
})

test(async t => {
  const { statusCode } = await server.inject({ path: '/blocks' })
  t.is(statusCode, 200)
})

test('/blocks', async t => {
  blockchain.blockchain = ['a']
  const { result } = await server.inject({ path: '/blocks' })
  t.is(result, JSON.stringify(blockchain.blockchain))
})

test('/mineBlock', async t => {
  stub(blockchain, 'mine').returns('x')
  stub(p2p, 'broadcastLatest')

  await server.inject({ method: 'POST', path: '/mineBlock' })

  t.is(blockchain.mine.callCount, 1)
  t.is(blockchain.mine.firstCall.args[0], 'x')
  t.is(p2p.broadcastLatest.callCount, 1)
})

test('/peers', async t => {
   p2p.sockets = [{
     _socket: {
       remoteAddress: '1.2.3.4',
       remotePort: 37960
     }
   },
   {
     _socket: {
       remoteAddress: '4.3.2.1',
       remotePort: 32876
     }
   }]

   const { result, statusCode } = await server.inject({ path: '/peers' })

   t.is(statusCode, 200)
   t.is(result, ['1.2.3.4:37960', '4.3.2.1:32876'])
})

test('/addPeer', async t => {
  stub(p2p, 'connectToPeers')

  const { statusCode } = await inject({ 
    method: 'POST',
    path: '/addPeer',
    payload: {
      peer: '5.6.7.8:33112'
    }
  })

  t.is(statusCode, 200)
  t.is(p2p.connectToPeers.callCount, 1)
  t.is(p2p.connectToPeers.firstCall.args)
})

test('/addPeer :: no peer provided', async t => {
  const { statusCode, result } = await inject({ 
    method: 'POST',
    path: '/addPeer',
    payload: {}
  })

  t.is(statusCode, 400)
  t.is(result.message, 'Peer is required')
})

test('/addPeer :: invalid peer format', async t => {
  const { statusCode, result } = await inject({ 
    method: 'POST',
    path: '/addPeer',
    payload: {
      peer: 'xyz'
    }
  })

  t.is(statusCode, 400)
  t.is(result.message, 'Peer is in an invalid format')
})
