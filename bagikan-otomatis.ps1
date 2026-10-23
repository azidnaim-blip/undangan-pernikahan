Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "       ☕ BREWPOINT POS - PEMBUAT LINK PUBLIK OTOMATIS HP       " -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sedang membuat tunnel HTTPS publik gratis via Cloudflare..." -ForegroundColor Gray

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = "$PSScriptRoot\cloudflared.exe"
$processInfo.Arguments = "tunnel --url http://localhost:3000"
$processInfo.RedirectStandardError = $true
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $processInfo
$null = $process.Start()

$foundUrl = $false
while (-not $process.HasExited) {
    $line = $process.StandardError.ReadLine()
    if ($line) {
        if ($line -match "https://[a-zA-Z0-9\-]+\.trycloudflare\.com") {
            $url = $matches[0]
            $foundUrl = $true
            try {
                Set-Clipboard -Value $url
            } catch {}
            
            Write-Host ""
            Write-Host "------------------------------------------------------------------" -ForegroundColor Green
            Write-Host "🎉 LINK HTTPS PUBLIK ANDA SUDAH AKTIF!" -ForegroundColor Green
            Write-Host "------------------------------------------------------------------" -ForegroundColor Green
            Write-Host ""
            Write-Host "👉 Undangan Pernikahan: $url" -ForegroundColor Yellow -BackgroundColor Black
            Write-Host ""
            Write-Host "📋 [SUDAH OTOMATIS DI-COPY KE CLIPBOARD]" -ForegroundColor Cyan
            Write-Host "   Anda tinggal buka WhatsApp dan tekan Ctrl + V (Paste)!" -ForegroundColor White
            Write-Host ""
            Write-Host "Daftar Tautan Lengkap:" -ForegroundColor Gray
            Write-Host "- Undangan Pernikahan : $url" -ForegroundColor Green
            Write-Host "- Form Atur Undangan  : $url/undangan/edit" -ForegroundColor White
            Write-Host "- Menu Kasir POS      : $url/pos" -ForegroundColor DarkGray
            Write-Host ""
            Write-Host "Catatan: Jangan tutup jendela ini selama HP masih mengakses aplikasi." -ForegroundColor DarkGray
            Write-Host "------------------------------------------------------------------" -ForegroundColor Gray
            break
        }
    }
}

# Keep process alive while user uses the tunnel
$process.WaitForExit()
