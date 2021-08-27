const mysql = require('mysql2');

const connectionPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'article',
});

module.exports = connectionPool;
