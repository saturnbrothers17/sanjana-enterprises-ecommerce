const { createClient } = require('@libsql/client');
require('dotenv').config();

// Create Turso database client
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize database tables
async function initializeDatabase() {
    try {
        // Create users table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create sessions table for better session management
        await db.execute(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                session_data TEXT,
                expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        console.log('✅ Database tables initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    }
}

module.exports = {
    db,
    initializeDatabase
};
