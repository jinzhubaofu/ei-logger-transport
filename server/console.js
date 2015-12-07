/**
 * @file ei-logger file transport
 * @author Leon(leon@outlook.com)
 */

var u = require('underscore');
var util = require('util');
var format = util.format;
var logger = require('ei-logger');

var ConsoleTransporter = logger.createTransport({

    /**
     * 打印日志
     *
     * @param  {string} loggerName logger名称
     * @param  {string} level      日志等级
     */
    log: function (loggerName, level) {

        var log = format(
            '%s [%s] [%s] %s\n',
            new Date().toISOString(),
            loggerName,
            level,
            format.apply(null, u.toArray(arguments).slice(2))
        );

        console.log(12321);

        process.stdout.write(log);

    }


});

module.exports = ConsoleTransporter;
