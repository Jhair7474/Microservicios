const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'db_users',
  user: 'root', 
  password: '1234',
  database: 'users_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;