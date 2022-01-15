FROM mcr.microsoft.com/playwright:focal
WORKDIR /opt/home-scheduler
COPY . .
RUN npm install
RUN npx playwright install firefox
ENTRYPOINT [ "bash", "-c", "npm start" ]