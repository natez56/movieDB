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
  var context = {};
  var tableData = [];
  var tableData2 = [];

  mysql.pool.query('SELECT * FROM `Movie`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.table = tableData;
    mysql.pool.query('SELECT `production_co_id`, `name` FROM `Production_Company`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData2.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.rowName = tableData2;
    res.render('movie', context);
  });
  });

  
});

app.post('/addMovie', function(req,res,next){
  var context = {};
  var movieIdVal;
  var movieTitle
  var productionCoId = req.body.production_co_id;

  mysql.pool.query("INSERT INTO `Movie` (title, duration, release_year) VALUES (?, ?, ?)", 
    [req.body.title, req.body.duration, req.body.release_year], function(err, result){
    
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }

    movieTitle = req.body.title;
    console.log(movieTitle);
    mysql.pool.query('SELECT `movie_id` FROM `Movie` WHERE `title` = ?', [movieTitle], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }

      movieIdVal = rows[0].movie_id;
      console.log(movieIdVal);
      console.log(productionCoId);

      mysql.pool.query("INSERT INTO `Movie_Production_Co` (movie_id, production_co_id) VALUES (?, ?)", 
        [movieIdVal, productionCoId], function(err, result){
        if(err){
        console.log("Error occurred.");
        next(err);
        return;
      }
    
      });
    });

  });
  res.render("addSuccess");
});



app.get('/genre',function(req,res,next){
  var context = {};
  var tableData = [];

  mysql.pool.query('SELECT * FROM Genre', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.table = tableData;

    res.render('genre', context);
  });
});

app.post('/addGenre', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO Genre (type) VALUES (?)", 
    [req.body.type], function(err, result){
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }
    res.render("addSuccess");
  });
});

app.get('/director',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];

  mysql.pool.query('SELECT * FROM `Director`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.table = tableData;
    mysql.pool.query('SELECT `movie_id`, `title` FROM `Movie`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData2.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.rowName = tableData2;
    res.render('director', context);
  });
  });  
});

app.post('/addDirector', function(req,res,next){
  var context = {};
  var directorIdVal;
  var directorName;
  var movieId = req.body.movie_id;

  mysql.pool.query("INSERT INTO `Director` (f_name, l_name, age) VALUES (?, ?, ?)", 
    [req.body.f_name, req.body.l_name, req.body.age], function(err, result){
    
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }

    directorName = req.body.l_name;
    mysql.pool.query('SELECT `director_id` FROM `Director` WHERE `l_name` = ?', [directorName], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }

      directorIdVal = rows[0].director_id;

      mysql.pool.query("INSERT INTO `Movie_Director` (movie_id, director_id) VALUES (?, ?)", 
        [movieId, directorIdVal], function(err, result){
        if(err){
        console.log("Error occurred.");
        next(err);
        return;
      }
      res.render("addSuccess");
    
      });
    });

  });
  
});


app.get('/productionCo',function(req,res,next){
  var context = {};
  var tableData = [];

  mysql.pool.query('SELECT * FROM Production_Company', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.table = tableData;

    res.render('productionCo', context);
  });
});

app.post('/addProductionCo', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO Production_Company (name, ceo_f_name, ceo_l_name, headquarters) VALUES (?, ?, ?, ?)", 
    [req.body.name, req.body.ceo_f_name, req.body.ceo_l_name, req.body.headquarters], function(err, result){
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }
    res.render("addSuccess");
  }); 
});

app.get('/movieSequel',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];
  var titleQuery = "SELECT movie_id, sequel_id FROM Sequels";

  mysql.pool.query(titleQuery, function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.table = tableData;
    context.results = JSON.stringify(rows);
    context.table = tableData;
    mysql.pool.query('SELECT `movie_id`, `title` FROM `Movie`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData2.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.rowName = tableData2;
    res.render('movieSequel', context);
    });
  });
});

