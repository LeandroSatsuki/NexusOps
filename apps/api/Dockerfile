FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages packages
RUN npm install

FROM deps AS build
COPY apps/api apps/api
WORKDIR /app/apps/api
RUN npm run db:generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/package.json ./apps/api/package.json
WORKDIR /app/apps/api
RUN npx prisma generate
EXPOSE 3333
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
