. "$PSScriptRoot\android-env.ps1"

Write-Host ""
Write-Host "Appareils Android detectes :" -ForegroundColor Cyan
Write-Host ""

& adb devices -l

$lines = & adb devices | Select-Object -Skip 1 | Where-Object { $_.Trim() -ne "" }
$online = @($lines | Where-Object { $_ -match "`tdevice$" })
$offline = @($lines | Where-Object { $_ -match "`toffline$" })
$unauthorized = @($lines | Where-Object { $_ -match "`tunauthorized$" })

Write-Host ""

if ($online.Count -gt 0) {
  Write-Host "OK : $($online.Count) appareil(s) pret(s) pour l'installation." -ForegroundColor Green
  exit 0
}

if ($unauthorized.Count -gt 0) {
  Write-Host "Action requise : debloquez le telephone et acceptez 'Autoriser le debogage USB'." -ForegroundColor Yellow
  exit 1
}

if ($offline.Count -gt 0) {
  Write-Host "Emulateur ou device OFFLINE detecte. Essayez :" -ForegroundColor Yellow
  Write-Host "  adb kill-server"
  Write-Host "  adb start-server"
  Write-Host "  Puis redemarrez l'emulateur ou rebranchez le telephone."
  exit 1
}

Write-Host "Aucun appareil connecte. Pour un telephone physique :" -ForegroundColor Yellow
Write-Host "  1. Options developpeur > Debogage USB active"
Write-Host "  2. Branchez en USB (cable data)"
Write-Host "  3. Acceptez l'autorisation sur le telephone"
Write-Host "  4. Relancez : npm run android:devices"
exit 1
