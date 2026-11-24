$ErrorActionPreference = 'Stop'
$ProjectDir = 'D:\GitHubProjects\TypeWords'
$NodeDir    = 'C:\Users\34857\nodejs'
$Port       = 5567
$Url        = "http://localhost:$Port/"
$env:Path   = "$NodeDir;" + $env:Path
Set-Location -LiteralPath $ProjectDir

$LogDir = Join-Path $ProjectDir 'logs'
if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

function Test-Alive {
    try {
        $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
        return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500)
    } catch { return $false }
}

if (Test-Alive) { Start-Process $Url; exit 0 }

$pnpm = Join-Path $NodeDir 'pnpm.cmd'
if (-not (Test-Path -LiteralPath $pnpm)) {
    Write-Host "找不到 pnpm：$pnpm" -ForegroundColor Red
    Read-Host "按回车关闭"
    exit 1
}

Start-Process -FilePath $pnpm -ArgumentList 'run','dev' -WorkingDirectory $ProjectDir -WindowStyle Hidden -RedirectStandardOutput (Join-Path $LogDir 'dev.log') -RedirectStandardError (Join-Path $LogDir 'dev.err.log')

$deadline = (Get-Date).AddSeconds(180)
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    if (Test-Alive) { Start-Process $Url; exit 0 }
}

Write-Host "启动超时，请查看日志：$LogDir\dev.log" -ForegroundColor Yellow
Read-Host "按回车关闭"
exit 1