var FileTransport = require('../../server/file');
var path = require('path');
var testLogPath = path.join(__dirname, './test.log');
var logger = require('ei-logger');

var a = new FileTransport({
    file: testLogPath
});

logger.addTransport(a);

var test = logger('a');

test.info('hello world');
