#!/bin/bash
echo "Iniciando deploy do CodeX..."

if [ "$EUID" -ne 0 ]
then echo "Por favor, execute como root (sudo bash deploy.sh)"
     exit 1
fi

# Instalar dependências
sudo yum update -y
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
sudo yum install -y nodejs nginx git
npm install -g pm2

# Configurar HTTPS/SSL
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt \
  -subj "/CN=3.147.67.126"

# Criar diretório da aplicação
mkdir -p /var/www/codex
chown -R $SUDO_USER:$SUDO_USER /var/www/codex

# Clonar repositório
cd /var/www
rm -rf codex
git clone https://github.com/EnricoGermano/CodeX.git codex
cd codex
git checkout feature/AWS-Migração

# Configurar backend
cat > /var/www/codex/app/.env << EOL
DB_HOST=databasenewe.cjusauuycpe7.us-east-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=rYMBV1INY&QpogZ53cdu
DB_NAME=newe_db
DB_PORT=3306
CLIENT_ORIGIN=https://3.147.67.126
PORT=3001
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI786IuytkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pb89kBzaXN0ZW1hLvaçpkmNvbSIsInolB798lcmZpbCIu6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA4NkhjkhjQwMH0.rB96zfoBe7YYjN5jg56-231jZui89cQOK1zkhjkhv431pVaFmYrMf678768QZsM90
JWT_EXPIRES_IN=24h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=codexdsm@gmail.com
EMAIL_PASS=nrua zaxg lvfv mumq
EMAIL_FROM=CodeX Sistema <codexdsm@gmail.com>
EOL

# Configurar frontend
cat > /var/www/codex/front/.env.production << EOL
NEXT_PUBLIC_API_URL=https://3.147.67.126
EOL

# Configurar Nginx
cat > /etc/nginx/conf.d/codex.conf << EOL
server {
    listen 80;
    server_name _;
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
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
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Authorization, Content-Type' always;
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

# Instalar e iniciar aplicações
cd /var/www/codex/app
npm install
pm2 start server.js --name codex-api

cd /var/www/codex/front
npm install
npm run build
pm2 start npm --name codex-front -- start

# Finalizar configuração
nginx -t
systemctl restart nginx
pm2 save

# Abrir firewall no Amazon Linux (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

echo "
Deploy concluído! 

 Acesse sua aplicação:
   Frontend: https://3.147.67.126
   API: https://3.147.67.126/api

 Importante:
 O navegador mostrará um aviso de certificado (normal, é auto-assinado)
 Para ver os logs:
   - Backend: pm2 logs codex-api
   - Frontend: pm2 logs codex-front
   - Nginx: tail -f /var/log/nginx/error.log

Para atualizar o código no futuro:
1. cd /var/www/codex
2. git pull origin feature/AWS-Migração
3. pm2 restart all
"
