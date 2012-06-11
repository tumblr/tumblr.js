#! /usr/bin/env node

var fs = require('fs')
  , repl = require('repl')
  , Tumblr = require('../index.js')
  , util = require('util')
  , _ = require('underscore'); // TODO: Figure out where to specify this dependency

fs.readFile('credentials.json', function (err, data) {
  if (err) return console.log('File not found: credentials.json');

  var context = repl.start(null, null, null, null, true).context; // Don't output return value if undefined

  // Callback function that can be used to store an API response object in the REPL context
  context.set = function (err, object) {
    if (err) return console.log(err);

    context.result = object;
    print(object);
    console.log('Stored in variable: \'result\'');
  };

  context.print = print;
  context.u = _;
  context.tumblr = new Tumblr(JSON.parse(data));
});

function print(object) {
  console.log(util.inspect(object, null, null, true)); // Style output with ANSI color codes
}