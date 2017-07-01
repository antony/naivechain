'use strict'

const blockchain = require('blockchain')
const util = require('blockchain/util')
const messages = require('./messages')
const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN
} = require('./messages/message-type')
const WebSocket = require('ws')
const port = process.env.P2P_PORT || 6001

class PeerToPeer {
  constructor () {
    this.sockets = []
  }

  bootstrap () {
    this.peers = process.env.PEERS ? process.env.PEERS.split(',') : []
    var server = new WebSocket.Server({ port })
    server.on('connection', (ws) => {
      this.initConnection(ws)
    })
    console.log(`listening websocket p2p port on: ${port}`)
    this.connectToPeers(this.peers)
  }

  connectToPeers (newPeers) {
    newPeers.forEach((peer) => {
      const ws = new WebSocket(peer)
      ws.on('open', () => {
        this.initConnection(ws)
      })
      ws.on('error', () => {
        console.log('connection failed')
      })
    })
  }

  initConnection (ws) {
    this.sockets.push(ws)
    this.initMessageHandler(ws)
    this.initErrorHandler(ws)
    this.write(ws, messages.getQueryChainLengthMsg())
  }

  write (ws, message) {
    ws.send(JSON.stringify(message))
  }

  broadcastLatest () {
    this.broadcast(messages.getResponseLatestMsg(blockchain))
  }

  broadcast (message) {
    this.sockets.forEach(socket => this.write(socket, message))
  }

  initMessageHandler (ws) {
    ws.on('message', (data) => {
      const message = JSON.parse(data)
      console.log(`Received message ${JSON.stringify(message)}`)
      this.handleMessage(ws, message)
    })
  }

  handleMessage (ws, message) {
    switch (message.type) {
      case QUERY_LATEST:
        console.log('latest')
        this.write(ws, messages.getResponseLatestMsg(blockchain))
        break
      case QUERY_ALL:
        this.write(ws, messages.getResponseChainMsg(blockchain))
        break
      case RESPONSE_BLOCKCHAIN:
        this.handleBlockchainResponse(message)
        break
      default:
        console.log(`Received unknown message type ${message.type}`)
    }
  }

  closeConnection (ws) {
    console.log(`connection failed to peer: ${ws.url}`)
    this.sockets.splice(this.sockets.indexOf(ws), 1)
  }

  initErrorHandler (ws) {
    ws.on('close', () => this.closeConnection(ws))
    ws.on('error', () => this.closeConnection(ws))
  }

  handleBlockchainResponse (message) {
    const receivedBlocks = JSON.parse(message.data)
    const latestBlockReceived = util.getLatestBlock(receivedBlocks)
    const latestBlockHeld = blockchain.latestBlock

    if (latestBlockReceived.index <= latestBlockHeld.index) {
      console.log('received blockchain is not longer than current blockchain. Do nothing')
      return
    }

    console.log(`blockchain possibly behind. We got: ${latestBlockHeld.index}, Peer got: ${latestBlockReceived.index}`)
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      console.log('We can append the received block to our chain')
      blockchain.addBlock(latestBlockReceived)
      this.broadcast(messages.getResponseLatestMsg(blockchain))
    } else if (receivedBlocks.length === 1) {
      console.log('We have to query the chain from our peer')
      this.broadcast(messages.getQueryAllMsg())
    } else {
      console.log('Received blockchain is longer than current blockchain')
      blockchain.replaceChain(receivedBlocks)
      this.broadcast(messages.getResponseLatestMsg(blockchain))
    }
  }
}

module.exports = new PeerToPeer()
