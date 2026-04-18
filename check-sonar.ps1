$user = 'admin'
$pass = 'admin'
$pair = "$user`:$pass"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)
$basicAuthValue = "Basic $base64"

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:9000/api/projects/search' -Headers @{Authorization=$basicAuthValue}
    Write-Host "Projects Found: $($response.paging.total)"
    foreach ($p in $response.components) {
        Write-Host " - $($p.key) ($($p.name))"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
