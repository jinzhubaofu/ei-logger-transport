/**
 * @file ei-logger file transport
 * @author Leon(leon@outlook.com)
 */

var u = require('underscore');
var util = require('util');
var format = util.format;
var logger = require('ei-logger');
var chalk = require('chalk');

var COLORS = {
    silly: 'black',
    debug: 'grey',
    verbose: 'white',
    info: 'cyan',
    warn: 'yellow',
    error: 'red'
};

var ConsoleTransporter = logger.createTransport({

    /**
     * 打印日志
     *
     * @param  {string} loggerName logger名称
     * @param  {string} level      日志等级
     */
    log: function (loggerName, level) {

        process.stdout.write(''
            + '[' + this.dye(level, new Date().toISOString()) + '] '
            + '[' + this.dye(level, loggerName) + '] '
            + '[' + this.dye(level, level) + '] '
            + this.dye(level, format.apply(null, u.toArray(arguments).slice(2)))
            + '\n'
        );

    },

    dye: function (level, text) {
        var color = COLORS[level];
        return color ? chalk[color](text) : text;
    }


});

module.exports = ConsoleTransporter;
