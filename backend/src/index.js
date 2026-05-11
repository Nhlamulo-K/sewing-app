if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const pool = require('./db/pool');
const auth = require('./middleware/auth');

const ordersRouter = require('./routes/orders');
const clientsRouter = require('./routes/clients');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.post('/test', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/orders', auth, ordersRouter);
app.use('/api/clients', auth, clientsRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection failed:', err.message);
    } else {
      console.log('Connected to PostgreSQL at:', res.rows[0].now);
    }
  });
}

module.exports = app;