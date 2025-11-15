# Comandos para configurar HTTPS com certificado auto-assinado (GRATUITO)
# Execute estes comandos no seu EC2 como root/sudo

# 1. Instalar Nginx
sudo apt update
sudo apt install -y nginx

# 2. Criar diretório para certificados
sudo mkdir -p /etc/nginx/ssl

# 3. Gerar certificado auto-assinado (quando pedir informações, pode dar Enter para todas)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/CN=3.18.105.117"

# 4. Configurar Nginx
# Copie o arquivo nginx-https-simple.conf para o servidor e então:
sudo cp nginx-https-simple.conf /etc/nginx/sites-available/codex

# 5. Ativar o site e remover o default
sudo ln -s /etc/nginx/sites-available/codex /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 6. Testar e reiniciar Nginx
sudo nginx -t
sudo systemctl restart nginx

# 7. Verificar status
sudo systemctl status nginx

# Comandos úteis:
# Ver logs:
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Reiniciar nginx após mudanças:
sudo systemctl restart nginx