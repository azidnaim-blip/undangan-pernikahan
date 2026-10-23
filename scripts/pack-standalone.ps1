$sourceDir = Join-Path $PSScriptRoot "..\undangan-pernikahan"
$destZip = Join-Path $PSScriptRoot "..\undangan-pernikahan-siap-deploy.zip"

if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

Write-Host "Mengompresi berkas undangan pernikahan ke ZIP..." -ForegroundColor Cyan
Compress-Archive -Path "$sourceDir\*" -DestinationPath $destZip -Force

if (Test-Path $destZip) {
    $zipItem = Get-Item $destZip
    $sizeKb = [Math]::Round($zipItem.Length / 1024, 1)
    Write-Host "Berhasil dibuat: undangan-pernikahan-siap-deploy.zip ($sizeKb KB)" -ForegroundColor Green
    Write-Host "File ZIP ini siap diunggah ke Netlify Drop (https://app.netlify.com/drop) atau cPanel hosting!" -ForegroundColor Yellow
} else {
    Write-Host "Gagal membuat file ZIP." -ForegroundColor Red
}
