const spdy = require('spdy');
const express = require('express');
const compression = require('compression');
const zlib = require('zlib');
const fs = require('fs');
const open = require('open');
const program = require('commander');
const socketIo = require("socket.io");

const UrlMappings = require('./url_mappings.js');
const Cache = require('./cache.js');
const EventBus = require('./event_bus.js');

let app = express();
let router = express.Router();

// initialize event bus
EventBus.init();

const APP_PORT = 7792;
const APP_HOST = '0.0.0.0';

app.use('/api/v1', router);
app.use('/migration-app', express.static(__dirname + '/ui/dist'));
app.use(compression({ 
  filter: shouldCompress,
  level: zlib.Z_BEST_COMPRESSION,
  memLevel: zlib.Z_DEFAULT_MEMLEVEL,
  strategy: zlib.Z_DEFAULT_STRATEGY
}));

router.use(express.json());
router.use(function(req, res, next) {
  res.header("Content-Type", "application/json");
  res.header("Pragma", "no-cache");
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    return false;
  }
  return compression.filter(req, res);
}

// register all routes for API through UrlMappings class
new UrlMappings(router).init();

// handle server shutdown by putting cache from memory to file
process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);

function shutDown() {
  console.log('Server is shutting down...');
  fs.writeFile(Cache.getInstance().getFilePath(), JSON.stringify(Cache.getInstance().getFullCache()), (err)=>{
    if(err) {
      console.log('Error while backing up cache contents');
    }
    else {
      process.exit(1);
    }
  });
}

// specify options for program and parse arguments passed to node program
program.option('-o, --open', 'open webapp in default browser');
program.parse(process.argv);

// function to open the app in chrome
let afterServerStart = (async () => {
  let serverUrl = `https://${APP_HOST}:${APP_PORT}/`;
  console.log(`Server started at ${serverUrl}`);
  if(program.open) {
    await open(`${serverUrl}migration-app/#/repo`); // mention {app: 'google chrome'} config to specify browser to open
  }
});

let serverOptions = {
  key: fs.readFileSync(__dirname + '/certificates/server-key.pem'),
  cert: fs.readFileSync(__dirname + '/certificates/server-cert.pem'),
  spdy: {
    protocols: [ 'h2', 'spdy/3.1', 'http/1.1' ]
  }
};

let server = spdy.createServer(serverOptions, app);

// handle generic error on server
server.on('error', err=> console.error(err));

// start server and open in chrome
server.listen(APP_PORT, APP_HOST, afterServerStart);

// implement socket.io server for status update push
let io = socketIo(server);
// on new connection
io.on("connection", socket => {
  // on disconnect
  socket.on("disconnect", () => {});//console.log(`Client ${socket.id} disconnected`));
});
// on status update emit event to UI
EventBus.registerHandler('statusUpdate', (data)=>{
  io.emit('statusUpdate', data);
});