#!/bin/sh

echo "starting backend"
uv run backend >backend.log 2>&1 &
backend_pid=$!

echo "starting frontend"
(
  cd ../app || exit 1
  npm run dev
) >frontend.log 2>&1 &
frontend_pid=$!

echo "backend PID: $backend_pid"
echo "frontend PID: $frontend_pid"

wait "$backend_pid" "$frontend_pid"