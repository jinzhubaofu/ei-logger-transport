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

            // 在 ie8 上，console.log 直到 devtools 被打开才会出现
            // http://stackoverflow.com/questions/7742781/why-javascript-only-works-after-opening-developer-tools-in-ie-once
            // 所以我们还是探测一下为好
            if (typeof handler === 'function') {
                handler.apply(console, [basic].concat(args));
            }

        }


    });

    module.exports = ConsoleTransporter;

});

