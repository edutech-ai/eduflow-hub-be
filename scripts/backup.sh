#!/bin/bash

# EduFlow Hub Database Backup Script
# This script creates a backup of the MongoDB database

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="eduflow_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Starting MongoDB backup...${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Extract MongoDB URI components
MONGO_URI=${MONGODB_URI:-"mongodb://localhost:27017/eduflow-hub"}

# Perform backup
echo -e "Backing up to: ${GREEN}${BACKUP_PATH}${NC}"
mongodump --uri="$MONGO_URI" --out="$BACKUP_PATH"

if [ $? -eq 0 ]; then
    # Compress backup
    echo ""
    echo -e "${YELLOW}🗜️  Compressing backup...${NC}"
    tar -czf "${BACKUP_PATH}.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"

    # Remove uncompressed backup
    rm -rf "$BACKUP_PATH"

    # Get backup size
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}.tar.gz" | cut -f1)

    echo ""
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo -e "   Location: ${BACKUP_PATH}.tar.gz"
    echo -e "   Size: ${BACKUP_SIZE}"
    echo ""

    # Keep only last 7 backups
    echo -e "${YELLOW}🧹 Cleaning old backups (keeping last 7)...${NC}"
    cd "$BACKUP_DIR"
    ls -t eduflow_backup_*.tar.gz | tail -n +8 | xargs -r rm
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    echo ""

else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi
