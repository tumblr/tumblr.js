
var qs           = require('querystring');
var jsonp        = require('jsonp');

var helpers      = require('../lib/helpers');
var TumblrClient = require('../lib/client');

TumblrClient.prototype._get = function(path, params, callback, addApiKey) {
    params = params || {};
    if (addApiKey) {
      params.api_key = this.credentials.consumer_key;
    }

    jsonp(
        helpers.baseUrl + path + '?' + qs.stringify(params),
        helpers.requestCallbackJSONP(callback)
    );
};

module.exports = TumblrClient;