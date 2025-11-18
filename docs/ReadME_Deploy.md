# Instruções Completas de Deploy no Amazon Linux - IP: 3.147.67.126

## Pré-requisitos

1.  Uma instância EC2 Amazon Linux 
2.  Acesso SSH à instância
3.  Security Group com portas 80, 443, 22 abertas
4.  Credenciais de acesso ao banco de dados RDS

## PASSO 1: Configurar Security Group (AWS Console)

No AWS Console:
1. Vá para EC2 → Security Groups
2. Selecione o security group da sua instância
3. Clique em "Edit inbound rules"
4. Adicione estas regras:
   ```
   - Tipo: SSH (22)      | Source: Seu IP
   - Tipo: HTTP (80)     | Source: 0.0.0.0/0
   - Tipo: HTTPS (443)   | Source: 0.0.0.0/0
   ```
5. Salve as regras

## PASSO 2: Conectar na EC2 via SSH

No seu terminal local (WSL, Git Bash ou terminal Linux):

```bash
# Substitua pelo caminho correto da sua chave .pem
ssh -i ~/.ssh/Codex.pem ec2-user@3.147.67.126
```

Se der erro de permissão da chave:
```bash
# Copie a chave para o WSL/terminal
cp /c/Users/SeuUsuario/Downloads/Codex.pem ~/.ssh/
chmod 400 ~/.ssh/Codex.pem

# Tente conectar novamente
ssh -i ~/.ssh/Codex.pem ec2-user@3.147.67.126
```

## PASSO 3: Fazer Deploy (execute estes comandos NA EC2)

Uma vez conectado na EC2, execute:

```bash
# Clonar o repositório
cd /home/ec2-user
git clone https://github.com/EnricoGermano/CodeX.git
cd CodeX

# Fazer checkout da branch correta
git checkout feature/AWS-Migração

# Executar o script de deploy como sudo
sudo bash deploy.sh
```

O script vai:
- ✅ Instalar Node.js 20, Nginx, Git
- ✅ Configurar certificado SSL auto-assinado
- ✅ Clonar o repositório
- ✅ Configurar variáveis de ambiente (.env)
- ✅ Instalar dependências do backend e frontend
- ✅ Build do Next.js
- ✅ Iniciar serviços com PM2
- ✅ Configurar Nginx como proxy reverso
- ✅ Abrir firewall (firewalld)

## PASSO 4: Verificar o Status dos Serviços

Após o deploy, execute:

```bash
# Ver status dos processos Node.js
pm2 status

# Deve mostrar:
# codex-api    online
# codex-front  online
```

Se algum estiver com erro, rode:
```bash
pm2 logs codex-api --lines 50
pm2 logs codex-front --lines 50
```

## PASSO 5: Testar a Aplicação

Abra seu navegador e acesse:
- **Frontend**: https://3.147.67.126
- **API (teste)**: https://3.147.67.126/api/health

Você verá um aviso de "Conexão não segura" — é normal com certificado auto-assinado:
1. Clique em "Avançado"
2. Selecione "Prosseguir para..."
3. Acesse o site

## PASSO 6: Testar Comunicação Frontend ↔ Backend

No navegador, abra o DevTools (F12):
1. Vá para a aba "Network"
2. Tente fazer login ou carregar uma página que chame a API
3. Procure por requisições para `https://3.147.67.126/api/...`
4. Confirme que recebem status 200 (sucesso) ou erro específico

Se tiver erro CORS:
```bash
# Verifique o .env do backend
cat /var/www/codex/app/.env | grep CLIENT_ORIGIN
# Deve mostrar: CLIENT_ORIGIN=https://3.147.67.126

# Reinicie o backend
pm2 restart codex-api
```

## Comandos Úteis para Manutenção

```bash
# Ver logs em tempo real
pm2 logs codex-api
pm2 logs codex-front

# Reiniciar serviços
pm2 restart all

# Parar serviços
pm2 stop all

# Começar serviços novamente
pm2 start all

# Ver configuração do Nginx
sudo cat /etc/nginx/conf.d/codex.conf

# Testar configuração do Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Atualizar o Código no Futuro

```bash
cd /var/www/codex

# Atualizar código
git pull origin feature/AWS-Migração

# Reinstalar dependências se necessário
cd app && npm install
cd ../front && npm install

# Fazer rebuild do Next.js
npm run build

# Reiniciar aplicações
pm2 restart all
```

## Troubleshooting

### Erro: "Frontend não consegue acessar API"
1. Verifique se a porta 3001 está rodando:
   ```bash
   netstat -tuln | grep 3001
   ```
2. Verifique o .env do backend:
   ```bash
   cat /var/www/codex/app/.env | grep CLIENT_ORIGIN
   ```
3. Reinicie o backend:
   ```bash
   pm2 restart codex-api
   ```

### Erro: "Build do Next.js congela"
1. Verifique memória disponível:
   ```bash
   free -h
   ```
2. Se tiver pouca memória, crie swap:
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```
3. Tente o build novamente:
   ```bash
   cd /var/www/codex/front
   rm -rf .next node_modules
   npm install
   npm run build
   ```

### Erro: "Nginx não encontra a página"
1. Verifique se o arquivo de config está correto:
   ```bash
   sudo cat /etc/nginx/conf.d/codex.conf
   ```
2. Teste a configuração:
   ```bash
   sudo nginx -t
   ```
3. Reinicie Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### Erro: "PM2 - Script already launched"
```bash
# Delete o processo e inicie novamente
pm2 delete codex-api
pm2 delete codex-front

# Inicie manualmente
cd /var/www/codex/app
pm2 start server.js --name codex-api

cd /var/www/codex/front
npm run build
pm2 start npm --name codex-front -- start
```

## Resumo Visual do Fluxo

```
Navegador (você)
    ↓
HTTPS (port 443)
    ↓
Nginx (3.147.67.126)
    ├─ /api → http://localhost:3001 (Node.js Backend)
    └─ /    → http://localhost:3000 (Next.js Frontend)
```

Se tudo estiver configurado corretamente:
- ✅ Frontend está em https://3.147.67.126 (porta 3000 internamente)
- ✅ Backend está em https://3.147.67.126/api (porta 3001 internamente)
- ✅ Nginx funciona como proxy reverso
- ✅ CORS permitido de https://3.147.67.126
- ✅ Firewall aberto para portas 80 e 443

Pronto! Seu sistema está online! 🎉