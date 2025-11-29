#!/bin/bash
# Database Monitor Script for Environment Monitor
# This script displays the SQLite database contents in real-time

DB_PATH="data/environments.db"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found at $DB_PATH"
    echo "Make sure the backend server has been started at least once."
    exit 1
fi

# Check if sqlite3 is installed
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ sqlite3 is not installed"
    echo "Install it with: sudo apt-get install sqlite3"
    exit 1
fi

echo "🔍 Environment Monitor - Database Watcher"
echo "========================================"
echo "Database: $DB_PATH"
echo "Press Ctrl+C to stop"
echo ""

# Watch the database with 2-second refresh
watch -n 2 "sqlite3 $DB_PATH '.mode column' '.headers on' 'SELECT id, name, url, status, last_updated FROM environments ORDER BY last_updated DESC'"
