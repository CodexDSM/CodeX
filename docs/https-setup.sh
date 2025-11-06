# Configuração de HTTPS para CodeX no EC2
# Salvar este arquivo e executar os comandos conforme necessário

# 1. Instalar Nginx e Certbot
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Configurar Nginx
# Copie o arquivo nginx-https.conf para o servidor
sudo cp nginx-https.conf /etc/nginx/sites-available/codex

# Crie um link simbólico para habilitar o site
sudo ln -s /etc/nginx/sites-available/codex /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # remove configuração padrão se existir

# 3. Verificar configuração do Nginx
sudo nginx -t

# 4. Reiniciar Nginx se a configuração estiver OK
sudo systemctl restart nginx

# 5. Obter certificado SSL com Certbot
# (Substitua example.com pelo seu domínio quando tiver um)
sudo certbot --nginx -d 3.18.105.117 --agree-tos --email seu-email@example.com

# Se precisar gerar certificado auto-assinado (temporário/desenvolvimento)
sudo mkdir -p /etc/letsencrypt/live/codex/
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/live/codex/privkey.pem \
  -out /etc/letsencrypt/live/codex/fullchain.pem \
  -subj "/CN=3.18.105.117"

# 6. Configurar renovação automática do certificado
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 7. Verificar status do Nginx
sudo systemctl status nginx

# 8. Comandos úteis
# Verificar logs do Nginx:
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Recarregar Nginx após mudanças:
sudo systemctl reload nginx

# Verificar certificados SSL:
sudo certbot certificates

# Testar renovação (dry-run):
sudo certbot renew --dry-run

# IMPORTANTE: Configuração do Security Group na AWS
# Abra as portas no Security Group da instância EC2:
# - HTTP (80): Para redirecionamento para HTTPS
# - HTTPS (443): Para acesso seguro
# - 3000: Next.js (apenas se precisar acesso direto em dev)
# - 3001: API (apenas se precisar acesso direto em dev)

# Comandos AWS CLI para configurar Security Group (substitua sg-xxxxxx pelo seu security group):
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxx \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxx \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0