/**
 * @file ei-logger file transport
 * @author Leon(leon@outlook.com)
 */

/*eslint-env node*/

var u = require('underscore');
var util = require('util');
var format = util.format;
var fs = require('fs');
var logger = require('ei-logger');

var FileTransport = logger.createTransport({

    init: function () {
        var file = this.file;

        if (!file) {
            throw new Error('FileTransport need a file param');
        }

        if (!fs.existsSync(file)) {
            throw new Error('FileTransport cannot find target file: ' + file);
        }

        fs.accessSync(file, fs.R_OK | fs.W_OK);

        this.stream = fs.createWriteStream(file, {
            flags: 'a',
            encoding: 'utf8'
        });

        this.onWriteComplete = u.bind(this.onWriteComplete, this);
    },

    log: function (loggerName, level) {

        var log = format(
            '%s [%s] [%s] %s\n',
            new Date().toISOString(),
            loggerName,
            level,
            format.apply(null, u.toArray(arguments).slice(2))
        );

        this.write(log);
    },

    write: function (message) {

        var me = this;

        function innerWrite() {
            me._isDraining = !me.stream.write(message, 'utf8', me.onWriteComplete);
        }

        if (me._isDraining) {
            this.stream.once('drain', innerWrite);
        }
        else {
            innerWrite();
        }

    },

    onWriteComplete: function () {
        this.emit('logged');
    }

});

module.exports = FileTransport;
