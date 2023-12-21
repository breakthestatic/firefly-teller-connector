FROM node:20-alpine

ENV DAYS_TO_FETCH=10
ENV PORT=8080

EXPOSE $PORT

RUN mkdir -p /app

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY scripts/ ./scripts/
COPY connect/ ./connect/
RUN chmod 0755 scripts/cron.sh scripts/entry.sh

RUN echo "* 8,18 * * * /app/scripts/cron.sh" > /app/crontab.txt
RUN /usr/bin/crontab /app/crontab.txt

CMD ["sh","/app/scripts/entry.sh"]