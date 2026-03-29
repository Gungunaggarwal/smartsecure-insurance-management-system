# run-pipeline.ps1
# This script builds and dockerizes all services locally on Windows.

$services = @(
    "service-registry/service-registry",
    "config-server/config-server",
    "api-gateway/api-gateway",
    "auth-service (1)/auth-service",
    "policy-service/policy-service",
    "claims-service/claims-service",
    "admin-service/admin-service"
)

$docker_names = @(
    "service-registry",
    "config-server",
    "api-gateway",
    "auth-service",
    "policy-service",
    "claims-service",
    "admin-service"
)

Write-Host "Starting Local CI/CD Pipeline Build..." -ForegroundColor Cyan

for ($i = 0; $i -lt $services.Count; $i++) {
    $service_path = $services[$i]
    $docker_name = $docker_names[$i]
    
    Write-Host "`nProcessing: $service_path" -ForegroundColor Green
    
    # 1. Build and Package (skip tests for speed, remove -DskipTests to run tests)
    Write-Host "  Step 1: Building with Maven..." -ForegroundColor Magenta
    Push-Location $service_path
    if (Test-Path "mvnw.cmd") {
        .\mvnw.cmd clean package -DskipTests
    } else {
        mvn clean package -DskipTests
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Maven build failed for $service_path" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    # 2. Build Docker image
    Write-Host "  Step 2: Building Docker image ($docker_name)..." -ForegroundColor Magenta
    docker build -t $docker_name`:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Docker build failed for $docker_name" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

Write-Host "`nSuccessfully built and dockerized all services!" -ForegroundColor Cyan
