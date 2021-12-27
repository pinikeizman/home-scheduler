FROM node:16
WORKDIR /opt/home-scheduler
RUN git clone https://github.com/pinikeizman/home-scheduler.git .
RUN ["npm", "install", "--verbose"]
ENTRYPOINT [ "bash", "-c","npm start" ]