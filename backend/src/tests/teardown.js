const pool = require('../db/pool');

module.exports = async () => {
  await pool.query("DELETE FROM users WHERE email LIKE '%test%'");
  await pool.end();
};