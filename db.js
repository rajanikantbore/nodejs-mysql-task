const mysql = require('mysql2');
let pool;

function establishPoolConnection() {
    return new Promise((resolve, reject) => {
        try {
            if (pool) {
                resolve(pool);
            }
            pool = mysql.createPool({
                host: "localhost",
                user: "root",
                password: "root1",
                database: "coursesdb",
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            pool.getConnection((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(pool);
                }
            })
        } catch (error) {
            console.log('ERROR occurred in getSqlConnection()', error);
            throw error;
        }
    })
}

function getSqlConnction(isTransaction = false) {
    return new Promise(async (resolve, reject) => {
        const pool = await establishPoolConnection();
        pool.getConnection(async (error, connection) => {
            if (error) {
                reject(error);
            } else {
                if (isTransaction) {
                    await beginTransaction(connection);
                }
                resolve(connection);
            }
        });
    })
}

module.exports = {
    establishPoolConnection,
    getSqlConnction,
}
