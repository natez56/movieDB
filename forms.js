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

// Main page of database.
app.get('/',function(req,res,next){
  res.render('home');
});

// Movie page with movie table, add movie form, and remove movie form.
app.get('/movie',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];
  var tableData3 = [];
  var tableData4 = [];

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

      context.rowName = tableData2;

      mysql.pool.query('SELECT `genre_id`, `type` FROM `Genre`', function(err, rows, fields){
        if(err){
          next(err);
          return;
        }
    
        var data = JSON.stringify(rows);
        var json = JSON.parse(data);

        for (var key in json) {
          tableData4.push(json[key]);
        }

        context.row3Name = tableData4;

        mysql.pool.query('SELECT `movie_id`, `title` FROM `Movie`', function(err, rows, fields){
          if(err){
            next(err);
            return;
          }

          var data = JSON.stringify(rows);
          var json = JSON.parse(data);

          for (var key in json) {
            tableData3.push(json[key]);
          }

          context.row2Name = tableData3;

          res.render('movie', context);
        });
      });
    });
  });
});

// Code to handle form data for new movie.
app.post('/addMovie', function(req,res,next){
  var context = {};
  var movieIdVal;
  var productionCoId = req.body.production_co_id;
  var genreIdVal = req.body.genre_id;

  mysql.pool.query("INSERT INTO `Movie` (`title`, `duration`, `release_year`) VALUES (?, ?, ?)", 
    [req.body.title, req.body.duration, req.body.release_year], function(err, result){
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }

    mysql.pool.query('SELECT MAX(`movie_id`) AS `movie_id` FROM `Movie`', function(err, rows, fields){
      if(err){
        next(err);
        return;
      }

      movieIdVal = rows[0].movie_id;

      mysql.pool.query("INSERT INTO `Movie_Production_Co` (`movie_id`, `production_co_id`) VALUES (?, ?)", 
        [movieIdVal, productionCoId], function(err, result){
        if(err){
          console.log("Error occurred.");
          next(err);
          return;
        }

        mysql.pool.query("INSERT INTO `Movie_Genre` (`movie_id`, `genre_id`) VALUES (?, ?)", 
          [movieIdVal, genreIdVal], function(err, result){
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
});

// Code to delete movie.  If director is no longer associated with a movie then
// they are deleted.
app.post('/deleteMovie', function(req,res,next){
  mysql.pool.query("DELETE FROM `Movie` WHERE `movie_id` = ?", [req.body.movie_id], function(err, result){   
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }

    mysql.pool.query('DELETE FROM `Director` WHERE `director_id` NOT IN (SELECT `director_id` FROM `Movie_Director`)', 
      function(err, result){
      if(err){
        next(err);
        return;
      }

      res.render("deleteSuccess");
    });
  });
});

// Code to display genre table.
app.get('/genre',function(req,res,next){
  var context = {};
  var tableData = [];

  mysql.pool.query('SELECT * FROM `Genre`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.table = tableData;

    res.render('genre', context);
  });
});

// Adds a genre.
app.post('/addGenre', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO `Genre` (`type`) VALUES (?)", 
    [req.body.type], function(err, result){
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    } 

    res.render("addSuccess");
  }); 
});

// Displays director tables and form to add director.
app.get('/director',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];

  mysql.pool.query('SELECT `f_name`, `l_name`, YEAR(`birthdate`) AS year, MONTH(`birthdate`) AS month, DAY(`birthdate`) AS day FROM `Director`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

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

      context.rowName = tableData2;

      res.render('director', context);
    });
  });  
});

// Handles form data to add director, updates movie/director relationship.
app.post('/addDirector', function(req,res,next){
  var context = {};
  var directorIdVal;
  var movieId = req.body.movie_id;

  mysql.pool.query("INSERT INTO `Director` (`f_name`, `l_name`, `birthdate`) VALUES (?, ?, ?)", 
    [req.body.f_name, req.body.l_name, req.body.birthdate], function(err, result){
    
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }

    mysql.pool.query('SELECT MAX(`director_id`) AS `director_id` FROM `Director`', function(err, rows, fields){
      if(err){
        next(err);
        return;
      }

      directorIdVal = rows[0].director_id;

      mysql.pool.query("INSERT INTO `Movie_Director` (`movie_id`, `director_id`) VALUES (?, ?)", 
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

// Displays table data for production companies and forms to add/update company.
app.get('/productionCo',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];

  mysql.pool.query('SELECT * FROM `Production_Company`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

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

      context.rowName = tableData2;

      res.render('productionCo', context);
    });
  });
});

// Handles form data to add a production company.
app.post('/addProductionCo', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO `Production_Company` (`name`, `ceo_f_name`, `ceo_l_name`, `hq_city`, `hq_state`) VALUES (?, ?, ?, ?, ?)", 
    [req.body.name, req.body.ceo_f_name, req.body.ceo_l_name, req.body.hq_city, req.body.hq_state], function(err, result){
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }

    res.render("addSuccess");
  }); 
});

