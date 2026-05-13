# StudentTracker

StudentTracker is a small full-stack student management system built for a DigitalOcean DevOps lab. It includes a Spring Boot 3 REST API, a React + Vite frontend, PostgreSQL, Docker Compose orchestration, Nginx reverse proxying, GitHub Actions CI/CD, backup automation, and optional HTTPS with Let's Encrypt. The application lets users create, view, update, and delete student records without adding authentication or extra complexity. The project is intentionally beginner-friendly so it is easy to run locally, deploy manually on an Ubuntu Droplet, and explain during a lab demonstration.

## 1. Project Description

The app manages one entity called `Student` with these fields: `id`, `firstName`, `lastName`, `email`, `age`, `course`, `grade`, and `createdAt`.

Backend endpoints:

- `GET /api/health`
- `GET /api/students`
- `GET /api/students/{id}`
- `POST /api/students`
- `PUT /api/students/{id}`
- `DELETE /api/students/{id}`

Nginx routing:

- `/` goes to the frontend container on port `3000`
- `/api` goes to the backend container on port `5000`

## 2. Technologies

- Java 17
- Spring Boot 3
- Maven
- React
- Vite
- PostgreSQL
- Docker
- Docker Compose
- Nginx
- GitHub Actions
- DigitalOcean Ubuntu Droplet

## 3. Why `.env` Is Needed

The `.env` file keeps database credentials, ports, and deployment settings outside the source code. That makes the project safer because real passwords and server-specific values are not hardcoded in Java, React, Docker Compose, or GitHub Actions files. It also makes the same codebase easy to reuse for local development, staging, and production by changing only environment values. The repository includes `.env.example` so you can create your own `.env` quickly while still keeping the real `.env` ignored by Git.

## 4. Project Structure

```text
StudentTracker/
  backend/
  frontend/
  docker-compose.yml
  docker-compose.staging.yml
  docker-compose.prod.yml
  nginx.conf
  nginx.https.conf
  .env
  .env.example
  .gitignore
  backup.sh
  README.md
  .github/workflows/studenttracker-cicd-ssh.yml
  .github/scripts/deploy-remote.sh
```

## 5. How To Run Locally On Windows 11 With IntelliJ IDEA

### Open the backend in IntelliJ IDEA

1. Open IntelliJ IDEA Ultimate.
2. Choose **Open** and select the project root folder.
3. Open the Maven project from `backend/pom.xml`.
4. Make sure the Project SDK is Java 17.

### Exact PowerShell commands

```powershell
git clone https://github.com/e1dos-kubatov/digitalocean-final.git
cd .\digitalocean-final
Copy-Item .env.example .env
docker compose up -d postgres
```

Run the backend:

```powershell
cd .\backend
.\mvnw.cmd spring-boot:run
```

Run the frontend in another PowerShell window:

```powershell
cd .\digitalocean-final\frontend
npm install
npm run dev
```

Open the app:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/api/health`

Quick API test in PowerShell:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

## 6. How To Run With Docker

Create the environment file first:

```powershell
cd .\digitalocean-final
Copy-Item .env.example .env
```

Start all four containers:

```powershell
docker compose up --build -d
docker compose ps
```

Useful checks:

```powershell
Invoke-RestMethod http://localhost/api/health
docker compose logs backend
docker compose logs frontend
docker compose logs nginx
docker compose logs postgres
```

Stop the stack:

```powershell
docker compose down
```

## 7. Docker Container Layout Required By The Lab

- Frontend container on port `3000`
- Backend container on port `5000`
- PostgreSQL container on port `5432`
- Nginx container on port `80`

The HTTPS-ready staging and production compose files also expose port `443` when you switch `NGINX_CONFIG_FILE` to `nginx.https.conf`.

## 8. DigitalOcean Ubuntu Server Setup

### Exact Ubuntu commands

Connect to the droplet:

```bash
ssh root@YOUR_SERVER_IP
```

Install Docker, Git, and Certbot:

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg git certbot
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker
docker --version
docker compose version
```

