#! /usr/bin/env node

var fs = require('fs')
  , repl = require('repl')
  , tumblr = require('../index.js')
  , util = require('util')
  , _ = require('underscore'); // TODO: Figure out where to specify this dependency

fs.readFile('credentials.json', function (err, data) {
  if (err) return console.log('File not found: credentials.json');

  var r = repl.start({
    prompt: null,
    source: null,
    eval: null,
    useGlobal: false,
    useColors: true
  });
  var context = r.context;

  // Callback function that can be used to store an API response object in the REPL context
  context.set = function (err, object) {
    if (err) return console.log(err);

    context.result = object;
    print(object);
    console.log('Stored in variable: \'result\'');
  };

  context.print = print;
  context.u = _;
  context.tumblr = new tumblr.Client(JSON.parse(data));
});

function print(object) {
  console.log(util.inspect(object, null, null, true)); // Style output with ANSI color codes
}

// Control + L should clear the REPL
process.stdin.on('keypress', function (s, key) {
  if (key && key.ctrl && key.name == 'l') process.stdout.write('\u001B[2J\u001B[0;0f');
});
