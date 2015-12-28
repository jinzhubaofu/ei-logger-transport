/**
 * @file ei-logger file transport
 * @author Leon(leon@outlook.com)
 */

define(function (require, exports, module) {

    var logger = require('ei-logger');

    var ConsoleTransporter = logger.createTransport({

        /**
         * 打印日志
         *
         * @param  {string} loggerName logger名称
         * @param  {string} level      日志等级
         */
        log: function (loggerName, level) {

            var basic = ''
                + '[' + (new Date().toISOString()) + '] '
                + '[' + loggerName + '] '
                + '[' + level + ']';

            var args = [basic].slice.call(arguments).slice(2);
            var handler = console[level] || console.log;

            handler.apply(console, [basic].concat(args));

        }


    });

    module.exports = ConsoleTransporter;

});

