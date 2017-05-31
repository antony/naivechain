'use strict'

const peerToPeer = require('./lib/p2p')
const httpServer = require('./lib/server')

peerToPeer.bootstrap()
httpServer.start()
