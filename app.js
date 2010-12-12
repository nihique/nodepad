
// Module dependencies.

var express = require('express'),
    app = module.exports = express.createServer(),
    mongoose = require('mongoose').Mongoose,
    Document,
    db;                                            



// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyDecoder());
    app.use(express.methodOverride());
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(express.staticProvider(__dirname + '/public'));
    app.use(app.router);
    app.use(express.logger());
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
    db = mongoose.connect('mongodb://localhost/nodepad-development');
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
    db = mongoose.connect('mongodb://localhost/nodepad-production');
});

app.configure('test', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
    db = mongoose.connect('mongodb://localhost/nodepad-test');
});

Document = require('./models.js').Document(db);



// Routes

// main index
app.get('/', function(req, res) {
    res.redirect('/documents');
});

// list
app.get('/documents.:format?', function(req, res) {
    Document.find().all(function(docs) {
        switch (req.params.format) {
            case 'json':
                res.send(documents.map(function(d) {
                    return d.__doc;
                }));
            break;

            default:
                res.render('documents/index', { 
                    locals: { documents: docs }
                });
        }
    });
});

// new
app.get('/documents/new', function(req, res) {
    res.render('documents/new', { 
        locals: { d: new Document() }
    });
});

// create
app.post('/documents.:format?', function(req, res) {
    var doc = new Document(req.body['document']);
    doc.save(function() {
        switch (req.params.format) {
            case 'json':
                res.send(doc.__doc);
                break;
            default:
                res.redirect('/documents');
        }
    });
});

// edit
app.get('/documents/:id.:format?/edit', function(req, res) {
    Document.findById(req.params.id, function(d) {
        res.render('documents/edit', {
            locals: { d: d }
        });
    });
});

// read
app.get('/documents/:id.:format?', function(req, res) {
    Document.findById(req.params.id, function(d) {
        switch (req.params.format) {
            case 'json':
                res.send(d.__doc);
                break;
            default:
                res.render('documents/show', {
                    locals: { d: d }
                });
        }


    });
});

// update
app.put('/documents/:id.:format?', function(req, res) {
    Document.findById(req.params.id, function(d) {
        d.title = req.body.document.title;
        d.data = req.body.document.data;
        d.save(function() {
            switch (req.params.format) {
                case 'json':
                    res.send(d.__doc);
                    break;
                default:
                    res.redirect('/documents');
            }
        });
    });
});

// delete
app.del('/documents/:id.:format?', function(req, res) {
    Document.findById(req.params.id, function(d) {
        d.remove(function() {
            switch (req.params.format) {
                case 'json':
                    res.send('true');
                    break;
                default:
                    res.redirect('/documents');
            }
        });
    });
});



// Start webserver

if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port %d, enviroment: %s", app.address().port, app.settings.env)
}
