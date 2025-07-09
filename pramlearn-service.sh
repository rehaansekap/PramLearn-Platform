#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display header
show_header() {
    clear
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   PramLearn Service Manager    ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Function to show status
show_status() {
    echo -e "${YELLOW}=== App Services Status ===${NC}"
    az webapp list --resource-group "pramlearn-rg" --query "[].{name:name, state:state}" --output table
    echo ""
    
    echo -e "${YELLOW}=== Database Status ===${NC}"
    az postgres flexible-server show --resource-group "pramlearn-rg" --name "pramlearn-db" --query "{name:name, state:state}" --output table
    echo ""
    
    echo -e "${YELLOW}=== Website URLs ===${NC}"
    echo -e "Frontend: ${GREEN}https://pramlearn.tech${NC}"
    echo -e "Backend:  ${GREEN}https://api.pramlearn.tech${NC}"
    echo -e "Admin:    ${GREEN}https://api.pramlearn.tech/admin/${NC}"
    echo ""
}

# Function to start services
start_services() {
    echo -e "${GREEN}🚀 Starting PramLearn services...${NC}"
    echo ""
    
    echo -e "${YELLOW}Starting database server...${NC}"
    az postgres flexible-server start --resource-group "pramlearn-rg" --name "pramlearn-db"
    
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    sleep 30
    
    echo -e "${YELLOW}Starting backend app service...${NC}"
    az webapp start --resource-group "pramlearn-rg" --name "pramlearn-backend"
    
    echo -e "${YELLOW}Starting frontend app service...${NC}"
    az webapp start --resource-group "pramlearn-rg" --name "pramlearn-frontend"
    
    echo ""
    echo -e "${GREEN}✅ All PramLearn services started!${NC}"
    echo ""
    
    # Show status after start
    show_status
}

# Function to stop services
stop_services() {
    echo -e "${RED}🛑 Stopping PramLearn services...${NC}"
    echo ""
    
    echo -e "${YELLOW}Stopping frontend app service...${NC}"
    az webapp stop --resource-group "pramlearn-rg" --name "pramlearn-frontend"
    
    echo -e "${YELLOW}Stopping backend app service...${NC}"
    az webapp stop --resource-group "pramlearn-rg" --name "pramlearn-backend"
    
    echo -e "${YELLOW}Stopping database server...${NC}"
    az postgres flexible-server stop --resource-group "pramlearn-rg" --name "pramlearn-db"
    
    echo ""
    echo -e "${YELLOW}⚠️  Note: Database will auto-start after 7 days${NC}"
    echo -e "${RED}✅ All PramLearn services stopped!${NC}"
    echo ""
    
    # Show status after stop
    show_status
}

# Function to show menu
show_menu() {
    echo -e "${BLUE}Choose an option:${NC}"
    echo -e "  ${GREEN}1${NC}) Start all services"
    echo -e "  ${RED}2${NC}) Stop all services"
    echo -e "  ${YELLOW}3${NC}) Show services status"
    echo -e "  ${RED}q${NC}) Quit"
    echo ""
    echo -n "Enter your choice: "
}

# Function to wait for user input
wait_for_input() {
    echo ""
    echo -e "${BLUE}Press Enter to continue...${NC}"
    read
}

# Main loop
while true; do
    show_header
    show_menu
    
    read -r choice
    
    case $choice in
        1)
            show_header
            start_services
            wait_for_input
            ;;
        2)
            show_header
            stop_services
            wait_for_input
            ;;
        3)
            show_header
            echo -e "${BLUE}📊 Current Services Status:${NC}"
            echo ""
            show_status
            wait_for_input
            ;;
        q|Q)
            show_header
            echo -e "${GREEN}👋 Thank you for using PramLearn Service Manager!${NC}"
            echo -e "${BLUE}Goodbye! 🚀${NC}"
            echo ""
            exit 0
            ;;
        *)
            show_header
            echo -e "${RED}❌ Invalid option. Please choose 1, 2, 3, or q.${NC}"
            echo ""
            wait_for_input
            ;;
    esac
done