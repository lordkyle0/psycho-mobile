param(
  [int]$Port = 8081
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\android-env.ps1"

$lines = & adb devices | Select-Object -Skip 1 | Where-Object { $_.Trim() -ne "" }
$online = @($lines | Where-Object { $_ -match "`tdevice$" })

if ($online.Count -eq 0) {
  Write-Host "adb reverse : aucun appareil connecte." -ForegroundColor Yellow
  exit 0
}

foreach ($line in $online) {
  $serial = ($line -split "`t")[0]
  & adb -s $serial reverse "tcp:$Port" "tcp:$Port"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Echec adb reverse sur $serial" -ForegroundColor Red
    exit 1
  }
  Write-Host "adb reverse tcp:$Port -> PC localhost:$Port ($serial)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Metro (port $Port) est accessible depuis l'appareil." -ForegroundColor Cyan
