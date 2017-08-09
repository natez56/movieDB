var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_xxxxx',
  password        : 'xxxxxxx',
  database        : 'cs340_xxxxx'
});

module.exports.pool = pool;
