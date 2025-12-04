#!/bin/bash

# Script para verificar status da aplicação

echo "=========================================="
echo "CodeX Application Status Check"
echo "=========================================="
echo ""

echo "🔹 Verificando Serviços Systemd..."
echo "---"

echo -n "Backend (Port 3001): "
if systemctl is-active --quiet codex-backend; then
    echo "✓ Running"
else
    echo "✗ Stopped"
fi

echo -n "Frontend (Port 3000): "
if systemctl is-active --quiet codex-frontend; then
    echo "✓ Running"
else
    echo "✗ Stopped"
fi

echo -n "Nginx (Port 80/443): "
if systemctl is-active --quiet nginx; then
    echo "✓ Running"
else
    echo "✗ Stopped"
fi

echo ""
echo "🔹 Verificando Portas..."
echo "---"

echo "Backend (3001): $(sudo lsof -i :3001 | wc -l) conexão(ões)"
echo "Frontend (3000): $(sudo lsof -i :3000 | wc -l) conexão(ões)"
echo "Nginx HTTP (80): $(sudo lsof -i :80 | wc -l) conexão(ões)"
echo "Nginx HTTPS (443): $(sudo lsof -i :443 | wc -l) conexão(ões)"

echo ""
echo "🔹 Certificado SSL..."
echo "---"

if [ -f "/etc/letsencrypt/live/newelog.duckdns.org/fullchain.pem" ]; then
    EXPIRY_DATE=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/newelog.duckdns.org/fullchain.pem | cut -d= -f2)
    echo "✓ Certificado encontrado"
    echo "  Expira em: $EXPIRY_DATE"
else
    echo "✗ Certificado não encontrado"
fi

echo ""
echo "🔹 Conectividade..."
echo "---"

echo -n "Frontend HTTP: "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000 || echo "Erro"

echo -n "Backend API: "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001 || echo "Erro"

echo ""
echo "🔹 Espaço em Disco..."
echo "---"
df -h | grep -E '^/dev/|^Filesystem'

echo ""
echo "🔹 Uso de Memória..."
echo "---"
free -h | head -2

echo ""
echo "=========================================="
echo "Fim da Verificação"
echo "=========================================="
