const { Pool } = require('pg');
require('dotenv').config();

// Configuração otimizada do pool de conexões para NeonDB
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 5, // NeonDB funciona melhor com menos conexões
    idleTimeoutMillis: 10000, // Timeout reduzido para NeonDB
    connectionTimeoutMillis: 10000, // Timeout de conexão aumentado
    query_timeout: 30000, // Timeout para queries
    statement_timeout: 30000, // Timeout para statements
    // Configurações específicas para NeonDB
    application_name: 'helpdesk-app',
    // Configurações de SSL para NeonDB
    ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
    }
});

// Testar conexão
pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL via NeonDB');
});

pool.on('error', (err) => {
    console.error('❌ Erro no pool de conexões PostgreSQL:', err);
    // Não encerrar o processo em caso de erro de conexão
    // process.exit(-1);
});

// Função para testar conexão
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Teste de conexão bem-sucedido');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Erro no teste de conexão:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };
