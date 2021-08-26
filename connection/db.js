const mysql = require('mysql2');

const connectionPool = mysql.createPool({
  host: 'localhost',
  port: '8889',
  user: 'root',
  password: 'root',
  database: 'article',
});

module.exports = connectionPool;
