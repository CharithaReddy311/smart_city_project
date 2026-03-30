$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$backendPath = Join-Path $root 'backend'
$frontendPath = Join-Path $root 'frontend'

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found in PATH."
    }
}

function Get-JavaMajorVersion {
    # java -version writes to stderr on many installs; run through cmd to capture it as plain text.
    $firstLine = (cmd /c "java -version 2>&1" | Select-Object -First 1)
    if ($null -eq $firstLine) {
        throw 'Could not detect Java version. java -version returned no output.'
    }
    $firstLine = $firstLine.ToString()

    if ($firstLine -match '"([0-9]+)\.([0-9]+)') {
        $first = [int]$Matches[1]
        $second = [int]$Matches[2]
        if ($first -eq 1) { return $second }
        return $first
    }
    throw "Could not detect Java version from: $firstLine"
}

function Find-Jdk17Home {
    $candidates = @(
        'C:\Program Files\Microsoft',
        'C:\Program Files\Eclipse Adoptium',
        'C:\Program Files\Java'
    )

    foreach ($base in $candidates) {
        if (Test-Path $base) {
            $match = Get-ChildItem -Path $base -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue |
                Sort-Object Name -Descending |
                Select-Object -First 1
            if ($match) { return $match.FullName }
        }
    }

    return $null
}

function Test-TcpPort {
    param(
        [string]$Host,
        [int]$Port,
        [int]$TimeoutMs = 1200
    )

    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $async = $client.BeginConnect($Host, $Port, $null, $null)
        $ok = $async.AsyncWaitHandle.WaitOne($TimeoutMs)
        if (-not $ok) { return $false }
        $client.EndConnect($async)
        return $true
    }
    catch {
        return $false
    }
    finally {
        $client.Close()
    }
}

Write-Host 'Checking prerequisites...' -ForegroundColor Cyan
Require-Command java
Require-Command mvn
Require-Command 'npm.cmd'

if (-not (Test-Path $backendPath)) { throw "Missing folder: $backendPath" }
if (-not (Test-Path $frontendPath)) { throw "Missing folder: $frontendPath" }

$javaMajor = Get-JavaMajorVersion
$javaHomeForBackend = $null
if ($javaMajor -lt 17) {
    $javaHomeForBackend = Find-Jdk17Home
    if (-not $javaHomeForBackend) {
        throw "Java 17 is required for backend. Current Java is $javaMajor and no JDK 17 install was auto-detected."
    }
    Write-Host "Java $javaMajor detected. Backend will run using JDK 17 at: $javaHomeForBackend" -ForegroundColor Yellow
}

if (-not (Test-TcpPort -Host '127.0.0.1' -Port 3306)) {
    Write-Host 'Warning: MySQL is not reachable on 127.0.0.1:3306. Backend may exit on startup.' -ForegroundColor Yellow
}

Write-Host 'Starting backend (Spring Boot) in a new PowerShell window...' -ForegroundColor Green
$backendCmd = 'mvn spring-boot:run'
if ($javaHomeForBackend) {
    $backendCmd = "`$env:JAVA_HOME='$javaHomeForBackend'; `$env:Path='$javaHomeForBackend\\bin;' + `$env:Path; mvn spring-boot:run"
}
Start-Process powershell -WorkingDirectory $backendPath -ArgumentList '-NoExit', '-Command', $backendCmd | Out-Null

Write-Host 'Starting frontend (Angular) in a new PowerShell window...' -ForegroundColor Green
$frontendCmd = 'npm.cmd start'
if (-not (Test-Path (Join-Path $frontendPath 'node_modules'))) {
    $frontendCmd = 'npm.cmd install; npm.cmd start'
}
Start-Process powershell -WorkingDirectory $frontendPath -ArgumentList '-NoExit', '-Command', $frontendCmd | Out-Null

Write-Host ''
Write-Host 'Startup commands launched.' -ForegroundColor Yellow
Write-Host 'Frontend: http://localhost:4200'
Write-Host 'Backend:  http://localhost:8080'
Write-Host ''
Write-Host 'If backend fails, verify values in backend/src/main/resources/application.properties.' -ForegroundColor DarkYellow
