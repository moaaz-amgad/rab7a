# Database Backup Script for Rabha ERP
$backupDir = Join-Path $PSScriptRoot "database\backups"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$dbFile = Join-Path $PSScriptRoot "database\database.sqlite"
$backupFile = Join-Path $backupDir "database_backup_$timestamp.sqlite"

if (Test-Path $dbFile) {
    Copy-Item -Path $dbFile -Destination $backupFile
    Write-Host "Backup created successfully: $backupFile" -ForegroundColor Green
} else {
    Write-Host "Database file not found!" -ForegroundColor Red
}
