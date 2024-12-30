const pool = require('../config/db');

const User = {
    async create(email, password, phone) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'INSERT INTO users (email, password, phone) VALUES ($1, $2, $3) RETURNING id, email, phone',
                [email, password, phone]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    },

    async findByEmail(email) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0];
        } finally {
            client.release();
        }
    },

    // ... other user-related database operations
};

module.exports = User;