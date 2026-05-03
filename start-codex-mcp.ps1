$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".env.codex.mcp"

if (-not (Test-Path $envFile)) {
  Write-Host "File .env.codex.mcp tidak ditemukan di: $PSScriptRoot" -ForegroundColor Yellow
  exit 1
}

Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()

  if ($line -eq "" -or $line.StartsWith("#")) {
    return
  }

  $parts = $line -split "=", 2

  if ($parts.Length -eq 2) {
    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")

    [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}

if (-not $env:CLOUDFLARE_MCP_TOKEN) {
  Write-Host "CLOUDFLARE_MCP_TOKEN belum kebaca dari .env.codex.mcp" -ForegroundColor Red
  exit 1
}

Write-Host "Loaded .env.codex.mcp" -ForegroundColor Green
Write-Host "Starting Codex resume with full access..." -ForegroundColor Cyan

& codex --dangerously-bypass-approvals-and-sandbox resume