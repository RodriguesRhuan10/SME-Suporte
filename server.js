const express = require('express');
const { pool, testConnection, executeQuery } = require('./db-config');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Criar instância do Express
const app = express();

// Importar e executar migrações
const { createTables, checkTables } = require('./migrations');

// Variável global para status do banco
let isDatabaseConnected = false;

// Função para inicializar o banco de dados
async function initializeDatabase() {
    try {
        console.log('🔄 Inicializando banco de dados...');
        
        // Testar conexão primeiro
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ Falha na conexão com o banco de dados');
            isDatabaseConnected = false;
            return false;
        }
        
        await createTables();
        await checkTables();
        console.log('✅ Banco de dados PostgreSQL inicializado com sucesso!');
        isDatabaseConnected = true;
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        isDatabaseConnected = false;
        return false;
    }
}

app.use(cors());
app.use(bodyParser.json());

// Middleware para verificar status do banco
app.use('/api', (req, res, next) => {
    if (req.method === 'GET' && req.path === '/health') {
        return next(); // Permitir acesso ao health check
    }
    
    if (!isDatabaseConnected) {
        return res.status(503).json({ 
            error: 'Serviço temporariamente indisponível', 
            message: 'Banco de dados não está conectado',
            retryAfter: 30
        });
    }
    
    next();
});

// Configuração de cache para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache por 1 dia
    etag: true,   // ETags para validação
    lastModified: true
}));

// Headers adicionais para evitar problemas de cache
app.use((req, res, next) => {
    // Para arquivos CSS e JS
    if (req.url.endsWith('.css') || req.url.endsWith('.js')) {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 horas
        res.setHeader('Vary', 'Accept-Encoding');
    }
    next();
});

// Inicializar banco de dados
initializeDatabase().then(success => {
    if (success) {
        console.log('🚀 Aplicação pronta para uso!');
        console.log('✅ Banco de dados: Conectado');
    } else {
        console.log('⚠️ Aplicação iniciada em modo offline');
        console.log('⚠️ Banco de dados: Desconectado');
        console.log('💡 A aplicação continuará funcionando, mas sem persistência de dados');
    }
}).catch(error => {
    console.error('❌ Erro na inicialização:', error);
    console.log('⚠️ Aplicação iniciada em modo de emergência');
});

// Criar ticket
app.post('/api/tickets', async (req, res) => {
    const { title, description, requester, priority } = req.body;
    
    // Validação básica
    if (!title || !description) {
        return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
    }
    
    // Validar prioridade
    const validPriorities = ['baixa', 'media', 'alta', 'urgente'];
    const ticketPriority = priority && validPriorities.includes(priority) ? priority : 'media';
    
    try {
        // Inserir ticket e retornar o ID
        const ticketResult = await executeQuery(
            `INSERT INTO tickets (title, description, requester, priority) VALUES ($1, $2, $3, $4) RETURNING id`,
            [title, description, requester, ticketPriority]
        );
        
        const ticketId = ticketResult.rows[0].id;
        
        // Inserir log
        await executeQuery(
            `INSERT INTO logs (ticket_id, message) VALUES ($1, $2)`,
            [ticketId, 'Chamado criado']
        );
        
        res.json({ id: ticketId, message: 'Chamado criado com sucesso' });
    } catch (error) {
        console.error('Erro ao criar ticket:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar tickets
app.get('/api/tickets', async (req, res) => {
    try {
        const result = await executeQuery(
            `SELECT * FROM tickets ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar tickets:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Obter ticket por ID
app.get('/api/tickets/:id', async (req, res) => {
    const ticketId = req.params.id;
    if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: 'ID do ticket inválido' });
    }
    
    try {
        const result = await executeQuery(
            `SELECT * FROM tickets WHERE id = $1`,
            [ticketId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar ticket:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Adicionar log
app.post('/api/tickets/:id/logs', async (req, res) => {
    const ticketId = req.params.id;
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }
    
    if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: 'ID do ticket inválido' });
    }
    
    try {
        const result = await executeQuery(
            `INSERT INTO logs (ticket_id, message) VALUES ($1, $2) RETURNING id`,
            [ticketId, message]
        );
        
        res.json({ id: result.rows[0].id, message: 'Log adicionado com sucesso' });
    } catch (error) {
        console.error('Erro ao adicionar log:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Obter logs de um ticket
app.get('/api/tickets/:id/logs', async (req, res) => {
    const ticketId = req.params.id;
    
    if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: 'ID do ticket inválido' });
    }
    
    try {
        const result = await executeQuery(
            `SELECT * FROM logs WHERE ticket_id = $1 ORDER BY created_at ASC`,
            [ticketId]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar status
app.put('/api/tickets/:id/status', async (req, res) => {
    const ticketId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
    }
    
    if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: 'ID do ticket inválido' });
    }
    
    const statusValidos = ['aberto', 'em_andamento', 'resolvido', 'fechado'];
    if (!statusValidos.includes(status)) {
        return res.status(400).json({ error: 'Status inválido. Use: aberto, em_andamento, resolvido, fechado' });
    }
    
    try {
        const result = await executeQuery(
            `UPDATE tickets SET status = $1 WHERE id = $2`,
            [status, ticketId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }
        
        // Inserir log
        await executeQuery(
            `INSERT INTO logs (ticket_id, message) VALUES ($1, $2)`,
            [ticketId, `Status alterado para ${status}`]
        );
        
        res.json({ updated: result.rowCount, message: 'Status atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para excluir um ticket
app.delete('/api/tickets/:id', async (req, res) => {
    const ticketId = req.params.id;
    
    try {
        const result = await executeQuery(
            'DELETE FROM tickets WHERE id = $1',
            [ticketId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }
        
        // Logs são excluídos automaticamente devido ao CASCADE
        
        console.log(`Ticket ${ticketId} excluído com sucesso`);
        res.json({ message: 'Ticket excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir ticket:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Front-end
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro não tratado:', err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota para verificar status da API
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: isDatabaseConnected ? 'connected' : 'disconnected',
        databaseStatus: isDatabaseConnected
    });
});

// Iniciar servidor
async function startServer() {
    try {
        // No Vercel, não precisamos iniciar o servidor manualmente
        // Apenas inicializar o banco de dados
        await initializeDatabase();
        
        console.log('🚀 Aplicação inicializada com sucesso!');
        console.log('📊 Banco de dados: PostgreSQL (NeonDB)');
        console.log('✨ Sistema pronto para uso no Vercel!');
    } catch (error) {
        console.error('❌ Erro ao inicializar aplicação:', error.message);
        // Não encerrar o processo no Vercel
    }
}

// Tratamento de erros não capturados (não encerrar processo no Vercel)
process.on('uncaughtException', (err) => {
    console.error('❌ Exceção não capturada:', err);
    // Não encerrar o processo no Vercel
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason);
    // Não encerrar o processo no Vercel
});

// Iniciar o servidor
startServer();

