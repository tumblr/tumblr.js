'use strict';

var baseUrl = 'http://api.tumblr.com/v2';

function blogPath(blogName, path) {
  var bn = blogName.indexOf('.') !== -1 ? blogName : blogName + '.tumblr.com';
  return '/blog/' + bn + path;
}

function requestCallback(callback) {
  if (!callback) return undefined;
  return function (err, response, body) {
    if (err) return callback(err);
    if (response.statusCode >= 400) {
      var errString = body.meta ? body.meta.msg : body.error;
      return callback(new Error('API error: ' + response.statusCode + ' ' + errString));
    }

    if (body && body.response) {
      return callback(null, body.response);
    } else {
      return callback(new Error('API error (malformed API response): ' + body));
    }
  };
}

function requestCallbackJSONP(callback) {
  if (!callback) return undefined;
  return function (err, body) {
    if (!body.meta) return callback(body);
    if (body.meta.status >= 400) {
      var errString = body.meta.msg;
      return callback(new Error('API error: ' + body.statusCode + ' ' + errString));
    }

    if (body && body.response) {
      return callback(null, body.response);
    } else {
      return callback(new Error('API error (malformed API response): ' + body));
    }
  };
}

function isFunction(value) {
  return Object.prototype.toString.call(value) == '[object Function]';
}

function requireValidation(options, choices) {
  var count = 0;
  for (var i = 0; i < choices.length; i++) {
    if (options[choices[i]]) {
      count += 1;
    }
  }
  if (choices.length === 1) {
    if (count === 0) {
      throw new Error('Missing required field: "' + choices[0] + '"');
    }
  } else if (choices.length > 1) {
    if (count === 0) {
      throw new Error('Missing one of: ' + choices.join(','));
    }
    if (count > 1) {
      throw new Error('Can only use one of: ' + choices.join(','));
    }
  }
}


module.exports = {
  baseUrl: baseUrl,
  blogPath: blogPath,
  requestCallback: requestCallback,
  requestCallbackJSONP: requestCallbackJSONP,
  isFunction: isFunction,
  requireValidation: requireValidation
};