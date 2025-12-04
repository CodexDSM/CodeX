#!/bin/bash

# Deploy Script for CodeX on EC2 Amazon Linux 2
# Configuração: HTTPS com nginx + Let's Encrypt + Node.js + Next.js
# Domain: https://newelog.duckdns.org/
# IP: 18.218.78.178

set -e

echo "================================"
echo "Deploy CodeX - EC2 AWS (Amazon Linux 2)"
echo "Domain: newelog.duckdns.org"
echo "IP: 18.218.78.178"
echo "================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
DOMAIN="newelog.duckdns.org"
APP_DIR="/var/www/codex"
BACKEND_PORT=3001
FRONTEND_PORT=3000
GITHUB_REPO="https://github.com/CodexDSM/CodeX.git"

echo -e "${YELLOW}[1/11] Atualizando sistema...${NC}"
sudo yum update -y

echo -e "${YELLOW}[2/11] Instalando dependências do sistema...${NC}"
sudo yum install -y \
    curl \
    git \
    wget \
    python3 \
    python3-pip \
    gcc \
    openssl-devel \
    make \
    mysql

echo -e "${YELLOW}[3/11] Instalando Certbot e plugin Nginx...${NC}"
sudo pip3 install --upgrade pip
sudo pip3 install certbot certbot-nginx

echo -e "${YELLOW}[4/11] Instalando Nginx via amazon-linux-extras...${NC}"
sudo amazon-linux-extras install -y nginx1
sudo systemctl enable nginx
sudo mkdir -p /var/www/certbot

echo -e "${YELLOW}[5/11] Instalando Node.js 20 LTS via NodeSource...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

echo -e "${YELLOW}[6/11] Criando estrutura de diretórios...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R ec2-user:ec2-user $APP_DIR
cd $APP_DIR

echo -e "${YELLOW}[7/11] Clonando repositório do GitHub...${NC}"
if [ -d ".git" ]; then
    git pull origin main
else
    git clone $GITHUB_REPO .
fi

echo -e "${YELLOW}[8/11] Instalando dependências do Backend...${NC}"
cd $APP_DIR/app
npm install --production

echo -e "${YELLOW}[9/11] Instalando dependências do Frontend...${NC}"
cd $APP_DIR/front
npm install --production
npm run build

echo -e "${YELLOW}[10/11] Criando arquivo .env para Backend...${NC}"
sudo tee $APP_DIR/app/.env > /dev/null << 'ENVEOF'
# Database Configuration
DB_HOST=databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=rYMBV1INY&QpogZ53cdu
DB_NAME=newe_db
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Configuration
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI786IuytkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pb89kBzaXN0ZW1hLvaçpkmNvbSIsInolB798lcmZpbCIu6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA4NkhjkhjQwMH0.rB96zfoBe7YYjN5jg56-231jZui89cQOK1zkhjkhv431pVaFmYrMf678768QZsM90
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=codexdsm@gmail.com
EMAIL_PASS=nrua zaxg lvfv mumq
EMAIL_FROM=CodeX Sistema <codexdsm@gmail.com>

# API URL (used by frontend)
NEXT_PUBLIC_API_URL=https://newelog.duckdns.org/api
ENVEOF

echo -e "${YELLOW}[11/11] Configurando Nginx com HTTPS...${NC}"

# Criar arquivo de configuração do Nginx
sudo tee /etc/nginx/conf.d/codex.conf > /dev/null << 'NGINXEOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name newelog.duckdns.org;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name newelog.duckdns.org;
    
    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/newelog.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/newelog.duckdns.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
    gzip_proxied any;
    gzip_vary on;
    gzip_min_length 1000;
    
    client_max_body_size 50M;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
NGINXEOF

# Testar configuração Nginx
echo -e "${GREEN}✓ Testando configuração Nginx...${NC}"
sudo nginx -t

# Obter certificado SSL com Let's Encrypt
echo -e "${YELLOW}Obtendo certificado SSL com Let's Encrypt...${NC}"
sudo certbot certonly --webroot -w /var/www/certbot -d $DOMAIN -n --agree-tos -m admin@$DOMAIN 2>/dev/null || echo "Certificado já existe ou erro"

# Carregar novo certificado
sudo systemctl restart nginx

# Criar serviços systemd
echo -e "${YELLOW}Criando serviços systemd...${NC}"

# Backend Service
sudo tee /etc/systemd/system/codex-backend.service > /dev/null << 'SERVICEOF'
[Unit]
Description=CodeX Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/var/www/codex/app
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICEOF

# Frontend Service
sudo tee /etc/systemd/system/codex-frontend.service > /dev/null << 'SERVICEOF'
[Unit]
Description=CodeX Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/var/www/codex/front
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICEOF

# Iniciar serviços
echo -e "${YELLOW}Inicializando serviços...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable codex-backend.service codex-frontend.service
sudo systemctl start codex-backend.service codex-frontend.service

# Aguardar serviços iniciarem
sleep 5

# Configurar renovação automática de SSL
echo -e "${YELLOW}Configurando renovação automática de SSL...${NC}"
sudo tee /etc/cron.d/certbot-renew > /dev/null << 'CRONEOF'
0 3 * * * root /usr/local/bin/certbot renew --quiet --renew-hook "systemctl reload nginx"
CRONEOF

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Deploy Concluído com Sucesso!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${GREEN}Informações de Acesso:${NC}"
echo "Frontend: https://newelog.duckdns.org"
echo "Backend API: https://newelog.duckdns.org/api"
echo "IP Público: 18.218.78.178"
echo ""
echo -e "${GREEN}Status dos Serviços:${NC}"
sudo systemctl status codex-backend --no-pager
sudo systemctl status codex-frontend --no-pager
sudo systemctl status nginx --no-pager
echo ""
echo -e "${GREEN}Próximas Etapas:${NC}"
echo "1. Verificar se os serviços estão rodando:"
echo "   sudo systemctl status codex-backend"
echo "   sudo systemctl status codex-frontend"
echo ""
echo "2. Ver logs em tempo real:"
echo "   sudo journalctl -u codex-backend -f"
echo "   sudo journalctl -u codex-frontend -f"
echo ""
echo "3. Renovar Certificado SSL manualmente (se necessário):"
echo "   sudo certbot renew"
echo ""
echo "4. Verificar acesso:"
echo "   curl -I https://newelog.duckdns.org"
echo ""
