'use strict'

import test from 'ava'
import { stub } from 'sinon'
import blockchain from 'blockchain'
import p2p from 'p2p'
import { connector } from './'

test(async t => {
  const { statusCode } = await connector.inject({ url: '/blocks' })
  t.is(statusCode, 200)
})

test('GET /blocks', async t => {
  blockchain.blockchain = ['a']
  const { result } = await connector.inject({ url: '/blocks' })
  t.is(result, JSON.stringify(blockchain.blockchain))
})

test('POST /mine', async t => {
  stub(blockchain, 'mine').returns('x')
  stub(p2p, 'broadcastLatest')

  const { statusCode } = await connector.inject({ 
    method: 'POST',
    url: '/mine',
    payload: { data: 'x' }
  })

  t.is(statusCode, 201)
  t.is(blockchain.mine.callCount, 1)
  t.is(blockchain.mine.firstCall.args[0], 'x')
  t.is(p2p.broadcastLatest.callCount, 1)
})

test('GET /peers', async t => {
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

test('PUT /peer', async t => {
  const ip = '5.6.7.8'
  const port = 31112
  stub(p2p, 'connectToPeers')

  const { statusCode } = await connector.inject({
    method: 'PUT',
    url: '/peer',
    payload: { ip, port }
  })

  t.is(statusCode, 201)
  t.is(p2p.connectToPeers.callCount, 1)
  t.is(p2p.connectToPeers.firstCall.args[0][0], `${ip}:${port}`)
})

async function addPeerMacro (t, payload, message) {
  const { statusCode, result } = await connector.inject({
    method: 'PUT',
    url: '/peer',
    payload
  })

  t.is(statusCode, 400)
  t.truthy(result.message.match(message))
}
addPeerMacro.title = (providedTitle) => `POST /peer :: ${providedTitle}`

test('missing payload', addPeerMacro, {}, /"ip" is required/)
test('non-ip', addPeerMacro, { ip: 'xyz', port: 34141 }, /"ip" must be a valid ip/)
test('invalid ip', addPeerMacro, { ip: '1.2.3.256', port: 34141 }, /"ip" must be a valid ip/)
test('cidr forbidden', addPeerMacro, { ip: '1.2.3.0/64', port: 34141 }, /with a forbidden CIDR/)
test('bad port', addPeerMacro, { ip: '1.2.3.4', port: 'xyz' }, /"port" must be a number/)
test('negative port', addPeerMacro, { ip: '1.2.3.4', port: '-134' }, /"port" must be larger than or equal to 0/)
test('port too high', addPeerMacro, { ip: '1.2.3.4', port: '65536' }, /"port" must be less than or equal to 65535/)
test('missing ip', addPeerMacro, { port: 34141 }, /"ip" is required/)
test('missing port', addPeerMacro, { ip: '0.0.0.0' }, /"port" is required/)
