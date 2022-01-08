FROM node:16
WORKDIR /opt/home-scheduler
COPY . .

RUN ["npm", "install", "--verbose"]
ENTRYPOINT [ "bash", "-c","npm start" ]