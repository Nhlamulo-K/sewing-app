const pool = require('../../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createTestUser = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, business_name)
     VALUES ('Test User', 'testuser@test.com', $1, 'Test Business')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [hashedPassword]
  );

  const user = rows[0];
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1d' }
  );

  return { user, token };
};

const deleteTestUser = async () => {
  await pool.query("DELETE FROM users WHERE email = 'testuser@test.com'");
};

module.exports = { createTestUser, deleteTestUser }; 