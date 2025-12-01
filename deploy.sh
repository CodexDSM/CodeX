#!/bin/bash

# =============================================================================
# DEPLOY CODEX - EC2 AWS AMAZON LINUX 2
# =============================================================================
# Script para deploy automático do CodeX (Backend + Frontend)
# Uso: sudo bash deploy.sh
# =============================================================================

set -e

echo "================================================"
echo "  INICIANDO DEPLOY DO CODEX NA EC2 AWS"
echo "================================================"
echo ""

# Validar se é root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Por favor, execute como root (sudo bash deploy.sh)"
    exit 1
fi

# =============================================================================
# CONFIGURAÇÕES
# =============================================================================

# Altere estas variáveis conforme necessário
DOMAIN_OR_IP="3.147.67.126"
APP_DIR="/var/www/codex"
APP_USER="ec2-user"
GITHUB_REPO="https://github.com/EnricoGermano/CodeX.git"
GITHUB_BRANCH="main"

# Banco de dados (RDS)
DB_HOST="databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com"
DB_USER="admin"
DB_PASSWORD="rYMBV1INY&QpogZ53cdu"
DB_NAME="newe_db"
DB_PORT="3306"

# Email (Gmail)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="codexdsm@gmail.com"
EMAIL_PASS="nrua zaxg lvfv mumq"
EMAIL_FROM="CodeX Sistema <codexdsm@gmail.com>"

# JWT
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# =============================================================================
# 1. ATUALIZAR SISTEMA E INSTALAR DEPENDÊNCIAS
# =============================================================================

echo "📦 Atualizando sistema e instalando dependências..."
yum update -y

# Instalar Node.js 20
echo "📥 Instalando Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Instalar Nginx
echo "📥 Instalando Nginx..."
amazon-linux-extras install -y nginx1

# Instalar Git
yum install -y git

# Instalar PM2 globalmente
echo "📥 Instalando PM2..."
npm install -g pm2

# Instalar Certbot (para Let's Encrypt - opcional)
yum install -y certbot python3-certbot-nginx

echo "✅ Dependências instaladas com sucesso"
echo ""

# =============================================================================
# 2. CRIAR DIRETÓRIO E CLONAR REPOSITÓRIO
# =============================================================================

echo "📁 Preparando diretórios..."

# Remover diretório antigo se existir
if [ -d "$APP_DIR" ]; then
    echo "🗑️  Removendo deploy anterior..."
    rm -rf "$APP_DIR"
fi

# Criar diretório
mkdir -p "$APP_DIR"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# Clonar repositório
echo "🔄 Clonando repositório do GitHub..."
cd /var/www
sudo -u "$APP_USER" git clone "$GITHUB_REPO" codex
cd "$APP_DIR"
sudo -u "$APP_USER" git checkout "$GITHUB_BRANCH"

echo "✅ Repositório clonado com sucesso"
echo ""

# =============================================================================
# 3. CONFIGURAR BACKEND (.env)
# =============================================================================

echo "⚙️  Configurando Backend..."

sudo -u "$APP_USER" cat > "$APP_DIR/app/.env" << EOF
NODE_ENV=production
PORT=3001
HOST=127.0.0.1

# Database
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=$DB_PORT

# CORS e Origin
CLIENT_ORIGIN=http://$DOMAIN_OR_IP

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=$JWT_EXPIRES_IN

# Email
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
EMAIL_FROM=$EMAIL_FROM
EOF

echo "✅ Backend configurado"
echo ""

# =============================================================================
# 4. CONFIGURAR FRONTEND (.env.production)
# =============================================================================

echo "⚙️  Configurando Frontend..."

sudo -u "$APP_USER" cat > "$APP_DIR/front/.env.production" << EOF
NEXT_PUBLIC_API_URL=http://$DOMAIN_OR_IP
EOF

echo "✅ Frontend configurado"
echo ""

# =============================================================================
# 5. INSTALAR DEPENDÊNCIAS E BUILD
# =============================================================================

echo "📦 Instalando dependências do Backend..."
cd "$APP_DIR/app"
sudo -u "$APP_USER" npm install --production
echo "✅ Backend pronto"
echo ""

echo "📦 Instalando dependências e fazendo build do Frontend..."
cd "$APP_DIR/front"
sudo -u "$APP_USER" npm install --legacy-peer-deps
echo "Building Frontend..."
sudo -u "$APP_USER" npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build do Frontend falhou!"
    exit 1
fi
echo "✅ Frontend pronto"
echo ""

# =============================================================================
# 6. INICIAR APLICAÇÕES COM PM2
# =============================================================================

echo "🚀 Iniciando aplicações com PM2..."

# Limpar PM2 anterior (se existir)
sudo -u "$APP_USER" pm2 delete all || true

# Para o Backend
cd "$APP_DIR/app"
sudo -u "$APP_USER" pm2 start server.js --name "codex-api" --node-args="--max-old-space-size=512" --env production

# Para o Frontend (Next.js)
cd "$APP_DIR/front"
# Iniciar diretamente sem npm (mais confiável)
sudo -u "$APP_USER" pm2 start "node_modules/.bin/next start -p 3000" --name "codex-front" --cwd "$APP_DIR/front" --env production

# Aguardar um pouco para ter certeza que iniciou
sleep 3

# Salvar configuração do PM2
sudo -u "$APP_USER" pm2 save

# Configurar PM2 para iniciar na boot
sudo -u "$APP_USER" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" --update

echo "✅ Aplicações iniciadas"
sleep 2
sudo -u "$APP_USER" pm2 status
echo ""

# =============================================================================
# 7. CONFIGURAR NGINX
# =============================================================================

echo "⚙️  Configurando Nginx..."

