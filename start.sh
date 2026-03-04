#!/bin/bash

# DCF Finanzanalyse - Automatisches Start-Script
# Prüft Ports, verwaltet venv und startet die Anwendung

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ports
BACKEND_PORT=8000
FRONTEND_PORT=3000

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  DCF Finanzanalyse - Startup Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Funktion: Port prüfen und freigeben
check_and_free_port() {
    local port=$1
    local service=$2
    
    echo -e "${YELLOW}Prüfe Port $port für $service...${NC}"
    
    # Prüfe ob Port belegt ist
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}Port $port ist belegt!${NC}"
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
        echo -e "${YELLOW}Beende Prozess $pid auf Port $port...${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✓ Port $port freigegeben${NC}"
    else
        echo -e "${GREEN}✓ Port $port ist frei${NC}"
    fi
}

# Funktion: Python venv prüfen und erstellen
setup_backend_venv() {
    echo -e "\n${YELLOW}Prüfe Backend Python venv...${NC}"
    
    cd backend
    
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Erstelle Python venv...${NC}"
        python3 -m venv venv
        echo -e "${GREEN}✓ venv erstellt${NC}"
    else
        echo -e "${GREEN}✓ venv existiert bereits${NC}"
    fi
    
    # Aktiviere venv
    source venv/bin/activate
    
    # Prüfe ob Dependencies installiert sind
    if ! python -c "import fastapi" 2>/dev/null; then
        echo -e "${YELLOW}Installiere Python Dependencies...${NC}"
        pip install -q -r requirements.txt
        echo -e "${GREEN}✓ Dependencies installiert${NC}"
    else
        echo -e "${GREEN}✓ Dependencies bereits installiert${NC}"
    fi
    
    cd ..
}

# Funktion: Node modules prüfen
setup_frontend_deps() {
    echo -e "\n${YELLOW}Prüfe Frontend Dependencies...${NC}"
    
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installiere npm Dependencies...${NC}"
        npm install
        echo -e "${GREEN}✓ npm Dependencies installiert${NC}"
    else
        echo -e "${GREEN}✓ node_modules existiert bereits${NC}"
    fi
    
    cd ..
}

# Ports prüfen und freigeben
check_and_free_port $BACKEND_PORT "Backend"
check_and_free_port $FRONTEND_PORT "Frontend"

# Backend venv setup
setup_backend_venv

# Frontend dependencies setup
setup_frontend_deps

# Erstelle data Verzeichnis falls nicht vorhanden
mkdir -p backend/data

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Starte Anwendung...${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Starte Backend im Hintergrund
echo -e "${YELLOW}Starte Backend Server...${NC}"
cd backend
source venv/bin/activate
python main.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Warte kurz bis Backend gestartet ist
sleep 3

# Prüfe ob Backend läuft
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend Server gestartet (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}✗ Backend konnte nicht gestartet werden${NC}"
    echo -e "${RED}Siehe backend.log für Details${NC}"
    exit 1
fi

# Starte Frontend im Hintergrund
echo -e "${YELLOW}Starte Frontend Server...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Warte kurz bis Frontend gestartet ist
sleep 5

# Prüfe ob Frontend läuft
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend Server gestartet (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}✗ Frontend konnte nicht gestartet werden${NC}"
    echo -e "${RED}Siehe frontend.log für Details${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Speichere PIDs für späteres Beenden
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Anwendung erfolgreich gestartet!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}📊 Anwendungs-Links:${NC}"
echo -e "${GREEN}   Frontend:  http://localhost:$FRONTEND_PORT${NC}"
echo -e "${GREEN}   Backend:   http://localhost:$BACKEND_PORT${NC}"
echo -e "${GREEN}   API Docs:  http://localhost:$BACKEND_PORT/docs${NC}\n"

echo -e "${BLUE}📝 Prozess-IDs:${NC}"
echo -e "   Backend PID:  $BACKEND_PID"
echo -e "   Frontend PID: $FRONTEND_PID\n"

echo -e "${BLUE}📋 Logs:${NC}"
echo -e "   Backend:  tail -f backend.log"
echo -e "   Frontend: tail -f frontend.log\n"

echo -e "${YELLOW}⚠️  Zum Beenden: ./stop.sh${NC}\n"

# Warte auf Benutzer-Eingabe
echo -e "${BLUE}Drücken Sie Ctrl+C um die Server zu beenden...${NC}"

# Trap für sauberes Beenden
cleanup() {
    echo -e "\n${YELLOW}Beende Server...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    rm -f .backend.pid .frontend.pid
    echo -e "${GREEN}✓ Server beendet${NC}"
    exit 0
}

trap cleanup INT TERM

# Halte Script am Laufen
wait
