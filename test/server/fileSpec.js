/**
 * @file file
 * @author Leon(leon@outlook.com)
 */

/*eslint-env node*/


var FileTransport = require('../../server/file');
var path = require('path');
var fs = require('fs');
var testLogPath = path.join(__dirname, './test.log');
var logger = require('ei-logger');

describe('FileTransport', function () {

    beforeEach(function (done) {

        fs.writeFileSync(testLogPath, '', 'utf8');

        var a = new FileTransport({
            file: testLogPath
        });

        a.on('logged', function () {
            done();
        });

        logger.addTransport(a);

        var test = logger('a');

        test.info('hello world');

    });

    it('should work', function () {
        var content = fs.readFileSync(testLogPath, 'utf8');
        expect(content).toContain('[info]');
        expect(content).toContain('hello world');
    });

});
