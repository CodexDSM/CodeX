# Deploy do CodeX na AWS EC2

Este guia descreve como fazer deploy do CodeX em uma instância EC2 da AWS.

## Pré-requisitos

1. Uma instância EC2 rodando Ubuntu
2. Acesso SSH à instância
3. As seguintes portas liberadas no Security Group:
   - 80 (HTTP)
   - 443 (HTTPS)

## Versões do Software

O deploy usa:
- Node.js 20.x LTS (mais recente versão com suporte de longo prazo)
- PM2 para gerenciamento de processos
- Nginx como servidor web/proxy reverso

Se você ver um aviso de versão do Node.js durante a instalação, não se preocupe - o script já está configurado para usar a versão LTS mais recente.

## Passos para Deploy

### 1. Configurar Security Group

No console AWS:
1. Vá para EC2 → Security Groups
2. Selecione o security group da sua instância
3. Adicione as regras de entrada (Inbound rules):
   ```
   Tipo: HTTP  | Porta: 80  | Source: 0.0.0.0/0
   Tipo: HTTPS | Porta: 443 | Source: 0.0.0.0/0
   ```

### 2. Conectar na EC2 e fazer Deploy

```bash
# Conectar via SSH (substitua pelo seu .pem e IP)
ssh -i "sua-chave.pem" ubuntu@3.18.105.117

# Clonar repositório e fazer checkout da branch
cd /var/www
sudo rm -rf codex  # Limpa se já existir
git clone https://github.com/EnricoGermano/CodeX.git codex  
cd codex
git checkout feature/AWS-Migração

# Executar script de deploy
sudo bash deploy.sh
```

### 3. Verificar Deploy

Após o deploy, você pode acessar:
- Frontend: https://3.18.105.117
- API: https://3.18.105.117/api

**Nota sobre o certificado SSL**: Como estamos usando um certificado auto-assinado, o navegador mostrará um aviso de segurança. Você pode:
1. Clicar em "Avançado"
2. Escolher "Prosseguir para..." para acessar o site

### 4. Comandos Úteis

```bash
# Ver logs
pm2 logs codex-api    # Logs do backend
pm2 logs codex-front  # Logs do frontend
sudo tail -f /var/log/nginx/error.log  # Logs do Nginx

# Reiniciar serviços
pm2 restart codex-api    # Reinicia backend
pm2 restart codex-front  # Reinicia frontend
sudo systemctl restart nginx  # Reinicia Nginx

# Atualizar código
cd /var/www/codex
git pull origin feature/AWS-Migração
cd app && npm install
cd ../front && npm install && npm run build
pm2 restart all
```

### 5. Estrutura de Arquivos no Servidor

```
/var/www/codex/
├── app/              # Backend
│   ├── .env         # Variáveis de ambiente do backend
│   └── server.js
├── front/           # Frontend
│   ├── .env.production
│   └── ...
└── deploy.sh       # Script de deploy

/etc/nginx/
├── sites-available/
│   └── codex       # Configuração do Nginx
└── ssl/
    ├── nginx-selfsigned.key
    └── nginx-selfsigned.crt
```

### 6. Troubleshooting

Se encontrar problemas:

1. **Erro de permissão**:
```bash
sudo chown -R $USER:$USER /var/www/codex
```

2. **Serviços não iniciam**:
```bash
# Verificar status
pm2 status
sudo systemctl status nginx

# Verificar logs
pm2 logs
sudo journalctl -u nginx
```

3. **Erro de CORS**:
```bash
# Verificar configuração do backend
cat /var/www/codex/app/.env
# Confirmar se CLIENT_ORIGIN está correto
```

4. **Certificado SSL**:
```bash
# Recriar certificado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/CN=3.18.105.117"
```

5. **Problemas com Node.js**:
```bash
# Ver versão atual do Node.js
node -v

# Se precisar reinstalar Node.js 20:
sudo apt remove nodejs
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar se a versão foi atualizada
node -v  # Deve mostrar v20.x.x
```

### 7. Backup (Opcional)

Para fazer backup da aplicação:
```bash
# Backup dos arquivos
sudo tar -czf /backup/codex-$(date +%Y%m%d).tar.gz /var/www/codex

# Backup do banco de dados (se necessário)
mysqldump -h $DB_HOST -u $DB_USER -p $DB_NAME > /backup/db-$(date +%Y%m%d).sql
```