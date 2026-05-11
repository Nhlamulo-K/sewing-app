const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || '7d'}
    );
};

const register = async (req, res) => {
    try {
        const {name, email, password, business_name} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({error: 'Name, email and password are required'});
        }

        if (password.length < 6) {
            return res.status(400).json({error: 'Password must be at least 6 characters'});
        }

        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({error: 'Email already in use'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const {rows} = await pool.query(
            `INSERT INTO users (name, email, password, business_name)
            VALUES ($1, $2, $3, $4) RETURNING id, name, email, business_name`,
            [name, email.toLowerCase(), hashedPassword, business_name]
        );

        const user = rows[0];
        const token = generateToken(user.id);

        res.status(201).json({token, user});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to register'});
    }
};

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            res.status(400).json({error: 'Email and password are required'});
        }

        const {rows} = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(401).json({error: 'Invali email or password'});
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(401).json({error: 'Invalid password'});
        }

        const token = generateToken(user.id);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                business_name: user.business_name,
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to login'});
    }
};

const getMe = async (req, res) => {
    try {
        const {rows} =await pool.query(
            'SELECT id, name, email, business_name, created_at FROM users WHERE id = $1',
            [req.userId]
        );
        if (!rows.length) return res.status(404).json({error: 'User not found'});
        res.json([rows[0]]);
    }
    catch (err) {
        res.status(500).json({error: 'Failed to fetch user'});
    }
};

module.exports = {register, login, getMe};