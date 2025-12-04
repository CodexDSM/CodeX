# 🚀 Deploy CodeX - Resumo Executivo

## O que foi criado

Criei um **deploy completo automatizado** para sua aplicação CodeX rodar na EC2 AWS com HTTPS.

### Arquivos Criados:

1. **`deploy-ec2.sh`** - Script principal de deploy (AUTOMÁTICO)
2. **`docs/DEPLOY_GUIDE.md`** - Guia detalhado (LEITURA)
3. **`scripts/setup-duckdns.sh`** - Config DuckDNS (OPCIONAL)
4. **`scripts/check-status.sh`** - Monitor de saúde (ÚTIL)
5. **`docs/SECURITY_CHECKLIST.md`** - Segurança (IMPORTANTE)

---

## 📋 O Que o Deploy Faz

✅ Instala Node.js + npm via NVM  
✅ Clona seu repositório GitHub  
✅ Instala dependências (Backend + Frontend)  
✅ Compila Next.js para produção  
✅ Configura Nginx como proxy reverso  
✅ Obtém certificado SSL via Let's Encrypt  
✅ Cria serviços systemd (auto-restart)  
✅ Configura renovação automática de SSL  
✅ Comprime arquivos (gzip)  

---

## ⚙️ Requisitos Antes de Começar

### 1. **EC2 Instance Setup**
- [ ] Instância EC2 criada (Amazon Linux 2 ou Ubuntu 22.04 LTS)
- [ ] **IP Público**: `18.218.78.178`
- [ ] Mínimo **30GB** de storage (SSD)
- [ ] Acesso SSH configurado (key pair salvo)

### 2. **Security Groups (AWS)**
```
INBOUND:
  - Port 22 (SSH): Seu IP ou 0.0.0.0/0
  - Port 80 (HTTP): 0.0.0.0/0
  - Port 443 (HTTPS): 0.0.0.0/0

OUTBOUND:
  - All traffic (permitir)
```

### 3. **DuckDNS**
- [ ] Conta criada em https://www.duckdns.org
- [ ] Token gerado e salvo
- [ ] Domínio `newelog` apontando para `18.218.78.178`
- [ ] Teste: `nslookup newelog.duckdns.org`

### 4. **Database (RDS)**
- [x] Já existe em `databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com`
- [x] Credenciais no `.env` (admin / senha)
- [x] Certifique-se que a EC2 consegue conectar na RDS

### 5. **GitHub**
- [x] Repositório público: https://github.com/CodexDSM/CodeX
- [ ] Ou gerar token se for privado

---

## 🚀 Passos para Deploy

### Passo 1: Conectar à EC2
```bash
# Substitua 'seu-key.pem' pelo seu arquivo de chave
ssh -i seu-key.pem ec2-user@18.218.78.178

# Se for Ubuntu (em vez de Amazon Linux)
ssh -i seu-key.pem ubuntu@18.218.78.178
```

### Passo 2: Copiar Script de Deploy
```bash
# Opção A: Download do repositório
git clone https://github.com/CodexDSM/CodeX.git
cd CodeX
chmod +x deploy-ec2.sh

# Opção B: Via SCP (do seu local)
scp -i seu-key.pem deploy-ec2.sh ec2-user@18.218.78.178:~/
```

### Passo 3: Executar Deploy
```bash
# Executar o script (vai levar 10-15 minutos)
sudo bash ./deploy-ec2.sh

# Ou
sudo ./deploy-ec2.sh
```

### Passo 4: Aguardar Conclusão
- Observar progresso no terminal
- Aguardar mensagem de sucesso
- **NÃO interromper o script**

### Passo 5: Verificar Status
```bash
# Verificar serviços
sudo systemctl status codex-backend
sudo systemctl status codex-frontend
sudo systemctl status nginx

# Testar HTTPS
curl -I https://newelog.duckdns.org

# Ver logs em tempo real
sudo journalctl -u codex-backend -f
```

---

## 🔍 O Que Verificar Após Deploy

### ✅ Frontend
```
Abrir no navegador: https://newelog.duckdns.org
```
- Página carrega?
- Sem erros de certificado SSL?
- Design renderiza corretamente?

### ✅ Backend API
```bash
curl -I https://newelog.duckdns.org/api
# Deve retornar: 200 ou 404 (mas não 502)
```

### ✅ Certificado SSL
```bash
# Deve mostrar como "válido"
curl -I https://newelog.duckdns.org

# Ver detalhes
openssl s_client -connect newelog.duckdns.org:443 -showcerts
```

### ✅ Banco de Dados
```bash
# Conectar à RDS da EC2
mysql -h databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com \
  -u admin -p newe_db

# Se conectar OK, status = ✓
```

### ✅ Logs Funcionando
```bash
# Backend logs
sudo journalctl -u codex-backend | head -20

# Frontend logs
sudo journalctl -u codex-frontend | head -20

# Nginx logs
sudo tail -20 /var/log/nginx/error.log
```

---

## 📊 Estrutura de Portas

| Serviço | Porta | Status | Acesso |
|---------|-------|--------|--------|
| Nginx HTTP | 80 | Redirecionado | 0.0.0.0/0 |
| Nginx HTTPS | 443 | ✅ Ativo | 0.0.0.0/0 |
| Next.js Frontend | 3000 | ✅ Ativo | Via nginx |
| Node.js Backend | 3001 | ✅ Ativo | Via nginx |
| MySQL RDS | 3306 | ✅ (RDS) | Via Subnet |

