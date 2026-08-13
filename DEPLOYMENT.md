# AI Content Factory — Single-Command VPS Deployment Guide

This guide covers deploying AI Content Factory to any Ubuntu / Debian VPS (Hetzner, DigitalOcean, AWS EC2, Linode) using Docker Compose and Let's Encrypt SSL.

---

## Hardware Requirements

- **CPU**: 4 vCPUs minimum (8 vCPUs recommended for concurrent FFmpeg video renders)
- **RAM**: 8 GB RAM minimum (16 GB recommended)
- **Disk**: 100 GB SSD/NVMe (for storing MinIO video/image assets and rendering cache)
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS

---

## 1. Initial VPS Server Preparation

SSH into your VPS as root:

```bash
ssh root@your-vps-ip
```

Update system packages and install Docker + Docker Compose plugin:

```bash
apt-get update && apt-get upgrade -y
apt-get install -y curl git ufw ca-certificates gnupg

# Install Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Configure firewall (UFW):

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 2. Deploying the Platform

### Clone repository to `/opt/ai-content-factory`:

```bash
cd /opt
git clone <your-repo-url> ai-content-factory
cd ai-content-factory
```

### Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Ensure you change the following security tokens before launching:

```env
NODE_ENV=production
APP_URL=https://yourdomain.com

JWT_SECRET=<generate-64-random-chars>
REFRESH_TOKEN_SECRET=<generate-64-random-chars>
ENCRYPTION_SECRET=<generate-32-hex-chars-for-aes256>

SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=<strong-unique-password>

POSTGRES_PASSWORD=<strong-db-password>
MINIO_SECRET_KEY=<strong-minio-password>
```

---

## 3. One-Command Production Launch

Launch the entire monorepo stack:

```bash
docker compose up --build -d
```

Verify all containers are healthy:

```bash
docker compose ps
```

Expected running containers:
- `acf_postgres`
- `acf_redis`
- `acf_minio`
- `acf_minio_init`
- `acf_api`
- `acf_web`
- `acf_worker_research`
- `acf_worker_script`
- `acf_worker_voice`
- `acf_worker_image`
- `acf_worker_video`
- `acf_worker_thumbnail`
- `acf_worker_upload`
- `acf_worker_analytics`
- `acf_nginx`

---

## 4. Let's Encrypt SSL Setup (Certbot)

To issue a free Let's Encrypt SSL certificate for your domain:

```bash
apt-get install -y certbot python3-certbot-nginx

# Obtain SSL Certificate
certbot certonly --webroot -w /var/www/certbot -d yourdomain.com --email admin@yourdomain.com --agree-tos --non-interactive
```

Update `infra/nginx/conf.d/default.conf` to enable SSL listening on port 443 pointing to `/etc/letsencrypt/live/yourdomain.com/fullchain.pem` and restart Nginx:

```bash
docker compose restart nginx
```

---

## 5. Maintenance & Database Backups

### View Live System Logs

```bash
docker compose logs -f api
docker compose logs -f worker-video
```

### Database Automated Daily Backup

Create a cron job for PostgreSQL backups:

```bash
crontab -e
```

Add daily 2 AM backup task:

```cron
0 2 * * * docker exec acf_postgres pg_dump -U acf_user acf_db | gzip > /opt/backups/acf_db_$(date +\%Y\%m\%d).sql.gz
```

---

## Troubleshooting

- **FFmpeg Out of Memory during Video Render**: Increase VPS RAM or swap space:
  ```bash
  fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  ```
- **API Key Decryption Error**: Check that `ENCRYPTION_SECRET` in `.env` has not been changed after storing keys.
