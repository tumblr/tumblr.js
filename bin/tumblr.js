#! /usr/bin/env node

var fs = require('fs')
  , repl = require('repl')
  , Tumblr = require('../index.js');

fs.readFile('credentials.json', function (err, data) {
    if (err) {
        return console.log('File not found: credentials.json');
    }

    var context = repl.start().context;
    context.tumblr = new Tumblr(JSON.parse(data));
});

// TODO: Possible to hack the REPL to allow filtering of callback bodies (synchronous)?