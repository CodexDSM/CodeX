#!/bin/bash

# Deploy Script for CodeX on EC2
# Configuração: HTTPS com nginx + Let's Encrypt + Node.js + Next.js
# Domain: https://newelog.duckdns.org/
# IP: 18.218.78.178

set -e

echo "================================"
echo "Deploy CodeX - EC2 AWS"
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

echo -e "${YELLOW}[1/10] Atualizando sistema...${NC}"
sudo apt-get update && sudo apt-get upgrade -y

echo -e "${YELLOW}[2/10] Instalando dependências do sistema...${NC}"
sudo apt-get install -y \
    curl \
    git \
    wget \
    certbot \
    python3-certbot-nginx \
    nginx \
    nodejs \
    npm \
    mysql-client \
    build-essential \
    libssl-dev \
    pkg-config

echo -e "${YELLOW}[3/10] Instalando Node.js LTS (via NVM recomendado)...${NC}"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

echo -e "${YELLOW}[4/10] Criando estrutura de diretórios...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR
cd $APP_DIR

echo -e "${YELLOW}[5/10] Clonando repositório do GitHub...${NC}"
git clone $GITHUB_REPO . || (cd $APP_DIR && git pull origin main)

echo -e "${YELLOW}[6/10] Instalando dependências do Backend...${NC}"
cd $APP_DIR/app
npm install --production

echo -e "${YELLOW}[7/10] Instalando dependências do Frontend...${NC}"
cd $APP_DIR/front
npm install --production
npm run build

echo -e "${YELLOW}[8/10] Criando arquivo .env para Backend...${NC}"
cat > $APP_DIR/app/.env << 'EOF'
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
EOF

echo -e "${YELLOW}[9/10] Configurando Nginx com HTTPS...${NC}"
sudo tee /etc/nginx/sites-available/codex > /dev/null << 'EOF'
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
EOF

sudo ln -sf /etc/nginx/sites-available/codex /etc/nginx/sites-enabled/codex
sudo rm -f /etc/nginx/sites-enabled/default

echo -e "${YELLOW}[10/10] Obtendo certificado SSL com Let's Encrypt...${NC}"
sudo mkdir -p /var/www/certbot
sudo certbot certonly --webroot -w /var/www/certbot -d newelog.duckdns.org -n --agree-tos -m admin@newelog.duckdns.org

echo -e "${GREEN}✓ Testando configuração Nginx...${NC}"
sudo nginx -t

echo -e "${YELLOW}Iniciando Nginx...${NC}"
sudo systemctl enable nginx
sudo systemctl start nginx

echo -e "${YELLOW}Criando serviços systemd...${NC}"

# Backend Service
sudo tee /etc/systemd/system/codex-backend.service > /dev/null << EOF
[Unit]
Description=CodeX Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/app
ExecStart=$(which node) server.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Frontend Service
sudo tee /etc/systemd/system/codex-frontend.service > /dev/null << EOF
[Unit]
Description=CodeX Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/front
ExecStart=$(which npm) start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

echo -e "${YELLOW}Iniciando serviços...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable codex-backend.service
sudo systemctl enable codex-frontend.service
sudo systemctl start codex-backend.service
sudo systemctl start codex-frontend.service

echo -e "${YELLOW}Configurando renovação automática de SSL...${NC}"
sudo tee /etc/cron.d/certbot-renew > /dev/null << 'EOF'
0 3 * * * root /usr/bin/certbot renew --quiet --renew-hook "systemctl reload nginx"
EOF

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Deploy Concluído com Sucesso!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${GREEN}Informações de Acesso:${NC}"
echo "Frontend: https://newelog.duckdns.org"
echo "Backend API: https://newelog.duckdns.org/api"
echo "IP Público: 18.218.78.178"
echo ""
echo -e "${GREEN}Próximas Etapas:${NC}"
echo "1. Verificar Status dos Serviços:"
echo "   sudo systemctl status codex-backend"
echo "   sudo systemctl status codex-frontend"
echo ""
echo "2. Ver Logs:"
echo "   sudo journalctl -u codex-backend -f"
echo "   sudo journalctl -u codex-frontend -f"
echo ""
echo "3. Renovar Certificado SSL manualmente (se necessário):"
echo "   sudo certbot renew"
echo ""
