const pool = require('../db/pool');

const createClient = async (req, res) => {
    try {
        const {name, phone, email} = req.body;
        if (!name) return res.status(400).json({error: 'Name is required'});
        const {rows} = await pool.query(
            'INSERT INTO clients (name, phone, email) VALUES ($1, $2, $3) RETURNING *',
            [name, phone, email]
        );
        res.status(201).json(rows[0]);
    }
    catch (err) {
        res.status(500).json({error: 'Failed to create client'});
    }
};

const getAllClients = async (req, res) => {
    try {
        const {rows} = await pool.query(
            'SELECT * FROM clients ORDER BY name ASC'
        );
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({error: 'Failed to fetch clients'});
    }
};

const updateClient = async (req, res) => {
    try {
        const {name, phone, email} = req.body;
        const {rows} = await pool.query(
            'UPDATE clients SET name=$1, phone+$2,  email=$3 WHERE id=$4 RETURNING *',
            [name, phone, email, req.params.id]
        );
        if (!rows.length) return res.status(404).json({error: 'Client not found'});
        res.json(rows[0]);
    }
    catch (err) {
        res.status(500).json({error: 'Failed to update client'});
    }
};

const deleteClient = async (req, res) => {
    try {
        const {rowCount} = await pool.query(
            'DELETE FROM clients WHERE id=$1',
            [req.params.id]
        );
        if (!rowCount) return res.status(404).json({error: 'Client not found'});
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({error: 'Failed to delete client'});
    }
};

module.exports = {createClient, getAllClients, updateClient, deleteClient};