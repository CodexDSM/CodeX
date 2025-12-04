# Guia de Deploy - CodeX na EC2 AWS

## 📋 Requisitos Necessários

### Infraestrutura
- **EC2 Instance**: Amazon Linux 2 (otimizado) ou Ubuntu 22.04 LTS
- **IP Público**: `18.218.78.178`
- **Domain**: `newelog.duckdns.org` (já configurado)
- **Database**: RDS MySQL (já em uso)
- **Storage**: Mínimo 30GB (SSD recomendado)
- **User EC2**: `ec2-user` (padrão Amazon Linux)

### Credenciais & Configurações
Antes de iniciar o deploy, certifique-se de que tem:

1. **AWS Credentials** - Acesso à EC2 via SSH
   ```bash
   # Conectar à EC2
   ssh -i seu-key.pem ec2-user@18.218.78.178
   # ou
   ssh -i seu-key.pem ubuntu@18.218.78.178
   ```

2. **GitHub Access** (opcional, se repositório é privado)
   - Token pessoal do GitHub ou SSH key configurada

3. **Domain Setup** - DuckDNS configurado
   - Apontar `newelog.duckdns.org` para IP `18.218.78.178`
   - Verificar: `nslookup newelog.duckdns.org`

4. **Email para SSL Certificate**
   - Usar email válido para Let's Encrypt notifications

## 🚀 Processo de Deploy Automático

### Passo 1: Conectar à EC2
```bash
# Via SSH
ssh -i seu-key.pem ec2-user@18.218.78.178

# Ou se for Ubuntu
ssh -i seu-key.pem ubuntu@18.218.78.178
```

### Passo 2: Preparar o Script de Deploy

**Para Amazon Linux 2 (RECOMENDADO):**
```bash
# Download do script
cd ~
wget https://raw.githubusercontent.com/CodexDSM/CodeX/main/deploy-ec2-amazonlinux.sh

# Ou copiar arquivo manualmente via SCP
scp -i seu-key.pem deploy-ec2-amazonlinux.sh ec2-user@18.218.78.178:~/

# Dar permissão de execução
chmod +x deploy-ec2-amazonlinux.sh
```

**Para Ubuntu 22.04:**
```bash
# Download do script
cd ~
wget https://raw.githubusercontent.com/CodexDSM/CodeX/main/deploy-ec2.sh

# Ou copiar arquivo manualmente via SCP
scp -i seu-key.pem deploy-ec2.sh ubuntu@18.218.78.178:~/

# Dar permissão de execução
chmod +x deploy-ec2.sh
```

### Passo 3: Executar o Deploy

**Amazon Linux 2:**
```bash
# Executar script (levará ~10-15 minutos)
sudo bash ./deploy-ec2-amazonlinux.sh
```

**Ubuntu:**
```bash
# Executar script (levará ~10-15 minutos)
sudo bash ./deploy-ec2.sh

# Se houver erros de permissão
sudo bash ./deploy-ec2.sh
```

### Passo 4: Verificar Status
```bash
# Ver status dos serviços
sudo systemctl status codex-backend
sudo systemctl status codex-frontend
sudo systemctl status nginx

# Ver logs em tempo real
sudo journalctl -u codex-backend -f
sudo journalctl -u codex-frontend -f

# Testar acesso
curl -I https://newelog.duckdns.org
curl -I https://newelog.duckdns.org/api
```

## 📁 Estrutura de Diretórios na EC2

```
/var/www/codex/
├── app/                    # Backend (Node.js + Express)
│   ├── server.js
│   ├── package.json
│   ├── .env               # Variáveis de ambiente (porta 3001)
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── config/
│   └── node_modules/
├── front/                 # Frontend (Next.js)
│   ├── next.config.mjs
│   ├── package.json
│   ├── .next/            # Build compilado
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── lib/
│   └── node_modules/
├── docs/
├── package.json
└── deploy-ec2.sh
```

## 🔒 Configuração HTTPS/SSL

### Certificado Let's Encrypt
- **Localização**: `/etc/letsencrypt/live/newelog.duckdns.org/`
- **Renovação Automática**: Configurada via cron (3:00 AM diariamente)
- **Validade**: 90 dias

### Verificar Certificado
```bash
# Ver data de expiração
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Teste de renovação
sudo certbot renew --dry-run
```

## 🔌 Configuração de Portas

| Serviço | Porta | Tipo | Acesso |
|---------|-------|------|--------|
| Nginx (HTTP) | 80 | Público | Redirect → HTTPS |
| Nginx (HTTPS) | 443 | Público | Frontend + API |
| Node.js Backend | 3001 | Local | Apenas via nginx |
| Next.js Frontend | 3000 | Local | Apenas via nginx |
| MySQL | 3306 | RDS | Variável |

