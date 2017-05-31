'use strict'

import test from 'ava'
import messages from '.'
import { stub } from 'sinon'
import blockchain from 'blockchain'
import p2p from 'p2p'
import { connector } from './'

test(async t => {
  const { statusCode } = await connector.inject({ url: '/blocks' })
  t.is(statusCode, 200)
})

test('/blocks', async t => {
  blockchain.blockchain = ['a']
  const { result } = await connector.inject({ url: '/blocks' })
  t.is(result, JSON.stringify(blockchain.blockchain))
})

test('/mineBlock', async t => {
  stub(blockchain, 'mine').returns('x')
  stub(p2p, 'broadcastLatest')

  const { statusCode } = await connector.inject({ 
    method: 'POST', 
    url: '/mineBlock',
    payload: { data: 'x' }
  })

  t.is(statusCode, 201)
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

   const { result, statusCode } = await connector.inject({ url: '/peers' })

   t.is(statusCode, 200)
   t.deepEqual(result, ['1.2.3.4:37960', '4.3.2.1:32876'])
})

test('/addPeer', async t => {
  const peer = '5.6.7.8:33112'
  stub(p2p, 'connectToPeers')

  const { statusCode } = await connector.inject({ 
    method: 'POST',
    url: '/addPeer',
    payload: { peer }
  })

  t.is(statusCode, 201)
  t.is(p2p.connectToPeers.callCount, 1)
  t.is(p2p.connectToPeers.firstCall.args[0][0], peer)
})

test('/addPeer :: no peer provided', async t => {
  const { statusCode, result } = await connector.inject({ 
    method: 'POST',
    url: '/addPeer',
    payload: {}
  })

  t.is(statusCode, 400)
  t.truthy(result.message.match(/"peer" is required/))
})

test('/addPeer :: invalid peer format', async t => {
  const { statusCode, result } = await connector.inject({ 
    method: 'POST',
    url: '/addPeer',
    payload: {
      peer: 'xyz'
    }
  })

  t.is(statusCode, 400)
  t.is(result.message.match('Peer is in an invalid format'))
})
