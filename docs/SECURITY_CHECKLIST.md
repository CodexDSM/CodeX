# 🔒 Security Checklist - CodeX Deployment

## 1. AWS EC2 Security

### Security Groups
- [ ] SSH (22) restrito apenas aos seus IPs
- [ ] HTTP (80) aberto ao mundo (0.0.0.0/0)
- [ ] HTTPS (443) aberto ao mundo (0.0.0.0/0)
- [ ] MySQL (3306) fechado na EC2 (RDS independente)

### IAM & Access
- [ ] Usar IAM roles em vez de access keys
- [ ] Limitar permissões apenas ao necessário
- [ ] Rotacionar credenciais regularmente
- [ ] Monitorar logs de acesso

### EC2 Instance
- [ ] Usar security groups restritivos
- [ ] Habilitar termination protection
- [ ] Realizar backups regulares via snapshots
- [ ] Usar EBS encryption para volumes

## 2. SSL/TLS Security

### Let's Encrypt
- [x] Certificado instalado para newelog.duckdns.org
- [x] Renovação automática configurada (cron)
- [ ] Monitorar data de expiração
- [ ] Testar renovação em seco: `sudo certbot renew --dry-run`

### Nginx SSL Configuration
- [x] TLS 1.2 e 1.3 habilitados
- [x] Ciphers fortes configurados
- [x] HSTS habilitado (Strict-Transport-Security)
- [x] Redirect HTTP → HTTPS automático

### Verificação
```bash
# Ver qualidade do certificado
curl -I https://newelog.duckdns.org

# Teste SSL/TLS
openssl s_client -connect newelog.duckdns.org:443

# Validação externa
https://www.ssllabs.com/ssltest/
```

## 3. Senhas & Secrets

### .env Backend
- [x] JWT_SECRET alterado (gerar novo via crypto)
- [x] Senha do DB protegida (não committed ao git)
- [x] Email password seguro (app password, não senha real)
- [x] Arquivo .env não versionado no git

### Gerar novo JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Verificar .gitignore
```bash
cat /var/www/codex/.gitignore | grep .env
```

## 4. Application Security

### Backend (Node.js)
- [x] Validação de input em todas as rotas
- [x] CORS configurado restritivamente
- [x] Rate limiting (considerar adicionar)
- [x] SQL injection protection via mysql2
- [x] XSS protection (express-validator)

### Frontend (Next.js)
- [x] CSP headers configurados
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: SAMEORIGIN
- [ ] Verificar CORS em requests à API

### Database
- [x] Conexão criptografada (RDS com SSL)
- [x] Backup automático habilitado
- [x] Multi-AZ replicação (considerar)
- [ ] Monitorar logs de acesso

## 5. Logs & Monitoring

### Nginx Logs
```bash
# Ver logs de erro
sudo tail -f /var/log/nginx/error.log

# Ver logs de acesso
sudo tail -f /var/log/nginx/access.log

# Análise de segurança
sudo grep "403\|401\|500" /var/log/nginx/access.log
```

### Application Logs
```bash
# Backend
sudo journalctl -u codex-backend -f

# Frontend
sudo journalctl -u codex-frontend -f
```

### CloudWatch (AWS)
- [ ] Configurar CloudWatch para logs
- [ ] Configurar alertas para erros
- [ ] Monitorar CPU/Memory/Disk

## 6. Data Protection

### Backup
- [ ] Backup automático do banco (RDS snapshots)
- [ ] Backup da aplicação (semanal)
- [ ] Armazenar em S3 (fora da EC2)

### Encryption
- [x] HTTPS/TLS em trânsito
- [ ] Criptografia de dados sensíveis em repouso
- [ ] EBS encryption para volumes
- [x] RDS encryption habilitado

### Teste de Backup
```bash
# Restaurar um backup para verificar integridade
# Realizar teste mensal
```

## 7. Atualizações & Patching

### Sistema Operacional
```bash
# Verificar updates disponíveis
sudo apt update && apt list --upgradable

# Aplicar patches
sudo apt upgrade -y

# Manter automático
sudo apt install -y unattended-upgrades
```

### Node.js & Dependências
```bash
# Verificar vulnerabilidades
npm audit

# Atualizar pacotes (com cuidado)
npm update

# Verificar versão do Node
node --version
```

### Nginx & OpenSSL
```bash
# Verificar versão
nginx -v

# Verificar OpenSSL
openssl version
```

## 8. DDoS & Rate Limiting

### Nginx Rate Limiting
```nginx
# Adicionar em /etc/nginx/sites-available/codex
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

location / {
    limit_req zone=general burst=20;
    ...
}

location /api {
    limit_req zone=api burst=100;
    ...
}
```

### CloudFlare (Recomendado)
- [ ] Considerar usar CloudFlare como proxy
- [ ] DDoS protection automático
- [ ] Cache global

## 9. Firewall & Network

### UFW Firewall
```bash
# Status
sudo ufw status

# Configurar (se não feito)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2Ban (Prevenir brute force)
```bash
# Instalar
sudo apt install -y fail2ban

# Configurar
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Verificar
sudo fail2ban-client status
```

## 10. Compliance & Auditing

### GDPR/Privacy
- [ ] Consentimento de cookies
- [ ] Privacy policy disponível
- [ ] Direito ao esquecimento implementado
- [ ] Log de acessos de dados sensíveis

### Auditoria
- [ ] Logs de login de usuários
- [ ] Rastreamento de mudanças críticas
- [ ] Monitoramento de acessos à API
- [ ] Alertas para atividades suspeitas

## 11. Disaster Recovery

### RTO/RPO Targets
- [ ] RTO (Recovery Time Objective): < 1 hora
- [ ] RPO (Recovery Point Objective): < 15 minutos

### Plano de Recuperação
- [ ] Documentado procedimento de restore
- [ ] Testado mensalmente
- [ ] Múltiplas cópias de backup

### Disaster Recovery Steps
```bash
# 1. Verificar último backup
ls -lh /backups/

# 2. Restaurar banco
mysql < backup_db.sql

# 3. Restaurar aplicação
tar -xzf codex_backup.tar.gz

# 4. Reiniciar serviços
sudo systemctl restart codex-backend codex-frontend
```

## 12. Documentação & Training

### Documentação
- [x] Deploy guide criado
- [x] Troubleshooting guide criado
- [ ] Runbook para emergências
- [ ] Procedimentos de escalabilidade

### Training
- [ ] Equipe treinada em segurança
- [ ] Procedures de incident response
- [ ] Rotation de responsabilidades

## Checklist Final

- [ ] Todos os pontos acima completados
- [ ] Penetration testing realizado
- [ ] Security headers verificados via https://securityheaders.com
- [ ] SSL Labs A+ rating: https://www.ssllabs.com/ssltest/
- [ ] Backup restaurado e testado
- [ ] Incident response plan documentado
- [ ] Equipe preparada para produção

## 📞 Contatos Emergência

- **AWS Support**: [AWS Console](https://console.aws.amazon.com)
- **Let's Encrypt**: [Status Page](https://letsencrypt.status.io/)
- **Team Slack**: #codex-deploy-alerts

---

**Última Auditoria**: [Data]  
**Próxima Auditoria**: [Data + 30 dias]  
**Responsável**: [Nome]
