#!/bin/sh

# start account connection server
npm run connect &

# start cron
/usr/sbin/crond -f -l 8