app.post('/addSequel', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO `Sequels` (movie_id, sequel_id) VALUES (?, ?)", 
    [req.body.movie_id, req.body.sequel_id], function(err, result){
    
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }
    res.render("addSuccess");
  }); 
});

app.get('/movieDirector',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];
  var tableData3 = [];
  var titleQuery = "SELECT movie_id, director_id FROM Movie_Director";

  mysql.pool.query(titleQuery, function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.table = tableData;
    mysql.pool.query('SELECT `movie_id`, `title` FROM `Movie`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData2.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.rowName = tableData2;
    mysql.pool.query('SELECT `director_id`, `f_name`, `l_name` FROM `Director`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData3.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.row2Name = tableData3;
    res.render('movieDirector', context);
    });
    });
  });
});

app.post('/addMovieDirector', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO `Movie_Director` (movie_id, director_id) VALUES (?, ?)", 
    [req.body.movie_id, req.body.director_id], function(err, result){
    
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }
    res.render("addSuccess");
  }); 
});

app.get('/movieGenre',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];
  var tableData3 = [];
  var titleQuery = "SELECT movie_id, genre_id FROM Movie_Genre";

  mysql.pool.query(titleQuery, function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.table = tableData;
    mysql.pool.query('SELECT `movie_id`, `title` FROM `Movie`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData2.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.rowName = tableData2;
    mysql.pool.query('SELECT `genre_id`, `type` FROM `Genre`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData3.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.row2Name = tableData3;
    res.render('movieGenre', context);
    });
    });
  });
});

app.post('/addMovieGenre', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO `Movie_Genre` (movie_id, genre_id) VALUES (?, ?)", 
    [req.body.movie_id, req.body.genre_id], function(err, result){
    
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }
    res.render("addSuccess");
  }); 
});

app.get('/movieProductionCo',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];
  var tableData3 = [];
  var titleQuery = "SELECT movie_id, production_co_id FROM Movie_Production_Co";

  mysql.pool.query(titleQuery, function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.table = tableData;
    mysql.pool.query('SELECT `movie_id`, `title` FROM `Movie`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData2.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.rowName = tableData2;
    mysql.pool.query('SELECT `production_co_id`, `name` FROM `Production_Company`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData3.push(json[key]);
    }

    context.results = JSON.stringify(rows);
    context.row2Name = tableData3;
    res.render('movieProductionCo', context);
    });
    });
  });
});

app.post('/addMovieProductionCo', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO `Movie_Production_Co` (movie_id, production_co_id) VALUES (?, ?)", 
    [req.body.movie_id, req.body.production_co_id], function(err, result){
    
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }
    res.render("addSuccess");
  }); 
});

app.get('/create-tables',function(req,res,next){
  var context = {};

  mysql.pool.query("DROP TABLE IF EXISTS `Movie`", function(err){
    var createString = "CREATE TABLE `Movie`("+
    "`movie_id` INT AUTO_INCREMENT,"+
    "`title` VARCHAR(255) NOT NULL,"+
    "`duration` INT,"+
    "`release_year` INT,"+
    "PRIMARY KEY(`movie_id`));";
    mysql.pool.query(createString, function(err){
      mysql.pool.query("DROP TABLE IF EXISTS `Genre`", function(err){
        var string2 = "CREATE TABLE `Genre`(" +
        "`genre_id` INT AUTO_INCREMENT,"+
        "`type` VARCHAR(255) NOT NULL UNIQUE,"+
        "PRIMARY KEY(`genre_id`));";
        mysql.pool.query(string2, function(err){
          mysql.pool.query("DROP TABLE IF EXISTS `Production_Company`", function(err){
          var string3 = "CREATE TABLE `Production_Company`("+
          "`production_co_id` INT AUTO_INCREMENT,"+
          "`name` VARCHAR(255) NOT NULL UNIQUE,"+
          "`ceo_f_name` VARCHAR(255),"+
          "`ceo_l_name` VARCHAR(255),"+
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
                  "`sequel_id` INT,"+
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
