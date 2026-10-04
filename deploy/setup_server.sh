#!/bin/bash
# PCM System - Server Setup Script
# Run this on a fresh Ubuntu 22.04 VM

set -e

echo "=========================================="
echo "PCM System - Server Setup"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

# Get database password
read -sp "Enter PostgreSQL password for pcm_user: " DB_PASSWORD
echo ""

print_step "Updating system..."
sudo apt update && sudo apt upgrade -y

print_step "Installing PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

print_step "Creating database and user..."
sudo -u postgres psql -c "CREATE USER pcm_user WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE pcm_db1 OWNER pcm_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pcm_db1 TO pcm_user;"

print_step "Installing Python, Nginx, Git..."
sudo apt install python3 python3-pip python3-venv git nginx -y

print_step "Setting up application directory..."
sudo mkdir -p /var/www/pcm
sudo chown -R $USER:$USER /var/www/pcm

print_step "Cloning repository..."
echo "Enter your GitHub repo URL (e.g., https://github.com/user/pcm_system.git):"
read REPO_URL
git clone $REPO_URL /var/www/pcm

print_step "Setting up Python virtual environment..."
cd /var/www/pcm
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

print_step "Creating .env file..."
cat > /var/www/pcm/.env << EOF
DATABASE_URL=postgresql+psycopg://pcm_user:$DB_PASSWORD@localhost:5432/pcm_db1
EOF

print_step "Initializing database schema..."
sudo -u postgres psql -d pcm_db1 -f /var/www/pcm/schema.sql
sudo -u postgres psql -d pcm_db1 -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pcm_user;"
sudo -u postgres psql -d pcm_db1 -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pcm_user;"

print_step "Creating systemd service..."
sudo tee /etc/systemd/system/pcm.service > /dev/null << 'EOF'
[Unit]
Description=PCM System FastAPI App
After=network.target postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/pcm
Environment="PATH=/var/www/pcm/venv/bin"
EnvironmentFile=/var/www/pcm/.env
ExecStart=/var/www/pcm/venv/bin/gunicorn backend.main:app -w 2 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

print_step "Setting permissions..."
sudo chown -R www-data:www-data /var/www/pcm

print_step "Starting PCM service..."
sudo systemctl daemon-reload
sudo systemctl enable pcm
sudo systemctl start pcm

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

print_step "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/pcm > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/pcm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=========================================="
echo -e "${GREEN}SETUP COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "Your PCM System is now running at:"
echo "  http://$SERVER_IP"
echo ""
echo "Useful commands:"
echo "  View logs:    sudo journalctl -u pcm -f"
echo "  Restart app:  sudo systemctl restart pcm"
echo "  App status:   sudo systemctl status pcm"
echo ""
