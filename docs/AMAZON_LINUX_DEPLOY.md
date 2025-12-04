# 🚀 Deploy CodeX - Amazon Linux 2

## Verificação de Compatibilidade

Antes de iniciar, confirme a versão do Amazon Linux:

```bash
cat /etc/os-release
# Output esperado:
# NAME="Amazon Linux"
# VERSION="2"
```

## ✅ O que o Script `deploy-ec2-amazonlinux.sh` Faz

✅ Usa `yum` (em vez de `apt-get`)  
✅ Instala Nginx via `amazon-linux-extras`  
✅ Instala Node.js 20 LTS via NodeSource  
✅ Instala Certbot e plugin Nginx  
✅ Configura diretório `/var/www/codex`  
✅ Clona repositório GitHub  
✅ Compila Next.js para produção  
✅ Configura HTTPS automático  
✅ Cria serviços systemd  
✅ Auto-renovação de certificado SSL  

**Tempo Total**: ~10-15 minutos

---

## 📋 Pré-Requisitos

### 1. Conectar à EC2
```bash
ssh -i seu-key.pem ec2-user@18.218.78.178
```

### 2. Verificar Internet
```bash
ping -c 3 github.com
```

### 3. Verificar Espaço em Disco
```bash
df -h
# Precisa de mínimo 30GB livres
```

### 4. Verificar Acesso ao RDS
```bash
# Testar conexão com banco (do terminal da EC2)
mysql -h databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com \
  -u admin -prYMBV1INY&QpogZ53cdu newe_db \
  -e "SELECT VERSION();"
  
# Se funcionar, terá output com versão do MySQL
```

---

## 🚀 Passo-a-Passo

### 1. Copiar Script para EC2

**Opção A: Via Git (recomendado)**
```bash
cd ~
git clone https://github.com/CodexDSM/CodeX.git
cd CodeX
chmod +x deploy-ec2-amazonlinux.sh
```

**Opção B: Via SCP (do seu computador local)**
```bash
scp -i seu-key.pem deploy-ec2-amazonlinux.sh ec2-user@18.218.78.178:~/
# Depois conectar à EC2 e dar permissão
ssh -i seu-key.pem ec2-user@18.218.78.178
chmod +x ~/deploy-ec2-amazonlinux.sh
```

### 2. Executar Deploy (com sudo)
```bash
# Necessário ter permissão sudo
sudo bash ~/deploy-ec2-amazonlinux.sh

# Ou se estiver no diretório do projeto
cd ~/CodeX
sudo bash ./deploy-ec2-amazonlinux.sh
```

⚠️ **Importante**: O script pede `sudo` porque instala pacotes do sistema.

### 3. Aguardar Conclusão

O script exibe o progresso:
```
[1/11] Atualizando sistema...
[2/11] Instalando dependências do sistema...
[3/11] Instalando Certbot...
[4/11] Instalando Nginx...
[5/11] Instalando Node.js...
[6/11] Criando estrutura de diretórios...
[7/11] Clonando repositório...
[8/11] Instalando dependências Backend...
[9/11] Instalando dependências Frontend...
[10/11] Configurando Nginx...
[11/11] Criando serviços systemd...
```

### 4. Verificar Resultado Final

Ao final, você verá:
```
================================
✓ Deploy Concluído com Sucesso!
================================

Frontend: https://newelog.duckdns.org
Backend API: https://newelog.duckdns.org/api
IP Público: 18.218.78.178
```

---

## ✔️ Validação Pós-Deploy

### 1. Testar Frontend
```bash
curl -I https://newelog.duckdns.org
# Esperado: HTTP/2 200 ou HTTP/1.1 200
```

### 2. Testar Backend API
```bash
curl -I https://newelog.duckdns.org/api
# Esperado: HTTP/2 404 (não encontrado é OK, significa que está respondendo)
```

### 3. Verificar Certificado SSL
```bash
openssl s_client -connect newelog.duckdns.org:443 -showcerts < /dev/null
# Deve mostrar certificado válido para newelog.duckdns.org
```

### 4. Verificar Status dos Serviços
```bash
sudo systemctl status codex-backend
sudo systemctl status codex-frontend
sudo systemctl status nginx

# Todos devem mostrar: active (running)
```

### 5. Ver Logs
```bash
# Backend
sudo journalctl -u codex-backend -n 20

# Frontend
sudo journalctl -u codex-frontend -n 20

# Nginx
sudo tail -20 /var/log/nginx/error.log
```

---

## 🔄 Comandos Úteis no Amazon Linux

### Gerenciar Serviços
```bash
# Ver status
sudo systemctl status codex-backend
sudo systemctl status codex-frontend
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart codex-backend
sudo systemctl restart codex-frontend
sudo systemctl restart nginx

# Parar
sudo systemctl stop codex-backend

# Iniciar
sudo systemctl start codex-backend

# Habilitar auto-start
sudo systemctl enable codex-backend
```

### Ver Logs
```bash
# Backend (últimas 50 linhas)
sudo journalctl -u codex-backend -n 50

# Frontend (tempo real)
sudo journalctl -u codex-frontend -f

# Nginx (erro)
sudo tail -f /var/log/nginx/error.log

# Nginx (acesso)
sudo tail -f /var/log/nginx/access.log
```

### Verificar Espaço
```bash
# Disco
df -h

# Memória
free -h

# Processos Node.js
ps aux | grep node
```

