const { Pool } = require('pg');
require('dotenv').config();

// Configuração otimizada do pool de conexões para NeonDB e Vercel
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
    },
    // Configurações otimizadas para Vercel
    max: 1, // Reduzir para Vercel (limite de conexões)
    min: 0, // Não manter conexões mínimas
    idleTimeoutMillis: 3000, // Timeout reduzido para Vercel
    connectionTimeoutMillis: 10000, // Timeout de conexão reduzido
    // Configurações específicas para NeonDB
    application_name: 'helpdesk-app-vercel'
});

// Testar conexão
pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL via NeonDB');
});

pool.on('error', (err) => {
    console.error('❌ Erro no pool de conexões PostgreSQL:', err);
    // Não encerrar o processo em caso de erro de conexão
});

// Função para testar conexão com retry
async function testConnection(retries = 2) {
    console.log(`🔍 Testando conexão com o banco de dados (${retries} tentativas)...`);
    
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🔌 Tentativa ${i + 1}/${retries} de conexão...`);
            const client = await pool.connect();
            console.log('✅ Teste de conexão bem-sucedido');
            client.release();
            return true;
        } catch (error) {
            console.error(`❌ Tentativa ${i + 1}/${retries} falhou:`, error.message);
            if (i < retries - 1) {
                const delay = 500 * (i + 1);
                console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error(`💥 Todas as tentativas de conexão falharam`);
            }
        }
    }
    return false;
}

// Função para executar query com retry
async function executeQuery(query, params = [], retries = 2) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🔍 Executando query (tentativa ${i + 1}/${retries})`);
            const result = await pool.query(query, params);
            console.log(`✅ Query executada com sucesso`);
            return result;
        } catch (error) {
            console.error(`❌ Query falhou (tentativa ${i + 1}/${retries}):`, error.message);
            if (i < retries - 1) {
                const delay = 500 * (i + 1);
                console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error(`💥 Todas as tentativas falharam. Último erro:`, error.message);
                throw error;
            }
        }
    }
}

// Função para fechar pool de forma segura
async function closePool() {
    try {
        await pool.end();
        console.log('✅ Pool de conexões fechado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao fechar pool:', error);
    }
}

module.exports = { pool, testConnection, executeQuery, closePool };
