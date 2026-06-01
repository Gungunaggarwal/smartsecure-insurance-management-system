#!/bin/bash
set -e

echo "===================================================="
echo "Starting Smartsure Monolithic Container..."
echo "===================================================="

# 1. Setup writable directories in /tmp
mkdir -p /tmp/pgdata /tmp/redis /tmp/rabbitmq /tmp/rabbitmq/logs /tmp/rabbitmq/mnesia /tmp/logs /tmp/nginx
chmod 700 /tmp/pgdata

# 2. Start PostgreSQL
if [ ! -d "/tmp/pgdata/base" ]; then
    echo "Initializing PostgreSQL Database..."
    initdb -D /tmp/pgdata
fi

echo "Starting PostgreSQL..."
pg_ctl -D /tmp/pgdata -o "-k /tmp -p 5432" start

echo "Waiting for PostgreSQL to start..."
until pg_isready -h localhost -p 5432; do
  sleep 1
done

echo "Setting up schemas from init-db.sql..."
psql -h localhost -p 5432 -d postgres -f /app/init-db.sql || echo "Database schemas already exist."

# 3. Start Redis
echo "Starting Redis Cache..."
redis-server --port 6379 --dir /tmp --daemonize yes

# 4. Start RabbitMQ
echo "Configuring RabbitMQ..."
export RABBITMQ_BASE=/tmp/rabbitmq
export RABBITMQ_LOGS=/tmp/rabbitmq/logs/rabbit.log
export RABBITMQ_PID_FILE=/tmp/rabbitmq/rabbitmq.pid
export RABBITMQ_MNESIA_BASE=/tmp/rabbitmq/mnesia
export RABBITMQ_LOG_BASE=/tmp/rabbitmq/logs
export HOME=/tmp/rabbitmq

echo "Starting RabbitMQ Server..."
rabbitmq-server -detached || echo "RabbitMQ already running or starting."

# 5. Start Zipkin (for Distributed Tracing)
echo "Starting Zipkin Tracing..."
java -jar /app/zipkin.jar > /tmp/logs/zipkin.log 2>&1 &

# 6. Start Spring Boot Microservices
echo "Starting Java Microservices..."

export EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://localhost:8761/eureka/
export SPRING_DATA_REDIS_HOST=localhost
export SPRING_RABBITMQ_HOST=localhost
export MANAGEMENT_ZIPKIN_TRACING_ENDPOINT=http://localhost:9411/api/v2/spans

# Start Eureka Service Registry
echo "Launching Service Registry..."
java -jar /app/service-registry.jar > /tmp/logs/service-registry.log 2>&1 &
sleep 12

# Start Config Server
echo "Launching Config Server..."
java -jar /app/config-server.jar > /tmp/logs/config-server.log 2>&1 &
sleep 8

# Start API Gateway
echo "Launching API Gateway..."
java -jar /app/api-gateway.jar > /tmp/logs/api-gateway.log 2>&1 &
sleep 5

# Start Business Services
echo "Launching Auth Service..."
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/auth_db
export SPRING_DATASOURCE_USERNAME=user
export SPRING_DATASOURCE_PASSWORD=""
java -jar /app/auth-service.jar > /tmp/logs/auth-service.log 2>&1 &

echo "Launching Policy Service..."
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/policy_db
export SPRING_DATASOURCE_USERNAME=user
export SPRING_DATASOURCE_PASSWORD=""
export RAZORPAY_KEY_ID="${RAZORPAY_KEY_ID:-rzp_test_SkQwUPAGLYRSdy}"
export RAZORPAY_KEY_SECRET="${RAZORPAY_KEY_SECRET:-qpKbWJetTzKztvl3OwSzrDi}"
java -jar /app/policy-service.jar > /tmp/logs/policy-service.log 2>&1 &

echo "Launching Claims Service..."
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/claims_db
export SPRING_DATASOURCE_USERNAME=user
export SPRING_DATASOURCE_PASSWORD=""
java -jar /app/claims-service.jar > /tmp/logs/claims-service.log 2>&1 &

echo "Launching Admin Service..."
java -jar /app/admin-service.jar > /tmp/logs/admin-service.log 2>&1 &

echo "All Java microservices launched!"
echo "Starting Nginx in foreground to serve frontend..."
nginx -c /app/nginx.conf -g "daemon off;"
