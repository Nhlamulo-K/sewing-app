const pool = require('../db/pool');

const createOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const {client_id, garment_type, deadline, price, deposit, fabric_notes, notes} = req.body;
        const {rows} = await client.query(
            `INSERT INTO orders (client_id, garment_type, deadline, price, deposit, fabric_notes, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [client_id,garment_type, deadline, price || 0, deposit ||0, fabric_notes, notes]
        );
        const order = rows[0];
        if (measurements) {
            const {bust, waist, hips, shoulder_width, length, sleeve_length} = measurements;
            await client.query(
                `INSERT INTO measurements (order_id, bust, waist, hips, shoulder_width, length, sleeve_length)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [order.id, bust, waist, hips, shoulder_width, length, sleeve_length]
            );
        }
        await client.query('COMMIT');
        res.status(201).json(order);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({error: 'Failed to create order'});
    }
    finally {
        client.release();
    }
};

const getAllOrders = async (req, res) => {
    try {
        const {status} = req.query;
        let query = `
            SELECT o.*, c.name AS client_name, c.phone AS client_phone,
                m.bust, m.waist, m.hips, m.shoulder_width, m.length, m.sleeve_length
            FROM orders o
            JOIN clients c ON o.client_id = c.id
            LEFT JOIN measurements m ON m.order_id = o.id
        `;
        const params = [];
        if (status) {
            query += ` WHERE o.status = $1`;
            params.push(status);
        }
        query += ` ORDER BY o.deadline ASC`;
        const {rows} = await pool.query(query, params);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch orders'});
    }
};

const getOrderById =async (req, res) => {
    try {
        const {rows} = await pool.query(
            `SELECT o.*, c.name AS client_name, c.phone AS client_phone,
                m.bust, m.waist, m.hips, m.shoulder_width, m.length, m.sleeve_length
            FROM orders o
            JOIN clients c ON o.client_id = c.id
            LEFT JOIN measurements m ON m.order_id = o.id
            WHERE o.id = $1`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({error: 'Order not found'});
        res.json(rows[0]);
    }
    catch (err) {
        res.status(500).json({error: 'Failed to fetch order'});
    }
};

const updateOrder = async (req, res) => {};