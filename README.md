# 🚀 Mini Helpdesk - Sistema de Suporte Técnico

Sistema completo de gerenciamento de chamados técnicos desenvolvido para a **Secretaria Municipal de Educação de Itatiaia**, com interface moderna e funcionalidades avançadas.

## ✨ Características Principais

### 🎯 **Funcionalidades Core**
- ✅ **Criação de Chamados**: Sistema completo de tickets
- ✅ **Gestão de Status**: Acompanhamento em tempo real
- ✅ **Sistema de Logs**: Histórico completo de alterações
- ✅ **Prioridades**: Baixa, Média, Alta e Urgente
- ✅ **Interface Responsiva**: Desktop e Mobile

### 🔧 **Tecnologias Utilizadas**
- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL (NeonDB)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Deploy**: Vercel (Serverless)
- **Estilização**: CSS Custom Properties + Flexbox/Grid

### 🚀 **Recursos Avançados**
- **Sistema de Retry**: Reconexão automática ao banco
- **Modo Offline**: Funciona mesmo sem conexão com banco
- **Health Check**: Monitoramento em tempo real
- **Cache Inteligente**: Performance otimizada
- **Logs Detalhados**: Debug e monitoramento

## 🏗️ Arquitetura

```
mini-helpdesk-node/
├── 📁 public/           # Frontend (HTML, CSS, JS)
├── 📁 node_modules/     # Dependências
├── 🔧 server.js         # Servidor Express
├── 🗄️ db-config.js     # Configuração do banco
├── 📊 migrations.js     # Estrutura do banco
├── ⚙️ package.json      # Configurações do projeto
├── 🚀 vercel.json       # Configuração do Vercel
└── 📚 README.md         # Documentação
```

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js 16+ 
- PostgreSQL (NeonDB recomendado)
- Conta no Vercel (para deploy)

### **Instalação Local**

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/mini-helpdesk-node.git
cd mini-helpdesk-node
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env
DATABASE_URL=sua_url_do_neondb
NODE_ENV=development
```

4. **Execute o projeto**
```bash
npm start
```

5. **Acesse a aplicação**
```
http://localhost:3000
```

### **Deploy no Vercel**

1. **Configure as variáveis de ambiente**
```bash
DATABASE_URL=sua_url_do_neondb
NODE_ENV=production
```

2. **Deploy automático**
```bash
vercel --prod
```

## 🗄️ Configuração do Banco

### **NeonDB (Recomendado)**
1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a string de conexão
4. Configure como `DATABASE_URL`

### **Estrutura das Tabelas**
```sql
-- Tabela de tickets
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requester VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'media',
    status VARCHAR(20) DEFAULT 'aberto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 API Endpoints

### **Tickets**
- `GET /api/tickets` - Listar todos os tickets
- `POST /api/tickets` - Criar novo ticket
- `GET /api/tickets/:id` - Obter ticket específico
- `PUT /api/tickets/:id/status` - Atualizar status
- `DELETE /api/tickets/:id` - Excluir ticket

### **Logs**
- `GET /api/tickets/:id/logs` - Obter logs de um ticket
- `POST /api/tickets/:id/logs` - Adicionar log

### **Sistema**
- `GET /api/health` - Status da API e banco

## 🎨 Interface

### **Header Inteligente**
- **Suporte Online**: Status sempre ativo (verde)
- **Design Responsivo**: Desktop e Mobile
- **Cores Institucionais**: Verde da Secretaria de Educação

### **Formulário de Chamados**
- Campos obrigatórios e opcionais
- Validação em tempo real
- Seleção de prioridade
- Descrição detalhada

### **Lista de Tickets**
- Filtros por status
- Ordenação por data
- Visualização em cards
- Modal de detalhes

## 🔒 Segurança

- **Senha de Acesso**: Configurável via variável de ambiente
- **Validação de Dados**: Input sanitizado
- **CORS Configurado**: Acesso controlado
- **SSL Forçado**: Conexões seguras

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar
- **Tablet**: Adaptação automática
- **Mobile**: Interface otimizada para touch
- **Breakpoints**: 768px, 480px, 360px

## 🚀 Performance

- **Cache Inteligente**: Arquivos estáticos otimizados
- **Lazy Loading**: Carregamento sob demanda
- **Compressão**: Gzip automático
- **CDN Ready**: Preparado para Vercel

## 🐛 Troubleshooting

### **Problemas Comuns**

1. **Erro de Conexão com Banco**
   - Verifique a `DATABASE_URL`
   - Confirme se o NeonDB está ativo
   - Teste a conectividade

2. **Timeout no Vercel**
   - Verifique o arquivo `vercel.json`
   - Configure `maxDuration` adequado
   - Monitore os logs

3. **Erro de Migração**
   - Execute `npm run db:migrate`
   - Verifique as permissões do banco
   - Confirme a estrutura das tabelas

### **Logs de Debug**
```bash
# Verificar status do banco
npm run db:info

# Testar conexão
npm run db:test

# Ver logs em tempo real
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido para uso interno da **Secretaria Municipal de Educação de Itatiaia**.

## 👨‍💻 Desenvolvimento

**Setor de Informática - SME Itatiaia**
- **Ano**: 2025
- **Versão**: 2.0.0
- **Status**: Produção

## 🔗 Links Úteis

- **Aplicação**: [URL do Vercel]
- **Documentação**: [Este README]
- **Issues**: [GitHub Issues]
- **Suporte**: [Contato da SME]

---

<div align="center">
  <strong>🚀 Sistema desenvolvido com ❤️ pela SME Itatiaia</strong>
</div>
