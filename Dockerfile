FROM node:12.13.0-alpine
RUN mkdir -p /opt/micro-challenges
WORKDIR /opt/micro-challenges
RUN adduser -S micro-challenges
COPY . .
RUN npm install
EXPOSE 3001
CMD [ "npm", "run", "start:dev" ]