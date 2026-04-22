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

const updateOrder = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        const {garment_type, status, deadline, price, deposit, fabric_notes, notes, measurements} = req.body;
        const {rows} = await client.query(
            `UPDATE orders SET garment_type=$1, status=$2, deadlne=$3, price=$4,
            deposit=$5, fabric_notes=$6, notes=$7 WHERE id=$8  RETURNING *`,
            [garment_type, status, deadline, price, deposit, fabric_notes, notes, req.params.id]
        );
        if (!rows.length) return res.status(404).json({error: 'Order not found'});
        if (measurements) {
            await client.query(
                `INSERT INTO measurements (order_id, bust, waist, hips, shoulder_width, length, sleeve_length)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (order_id) DO UPDATE
                SET bust=$2, waist=$3, hips=$4, shoulder_width=$5, length=$6, sleeve_length=$7`,
                [req.params.id, bust, waist, hips, shoulder_width, length, sleeve_length]
            );
        }
        await client.query('COMMIT');
        res.json(rows[0]);
    }
    catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({error: 'Failed to update order'});
    }
    finally { client.release(); }
};

const deleteOrder = async (req, res) => {
    try{
        const {rowCount} = await pool.query(
            'DELETE FROM orders WHERE id = $1',
            [req.params.id]
        );
        if (!rowCount) return res.status(404).json({error: 'Ornder not found'});
        res.status(204).send();
    }
    catch {}
};

module.exports = {createOrder, getAllOrders, getOrderById,updateOrder, deleteOrder};