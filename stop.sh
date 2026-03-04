#!/bin/bash

# DCF Finanzanalyse - Stop Script
# Beendet alle laufenden Server

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  DCF Finanzanalyse - Stop Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Beende Backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Beende Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Backend beendet${NC}"
    else
        echo -e "${YELLOW}Backend läuft nicht${NC}"
    fi
    rm -f .backend.pid
fi

# Beende Frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Beende Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Frontend beendet${NC}"
    else
        echo -e "${YELLOW}Frontend läuft nicht${NC}"
    fi
    rm -f .frontend.pid
fi

# Zusätzlich: Beende alle Prozesse auf den Ports (falls PIDs nicht funktionieren)
echo -e "\n${YELLOW}Prüfe Ports 8000 und 3000...${NC}"

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -Pi :8000 -sTCP:LISTEN -t)
    kill -9 $PID 2>/dev/null || true
    echo -e "${GREEN}✓ Port 8000 freigegeben${NC}"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    kill -9 $PID 2>/dev/null || true
    echo -e "${GREEN}✓ Port 3000 freigegeben${NC}"
fi

echo -e "\n${GREEN}✓ Alle Server beendet${NC}\n"