// Creates a page with prepopulated text boxes for update.
app.post('/updateProductionCoPage', function(req,res,next){
  var context = {};
  var tableData = [];

  mysql.pool.query('SELECT * FROM `Production_Company` WHERE `production_co_id` = ?', [req.body.production_co_id], function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    
    var data = JSON.stringify(rows);
    var json = JSON.parse(data);

    for (var key in json) {
      tableData.push(json[key]);
    }

    context.rowName = tableData;

    res.render("updatePage", context);
  });
});

// Handles form data to update production companies.
app.post('/updateProductionCo', function(req,res,next){
  mysql.pool.query('UPDATE `Production_Company` SET `name` = ?, `ceo_f_name` = ?, `ceo_l_name` = ?, `hq_city` = ?, `hq_state` = ? WHERE `production_co_id` = ?', 
    [req.body.name, req.body.ceo_f_name, req.body.ceo_l_name, req.body.hq_city, req.body.hq_state, req.body.production_co_id], function(err, rows, fields){
    if(err){
      next(err);
      return;
    }

    res.render("updateSuccess");
  });
});

// Displays table data showing movies with sequels.
app.get('/movieSequel',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];
  var tableData3 = [];

  // Change T1 LEFT JOIN in brackerts to INNER JOIN to only select movies with sequels
  var titleQuery = "SELECT DISTINCT T1.title AS original, T2.title AS sequel FROM (SELECT m.title, m.movie_id FROM Movie m INNER JOIN Sequels s ON m.movie_id = s.movie_id) AS T1 INNER JOIN " +
    "(SELECT mo.title, se.movie_id FROM Movie mo INNER JOIN Sequels se ON mo.movie_id = se.sequel_id) AS T2 ON T1.movie_id = T2.movie_id";

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

      context.rowName = tableData2;

      res.render('movieSequel', context);
    });
  });
});

// Allows new sequel relationship to be established.
app.post('/addSequel', function(req,res,next){
  var context = {};
  var sequelQuery = "INSERT INTO `Sequels` (`movie_id`, `sequel_id`) VALUES " +
  "((SELECT `movie_id` FROM `Movie` WHERE `movie_id` = ? AND `movie_id` != ?), " +
  "(SELECT `movie_id` FROM `Movie` WHERE `movie_id` = ? AND `movie_id` != ?))";

  mysql.pool.query(sequelQuery, [req.body.movie_id, req.body.sequel_id, req.body.sequel_id, req.body.movie_id], function(err, result){   
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }
    res.render("addSuccess");
  }); 
});

// Displays movie director relationship table.
app.get('/movieDirector',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];
  var tableData3 = [];
  var titleQuery = "SELECT m.title, d.f_name, d.l_name FROM `Movie` m INNER JOIN `Movie_Director` md ON" +
  " m.movie_id = md.movie_id INNER JOIN `Director` d ON d.director_id = md.director_id" +
  " ORDER BY m.title ASC;";

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

        context.row2Name = tableData3;

        res.render('movieDirector', context);
      });
    });
  });
});

// Handles form data to add new movie director relationship.
app.post('/addMovieDirector', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO `Movie_Director` (`movie_id`, `director_id`) VALUES (?, ?)", 
    [req.body.movie_id, req.body.director_id], function(err, result){   
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }

    res.render("addSuccess");
  }); 
});

// Allows a movie director relationship to be deleted.
app.post('/removeMovieDirector', function(req,res,next){
  var context = {};
  var directorIdVal;
  var directorName;
  var movieId = req.body.movie_id;

  mysql.pool.query("DELETE FROM `Movie_Director` WHERE `movie_id` = ? AND `director_id` = ?", 
    [req.body.movie_id, req.body.director_id], function(err, result){   
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }

    mysql.pool.query('DELETE FROM `Director` WHERE `director_id` NOT IN (SELECT `director_id` FROM `Movie_Director`)', 
      function(err, result){
      if(err){
        next(err);
        return;
      }

      res.render('deleteSuccess', context);
    });
  }); 
});

// Displays table for movie genre relationship.
app.get('/movieGenre',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];
  var tableData3 = [];
  var titleQuery = "SELECT m.title, g.type FROM `Movie` m LEFT JOIN `Movie_Genre` mg ON" +
  " m.movie_id = mg.movie_id LEFT JOIN `Genre` g ON mg.genre_id = g.genre_id" +
  " ORDER BY m.title ASC;";

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

        context.row2Name = tableData3;

        res.render('movieGenre', context);
      });
    });
  });
});

// Allow new relationship for movie/genre.
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

