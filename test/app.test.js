
// Run $ expresso

/**
 * Module dependencies.
 */

var app = require('../app'),
    assert = require('assert');

process.env.NODE_ENV = 'test';

module.exports = {

    'GET /': function() {
        assert.response(    
            app, { 
                url: '/' 
            }, { 
                status: 302, 
                headers: { 'Location': '/documents' }
            });
    }

};
