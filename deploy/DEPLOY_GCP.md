# PCM System - GCP Deployment Guide (From Scratch)

## Part 1: Create GCP Account & VM

### Step 1: Create GCP Account
1. Go to https://cloud.google.com
2. Click "Get started for free"
3. Sign in with Google account
4. Add billing info (you get **$300 free credits** for 90 days)
5. Create a new project: `pcm-system`

### Step 2: Create VM Instance
1. Go to **Compute Engine** → **VM Instances**
2. Click **"Enable"** (first time only, wait 1-2 mins)
3. Click **"Create Instance"**

**Configure the VM:**
```
Name:           pcm-server
Region:         asia-south1 (Mumbai) or nearest to you
Zone:           asia-south1-a
Machine type:   e2-small (2 vCPU, 2GB) - recommended
                e2-micro (2 vCPU, 1GB) - free tier eligible

Boot disk:      Click "Change"
                - OS: Ubuntu
                - Version: Ubuntu 22.04 LTS
                - Size: 30 GB
                - Type: Balanced persistent disk

Firewall:       ✅ Allow HTTP traffic
                ✅ Allow HTTPS traffic
```

4. Click **"Create"** (takes 1-2 minutes)

### Step 3: Reserve Static IP (Important!)
1. Go to **VPC Network** → **IP Addresses**
2. Click **"Reserve External Static Address"**
3. Name: `pcm-static-ip`
4. Region: Same as your VM
5. Attached to: Select your VM
6. Click **"Reserve"**

**Note down this IP address** — this is your server's permanent IP.

---

## Part 2: Connect to Your VM

### Option A: Browser SSH (Easiest)
1. Go to **Compute Engine** → **VM Instances**
2. Click **"SSH"** button next to your VM
3. A terminal opens in your browser

### Option B: Terminal SSH
```bash
# Install gcloud CLI first: https://cloud.google.com/sdk/docs/install
gcloud compute ssh pcm-server --zone=asia-south1-a
```

---

## Part 3: Server Setup (Run these commands)

### Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 3: Create Database & User
```bash
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE USER pcm_user WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE pcm_db1 OWNER pcm_user;
GRANT ALL PRIVILEGES ON DATABASE pcm_db1 TO pcm_user;
\q
```

### Step 4: Install Python & Dependencies
```bash
sudo apt install python3 python3-pip python3-venv git nginx -y
```

### Step 5: Clone Your App
```bash
cd /home
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/pcm_system.git pcm
sudo chown -R $USER:$USER /var/www/pcm
cd pcm
```

### Step 6: Setup Python Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

### Step 7: Configure Environment
```bash
# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql+psycopg://pcm_user:your_secure_password_here@localhost:5432/pcm_db1
EOF
```

### Step 8: Initialize Database
```bash
# Run schema
sudo -u postgres psql -d pcm_db1 -f schema.sql

# Grant permissions
sudo -u postgres psql -d pcm_db1 -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pcm_user;"
sudo -u postgres psql -d pcm_db1 -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pcm_user;"
```

### Step 9: Test the App
```bash
source venv/bin/activate
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
# Visit http://YOUR_IP:8000 to test
# Press Ctrl+C to stop
```

---

## Part 4: Setup Systemd Service (Auto-start)

```bash
sudo nano /etc/systemd/system/pcm.service
```

Paste this content:
```ini
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
```

Save (Ctrl+X, Y, Enter) then:
```bash
sudo chown -R www-data:www-data /var/www/pcm
sudo systemctl daemon-reload
sudo systemctl enable pcm
sudo systemctl start pcm
sudo systemctl status pcm
```

---

## Part 5: Setup Nginx (Web Server)

```bash
sudo nano /etc/nginx/sites-available/pcm
```

Paste this:
```nginx
server {
    listen 80;
    server_name YOUR_STATIC_IP;  # Replace with your IP or domain

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/pcm /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Part 6: Test Your Deployment

1. Open browser: `http://YOUR_STATIC_IP`
2. You should see the PCM login page!

---

## Part 7: Setup Domain & SSL (Optional but Recommended)

### If you have a domain:
1. Point your domain's A record to your static IP
2. Wait for DNS propagation (5-30 mins)
3. Install SSL:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## Useful Commands

```bash
# View app logs
sudo journalctl -u pcm -f

# Restart app
sudo systemctl restart pcm

# Restart nginx
sudo systemctl restart nginx

# Update app
cd /var/www/pcm
git pull
sudo systemctl restart pcm
```

---

## Troubleshooting

**App won't start?**
```bash
sudo journalctl -u pcm -n 50
```

**Database connection error?**
```bash
sudo -u postgres psql -c "\l"  # List databases
sudo -u postgres psql -c "\du" # List users
```

**Nginx error?**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

## Cost Summary

| Item | Monthly Cost |
|------|--------------|
| e2-small VM | ~$13 |
| 30GB disk | ~$3 |
| Static IP | ~$3 (when attached: free) |
| Egress (low traffic) | ~$1-2 |
| **Total** | **~$15-20/month** |

With free tier (e2-micro): **~$6-10/month**
