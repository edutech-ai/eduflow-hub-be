#!/bin/bash

# EduFlow Hub Database Restore Script
# This script restores a MongoDB backup

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="./backups"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📥 MongoDB Restore Utility${NC}"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Backup directory not found!${NC}"
    echo -e "   Please create a backup first using: npm run db:backup"
    exit 1
fi

# List available backups
echo -e "${BLUE}Available backups:${NC}"
echo ""
backups=($(ls -t "$BACKUP_DIR"/eduflow_backup_*.tar.gz 2>/dev/null))

if [ ${#backups[@]} -eq 0 ]; then
    echo -e "${RED}❌ No backups found!${NC}"
    echo -e "   Please create a backup first using: npm run db:backup"
    exit 1
fi

# Display backups with numbers
for i in "${!backups[@]}"; do
    backup_name=$(basename "${backups[$i]}")
    backup_size=$(du -h "${backups[$i]}" | cut -f1)
    backup_date=$(echo "$backup_name" | grep -oP '\d{8}_\d{6}' | sed 's/_/ /')
    echo -e "  ${GREEN}[$((i+1))]${NC} $backup_date (${backup_size})"
done

echo ""
echo -e "${YELLOW}⚠️  WARNING: This will replace your current database!${NC}"
echo ""
read -p "Enter backup number to restore (or 'q' to quit): " choice

# Check if user wants to quit
if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
    echo -e "${BLUE}Restore cancelled.${NC}"
    exit 0
fi

# Validate choice
if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt "${#backups[@]}" ]; then
    echo -e "${RED}❌ Invalid selection!${NC}"
    exit 1
fi

# Get selected backup
selected_backup="${backups[$((choice-1))]}"
backup_name=$(basename "$selected_backup" .tar.gz)

echo ""
echo -e "${YELLOW}📦 Extracting backup...${NC}"

# Extract backup
tar -xzf "$selected_backup" -C "$BACKUP_DIR"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to extract backup!${NC}"
    exit 1
fi

# Restore database
echo -e "${YELLOW}🔄 Restoring database...${NC}"

MONGO_URI=${MONGODB_URI:-"mongodb://localhost:27017/eduflow-hub"}
RESTORE_PATH="${BACKUP_DIR}/${backup_name}"

mongorestore --uri="$MONGO_URI" --drop "$RESTORE_PATH"

if [ $? -eq 0 ]; then
    # Cleanup extracted backup
    rm -rf "$RESTORE_PATH"

    echo ""
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
    echo -e "   From: $(basename "$selected_backup")"
    echo ""
else
    echo -e "${RED}❌ Restore failed!${NC}"
    rm -rf "$RESTORE_PATH"
    exit 1
fi