// Allows search for movies by genre.
app.post('/searchMovieGenre', function(req,res,next){
  var context = {};
  var tableData = [];
  var searchQuery = "SELECT m.title, g.type FROM Movie m INNER JOIN Movie_Genre mg ON m.movie_id = mg.movie_id " +
  "INNER JOIN Genre g ON mg.genre_id = g.genre_id WHERE g.genre_id = ? ORDER BY m.title ASC";

  mysql.pool.query(searchQuery, [req.body.genre_id], function(err, rows, fields){ 
    if(err){
      console.log("Error occurred.");
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
    res.render("searchResult", context);
  }); 
});

// Displays relationship table for movie production co and related forms.
app.get('/movieProductionCo',function(req,res,next){
  var context = {};
  var tableData = [];
  var tableData2 = [];
  var tableData3 = [];
  var titleQuery = "SELECT m.title, p.name FROM `Movie` m INNER JOIN `Movie_Production_Co` mp ON" +
  " m.movie_id = mp.movie_id INNER JOIN `Production_Company` p ON mp.production_co_id = p.production_co_id" +
  " ORDER BY p.name ASC;";

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

        context.row2Name = tableData3;

        res.render('movieProductionCo', context);
      });
    });
  });
});

// Handles form data to add relationship for movie/production co.
app.post('/addMovieProductionCo', function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO `Movie_Production_Co` (`movie_id`, `production_co_id`) VALUES (?, ?)", 
    [req.body.movie_id, req.body.production_co_id], function(err, result){   
    if(err){
      console.log("Error occurred.");
      next(err);
      return;
    }

    res.render("addSuccess");
  }); 
});

// Creates tables for the website.  Commented out to prevent user from deleting data.
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
          "`hq_city` VARCHAR(255) NOT NULL,"+
          "`hq_state` VARCHAR(255) NOT NULL,"+
          "PRIMARY KEY(`production_co_id`));";
          mysql.pool.query(string3, function(err){
            mysql.pool.query("DROP TABLE IF EXISTS `Director`", function(err){
              var string4 = "CREATE TABLE `Director`("+
              "`director_id` INT AUTO_INCREMENT,"+
              "`f_name` VARCHAR(255) NOT NULL,"+
              "`l_name` VARCHAR(255) NOT NULL,"+
              "`birthdate` DATE NOT NULL,"+
              "PRIMARY KEY(`director_id`));";
              mysql.pool.query(string4, function(err){
                mysql.pool.query("DROP TABLE IF EXISTS `Sequels`", function(err){
                  var string5 = "CREATE TABLE `Sequels`("+
                  "`movie_id` INT NOT NULL,"+
                  "`sequel_id` INT,"+
                  "FOREIGN KEY(`movie_id`)"+
                  "  REFERENCES `Movie`(`movie_id`)"+
                  "  ON UPDATE CASCADE ON DELETE CASCADE," +
                  "FOREIGN KEY(`sequel_id`)"+
                  "  REFERENCES `Movie`(`movie_id`)" +
                  "  ON UPDATE CASCADE ON DELETE CASCADE," +
                  "UNIQUE(`movie_id`, `sequel_id`));";
                  mysql.pool.query(string5, function(err){
                    mysql.pool.query("DROP TABLE IF EXISTS `Movie_Production_Co`", function(err){
                      var string6 = "CREATE TABLE `Movie_Production_Co`("+
                      "`movie_id` INT,"+
                      "`production_co_id` INT NOT NULL,"+
                      "FOREIGN KEY(`movie_id`)"+
                      "  REFERENCES `Movie`(`movie_id`)"+
                      "ON UPDATE CASCADE ON DELETE CASCADE," +
                      "FOREIGN KEY(`production_co_id`)"+
                      "  REFERENCES `Production_Company`(`production_co_id`)" +
                      "ON UPDATE CASCADE ON DELETE CASCADE," +
                      "UNIQUE(`movie_id`, `production_co_id`));";
                      mysql.pool.query(string6, function(err){
                        mysql.pool.query("DROP TABLE IF EXISTS `Movie_Director`", function(err){
                          var string7 = "CREATE TABLE `Movie_Director`("+
                          "`movie_id` INT NOT NULL,"+
                          "`director_id` INT,"+
                          "FOREIGN KEY(`movie_id`)"+
                          "  REFERENCES `Movie`(`movie_id`)"+
                          "ON UPDATE CASCADE ON DELETE CASCADE," +
                          "FOREIGN KEY(`director_id`)"+
                          "  REFERENCES `Director`(`director_id`)" +
                          "ON UPDATE CASCADE ON DELETE CASCADE, " +
                          "UNIQUE(`movie_id`, `director_id`));";
                          mysql.pool.query(string7, function(err){
                            mysql.pool.query("DROP TABLE IF EXISTS `Movie_Genre`", function(err){
                              var string8 = "CREATE TABLE `Movie_Genre`("+
                              "`movie_id` INT,"+
                              "`genre_id` INT NOT NULL,"+
                              "FOREIGN KEY(`movie_id`)"+
                              "  REFERENCES `Movie`(`movie_id`)"+
                              "ON UPDATE CASCADE ON DELETE CASCADE," +
                              "FOREIGN KEY(`genre_id`)"+
                              "  REFERENCES `Genre`(`genre_id`)" +
                              "ON UPDATE CASCADE ON DELETE CASCADE," +
                              "UNIQUE(`movie_id`, `genre_id`));";
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

// Error handling below.
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('errorPage', { error: err });
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
