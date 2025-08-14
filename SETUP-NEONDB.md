# 🚀 Configuração do NeonDB para Deploy na Vercel

## 📋 Passo a Passo para Configurar o NeonDB

### 1. **Criar Conta no NeonDB**
- Acesse [neon.tech](https://neon.tech)
- Clique em "Sign Up" e crie sua conta
- Faça login na plataforma

### 2. **Criar Novo Projeto**
- Clique em "Create New Project"
- Escolha um nome para seu projeto (ex: `helpdesk-sme`)
- Selecione a região mais próxima (ex: `US East (N. Virginia)`)
- Clique em "Create Project"

### 3. **Obter String de Conexão**
- No dashboard do projeto, clique em "Connection Details"
- Copie a string de conexão que aparece
- Ela deve ser algo como:
```
postgresql://username:password@ep-xxxxx-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

### 4. **Configurar Variáveis de Ambiente**

#### **Para Desenvolvimento Local:**
1. Crie um arquivo `.env` na raiz do projeto:
```bash
cp env.example .env
```

2. Edite o arquivo `.env` e substitua a DATABASE_URL:
```env
DATABASE_URL=postgresql://username:password@ep-xxxxx-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

#### **Para Produção (Vercel):**
1. Instale o Vercel CLI:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Configure a variável de ambiente:
```bash
vercel env add DATABASE_URL
# Cole sua string de conexão do NeonDB quando solicitado
```

### 5. **Executar Migrações**
```bash
npm run db:migrate
```

### 6. **Testar Localmente**
```bash
npm run dev
```

### 7. **Deploy na Vercel**
```bash
vercel --prod
```

## 🔧 Configurações Importantes

### **SSL Mode**
- **Desenvolvimento**: `sslmode=prefer`
- **Produção**: `sslmode=require`

### **Pool de Conexões**
- O sistema está configurado para usar no máximo 20 conexões
- NeonDB funciona melhor com menos conexões simultâneas
- Timeout configurado para 30 segundos

### **Índices**
- O sistema cria automaticamente índices para:
  - `tickets.status`
  - `tickets.priority`
  - `tickets.created_at`
  - `logs.ticket_id`

## 🚨 Solução de Problemas

### **Erro de Conexão Recusada**
- Verifique se a DATABASE_URL está correta
- Confirme se o projeto NeonDB está ativo
- Verifique se a região está correta

### **Erro de SSL**
- Para desenvolvimento local, pode usar `sslmode=prefer`
- Para produção, use sempre `sslmode=require`

### **Erro de Timeout**
- Aumente o `connectionTimeoutMillis` no `db-config.js`
- Verifique sua conexão com a internet

## 📊 Monitoramento

### **Verificar Status do Banco**
```bash
npm run db:info
```

### **Logs do NeonDB**
- Acesse o dashboard do NeonDB
- Vá em "Logs" para ver queries e erros
- Monitore o uso de conexões

## 🔐 Segurança

### **Variáveis de Ambiente**
- **NUNCA** commite o arquivo `.env`
- Use sempre variáveis de ambiente na Vercel
- Rotacione senhas regularmente

### **Conexões**
- O sistema usa pool de conexões para eficiência
- Conexões são fechadas automaticamente após timeout
- SSL é obrigatório em produção

## 📞 Suporte

- **NeonDB**: [docs.neon.tech](https://docs.neon.tech)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **PostgreSQL**: [postgresql.org/docs](https://postgresql.org/docs)

---

**🎉 Parabéns! Seu sistema está configurado para usar PostgreSQL via NeonDB e pode ser deployado na Vercel!**
