const pool = require('../db/pool');

module.exports = async () => {
  await pool.query("DELETE FROM clients WHERE name LIKE '%Test%'");
  await pool.end();
};