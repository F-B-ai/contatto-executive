#!/usr/bin/env bash
# Installazione del bot WhatsApp "Valentina" su un server Ubuntu (Hetzner, ecc.).
# Da eseguire come root su un server Ubuntu 22.04/24.04 appena creato:
#
#   bash <(curl -fsSL https://raw.githubusercontent.com/F-B-ai/contatto-executive/claude/claude-md-docs-fnsb3h/whatsapp-bot/setup.sh)
#
# Al termine restano solo due passaggi manuali: inserire la chiave API nel
# file .env e collegare WhatsApp (QR o codice di abbinamento).

set -e

BRANCH="claude/claude-md-docs-fnsb3h"
REPO="https://github.com/F-B-ai/contatto-executive.git"

echo "== 0/5 Aggiungo swap se manca (evita crash di Chromium su VM con poca RAM) =="
if [ "$(swapon --show | wc -l)" -eq 0 ] && [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "   swap di 2GB creato."
else
  echo "   swap già presente, salto."
fi

echo "== 1/5 Aggiorno il sistema e installo Node.js 20 + git =="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

echo "== 2/5 Installo le librerie di sistema per Chromium (headless) =="
# Best-effort: i nomi dei pacchetti variano un po' tra Ubuntu 22.04 e 24.04,
# quindi non blocchiamo lo script se qualcuno non si trova.
apt-get install -y \
  ca-certificates fonts-liberation libatk-bridge2.0-0 libatk1.0-0 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libglib2.0-0 libgtk-3-0 \
  libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcomposite1 libxdamage1 libxext6 \
  libxfixes3 libxrandr2 libxkbcommon0 libxshmfence1 xdg-utils 2>/dev/null || \
  echo "   (alcune librerie non trovate: proseguo, le sistemo dopo se serve)"

echo "== 3/5 Scarico il codice del bot (branch $BRANCH) =="
cd ~
if [ -d contatto-executive/.git ]; then
  cd contatto-executive && git fetch origin "$BRANCH" && git checkout "$BRANCH" && git pull origin "$BRANCH"
else
  git clone -b "$BRANCH" "$REPO"
  cd contatto-executive
fi
cd whatsapp-bot

echo "== 4/5 Installo le dipendenze del bot e pm2 =="
npm install
npm install -g pm2 || true

echo "== 5/5 Preparo la configurazione =="
[ -f .env ] || cp .env.example .env

echo ""
echo "======================================================================"
echo " Installazione completata. Restano SOLO due passaggi:"
echo ""
echo " 1) Configura la chiave API:"
echo "      nano ~/contatto-executive/whatsapp-bot/.env"
echo "    - inserisci  ANTHROPIC_API_KEY=sk-ant-..."
echo "    - (facoltativo, per collegare senza QR da telefono) imposta"
echo "      PAIRING_PHONE_NUMBER con il numero del bot, solo cifre e prefisso"
echo "      internazionale, es. 393331234567"
echo "    salva con Ctrl+O poi Invio, esci con Ctrl+X"
echo ""
echo " 2) Primo avvio per collegare WhatsApp:"
echo "      cd ~/contatto-executive/whatsapp-bot && npm start"
echo "    scansiona il QR (o digita il codice di abbinamento) da WhatsApp."
echo "    Quando vedi '[bot] Pronto!', ferma con Ctrl+C e avvia in background:"
echo "      pm2 start src/index.js --name whatsapp-bot && pm2 save && pm2 startup"
echo "======================================================================"
