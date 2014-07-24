var fs = require('fs');


var BASE_URL = 'http://localhost:3000/pages/',
    WINDOW_WIDTH = 1200,
    WINDOW_HEIGHT = 800;


exports.initMessages = function () {
  // Dump log messages
  casper.removeAllListeners('remote.message');
  casper.on('remote.message', function(message) {
    this.echo('Log: '+ message, 'LOG');
  });

  // Dump uncaught errors
  casper.removeAllListeners('page.error');
  casper.on('page.error', function(msg) {
    this.echo('Error: ' + msg, 'ERROR');
  });
};


exports.changeWorkingDirectory = function (dir) {
  // Since Casper has control, the invoked script is deep in the argument stack
  var currentFile = require('system').args[4];
  var curFilePath = fs.absolute(currentFile).split(fs.separator);
  if (curFilePath.length > 1) {
    curFilePath.pop(); // PhantomJS does not have an equivalent path.baseName()-like method
    curFilePath.push(dir);
    fs.changeWorkingDirectory(curFilePath.join(fs.separator));
  }
};


exports.testName = function () {
  var head = Array.prototype.slice.call(arguments, 0);
  return function () {
    var tail = Array.prototype.slice.call(arguments, 0),
        body = head.concat(tail);
    return body.join(' :: ');
  };
};


var mockRequest = function (url, response) {
  return casper.evaluate(function (url, response) {
    return jQuery.mockjax({ url: url, responseText: response});
  }, url, response);
};
exports.mockRequest = mockRequest;


exports.mockRequestFromFile = function (url, fileName) {
  var response = fs.read(fileName);
  return mockRequest(url, response);
};


exports.clearRequestMocks = function () {
  casper.evaluate(function() {
    jQuery.mockjaxClear();
  });
}


exports.clearRequestMock = function (mockId) {
  casper.evaluate(function(mockId) {
    jQuery.mockjaxClear(mockId);
  }, mockId);
}


exports.buildUrl = function (urlTail) {
  return BASE_URL + urlTail;
};


exports.setDefaultViewport = function () {
  casper.viewport(WINDOW_WIDTH, WINDOW_HEIGHT);
};


exports.capture = function (fileName) {
  casper.capture(fileName, { top: 0, left: 0, width: WINDOW_WIDTH, height: WINDOW_HEIGHT });
};
