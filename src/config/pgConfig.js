import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export const connection = async () => {
    try {
        if (client) {
            await client.connect();
            console.log('✅ Database Connected Successfully');
        }
        return client;
    } catch (error) {
        console.error('❌ Error connecting to the database:', error);
        process.exit(1);
    }
}
