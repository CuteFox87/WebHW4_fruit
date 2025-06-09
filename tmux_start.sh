#!/bin/bash

# Description:
# Launch backend and frontend in tmux session from any location.

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SESSION_NAME="fruit"

# Ensure tmux is installed
if ! command -v tmux &> /dev/null; then
  echo "❌ tmux is not installed. Install it with 'sudo apt install tmux'"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Install it with 'sudo apt install npm'"
  exit 1
fi

# Kill existing session if exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
  tmux kill-session -t $SESSION_NAME
fi

# Start new session
cd "$PROJECT_DIR"
tmux new-session -d -s $SESSION_NAME

tmux send-keys -t $SESSION_NAME:0 "cd backend && npm install && npm run start" C-m
tmux split-window -h -t $SESSION_NAME
tmux send-keys -t $SESSION_NAME:0.1 "cd frontend && npm install && npm run dev" C-m

# Attach to session
tmux attach-session -t $SESSION_NAME

