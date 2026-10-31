$ErrorActionPreference = "Stop"

. "$PSScriptRoot\android-env.ps1"

$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot

Set-Location "$projectRoot\android"
& .\gradlew.bat --stop 2>$null
Set-Location $projectRoot

Write-Host "Verification des appareils Android..." -ForegroundColor Cyan
$lines = & adb devices | Select-Object -Skip 1 | Where-Object { $_.Trim() -ne "" }
$online = @($lines | Where-Object { $_ -match "`tdevice$" })

if ($online.Count -eq 0) {
  Write-Host ""
  & "$PSScriptRoot\adb-devices.ps1"
  exit 1
}

Write-Host "Installation sur : $($online -join ', ')" -ForegroundColor Green
Write-Host ""

& "$PSScriptRoot\adb-reverse.ps1" -Port 8081

$reactNativeCli = Join-Path $projectRoot "node_modules\.bin\react-native.cmd"
if (-not (Test-Path $reactNativeCli)) {
  Write-Host "react-native CLI introuvable. Lancez : npm install" -ForegroundColor Red
  exit 1
}

& $reactNativeCli run-android @args
