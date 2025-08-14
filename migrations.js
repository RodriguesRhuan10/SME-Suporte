const { pool } = require('./db-config');

// Função para criar as tabelas no PostgreSQL
async function createTables() {
    try {
        console.log('🔄 Criando tabelas no PostgreSQL...');
        
        // Criar tabela tickets
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                requester VARCHAR(255),
                priority VARCHAR(20) DEFAULT 'media',
                status VARCHAR(20) DEFAULT 'aberto',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela tickets criada/verificada');
        
        // Criar tabela logs
        await pool.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY,
                ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela logs criada/verificada');
        
        // Criar índices para melhor performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
            CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
            CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
            CREATE INDEX IF NOT EXISTS idx_logs_ticket_id ON logs(ticket_id);
        `);
        console.log('✅ Índices criados/verificados');
        
        console.log('🎉 Migração concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        throw error;
    }
}

// Função para verificar se as tabelas existem
async function checkTables() {
    try {
        const ticketsResult = await pool.query(`
            SELECT COUNT(*) as count FROM tickets
        `);
        
        const logsResult = await pool.query(`
            SELECT COUNT(*) as count FROM logs
        `);
        
        console.log(`📊 Tabela tickets: ${ticketsResult.rows[0].count} registros`);
        console.log(`📊 Tabela logs: ${logsResult.rows[0].count} registros`);
        
        return {
            tickets: ticketsResult.rows[0].count,
            logs: logsResult.rows[0].count
        };
    } catch (error) {
        console.error('❌ Erro ao verificar tabelas:', error);
        return null;
    }
}

// Executar migração se chamado diretamente
if (require.main === module) {
    createTables()
        .then(() => checkTables())
        .then(() => {
            console.log('✅ Verificação concluída');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Falha na migração:', error);
            process.exit(1);
        });
}

module.exports = { createTables, checkTables };
