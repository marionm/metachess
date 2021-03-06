var mongoose = require('mongoose');

module.exports = function(app, express, io) {
  app.configure(function(){
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/../public'));
  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    mongoose.connect('localhost', 'metachessDev');
  });

  app.configure('production', function(){
    app.use(express.errorHandler());
    mongoose.connect('mongodb://temp:password@staff.mongohq.com:10018/app4036118');

    //Heroku cedar stack doesn't support websockets, use long polling instead
    io.configure(function() {
      io.set('transports', ['xhr-polling']);
      io.set('polling duration', 10);
    });

  });
}
