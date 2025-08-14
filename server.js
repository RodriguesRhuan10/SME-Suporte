const express = require('express');
const { pool } = require('./db-config');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const net = require('net');

// Criar instância do Express
const app = express();

// Função para verificar se uma porta está disponível
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        server.on('error', () => resolve(false));
    });
}

// Função para encontrar uma porta disponível
async function findAvailablePort(startPort) {
    let port = startPort;
    while (!(await isPortAvailable(port))) {
        port++;
        if (port > startPort + 100) {
            throw new Error('Não foi possível encontrar uma porta disponível');
        }
    }
    return port;
}

// Importar e executar migrações
const { createTables, checkTables } = require('./migrations');

// Função para inicializar o banco de dados
async function initializeDatabase() {
    try {
        await createTables();
        await checkTables();
        console.log('✅ Banco de dados PostgreSQL inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        process.exit(1);
    }
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar banco de dados
initializeDatabase();

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
        const ticketResult = await pool.query(
            `INSERT INTO tickets (title, description, requester, priority) VALUES ($1, $2, $3, $4) RETURNING id`,
            [title, description, requester, ticketPriority]
        );
        
        const ticketId = ticketResult.rows[0].id;
        
        // Inserir log
        await pool.query(
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
        const result = await pool.query(
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
        const result = await pool.query(
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
        const result = await pool.query(
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
        const result = await pool.query(
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
        const result = await pool.query(
            `UPDATE tickets SET status = $1 WHERE id = $2`,
            [status, ticketId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }
        
        // Inserir log
        await pool.query(
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
        const result = await pool.query(
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
        database: 'connected'
    });
});

// Iniciar servidor
async function startServer() {
    try {
        const PORT = await findAvailablePort(3000);
        
        app.listen(PORT, () => {
            console.log('🚀 Servidor iniciado com sucesso!');
            console.log(`📍 Acesse: http://localhost:${PORT}`);
            console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
            console.log('📊 Banco de dados: SQLite');
            console.log('✨ Sistema pronto para uso!');
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error.message);
        process.exit(1);
    }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
    console.error('❌ Exceção não capturada:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason);
    process.exit(1);
});

// Iniciar o servidor
startServer();

