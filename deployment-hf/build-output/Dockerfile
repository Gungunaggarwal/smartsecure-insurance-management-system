FROM ubuntu:22.04

# Avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies (Java 17, Postgres, Redis, RabbitMQ, Nginx, curl)
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    postgresql \
    postgresql-contrib \
    redis-server \
    rabbitmq-server \
    nginx \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Download Zipkin tracing jar
RUN curl -sSL https://zipkin.io/quickstart.sh | bash

# Copy configuration files (from the deployment folder)
COPY nginx.conf /app/nginx.conf
COPY entrypoint.sh /app/entrypoint.sh
COPY init-db.sql /app/init-db.sql

# Copy built JAR files (pre-renamed in the deployment folder)
COPY service-registry.jar /app/service-registry.jar
COPY config-server.jar /app/config-server.jar
COPY api-gateway.jar /app/api-gateway.jar
COPY auth-service.jar /app/auth-service.jar
COPY policy-service.jar /app/policy-service.jar
COPY claims-service.jar /app/claims-service.jar
COPY admin-service.jar /app/admin-service.jar

# Copy frontend static build files (pre-built Angular browser files)
COPY browser /var/www/html/browser

# Configure PostgreSQL path (Ubuntu 22.04 defaults to Postgres 14)
ENV PATH="/usr/lib/postgresql/14/bin:$PATH"

# Create a non-root user (UID 1000 is required by Hugging Face Spaces)
RUN useradd -m -u 1000 user \
    && chown -R user:user /app \
    && chown -R user:user /var/www/html \
    && chown -R user:user /var/log/nginx \
    && chown -R user:user /var/lib/nginx \
    && chmod +x /app/entrypoint.sh

# Switch to the non-root user
USER user

# Set home directory environment variable
ENV HOME=/home/user

# Expose Nginx port
EXPOSE 7860

# Run entrypoint script
CMD ["/bin/bash", "/app/entrypoint.sh"]
