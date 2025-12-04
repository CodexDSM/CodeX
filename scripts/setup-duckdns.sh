#!/bin/bash

# Script para configurar DuckDNS na EC2
# Este script atualiza o IP do DuckDNS automaticamente

DUCKDNS_TOKEN="seu_token_duckdns"
DUCKDNS_DOMAIN="newelog"

echo "Configurando DuckDNS autoupdate..."

# Criar diretório para script
sudo mkdir -p /opt/duckdns
sudo chmod 755 /opt/duckdns

# Criar script de atualização
sudo tee /opt/duckdns/update.sh > /dev/null << 'EOF'
#!/bin/bash

TOKEN="seu_token_duckdns"
DOMAIN="newelog"

# Obter IP público atual
CURRENT_IP=$(curl -s http://checkip.dyndns.org | grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b')

# Atualizar DuckDNS
curl -k "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=${CURRENT_IP}"

echo "DuckDNS atualizado: ${DOMAIN}.duckdns.org -> ${CURRENT_IP}"
EOF

sudo chmod +x /opt/duckdns/update.sh

# Configurar cron job para executar a cada 5 minutos
echo "Configurando cron job..."
sudo tee /etc/cron.d/duckdns-update > /dev/null << 'EOF'
*/5 * * * * root /opt/duckdns/update.sh >> /var/log/duckdns.log 2>&1
EOF

sudo chmod 644 /etc/cron.d/duckdns-update

echo "✓ DuckDNS configurado!"
echo "⚠️  IMPORTANTE: Editar /opt/duckdns/update.sh com seu token real"
echo "   Comando: sudo nano /opt/duckdns/update.sh"
