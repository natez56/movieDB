var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_****',
  password        : '******',
  database        : 'cs340_******'
});

module.exports.pool = pool;
