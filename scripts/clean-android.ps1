$ErrorActionPreference = "Stop"

$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

$env:Path = @(
  "$env:JAVA_HOME\bin",
  "$env:ANDROID_HOME\platform-tools",
  "C:\Program Files\nodejs"
) -join ";" + ";" + $env:Path

$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location "$projectRoot\android"

& .\gradlew.bat --stop 2>$null

$paths = @(
  "$projectRoot\android\build",
  "$projectRoot\android\app\build",
  "$projectRoot\android\.gradle"
)

foreach ($p in $paths) {
  if (Test-Path $p) {
    Remove-Item -Recurse -Force $p -ErrorAction SilentlyContinue
  }
}

Get-ChildItem "$projectRoot\node_modules" -Directory -ErrorAction SilentlyContinue |
  ForEach-Object {
    $buildDir = Join-Path $_.FullName "android\build"
    if (Test-Path $buildDir) {
      Remove-Item -Recurse -Force $buildDir -ErrorAction SilentlyContinue
    }
  }

Write-Host "Android build caches cleaned."
