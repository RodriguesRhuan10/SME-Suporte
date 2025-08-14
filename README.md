# 🎓 Sistema de Suporte - Secretaria de Educação de Itatiaia

Um sistema profissional de suporte técnico desenvolvido para a Secretaria de Educação da Prefeitura Municipal de Itatiaia, com interface moderna e funcionalidades completas para gerenciamento de chamados.

> **🚀 Projeto atualizado para PostgreSQL + NeonDB + Deploy Vercel**

## ✨ Funcionalidades

- **Criar Chamados**: Formulário profissional para abertura de novos chamados de suporte
- **Sistema de Prioridades**: Classificação por níveis (Baixa, Média, Alta, Urgente)
- **Gerenciar Status**: Controle completo do ciclo de vida dos chamados
- **Histórico de Atualizações**: Sistema de logs para acompanhamento completo
- **Interface Responsiva**: Design moderno que funciona em todos os dispositivos
- **Notificações Visuais**: Sistema de alertas profissionais
- **API RESTful**: Backend robusto para integrações

## 🎨 Identidade Visual

- **Cores Institucionais**: Azul e verde da Secretaria de Educação
- **Design Profissional**: Interface séria e adequada para ambiente corporativo
- **Ícones FontAwesome**: Substituição de emojis por ícones profissionais
- **Tipografia Inter**: Fonte moderna e legível
- **Layout Responsivo**: Adaptação para desktop, tablet e mobile

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta no NeonDB (para PostgreSQL)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/RodriguesRhuan10/SME-Suporte.git
cd SME-Suporte
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

4. **Configure o banco de dados**
```bash
# Crie um arquivo .env com suas configurações do NeonDB
cp env.example .env
# Edite o .env com sua DATABASE_URL do NeonDB
```

5. **Execute as migrações**
```bash
npm run db:migrate
```

6. **Acesse a aplicação**
```
http://localhost:3000 (ou porta disponível)
```

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL (NeonDB)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Ícones**: FontAwesome 6.0
- **Tipografia**: Google Fonts (Inter)
- **Middleware**: CORS, Body-parser
- **Desenvolvimento**: Nodemon

## 📁 Estrutura do Projeto

```
SME-Suporte/
├── server.js          # Servidor Express principal
├── db-config.js       # Configuração do PostgreSQL/NeonDB
├── migrations.js      # Migrações do banco de dados
├── package.json       # Dependências e scripts
├── public/            # Arquivos estáticos
│   ├── index.html     # Interface principal
│   ├── style.css      # Estilos CSS profissionais
│   └── script.js      # Lógica do frontend
├── vercel.json        # Configuração para deploy na Vercel
├── env.example        # Exemplo de variáveis de ambiente
├── SETUP-NEONDB.md    # Guia de configuração do NeonDB
└── README.md          # Documentação
```

## 🔧 API Endpoints

### Chamados
- `POST /api/tickets` - Criar novo chamado
- `GET /api/tickets` - Listar todos os chamados
- `GET /api/tickets/:id` - Obter chamado específico
- `PUT /api/tickets/:id/status` - Atualizar status do chamado

### Logs
- `POST /api/tickets/:id/logs` - Adicionar comentário/log
- `GET /api/tickets/:id/logs` - Obter histórico de um chamado

### Sistema
- `GET /api/health` - Status da API e banco de dados

## 💾 Banco de Dados

O sistema utiliza PostgreSQL (NeonDB) com duas tabelas principais:

### Tabela `tickets`
- `id`: Identificador único (SERIAL)
- `title`: Assunto do chamado (VARCHAR)
- `description`: Descrição detalhada (TEXT)
- `requester`: Nome e função do solicitante (VARCHAR)
- `priority`: Prioridade (baixa, media, alta, urgente)
- `status`: Status atual (aberto, em_andamento, resolvido, fechado)
- `created_at`: Data de criação (TIMESTAMP)

### Tabela `logs`
- `id`: Identificador único (SERIAL)
- `ticket_id`: Referência ao chamado (INTEGER, FOREIGN KEY)
- `message`: Comentário ou atualização (TEXT)
- `created_at`: Data de criação (TIMESTAMP)

## 🎯 Fluxo de Trabalho

1. **Abertura**: Usuário preenche formulário com dados do chamado
2. **Classificação**: Sistema define prioridade automaticamente (padrão: média)
3. **Acompanhamento**: Visualização detalhada e histórico completo
4. **Atualização**: Alteração de status conforme progresso
5. **Comentários**: Adição de logs para documentar ações
6. **Resolução**: Marcação como resolvido ou fechado

## 🎨 Características da Interface

- **Header Institucional**: Logo e informações da Secretaria de Educação
- **Formulário Profissional**: Campos organizados e validação
- **Cards de Chamados**: Visualização clara e organizada
- **Modal Detalhado**: Informações completas e controles
- **Sistema de Cores**: Identidade visual consistente
- **Responsividade**: Adaptação para todos os dispositivos

## 🚨 Solução de Problemas

### Erro de Banco de Dados
O sistema cria automaticamente o diretório `db/` e arquivo do banco se não existirem.

### Persistência de Dados
✅ **Dados são mantidos** entre reinicializações do servidor  
✅ **Backup automático** após cada operação importante  
✅ **Verificação de integridade** do banco de dados  
✅ **Migração automática** de estrutura se necessário  

### Sistema de Banco de Dados
O sistema utiliza PostgreSQL via NeonDB:
- **Provedor**: NeonDB (PostgreSQL serverless)
- **Conexão**: Pool de conexões otimizado
- **SSL**: Habilitado para produção
- **Índices**: Otimizados para performance

### Comandos de Banco de Dados
```bash
# Executar migrações
npm run db:migrate

# Verificar informações do banco
npm run db:info
```

### Porta em Uso
O sistema detecta automaticamente portas disponíveis, começando pela 3000.

### Dependências
Se houver problemas com dependências:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deploy na Vercel

### 1. **Configurar NeonDB**
- Crie uma conta em [neon.tech](https://neon.tech)
- Crie um novo projeto
- Copie a string de conexão (DATABASE_URL)

### 2. **Configurar Vercel**
- Instale o Vercel CLI: `npm i -g vercel`
- Faça login: `vercel login`
- Configure as variáveis de ambiente:
```bash
vercel env add DATABASE_URL
# Cole sua string de conexão do NeonDB
```

### 3. **Deploy**
```bash
vercel --prod
```

## 📝 Próximas Melhorias

- [ ] Sistema de usuários e autenticação
- [ ] Filtros e busca avançada por prioridade/status
- [ ] Paginação de resultados
- [ ] Categorias de chamados
- [ ] Sistema de notificações por email
- [ ] Relatórios e estatísticas
- [ ] Dashboard administrativo
- [ ] API de webhooks
- [ ] Sistema de anexos

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido para a Secretaria de Educação de Itatiaia - Prefeitura Municipal de Itatiaia**

**Tecnologias**: Node.js, Express, SQLite, HTML5, CSS3, JavaScript ES6+
