# The builder app (app/server.mjs) for Railway (see railway.json and LAUNCH.md). No npm install: it only uses Node's built-ins.
# Railway sets PORT; the volume is mounted at /data (BLUEBONNET_DATA).
FROM node:24-slim
WORKDIR /srv
ENV NODE_ENV=production BLUEBONNET_DATA=/data
# Only what the app imports. Prospect data (leads/, mockups/, clients/) never goes in the image.
COPY app/ app/
COPY mockup/ mockup/
COPY src/ src/
RUN rm -rf app/data
CMD ["node", "app/server.mjs"]
