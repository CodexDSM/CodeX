const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  charset: 'utf8mb4',

  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,

  reconnect: true,
  idleTimeout: 300000,
  maxIdle: 10,

  keepAliveInitialDelay: 0,
  enableKeepAlive: true,

  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  debug: false,
  trace: false,

  ssl: false
});

pool.on('connection', function (connection) {
  console.log('Nova conexão MySQL estabelecida como id ' + connection.threadId);
});

pool.on('acquire', function (connection) {
  console.log('Conexão %d adquirida', connection.threadId);
});

pool.on('release', function (connection) {
  console.log('Conexão %d liberada', connection.threadId);
});

pool.on('error', function (err) {
  console.error('Erro no pool MySQL:', err);

  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Conexão perdida, pool irá reconectar automaticamente');
  } else if (err.code === 'ECONNRESET') {
    console.log('Conexão resetada, pool irá tentar novamente');
  } else {
    console.error('Erro crítico no pool:', err.code);
  }
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Teste de conectividade MySQL bem-sucedido');
    connection.release();
  } catch (error) {
    console.error('Falha no teste de conectividade MySQL:', error.message);
  }
}

testConnection();

module.exports = pool;
