# 下载并安装 Hugo Extended 到本项目的 .tools\hugo 目录
# 由「安装Hugo.cmd」调用，也可以直接运行：
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\install-hugo.ps1
#
# 注意：本文件必须保存为「UTF-8 带 BOM」，否则 Windows PowerShell 5.1
# 会用系统 ANSI 代码页解析，中文会乱码并导致语法错误。

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }
$ErrorActionPreference = 'Continue'

$root    = Split-Path -Parent $PSScriptRoot
$version = '0.166.0'
$target  = Join-Path $root '.tools\hugo'
$exe     = Join-Path $target 'hugo.exe'

Write-Host ''

if (Test-Path $exe) {
  Write-Host '  Hugo 已经安装好了，不需要重复安装。' -ForegroundColor Green
  Write-Host ''
  & $exe version
  exit 0
}

$url = 'https://github.com/gohugoio/hugo/releases/download/v' + $version + '/hugo_extended_' + $version + '_windows-amd64.zip'
$zip = Join-Path $env:TEMP ('hugo_extended_' + $version + '.zip')

Write-Host '  正在下载 Hugo Extended ' + $version + '（约 23 MB）...'
Write-Host ''

try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }

$ok = $false
try {
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -TimeoutSec 600
  $ok = $true
} catch {
  Write-Host '  常规下载失败，改用 curl.exe 重试 ...'
}

if (-not $ok) {
  try {
    & curl.exe -L --fail --retry 3 --connect-timeout 30 -o $zip $url
    if ($LASTEXITCODE -eq 0 -and (Test-Path $zip)) { $ok = $true }
  } catch { }
}

if (-not $ok -or -not (Test-Path $zip)) {
  Write-Host ''
  Write-Host '  下载失败，通常是网络访问 GitHub 不稳定。' -ForegroundColor Red
  Write-Host ''
  Write-Host '  可以改用下面任意一种方式：'
  Write-Host '    1) winget install Hugo.Hugo.Extended'
  Write-Host '    2) 开代理后重新双击「安装Hugo.cmd」'
  Write-Host ''
  Write-Host '  装好后直接双击「预览博客.cmd」即可，本脚本可以跳过。'
  exit 1
}

Write-Host '  下载完成，正在解压 ...'
New-Item -ItemType Directory -Force -Path $target | Out-Null

try {
  Expand-Archive -Path $zip -DestinationPath $target -Force
  Remove-Item $zip -Force -ErrorAction SilentlyContinue
} catch {
  Write-Host ('  解压失败：' + $_.Exception.Message) -ForegroundColor Red
  exit 1
}

if (Test-Path $exe) {
  Write-Host ''
  & $exe version
  Write-Host ''
  Write-Host '  安装完成。现在可以双击「预览博客.cmd」了。' -ForegroundColor Green
  exit 0
}

Write-Host '  解压后没有找到 hugo.exe，安装未完成。' -ForegroundColor Red
exit 1
