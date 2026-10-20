# The builder app (app/server.mjs) for Fly.io. No npm install: it only uses Node's built-ins.
FROM node:24-slim
WORKDIR /srv
ENV NODE_ENV=production
# Only what the app imports. Prospect data (leads/, mockups/, clients/) never goes in the image.
COPY app/ app/
COPY mockup/ mockup/
COPY src/ src/
RUN rm -rf app/data
EXPOSE 8080
CMD ["node", "app/server.mjs"]
