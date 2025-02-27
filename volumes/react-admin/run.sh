#!/bin/sh

export VITE_GRAPHQL_PORT="${GRAPHQL_PORT:-5678}"

#tail -f /dev/null

npm i && npm run gen && npm run dev --host