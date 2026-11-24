$Port = 5567
$ids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if (-not $ids) { Write-Host "TypeWords 未在运行（端口 $Port 空闲）"; Start-Sleep -Seconds 1; exit 0 }
foreach ($id in $ids) { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue }
Write-Host "已停止 TypeWords（端口 $Port）"
Start-Sleep -Seconds 1