---

## 🔄 Atualizar Aplicação

### Puxar novas versões
```bash
cd /var/www/codex
git pull origin main

# Atualizar backend
cd app && npm install --production
sudo systemctl restart codex-backend

# Atualizar frontend
cd ../front && npm install --production && npm run build
sudo systemctl restart codex-frontend
```

---

## 🛠️ Troubleshooting Rápido

### Site não carrega (502 Bad Gateway)
```bash
# Verificar backends
sudo systemctl status codex-backend
sudo systemctl status codex-frontend

# Reiniciar
sudo systemctl restart codex-backend codex-frontend

# Ver erro
sudo journalctl -u codex-frontend -f
```

### API retorna erro (503)
```bash
# Verificar backend
sudo systemctl status codex-backend

# Testar conexão com DB
cd /var/www/codex/app
node -e "require('./src/config/database')"

# Logs
sudo journalctl -u codex-backend -f
```

### Certificado SSL inválido
```bash
# Renovar certificado
sudo certbot renew

# Se tiver erro, renovar manualmente
sudo certbot renew --force-renewal

# Recarregar nginx
sudo systemctl reload nginx
```

### Porta já em uso
```bash
# Encontrar o que está usando
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000
sudo lsof -i :3001

# Parar serviço conflitante
sudo systemctl stop nginx
```

---

## 📝 Variáveis de Ambiente Críticas

Localização: `/var/www/codex/app/.env`

```env
# Database (já configurado no RDS)
DB_HOST=databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=rYMBV1INY&QpogZ53cdu
DB_NAME=newe_db
DB_PORT=3306

# Server
PORT=3001
NODE_ENV=production

# JWT (IMPORTANTE: alterar para novo valor)
JWT_SECRET=seu_secret_aqui
JWT_EXPIRES_IN=24h

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=codexdsm@gmail.com
EMAIL_PASS=nrua zaxg lvfv mumq

# Frontend access
NEXT_PUBLIC_API_URL=https://newelog.duckdns.org/api
```

---

## 🔒 Segurança Essencial

- [x] HTTPS/SSL configurado ✓
- [x] Nginx proxy reverso ✓
- [x] Auto-renovação de certificado ✓
- [ ] **TODO**: Alterar JWT_SECRET para valor único
- [ ] **TODO**: Verificar CORS no backend
- [ ] **TODO**: Implementar rate limiting
- [ ] **TODO**: Revisar logs de segurança

**Consulte `docs/SECURITY_CHECKLIST.md` para lista completa.**

---

## 📊 Monitoramento Contínuo

### Status da Aplicação
```bash
bash /var/www/codex/scripts/check-status.sh
```

### Ver todos os logs
```bash
# Backend
sudo journalctl -u codex-backend -f

# Frontend  
sudo journalctl -u codex-frontend -f

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Renovação de SSL
```bash
# Verificar certificados
sudo certbot certificates

# Teste de renovação (sem fazer nada)
sudo certbot renew --dry-run

# Renovar agora
sudo certbot renew
```

---

## 🆘 Precisa de Ajuda?

### Verificar se tudo está OK
```bash
# 1. Conectar à EC2
ssh -i seu-key.pem ec2-user@18.218.78.178

# 2. Rodar status check
bash /var/www/codex/scripts/check-status.sh

# 3. Ver logs
sudo journalctl -u codex-backend -f
sudo journalctl -u codex-frontend -f

# 4. Testar HTTPS
curl -I https://newelog.duckdns.org
```

### Documentação Disponível
- **`docs/DEPLOY_GUIDE.md`** - Guia detalhado completo
- **`docs/SECURITY_CHECKLIST.md`** - Checklist de segurança
- **`scripts/check-status.sh`** - Script de diagnóstico

---

## 📋 Checklist Final

- [ ] EC2 criada e acessível via SSH
- [ ] Security groups configurados
- [ ] DuckDNS apontando para EC2
- [ ] Script `deploy-ec2.sh` copiado para EC2
- [ ] `sudo bash ./deploy-ec2.sh` executado com sucesso
- [ ] Frontend acessa: https://newelog.duckdns.org
- [ ] Backend responde: https://newelog.duckdns.org/api
- [ ] Certificado SSL válido (sem warnings)
- [ ] Banco de dados conectando
- [ ] Emails funcionando (teste)
- [ ] Logs operacionais normais

---

## 🎯 Próximos Passos

1. **Curto Prazo** (1-2 dias)
   - Testar todas as funcionalidades
   - Verificar conexão com banco
   - Testar envio de emails
   - Testar uploads de arquivos

2. **Médio Prazo** (1-2 semanas)
   - Implementar monitoramento (CloudWatch)
   - Configurar alertas
   - Backup automático
   - Load testing

3. **Longo Prazo** (Contínuo)
   - Security audits
   - Performance optimization
   - Disaster recovery testing
   - Documentação de incidents

---

**Versão**: 1.0  
**Data**: Dezembro 2025  
**Status**: Pronto para Deploy  

✅ **Tudo preparado. Seu deploy está pronto!**
