
/**
 * Module dependencies.
 */
// defind library
var express = require('express');
var api = require('./routes/api');
var http = require('http');
var path = require('path');

var app = express();

// set environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('jsonp callback name', 'callback');

// defind use library method
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// route url
app.get('/', api.search);


// error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Page Not Found');
  err.status = 404;
    var data = {'code': '404', 'message': err.message};
    res.header('Contect-type', 'application/json');
    res.header('Charset', 'utf8');
    res.jsonp(data);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
