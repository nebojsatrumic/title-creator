FROM node:14.17-alpine3.14

WORKDIR /home/node/title_creator

COPY package*.json ./

# https://stackoverflow.com/questions/52196518/could-not-get-uid-gid-when-building-node-docker
RUN npm config set unsafe-perm true
RUN npm ci


# Copy app
COPY app/ /home/node/title_creator/app/
COPY ./tsconfig.json /home/node/title_creator/
# Copy sequelize config and migrations
COPY /.sequelizerc /home/node/title_creator/
COPY database/ /home/node/title_creator/database/
# Copy entrypoint script to usr/local/bin
COPY docker-entry.sh /usr/local/bin/
RUN ln -s /usr/local/bin/docker-entry.sh
RUN chmod +x /usr/local/bin/docker-entry.sh

# EXPOSE 4100
ENTRYPOINT ["/usr/local/bin/docker-entry.sh"]

