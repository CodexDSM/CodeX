# Deploy do CodeX para EC2
# ====================

## 1. Configuração inicial do EC2 (executar apenas uma vez)
# ---------------------------------------------------

## 1.1. Instalar Node.js e npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

## 1.2. Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

## 1.3. Instalar Nginx
sudo apt update
sudo apt install -y nginx

## 1.4. Configurar HTTPS com certificado auto-assinado
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/CN=3.18.105.117"

## 1.5. Criar diretório da aplicação
sudo mkdir -p /var/www/codex
sudo chown -R $USER:$USER /var/www/codex

# 2. Deploy da Aplicação
# --------------------

## 2.1. Variáveis de ambiente do backend (copiar para /var/www/codex/app/.env)
DB_HOST=databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=rYMBV1INY&QpogZ53cdu
DB_NAME=newe_db
DB_PORT=3306
CLIENT_ORIGIN=https://3.18.105.117
PORT=3001
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI786IuytkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pb89kBzaXN0ZW1hLvaçpkmNvbSIsInolB798lcmZpbCIu6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA4NkhjkhjQwMH0.rB96zfoBe7YYjN5jg56-231jZui89cQOK1zkhjkhv431pVaFmYrMf678768QZsM90
JWT_EXPIRES_IN=24h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=codexdsm@gmail.com
EMAIL_PASS=nrua zaxg lvfv mumq
EMAIL_FROM=CodeX Sistema <codexdsm@gmail.com>

## 2.2. Variáveis de ambiente do frontend (copiar para /var/www/codex/front/.env.production)
NEXT_PUBLIC_API_URL=https://3.18.105.117

## 2.3. Deploy do Backend
cd /var/www/codex/app
npm install
pm2 start server.js --name codex-api

## 2.4. Deploy do Frontend
cd /var/www/codex/front
npm install
npm run build
pm2 start npm --name codex-front -- start

# 3. Configuração do Nginx
# ----------------------

## 3.1. Configurar Nginx (salvar em /etc/nginx/sites-available/codex)
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS Headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

## 3.2. Ativar configuração do Nginx
sudo ln -s /etc/nginx/sites-available/codex /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 4. Comandos úteis de manutenção
# -----------------------------

## 4.1. Verificar status dos serviços
pm2 status  # Status das aplicações Node.js
sudo systemctl status nginx  # Status do Nginx

## 4.2. Logs
pm2 logs codex-api  # Logs do backend
pm2 logs codex-front  # Logs do frontend
sudo tail -f /var/log/nginx/access.log  # Logs de acesso do Nginx
sudo tail -f /var/log/nginx/error.log   # Logs de erro do Nginx

## 4.3. Reiniciar serviços
pm2 restart codex-api  # Reiniciar backend
pm2 restart codex-front  # Reiniciar frontend
sudo systemctl restart nginx  # Reiniciar Nginx

## 4.4. Atualizar aplicação (quando fizer alterações)
cd /var/www/codex
git pull  # Atualizar código
cd app && npm install  # Atualizar dependências do backend
cd ../front && npm install && npm run build  # Atualizar frontend
pm2 restart all  # Reiniciar todas as aplicações