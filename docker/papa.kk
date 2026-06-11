version: "3.9"

services:
  # ============================
  # POSTGRESQL
  # ============================
  postgres:
    image: postgres:15
    container_name: url-shortener-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: url_shortener
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # ============================
  # MONGODB
  # ============================
  mongodb:
    image: mongo:7
    container_name: url-shortener-mongo
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  # ============================
  # REDIS
  # ============================
  redis:
    image: redis:7
    container_name: url-shortener-redis
    restart: always
    ports:
      - "6379:6379"

  # ============================
  # NODE BACKEND
  # ============================
  backend:
    build: .
    container_name: url-shortener-backend
    restart: always
    depends_on:
      - postgres
      - mongodb
      - redis
    ports:
      - "3000:3000"
    environment:
      PORT: 3000

      # PostgreSQL
      DATABASE_URL: postgresql://postgres:password@postgres:5432/url_shortener

      # MongoDB
      MONGO_MAIN_URL: mongodb://mongodb:27017/main_db
      MONGO_ANALYTICS_URL: mongodb://mongodb:27017/analytics_db
      MONGO_LOGS_URL: mongodb://mongodb:27017/logs_db

      # Redis
      REDIS_URL: redis://redis:6379

      # JWT
      ACCESS_SECRET: your_access_secret
      REFRESH_SECRET: your_refresh_secret

    volumes:
      - .:/app
    command: npm run dev

volumes:
  postgres_data:
  mongo_data: