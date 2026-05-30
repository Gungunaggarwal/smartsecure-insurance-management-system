# PowerShell script to gather all compiled outputs for Hugging Face Spaces deployment
$baseDir = "C:\capgemini_sprint"
$outputDir = Join-Path $baseDir "deployment-hf\build-output"

Write-Host "Creating clean output directory: $outputDir"
if (Test-Path $outputDir) {
    Remove-Item -Recurse -Force $outputDir
}
New-Item -ItemType Directory -Force -Path $outputDir

# 1. Copy configurations and scripts
Write-Host "Copying deployment configs..."
Copy-Item (Join-Path $baseDir "deployment-hf\Dockerfile") $outputDir
Copy-Item (Join-Path $baseDir "deployment-hf\nginx.conf") $outputDir
Copy-Item (Join-Path $baseDir "deployment-hf\entrypoint.sh") $outputDir
Copy-Item (Join-Path $baseDir "init-db.sql") $outputDir

# 2. Copy JAR files
Write-Host "Copying Spring Boot JAR files..."
$jarMap = @{
    "service-registry/service-registry/target" = "service-registry.jar"
    "config-server/config-server/target"       = "config-server.jar"
    "api-gateway/api-gateway/target"           = "api-gateway.jar"
    "auth-service/auth-service/target"         = "auth-service.jar"
    "policy-service/policy-service/target"     = "policy-service.jar"
    "claims-service/claims-service/target"     = "claims-service.jar"
    "admin-service/admin-service/target"       = "admin-service.jar"
}

foreach ($item in $jarMap.GetEnumerator()) {
    $srcPath = Join-Path $baseDir $item.Key
    $destFile = Join-Path $outputDir $item.Value
    
    # Find the packaged jar file (excluding .original files)
    $jars = Get-ChildItem -Path $srcPath -Filter *.jar | Where-Object { $_.Name -notmatch "original" }
    
    if ($jars.Count -eq 0) {
        Write-Error "No JAR file found in $srcPath!"
        exit 1
    }
    
    $jarFile = $jars[0].FullName
    Write-Host "Copying $jarFile -> $destFile"
    Copy-Item $jarFile $destFile
}

# 3. Copy Angular built static files
$frontendSrc = Join-Path $baseDir "frontend\dist\frontend\browser"
$frontendDest = Join-Path $outputDir "browser"

Write-Host "Copying Angular build files: $frontendSrc -> $frontendDest"
if (-not (Test-Path $frontendSrc)) {
    Write-Error "Angular build folder does not exist at $frontendSrc. Build the frontend first!"
    exit 1
}

Copy-Item -Recurse $frontendSrc $frontendDest

Write-Host "========================================================================"
Write-Host "SUCCESS: Deployment directory prepared!"
Write-Host "All assets are ready in: $outputDir"
Write-Host "========================================================================"