### Testar Conectividade
```bash
# Testar DNS
nslookup newelog.duckdns.org

# Testar HTTP → HTTPS redirect
curl -I http://newelog.duckdns.org
# Deve retornar: 301 (redirect para HTTPS)

# Testar HTTPS
curl -I https://newelog.duckdns.org

# Testar Backend
curl https://newelog.duckdns.org/api/health 2>/dev/null | head -c 200
```

---

## 🐛 Troubleshooting - Amazon Linux

### Problema: "Permission denied" ao executar script

**Solução:**
```bash
# Dar permissão de execução
chmod +x deploy-ec2-amazonlinux.sh

# Executar com bash explicitamente
sudo bash deploy-ec2-amazonlinux.sh
```

### Problema: Nginx não inicia

**Verificar:**
```bash
# Ver erro
sudo nginx -t

# Ver status detalhado
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/error.log
```

**Solução comum:** Porta 80 ou 443 já em uso
```bash
# Ver o que está usando a porta
sudo lsof -i :80
sudo lsof -i :443

# Liberar (se for outro serviço)
sudo systemctl stop outro-servico
```

### Problema: Node.js/npm não encontrado

**Verificar:**
```bash
# Verificar versão
node --version
npm --version

# Se não tiver, reinstalar
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### Problema: Certificado SSL não gerado

**Verificar:**
```bash
# Ver error
sudo certbot certonly --webroot -w /var/www/certbot \
  -d newelog.duckdns.org -v

# Verificar diretório
ls -la /etc/letsencrypt/live/newelog.duckdns.org/

# Se não existir, tentar manualmente
sudo certbot renew --force-renewal
```

### Problema: Backend/Frontend não iniciam

**Verificar:**
```bash
# Ver logs
sudo journalctl -u codex-backend -n 50
sudo journalctl -u codex-frontend -n 50

# Reiniciar manualmente para ver erro
cd /var/www/codex/app
node server.js

# Ou
cd /var/www/codex/front
npm start
```

### Problema: Conexão com banco não funciona

**Verificar:**
```bash
# Testar conectividade
mysql -h databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com \
  -u admin -prYMBV1INY&QpogZ53cdu newe_db \
  -e "SELECT VERSION();"

# Verificar .env
cat /var/www/codex/app/.env | grep DB_

# Verificar logs do backend
sudo journalctl -u codex-backend -f | grep -i "database\|error"
```

---

## 📊 Estrutura de Diretórios Criada

```
/var/www/codex/
├── app/                    # Backend (Node.js + Express)
│   ├── server.js
│   ├── package.json
│   ├── .env                # Variáveis de ambiente
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── config/
│   └── node_modules/
├── front/                  # Frontend (Next.js)
│   ├── next.config.mjs
│   ├── package.json
│   ├── .next/             # Build compilado
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── lib/
│   └── node_modules/
└── .git/                  # Repositório Git
```

## 📁 Configuração de Nginx (Amazon Linux)

```
/etc/nginx/
├── conf.d/
│   └── codex.conf       # ← Configuração principal do seu site
├── sites-available/     # (não usado no Amazon Linux)
└── sites-enabled/       # (não usado no Amazon Linux)
```

**Diferença importante:**
- **Ubuntu**: Usa `sites-available/` e `sites-enabled/`
- **Amazon Linux**: Usa `conf.d/` diretamente

---

## 🔐 Certificado SSL

### Verificar Certificado
```bash
# Ver validade
sudo openssl x509 -in /etc/letsencrypt/live/newelog.duckdns.org/fullchain.pem -text -noout | grep -A 2 "Validity"

# Listar todos
sudo certbot certificates
```

### Renovar Certificado
```bash
# Teste (não faz nada)
sudo certbot renew --dry-run

# De verdade
sudo certbot renew

# Forçar renovação
sudo certbot renew --force-renewal
```

### Auto-Renovação
```bash
# Verificar cron job
sudo cat /etc/cron.d/certbot-renew

# Testar manualmente
sudo /usr/local/bin/certbot renew
```

---

## 🔄 Atualizar Aplicação

### Puxar Atualizações
```bash
cd /var/www/codex
sudo git pull origin main
sudo chown -R ec2-user:ec2-user .
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

---

## 📊 Monitoramento

### Verificar Saúde da Aplicação
```bash
bash /var/www/codex/scripts/check-status.sh
```

### CloudWatch (opcional)
```bash
# Instalar agent CloudWatch
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

---

## 🎯 Checklist Final

- [ ] Script executado com sucesso
- [ ] Nginx respondendo (curl -I https://newelog.duckdns.org)
- [ ] Frontend carregando no navegador
- [ ] Backend API respondendo
- [ ] Certificado SSL válido
- [ ] Banco de dados conectando
- [ ] Logs sem erros
- [ ] Serviços em auto-start habilitado

---

## 📞 Suporte Rápido

```bash
# Diagnóstico completo
echo "=== Versão Amazon Linux ===" && cat /etc/os-release
echo "=== Node.js ===" && node --version
echo "=== npm ===" && npm --version
echo "=== Nginx ===" && nginx -v
echo "=== Serviços ===" && sudo systemctl status codex-backend codex-frontend nginx --no-pager
echo "=== Certificado ===" && sudo certbot certificates
echo "=== Disco ===" && df -h
echo "=== Memória ===" && free -h
```

---

**Versão**: 1.0 - Amazon Linux 2  
**Data**: Dezembro 2025  
**Status**: Pronto para Deploy
