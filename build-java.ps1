# PowerShell script to build all Java microservices sequentially
$baseDir = "C:\capgemini_sprint"
$services = @(
    "service-registry/service-registry",
    "config-server/config-server",
    "api-gateway/api-gateway",
    "auth-service/auth-service",
    "policy-service/policy-service",
    "claims-service/claims-service",
    "admin-service/admin-service"
)

foreach ($service in $services) {
    Write-Host "========================================================================"
    Write-Host "Building service: $service"
    Write-Host "========================================================================"
    
    $targetPath = Join-Path $baseDir $service
    Push-Location $targetPath
    
    # Run the maven wrapper to package the jar without running tests
    & .\mvnw.cmd clean package -DskipTests
    
    $exitCode = $LASTEXITCODE
    Pop-Location
    
    if ($exitCode -ne 0) {
        Write-Error "Build failed for service: $service with exit code $exitCode"
        exit $exitCode
    }
}

Write-Host "========================================================================"
Write-Host "SUCCESS: All Java microservices have been built successfully!"
Write-Host "========================================================================"
