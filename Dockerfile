FROM node:20-alpine

ENV PORT=8080
ENV DAYS_TO_FETCH=10
ENV CRON_TIME="0 0 8,18 * * *"
ENV SYNC=true

EXPOSE $PORT

RUN mkdir -p /app

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY app/ ./

CMD ["node","/app/entry.js"]