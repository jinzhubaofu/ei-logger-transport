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

var DEFAULT_FILE_ENCODE = 'utf8';

var FileTransport = logger.createTransport({

    init: function () {
        this.onStreamError = this.onStreamError.bind(this);
        this.onStreamDrain = this.onStreamDrain.bind(this);
        this.onStreamWrite = this.onStreamWrite.bind(this);
        this._isBusy = false;
        this.open(this.file);
    },

    open: function (file) {

        // 要打开的文件与当前的文件不一致
        if (this.file !== file) {
            // 并且当前已经打开了一个写入流
            if (this.stream) {
                // 那么把它关掉
                this.close();
            }
            // 更新当前的文件
            this.file = file;
        }
        // 如果要打开的文件与当前文件一致并且已经打开了一个写入流
        // 那么就不用重复要打开了
        else if (this.stream) {
            return;
        }

        // 如果文件不存在
        if (!file) {
            throw new Error('FileTransport need a file param');
        }

        // 如果文件不存在
        if (!fs.existsSync(file)) {
            throw new Error('FileTransport cannot find target file: ' + file);
        }

        // 这里测试写入权限，如果没有权限会直接丢出异常
        fs.accessSync(file, fs.R_OK | fs.W_OK);

        // 这里打开写入流
        var stream = this.stream = fs.createWriteStream(file, {
            flags: 'a',
            encoding: DEFAULT_FILE_ENCODE
        });

        // 绑定错误事件
        stream.on('error', this.onStreamError);

    },

    /**
     * 打印日志
     * @param  {string} loggerName logger名称
     * @param  {string} level      日志等级
     */
    log: function (loggerName, level) {

        if (!this.isFileOpened()) {
            return;
        }

        var log = format(
            '%s [%s] [%s] %s\n',
            new Date().toISOString(),
            loggerName,
            level,
            format.apply(null, u.toArray(arguments).slice(2))
        );

        this.write(log);
    },

    /**
     * 写入文件
     * @param  {string} message 消息
     */
    write: function (message) {

        var stream = this.stream;

        // 将消息写入文件
        var isBusy = !stream.write(
            message,
            DEFAULT_FILE_ENCODE,
            this.onStreamWrite
        );

        // 如果文件写入繁忙，那么给`drain`事件绑定回调
        if (isBusy && !this._isBusy) {
            stream.once('drain', this.onStreamDrain);
            this._isBusy = isBusy;
        }

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
        this._isBusy = false;
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
            stream = this.stream = null;
        }
        this.file = '';
    },

    /**
     * 销毁
     */
    dispose: function () {
        this.close();
    }

});

module.exports = FileTransport;
