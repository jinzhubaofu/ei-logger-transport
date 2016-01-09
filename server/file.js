/**
 * @file ei-logger file transport
 * @author Leon(leon@outlook.com)
 */

var u = require('underscore');
var util = require('util');
var format = util.format;
var fs = require('fs');
var logger = require('ei-logger');
var path = require('path');

var DEFAULT_FILE_ENCODE = 'utf8';

function pad(number) {
    return (number < 10 ? '0' : '') + number;
}

var FileTransport = logger.createTransport({

    init: function () {

        this.onStreamError = this.onStreamError.bind(this);
        this.onStreamDrain = this.onStreamDrain.bind(this);
        this.onStreamWrite = this.onStreamWrite.bind(this);

        this.dirname = path.dirname(this.filename);

        this.timestamp = this.getTimestamp();
    },

    getTimestamp: function () {
        var now = new Date();

        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            date: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes()
        };

    },

    open: function (callback) {

        // 正在打开
        if (this.isOpening) {
            callback(true);
            return;
        }

        // 当前没有写入流，或者需要一个新的写入流
        if (!this.stream || this.needNewFile()) {
            callback(true);
            this.createStream();
            return;
        }

        // 这个时候是可以写入的
        callback();
    },

    createStream: function () {

        var me = this;

        me.isOpening = true;

        // 更新时间戳
        me.timestamp = me.getTimestamp();

        // 获得一个带时间戳的文件名
        var fullname = me.getFileName();

        if (me.stream) {
            me.close();
        }

        // 这里打开写入流
        var stream = me.stream = fs.createWriteStream(fullname, {
            flags: 'a+',
            encoding: DEFAULT_FILE_ENCODE
        });

        stream.on('open', function () {

            // 标识
            me.isOpening = false;

            me.emit('open');

            // 把缓存刷掉
            me.flush();

        });

        // 绑定错误事件
        stream.on('error', me.onStreamError);
        stream.on('drain', me.onStreamDrain);

    },

    getFileName: function () {

        var timestamp = this.timestamp;

        return ''
            + this.file + '.'
            + timestamp.year + '-'
            + pad(timestamp.month) + '-'
            + pad(timestamp.date);
    },

    needNewFile: function () {

        var now = new Date();
        var timestamp = this.timestamp;

        // 这里先按天切
        return now.getFullYear() > timestamp.year
            || now.getMonth() + 1 > timestamp.month
            || now.getDate() > timestamp.date;

    },

    /**
     * 打印日志
     *
     * @param  {string} loggerName logger名称
     * @param  {string} level      日志等级
     */
    log: function (loggerName, level) {

        var me = this;

        var log = format(
            '%s [%s] [%s] %s\n',
            new Date().toISOString(),
            loggerName,
            level,
            format.apply(null, u.toArray(arguments).slice(2))
        );

        me.open(function (err) {
            err ? me.cache(log) : me.write(log);
        });

    },

    cache: function (log) {

        var buffer = this.buffer;

        if (!buffer) {
            buffer = this.buffer = [];
        }

        this.buffer.push(log);

    },

    flush: function () {

        var buffer = this.buffer;

        if (!buffer) {
            return;
        }

        for (var i = 0, len = buffer.length; i < len; ++i) {
            this.write(buffer[i]);
        }

        this.buffer.length = 0;

    },

    /**
     * 写入文件
     * @param  {string} message 消息
     */
    write: function (message) {

        var stream = this.stream;

        // 将消息写入文件，无脑写
        stream.write(
            message,
            DEFAULT_FILE_ENCODE,
            this.onStreamWrite
        );

    },

    onStreamWrite: function () {
        this.emit('logged');
    },

    /**
     * 当文件写入流出错时处理
     * @param  {Event} e 写入流出错事件
     */
    onStreamError: function (e) {
        this.emit('error', e);
        this.close();
    },

    /**
     * 当文件写入不繁忙时处理
     */
    onStreamDrain: function () {
        this.emit('logged');
        this.emit('flushed');
    },

    /**
     * 是否开启文件
     * @return {boolean}
     */
    isFileOpened: function () {
        return !!this.stream;
    },

    /**
     * 关闭当前文件写入流
     * 如果当前有缓存，那么把缓存写入到文件
     */
    close: function () {

        var stream = this.stream;

        if (stream) {
            // 移除所有的监听
            stream.removeAllListeners();
            stream.end();
            stream = this.stream = null;
        }

    },

    /**
     * 销毁
     */
    dispose: function () {
        this.close();
    }

});

module.exports = FileTransport;