### Security Groups na AWS (importante!)
Certifique-se que estes ports estão liberados:
```
Inbound:
  - Port 22 (SSH): Seu IP / 0.0.0.0/0 (com cuidado)
  - Port 80 (HTTP): 0.0.0.0/0
  - Port 443 (HTTPS): 0.0.0.0/0

Outbound:
  - All traffic (para RDS e internet)
```

## 📊 Monitoramento e Manutenção

### Ver Logs
```bash
# Backend
sudo journalctl -u codex-backend -n 50
sudo journalctl -u codex-backend -f  # Em tempo real

# Frontend
sudo journalctl -u codex-frontend -n 50
sudo journalctl -u codex-frontend -f

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Reiniciar Serviços
```bash
# Reiniciar backend
sudo systemctl restart codex-backend

# Reiniciar frontend
sudo systemctl restart codex-frontend

# Reiniciar nginx
sudo systemctl reload nginx

# Reiniciar tudo
sudo systemctl restart codex-backend codex-frontend nginx
```

### Parar Serviços
```bash
sudo systemctl stop codex-backend
sudo systemctl stop codex-frontend
sudo systemctl stop nginx
```

### Iniciar Serviços
```bash
sudo systemctl start codex-backend
sudo systemctl start codex-frontend
sudo systemctl start nginx
```

## 🔄 Atualizar Aplicação

### Puxar Atualizações do GitHub
```bash
cd /var/www/codex
git pull origin main
```

### Atualizar Backend
```bash
cd /var/www/codex/app
npm install --production
sudo systemctl restart codex-backend
```

### Atualizar Frontend
```bash
cd /var/www/codex/front
npm install --production
npm run build
sudo systemctl restart codex-frontend
```

### Deploy Completo (com update)
```bash
cd /var/www/codex
git pull origin main

cd app
npm install --production
cd ../front
npm install --production
npm run build

sudo systemctl restart codex-backend codex-frontend
```

## 🐛 Troubleshooting

### 1. Frontend não carrega (erro 502)
```bash
# Verificar se Next.js está rodando
sudo systemctl status codex-frontend

# Ver logs
sudo journalctl -u codex-frontend -f

# Reiniciar
sudo systemctl restart codex-frontend
```

### 2. API retorna erro (erro 502/503)
```bash
# Verificar conexão com banco
cd /var/www/codex/app
node -e "const config = require('./src/config/database'); console.log('DB OK');"

# Ver logs do backend
sudo journalctl -u codex-backend -f

# Reiniciar
sudo systemctl restart codex-backend
```

### 3. HTTPS não funciona / Certificado inválido
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew

# Teste de validação
curl -I https://newelog.duckdns.org
```

### 4. Porta 80/443 já em uso
```bash
# Encontrar o que está usando
sudo lsof -i :80
sudo lsof -i :443

# Verificar nginx
sudo systemctl status nginx
sudo nginx -t
```

### 5. Espaço em disco cheio
```bash
# Ver uso de disco
df -h

# Limpar logs antigos
sudo journalctl --vacuum=30d

# Limpar npm cache
cd /var/www/codex/app && npm cache clean --force
cd /var/www/codex/front && npm cache clean --force
```

## 📝 Variáveis de Ambiente Críticas

### Backend (.env)
```env
# Database
DB_HOST=databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=rYMBV1INY&QpogZ53cdu
DB_NAME=newe_db
DB_PORT=3306

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=seu_secret_aqui
JWT_EXPIRES_IN=24h

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=codexdsm@gmail.com
EMAIL_PASS=nrua zaxg lvfv mumq
EMAIL_FROM=CodeX Sistema <codexdsm@gmail.com>

# Frontend API
NEXT_PUBLIC_API_URL=https://newelog.duckdns.org/api
```

## 🔐 Backup e Recuperação

### Backup do Banco de Dados
```bash
# Exportar database
mysqldump -h databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com \
  -u admin -prYMBV1INY&QpogZ53cdu \
  newe_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Backup da Aplicação
```bash
cd /var/www
tar -czf codex_backup_$(date +%Y%m%d_%H%M%S).tar.gz codex/
```

## 📞 Suporte e Contato

- **GitHub**: https://github.com/CodexDSM/CodeX
- **Email**: codexdsm@gmail.com
- **Domain**: https://newelog.duckdns.org

## ✅ Checklist Pós-Deploy

- [ ] Site carrega em https://newelog.duckdns.org
- [ ] Frontend renderiza corretamente
- [ ] API responde em https://newelog.duckdns.org/api
- [ ] Certificado SSL válido (sem warnings)
- [ ] Serviços iniciando automaticamente após reboot
- [ ] Logs funcionando corretamente
- [ ] Conexão com banco de dados OK
- [ ] Emails funcionando (teste)
- [ ] Uploads funcionando (teste)
- [ ] Backup automatizado configurado

---

**Última Atualização**: Dezembro 2025  
**Versão**: 1.0
