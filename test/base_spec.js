var request = require('request');
var fs = require('fs');
var helper = require('./helper');
var client = helper.client;

client.credentials.consumer_key = 'consumer_key';

describe('_get', function () {

  describe('no api key', function () {

    before(function () {
      request.get = function (options, callback) {
        this.call = options;
        this.receivedCallback = callback;
      }.bind(this);
      // make a call
      this.path = '/the/path';
      this.options = { my: 'options' };
      this.callback = function () { };
      client._get(this.path, this.options, this.callback);
    });

    it('should call with the proper url', function () {
      this.call.url.should.equal('http://api.tumblr.com/v2' + this.path + '?my=options');
    });

    it('should want json back', function () {
      this.call.json.should.equal(true);
    });

    it('should pass the credentials for oauth', function () {
      this.call.oauth.should.eql(client.credentials);
    });

    it('should avoid redirect', function () {
      this.call.followRedirect.should.equal(false);
    });

    it('should get a function callback', function () {
      (typeof this.receivedCallback).should.equal('function');
    });

  });

  describe('api key', function () {

    before(function () {
      request.get = function (options, callback) {
        this.call = options;
        this.receivedCallback = callback;
      }.bind(this);
      // make a call
      this.path = '/the/path';
      this.options = { my: 'options' };
      this.callback = function () { };
      client._get(this.path, this.options, this.callback, true);
    });

    it('should add the api key as an option', function () {
      var proper = { my: 'options', api_key: 'consumer_key' };
      this.call.url.should.equal('http://api.tumblr.com/v2/the/path?my=options&api_key=consumer_key');
    });

  });

});

describe('client', function () {

  describe('.photo', function () {
    var mockReadStreamReturn, mockRequestGetReturn;
    function generateRandomNumberString () {
      return Math.floor(Math.random(1000000)*100000).toString();
    };

    beforeEach(function () {
      // Request post stub
      request.post = function (options, callback) {
        var self = this;

        self.postCall = options;
        self.formData = {};
        return {
          form: function () {
            return {
              append: function (appendedField, appendedData) {
                return self.formData[appendedField] = appendedData;
              },
              getHeaders: function () {
                callback(self);
              }
            }
          },
          oauth: function () {},
          headers: {},
          body: {}
        };
      }.bind(this);

      // fs stub
      mockReadStreamReturn = generateRandomNumberString();
      fs.createReadStream = function (path) {
        return mockReadStreamReturn;
      };

      // Request get stub
      mockRequestGetReturn = generateRandomNumberString();
      request.get = function (options, callback) {
        return mockRequestGetReturn;
      }.bind(this);
    });

    it('should make a post of type photo', function () {
      client.photo('test', {
        source: 'http://nodejs.org/images/logo.png'
      }, function (requestData) {
        requestData.formData.type.should.equal('photo');
      });
    });

    it('should resolve blog names properly if .tumblr.com is omitted', function () {
      client.photo('test', {
        source: 'http://nodejs.org/images/logo.png'
      }, function (requestData) {
        requestData.postCall.url.indexOf('test.tumblr.com').should.not.equal(-1);
      });
    });

    it('should make a form request with inputted caption', function () {
      var randomCaption = generateRandomNumberString();
      client.photo('test', {
        caption: randomCaption,
        source: 'http://nodejs.org/images/logo.png'
      }, function (requestData) {
        requestData.formData.caption.should.equal(randomCaption);
      });
    });

    it('should pull from the local fs when not a web path', function () {
      var randomCaption = generateRandomNumberString();
      client.photo('test', {
        caption: randomCaption,
        data: './test.jpg'
      }, function (requestData) {
        requestData.formData.data.should.equal(mockReadStreamReturn);
      });
    });

    it('should make a request for an image when it\'s a web path', function () {
      var randomCaption = generateRandomNumberString();
      client.photo('test', {
        caption: randomCaption,
        data: 'http://nodejs.org/images/logo.png'
      }, function (requestData) {
        requestData.formData.data.should.equal(mockRequestGetReturn);
      });
    });

    it('should retrieve multiple images when an array of data is passed', function () {
      var randomCaption = generateRandomNumberString();
      client.photo('test', {
        caption: randomCaption,
        data: ['./test.jpg', 'http://nodejs.org/images/logo.png']
      }, function (requestData) {
        requestData.formData['data[0]'].should.equal(mockReadStreamReturn);
        requestData.formData['data[1]'].should.equal(mockRequestGetReturn);
      });
    });
  });

});
