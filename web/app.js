
/**
 * Module dependencies.
 */

var express = require('express')
  , index = require('./routes/index')
  , perlin = require('./routes/perlin');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', index.index);

app.get('/perlin', perlin.findAll);
app.get('/perlin/:id', perlin.findById);
app.post('/perlin', perlin.addPerlin);
app.put('/perlin/:id', perlin.updatePerlin);
app.delete('/perlin/:id', perlin.deletePerlin);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