Clone the repository on the server:

```bash
git clone https://github.com/e1dos-kubatov/digitalocean-final.git StudentTracker
cd /root/StudentTracker
cp .env.example .env
nano .env
```

Manual production deployment:

```bash
docker compose --env-file .env -f docker-compose.prod.yml up -d --build
docker ps
```

Manual staging deployment:

```bash
git checkout develop
docker compose --env-file .env -f docker-compose.staging.yml up -d --build
docker ps
```

## 9. Database Backup Task

The file `backup.sh` runs `pg_dump` inside the PostgreSQL container and stores the output in `/home/ubuntu/student-tracker-backups`. The backup file name includes the current date and time.

Make the script executable and run it:

```bash
cd /root/StudentTracker
chmod +x backup.sh
./backup.sh
```

Set up the daily cron job at `02:00`:

```bash
crontab -e
```

Add this exact line:

```bash
0 2 * * * /root/StudentTracker/backup.sh
```

Verify cron and backups:

```bash
crontab -l
ls -la /home/ubuntu/student-tracker-backups
```

## 10. HTTPS With Let’s Encrypt

A real domain name is required for Let's Encrypt. A plain server IP address is not enough.

### Certbot commands on Ubuntu

```bash
apt install -y certbot
docker compose -f docker-compose.prod.yml down
certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

After the certificate is created:

1. Update `.env` and set `NGINX_CONFIG_FILE=nginx.https.conf`
2. Make sure `nginx.https.conf` uses your real domain
3. Start the containers again

```bash
cd /root/StudentTracker
nano .env
docker compose --env-file .env -f docker-compose.prod.yml up -d
```

The `nginx.https.conf` file redirects HTTP port `80` to HTTPS port `443`.

## 11. Multiple Environments

- `docker-compose.yml` is for local development with `build:`
- `docker-compose.staging.yml` builds the app on the server and uses `SPRING_PROFILES_ACTIVE=staging`
- `docker-compose.prod.yml` builds the app on the server and uses `SPRING_PROFILES_ACTIVE=prod`

## 12. GitHub Secrets

Add these GitHub Secrets in the repository settings:

- `STAGING_SERVER_IP`
- `PROD_SERVER_IP`
- `SSH_PRIVATE_KEY`

Accepted fallback names:

- `HOST` can be used instead of `STAGING_SERVER_IP` or `PROD_SERVER_IP`
- `SSH_KEY` can be used instead of `SSH_PRIVATE_KEY`
- `SSH_USERNAME` or `USERNAME` can be used if the server user is not `root`
- The workflow accepts these names from either GitHub `Secrets` or GitHub `Variables`

How the workflow behaves:

- Push to `develop` runs backend tests and frontend build, SSHs into the staging server, updates `/root/StudentTracker`, and runs `docker compose -f docker-compose.staging.yml up -d --build`
- Push to `main` runs backend tests and frontend build, SSHs into the production server, updates `/root/StudentTracker`, and runs `docker compose -f docker-compose.prod.yml up -d --build`
- The remote deploy script validates the server path, required files, Docker/Compose availability, and the backend health endpoint before the job is marked successful
- If SSH deployment settings are missing, the deploy step is skipped with a warning instead of failing the entire workflow

## 13. Required Screenshots For The Lab Report

Take these screenshots after deployment:

- `docker ps` showing 4 containers
- GitHub Actions successful deploy
- `crontab -l`
- backup folder with dump files
- browser with HTTPS lock
- `.gitignore` showing `.env`
- staging deployment
- production deployment

## 14. Helpful Commands

Check running containers:

```bash
docker ps
docker compose ps
```

Watch logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f postgres
```

Rebuild local images:

```bash
docker compose up --build -d
```

Stop everything:

```bash
docker compose down
```
