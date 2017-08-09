//Nathan Zimmerman
//06/10/2017

var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 9225);
app.use(express.static('public'));

app.get('/',function(req,res,next){
    res.render('home');
});

app.get('/movie',function(req,res,next){
    res.render('movie');
});

app.get('/genre',function(req,res,next){
    res.render('genre');
});

app.get('/director',function(req,res,next){
    res.render('director');
});

app.get('/productionCo',function(req,res,next){
    res.render('productionCo');
});

app.get('/movieSequel',function(req,res,next){
    res.render('movieSequel');
});

app.get('/movieDirector',function(req,res,next){
    res.render('movieDirector');
});

app.get('/movieGenre',function(req,res,next){
    res.render('movieGenre');
});

app.get('/movieProductionCo',function(req,res,next){
    res.render('movieProductionCo');
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