# Remover configuração padrão
rm -f /etc/nginx/conf.d/default.conf

# Criar arquivo de configuração do Nginx
cat > /etc/nginx/conf.d/codex.conf << 'NGINX_EOF'
# Redirecionar HTTP para HTTPS (comentado - usando HTTP simples por enquanto)
# server {
#     listen 80;
#     server_name _;
#     return 301 https://$host$request_uri;
# }

# Servidor HTTP
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;

    # Comprimir respostas
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    gzip_vary on;
    gzip_comp_level 6;

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;

        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Authorization, Content-Type, Accept, Origin' always;
    }

    # Frontend Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}

# Configuração de HTTPS com Let's Encrypt (descomente para usar SSL)
# Antes, execute: certbot certonly --standalone -d seu-dominio.com
#
# server {
#     listen 443 ssl http2;
#     server_name seu-dominio.com;
#
#     ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#
#     client_max_body_size 50M;
#     gzip on;
#     gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
#
#     location /api {
#         proxy_pass http://127.0.0.1:3001;
#         # ... resto da configuração ...
#     }
#
#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         # ... resto da configuração ...
#     }
# }
#
# # Redirecionar HTTP para HTTPS
# server {
#     listen 80;
#     server_name seu-dominio.com;
#     return 301 https://$host$request_uri;
# }

NGINX_EOF

# Testar configuração
nginx -t

# Iniciar Nginx
systemctl enable nginx
systemctl restart nginx

echo "✅ Nginx configurado e iniciado"
echo ""

# =============================================================================
# 8. CONFIGURAR FIREWALL
# =============================================================================

echo "🔒 Configurando firewall..."

# Verificar e abrir portas
if command -v firewall-cmd >/dev/null 2>&1; then
    firewall-cmd --permanent --add-service=http || true
    firewall-cmd --permanent --add-service=https || true
    firewall-cmd --reload
    echo "✅ Firewall configurado"
else
    echo "⚠️  firewall-cmd não encontrado (normal em EC2 sem firewalld)"
    echo "   Configure as portas 80 e 443 no Security Group da EC2"
fi

echo ""

# =============================================================================
# 9. CRIAR SCRIPTS DE UTILIDADE
# =============================================================================

echo "📝 Criando scripts de utilidade..."

# Script para ver logs
cat > "$APP_DIR/logs.sh" << 'SCRIPT_EOF'
#!/bin/bash
echo "Logs do CodeX:"
echo ""
echo "=== BACKEND ==="
pm2 logs codex-api --lines 50
echo ""
echo "=== FRONTEND ==="
pm2 logs codex-front --lines 50
echo ""
echo "=== NGINX ==="
tail -f /var/log/nginx/error.log
SCRIPT_EOF

chmod +x "$APP_DIR/logs.sh"
chown "$APP_USER:$APP_USER" "$APP_DIR/logs.sh"

# Script para restart
cat > "$APP_DIR/restart.sh" << 'SCRIPT_EOF'
#!/bin/bash
echo "Reiniciando aplicações..."
pm2 restart all
echo "✅ Aplicações reiniciadas"
SCRIPT_EOF

chmod +x "$APP_DIR/restart.sh"
chown "$APP_USER:$APP_USER" "$APP_DIR/restart.sh"

# Script para update
cat > "$APP_DIR/update.sh" << 'SCRIPT_EOF'
#!/bin/bash
echo "Atualizando código..."
cd /var/www/codex
git pull origin main

echo "Instalando dependências do backend..."
cd app
npm install --production

echo "Instalando dependências e fazendo build do frontend..."
cd ../front
npm install --legacy-peer-deps
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou!"
    exit 1
fi

echo "Reiniciando aplicações..."
pm2 restart all
sleep 2
pm2 status
echo "✅ Atualização concluída"
SCRIPT_EOF

chmod +x "$APP_DIR/update.sh"
chown "$APP_USER:$APP_USER" "$APP_DIR/update.sh"

echo "✅ Scripts criados"
echo ""

# =============================================================================
# RESUMO FINAL
# =============================================================================

echo "================================================"
echo "  ✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================================"
echo ""
echo "📱 Acesse sua aplicação:"
echo "   🌐 Frontend:  http://$DOMAIN_OR_IP"
echo "   🔌 API:      http://$DOMAIN_OR_IP/api"
echo ""
echo "📋 Comandos úteis:"
echo "   📊 Ver status:    pm2 status"
echo "   📝 Ver logs:      pm2 logs"
echo "   🔄 Reiniciar:     cd $APP_DIR && ./restart.sh"
echo "   📤 Atualizar:     cd $APP_DIR && ./update.sh"
echo ""
echo "🔒 Próximos passos (IMPORTANTE):"
echo "   1. Configure seu domínio para apontar para: $DOMAIN_OR_IP"
echo "   2. Para HTTPS com Let's Encrypt (recomendado):"
echo "      sudo certbot certonly --standalone -d seu-dominio.com"
echo "      Depois descomente a seção HTTPS em /etc/nginx/conf.d/codex.conf"
echo ""
echo "📁 Arquivos importantes:"
echo "   - Backend .env:      $APP_DIR/app/.env"
echo "   - Frontend .env:     $APP_DIR/front/.env.production"
echo "   - Nginx config:      /etc/nginx/conf.d/codex.conf"
echo "   - PM2 logs:          ~/.pm2/logs/"
echo ""
echo "❓ Troubleshooting:"
echo "   - Verificar status: pm2 status"
echo "   - Ver erros:        pm2 logs"
echo "   - Teste Nginx:      nginx -t"
echo "   - Reiniciar Nginx:  systemctl restart nginx"
echo ""
echo "================================================"
