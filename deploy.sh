#!/bin/bash
# Script de deploy para CodeX no EC2
# Salve este arquivo como deploy.sh e execute: bash deploy.sh

echo "🚀 Iniciando deploy do CodeX..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Por favor, execute como root (sudo bash deploy.sh)"
  exit 1
fi

# 1. Instalar dependências
echo "📦 Instalando dependências..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx
npm install -g pm2

# 2. Configurar HTTPS
echo "🔒 Configurando HTTPS..."
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/CN=3.18.105.117"

# 3. Criar diretório da aplicação
echo "📁 Criando diretórios..."
mkdir -p /var/www/codex
chown -R $SUDO_USER:$SUDO_USER /var/www/codex

# 4. Clonar repositório e checkout da branch correta
echo "📋 Clonando repositório..."
cd /var/www
rm -rf codex # Remove se já existir
git clone https://github.com/EnricoGermano/CodeX.git codex
cd codex
git checkout feature/AWS-Migração

# 5. Configurar backend
echo "⚙️ Configurando backend..."
cat > /var/www/codex/app/.env << EOL
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
EOL

# 6. Configurar frontend
echo "🎨 Configurando frontend..."
cat > /var/www/codex/front/.env.production << EOL
NEXT_PUBLIC_API_URL=https://3.18.105.117
EOL

# 7. Configurar Nginx
echo "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/codex << EOL
server {
    listen 80;
    server_name _;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

ln -sf /etc/nginx/sites-available/codex /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 8. Instalar e iniciar aplicações
echo "🚀 Instalando e iniciando aplicações..."
cd /var/www/codex/app
npm install
pm2 start server.js --name codex-api

cd /var/www/codex/front
npm install
npm run build
pm2 start npm --name codex-front -- start

# 9. Iniciar e verificar Nginx
echo "✅ Finalizando configuração..."
nginx -t && systemctl restart nginx

# 10. Salvar configuração do PM2
pm2 save

echo "
✨ Deploy concluído! ✨

📱 Acesse sua aplicação:
   Frontend: https://3.18.105.117
   API: https://3.18.105.117/api

⚠️ Importante:
1. Certifique-se de que as portas 80 e 443 estão liberadas no Security Group da EC2
2. O navegador mostrará um aviso de certificado (normal, é auto-assinado)
3. Para ver os logs:
   - Backend: pm2 logs codex-api
   - Frontend: pm2 logs codex-front
   - Nginx: tail -f /var/log/nginx/error.log

🔄 Para atualizar o código no futuro:
1. cd /var/www/codex
2. git pull
3. pm2 restart all
"