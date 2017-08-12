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

app.get('/create',function(req,res,next){
  var context = {};

  mysql.pool.query("DROP TABLE IF EXISTS `Movie`", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE Movie("+
    "movie_id INT AUTO_INCREMENT,"+
    "title VARCHAR(255) NOT NULL,"+
    "duration INT NOT NULL,"+
    "release_year INT NOT NULL,"+
    "PRIMARY KEY(movie_id));";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    });
  });
});

app.get('/create-tables',function(req,res,next){
  var context = {};

  mysql.pool.query("DROP TABLE IF EXISTS `Movie`", function(err){
    var createString = "CREATE TABLE `Movie`("+
    "`movie_id` INT AUTO_INCREMENT,"+
    "`title` VARCHAR(255) NOT NULL,"+
    "`duration` INT NOT NULL,"+
    "`release_year` INT NOT NULL,"+
    "PRIMARY KEY(`movie_id`));";
    mysql.pool.query(createString, function(err){
      mysql.pool.query("DROP TABLE IF EXISTS `Genre`", function(err){
        var string2 = "CREATE TABLE `Genre`(" +
        "`genre_id` INT AUTO_INCREMENT,"+
        "`type` VARCHAR(255) NOT NULL UNIQUE,"+
        "PRIMARY KEY(`genre_id`));";
        mysql.pool.query(string2, function(err){
          mysql.pool.query("DROP TABLE IF EXISTS `Production_Company", function(err){
          var string3 = "CREATE TABLE `Production_Company`("+
          "`production_co_id` INT AUTO_INCREMENT,"+
          "`name` VARCHAR(255) NOT NULL UNIQUE,"+
          "`ceo` VARCHAR(255),"+
          "`headquarters` VARCHAR(255) NOT NULL,"+
          "PRIMARY KEY(`production_co_id`));";
          mysql.pool.query(string3, function(err){
            mysql.pool.query("DROP TABLE IF EXISTS `Director`", function(err){
              var string4 = "CREATE TABLE `Director`("+
              "`director_id` INT AUTO_INCREMENT,"+
              "`f_name` VARCHAR(255) NOT NULL,"+
              "`l_name` VARCHAR(255) NOT NULL,"+
              "`age` INT NOT NULL,"+
              "PRIMARY KEY(`director_id`));";
              mysql.pool.query(string4, function(err){
                mysql.pool.query("DROP TABLE IF EXISTS `Sequels`", function(err){
                  var string5 = "CREATE TABLE `Sequels`("+
                  "`movie_id` INT,"+
                  "`sequel_id` INT,"
                  "FOREIGN KEY(`movie_id`)"+
                  "  REFERENCES `Movie`(`movie_id`),"+
                  "FOREIGN KEY(`sequel_id`)"+
                  "  REFERENCES `Movie`(`movie_id`));";
                  mysql.pool.query(string5, function(err){
                    mysql.pool.query("DROP TABLE IF EXISTS `Movie_Production_Co`", function(err){
                      var string6 = "CREATE TABLE `Movie_Production_Co`("+
                      "`movie_id` INT,"+
                      "`production_co_id` INT,"+
                      "FOREIGN KEY(`movie_id`)"+
                      "  REFERENCES `Movie`(`movie_id`),"+
                      "FOREIGN KEY(`production_co_id`)"+
                      "  REFERENCES `Production_Company`(`production_co_id`));";
                      mysql.pool.query(string6, function(err){
                        mysql.pool.query("DROP TABLE IF EXISTS `Movie_Director`", function(err){
                          var string7 = "CREATE TABLE `Movie_Director`("+
                          "`movie_id` INT,"+
                          "`director_id` INT,"+
                          "FOREIGN KEY(`movie_id`)"+
                          "  REFERENCES `Movie`(`movie_id`),"+
                          "FOREIGN KEY(`director_id`)"+
                          "  REFERENCES `Director`(`director_id`));";
                          mysql.pool.query(string7, function(err){
                            mysql.pool.query("DROP TABLE IF EXISTS `Movie_Genre`", function(err){
                              var string8 = "CREATE TABLE `Movie_Genre`("+
                              "`movie_id` INT,"+
                              "`genre_id` INT,"+
                              "FOREIGN KEY(`movie_id`)"+
                              "  REFERENCES `Movie`(`movie_id`),"+
                              "FOREIGN KEY(`genre_id`)"+
                              "  REFERENCES `Genre`(`genre_id`));";
                              mysql.pool.query(string8, function(err){
                                context.results = "Table reset";
                                res.render('home',context);
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
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
