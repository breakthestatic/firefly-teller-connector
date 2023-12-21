#!/bin/sh
cd /app
npm run transactions:sync -- --days $DAYS_TO_FETCH
