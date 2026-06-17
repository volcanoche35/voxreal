#!/usr/bin/env bash
# =============================================================================
# VoxReal – Deploy Script
# =============================================================================
# This script deploys the VoxReal application on the Hetzner VPS.
#
# Usage:
#   ./deploy.sh [--env-file /path/to/.env] [--skip-git]
#
# What it does:
#   1. Pulls the latest code from the GitHub repository
#   2. Copies app source & config to the survey-app deployment directory
#   3. Builds Docker images
#   4. Deploys (or recreates) containers with docker compose
#   5. Runs a health check and reports status
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
REPO_DIR="/home/volkan/voxreal"               # Git repository root
DEPLOY_DIR="/home/volkan/survey-app"          # Docker compose working directory
COMPOSE_FILE="docker-compose.yml"
NGINX_DIR="$DEPLOY_DIR/nginx"
HEALTHCHECK_MAX_RETRIES=12                     # ~60 seconds  (12 × 5 s)
HEALTHCHECK_INTERVAL=5                         # seconds between checks

# Colour helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Colour

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ── Argument parsing ─────────────────────────────────────────────────────────
SKIP_GIT=false
ENV_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-git)    SKIP_GIT=true;     shift ;;
    --env-file)    ENV_FILE="$2";     shift 2 ;;
    --help|-h)     echo "Usage: $0 [--skip-git] [--env-file /path/to/.env]" && exit 0 ;;
    *)             err "Unknown argument: $1"; exit 1 ;;
  esac
done

# ── Pre-flight checks ────────────────────────────────────────────────────────
info "Pre-flight checks …"

if [[ ! -d "$REPO_DIR" ]]; then
  err "Repository directory '$REPO_DIR' does not exist."
  exit 1
fi

if [[ ! -f "$DEPLOY_DIR/$COMPOSE_FILE" ]]; then
  err "Docker compose file not found at '$DEPLOY_DIR/$COMPOSE_FILE'."
  exit 1
fi

if ! command -v docker &>/dev/null; then
  err "Docker is not installed."
  exit 1
fi

if ! docker compose version &>/dev/null; then
  err "Docker Compose plugin is not available."
  exit 1
fi

ok "All pre-flight checks passed."

# ── Step 1: Git Pull ─────────────────────────────────────────────────────────
if [[ "$SKIP_GIT" == false ]]; then
  info "Pulling latest code from GitHub …"
  cd "$REPO_DIR"

  # Stash any local changes so the pull is clean
  if ! git diff --quiet; then
    warn "Local changes detected – stashing them before pull."
    git stash push -m "auto-stash by deploy.sh $(date +%Y-%m-%d_%H:%M:%S)"
  fi

  git pull origin main 2>&1 || git pull origin master 2>&1 || {
    err "Git pull failed. Check your network or repository access."
    exit 1
  }
  ok "Git repository up to date."
else
  info "Skipping git pull (--skip-git)."
fi

# ── Step 2: Sync application source to deploy directory ──────────────────────
# If the repo contains app source (e.g. Dockerfile, package.json), copy it.
# This allows the repo structure to differ from the docker-compose directory.
info "Syncing application source …"

if [[ -f "$REPO_DIR/Dockerfile" ]]; then
  # Full repo → deploy dir sync (respects .gitignore-style excludes)
  rsync -a --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='deploy.sh' \
    "$REPO_DIR/" "$DEPLOY_DIR/"
  ok "Source synced from $REPO_DIR to $DEPLOY_DIR."
else
  # Repo is still a scaffold (no Dockerfile yet); deploy dir already has
  # the compose / nginx config.  Nothing extra to copy.
  info "No application source in repo yet – using existing deploy directory."
fi

# ── Step 3: .env file ────────────────────────────────────────────────────────
if [[ -n "$ENV_FILE" ]]; then
  if [[ -f "$ENV_FILE" ]]; then
    cp "$ENV_FILE" "$DEPLOY_DIR/.env"
    info "Environment file copied from $ENV_FILE."
  else
    err "Specified env file '$ENV_FILE' not found."
    exit 1
  fi
elif [[ ! -f "$DEPLOY_DIR/.env" ]]; then
  if [[ -f "$DEPLOY_DIR/.env.example" ]]; then
    warn "No .env found – copying from .env.example.  EDIT IT before deploying!"
    cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
  else
    err "No .env file and no .env.example available."
    exit 1
  fi
else
  ok ".env file present."
fi

# ── Step 4: Docker Compose Build ─────────────────────────────────────────────
info "Building Docker images …"
cd "$DEPLOY_DIR"
docker compose build --pull 2>&1
ok "Docker images built successfully."

# ── Step 5: Deploy / Recreate ────────────────────────────────────────────────
info "Deploying containers (force-recreate) …"
docker compose up -d --force-recreate --remove-orphans 2>&1
ok "Containers are up."

# ── Step 6: Health Check ─────────────────────────────────────────────────────
info "Running health check …"

APP_SERVICE=$(docker compose config --services 2>/dev/null | head -1)
if [[ -z "$APP_SERVICE" ]]; then
  APP_SERVICE="app"
fi

RETRIES=0
while [[ $RETRIES -lt $HEALTHCHECK_MAX_RETRIES ]]; do
  STATUS=$(docker inspect --format='{{.State.Status}}' "${APP_SERVICE}" 2>/dev/null || true)
  HEALTH=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}running{{end}}' "${APP_SERVICE}" 2>/dev/null || echo "unknown")

  if [[ "$STATUS" == "running" ]]; then
    if [[ "$HEALTH" == "healthy" || "$HEALTH" == "running" ]]; then
      ok "Service '$APP_SERVICE' is $HEALTH."
      break
    fi
  fi

  RETRIES=$((RETRIES + 1))
  if [[ $RETRIES -lt $HEALTHCHECK_MAX_RETRIES ]]; then
    sleep "$HEALTHCHECK_INTERVAL"
  fi
done

if [[ $RETRIES -ge $HEALTHCHECK_MAX_RETRIES ]]; then
  warn "Health check timed out. Checking container logs …"
  docker compose logs --tail=30 "$APP_SERVICE" 2>/dev/null || true
  err "Deploy may have issues – please investigate manually."
  exit 1
fi

# ── Step 7: Summary ──────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   🚀  VoxReal  Deployed                     ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Containers:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | \
  while IFS= read -r line; do printf "║  %-60s ║\n" "$line"; done
echo "║                                                             ║"
echo "║  Logs:       docker compose logs -f                         ║"
echo "║  Restart:    docker compose restart                         ║"
echo "║  Stop:       docker compose down                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
