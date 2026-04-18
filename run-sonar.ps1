# run-sonar.ps1
# 1. Start SonarQube
# 2. Wait for it to be ready
# 3. Analyze all services

param(
    [string]$SonarToken = "",
    [string]$SonarHostUrl = "http://localhost:9000"
)

$services = @(
    @{ name = "service-registry";  path = "service-registry/service-registry" },
    @{ name = "config-server";     path = "config-server/config-server" },
    @{ name = "api-gateway";       path = "api-gateway/api-gateway" },
    @{ name = "auth-service";      path = "auth-service/auth-service" },
    @{ name = "policy-service";    path = "policy-service/policy-service" },
    @{ name = "claims-service";    path = "claims-service/claims-service" },
    @{ name = "admin-service";     path = "admin-service/admin-service" }
)

Write-Host "Starting SonarQube..." -ForegroundColor Cyan
docker compose up -d sonarqube-db sonarqube

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to start SonarQube" -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for SonarQube at $SonarHostUrl..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0
$ready = $false

while (-not $ready -and $retryCount -lt $maxRetries) {
    Start-Sleep -Seconds 10
    $retryCount++
    try {
        $response = Invoke-RestMethod -Uri "$SonarHostUrl/api/system/status" -Method Get -ErrorAction Stop
        if ($response.status -eq "UP") {
            $ready = $true
            Write-Host "  SonarQube is UP!" -ForegroundColor Green
        } else {
            Write-Host "  SonarQube status: $($response.status) - waiting... ($retryCount/$maxRetries)" -ForegroundColor DarkYellow
        }
    } catch {
        Write-Host "  SonarQube not ready yet - waiting... ($retryCount/$maxRetries)" -ForegroundColor DarkYellow
    }
}

if (-not $ready) {
    Write-Host "Error: SonarQube did not start." -ForegroundColor Red
    exit 1
}

if (-not $SonarToken) {
    Write-Host "No SonarToken provided. Run with: .\run-sonar.ps1 -SonarToken your-token" -ForegroundColor Yellow
    exit 0
}

Write-Host "Analyzing all services..." -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "  Analyzing: $($service.name)" -ForegroundColor Green
    Push-Location $service.path
    if (Test-Path "mvnw.cmd") {
        .\mvnw.cmd -B clean verify sonar:sonar "-Dsonar.projectKey=$($service.name)" "-Dsonar.host.url=$SonarHostUrl" "-Dsonar.token=$SonarToken" "-Dmaven.test.failure.ignore=true" -e
    } else {
        mvn -B clean verify sonar:sonar "-Dsonar.projectKey=$($service.name)" "-Dsonar.host.url=$SonarHostUrl" "-Dsonar.token=$SonarToken" "-Dmaven.test.failure.ignore=true" -e
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Error: Analysis failed for $($service.name). Please check the Maven logs above." -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

Write-Host "Analysis complete for all services!" -ForegroundColor Cyan
Write-Host "Open $SonarHostUrl to view results." -ForegroundColor Cyan
