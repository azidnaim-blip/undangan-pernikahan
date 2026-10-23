const http = require('http');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

const PORT = 3000;
const ROOT_DIR = path.resolve(__dirname, '..');
const CLOUDFLARED_BIN = path.join(ROOT_DIR, 'cloudflared.exe');

console.clear();
console.log('\x1b[36m%s\x1b[0m', '======================================================================');
console.log('\x1b[33m%s\x1b[0m', '        ☕ BREWPOINT COFFEE POS - AKSES PUBLIK MOBILE HP / TABLET     ');
console.log('\x1b[36m%s\x1b[0m', '======================================================================\n');

function checkLocalServer() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PORT}`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function copyToClipboard(text) {
  try {
    execSync(`powershell.exe -NoProfile -Command "Set-Clipboard -Value '${text}'"`);
    return true;
  } catch (err) {
    return false;
  }
}

async function startServerIfNeeded() {
  const isRunning = await checkLocalServer();
  if (isRunning) {
    console.log('\x1b[32m%s\x1b[0m', '✓ Server lokal Next.js sudah aktif di port 3000.');
    return;
  }

  const hasBuild = fs.existsSync(path.join(ROOT_DIR, '.next'));
  const startArgs = hasBuild ? ['start'] : ['run', 'dev'];
  console.log('\x1b[33m%s\x1b[0m', `⚡ Menyalakan server Next.js (${hasBuild ? 'Production Mode' : 'Dev Mode'})...`);
  const serverProcess = spawn('npm.cmd', startArgs, {
    cwd: ROOT_DIR,
    stdio: 'ignore',
    detached: true,
  });
  serverProcess.unref();

  let attempts = 0;
  while (attempts < 30) {
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;
    const ready = await checkLocalServer();
    if (ready) {
      console.log('\x1b[32m%s\x1b[0m', '✓ Server Next.js berhasil aktif dan siap!');
      return;
    }
    process.stdout.write('.');
  }
  console.log('\n\x1b[31m%s\x1b[0m', '⚠️ Peringatan: Server lokal belum merespons dalam 60 detik.');
}

async function startTunnel() {
  await startServerIfNeeded();

  if (!fs.existsSync(CLOUDFLARED_BIN)) {
    console.log('\x1b[31m%s\x1b[0m', '❌ File cloudflared.exe tidak ditemukan di: ' + CLOUDFLARED_BIN);
    console.log('\x1b[33m%s\x1b[0m', 'Menjalankan alternatif OpenSSH Tunnel...');
    const ssh = spawn('ssh', ['-p', '443', '-R0:localhost:3000', '-o', 'StrictHostKeyChecking=no', 'a.pinggy.io'], {
      stdio: 'inherit',
    });
    return;
  }

  console.log('\x1b[36m%s\x1b[0m', '⚡ Menghubungkan Cloudflare Tunnel publik gratis...');
  console.log('\x1b[90m%s\x1b[0m', '(Tautan bisa dibuka dari HP mana saja via Kuota 4G/5G tanpa harus 1 WiFi)\n');

  const tunnel = spawn(CLOUDFLARED_BIN, [
    'tunnel',
    '--edge-ip-version', '4',
    '--protocol', 'http2',
    '--no-autoupdate',
    '--url', `http://localhost:${PORT}`
  ]);

  let foundUrl = false;

  const handleOutput = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9\-]+\.trycloudflare\.com/);
    if (match && !foundUrl) {
      foundUrl = true;
      const baseUrl = match[0];
      const posUrl = `${baseUrl}/pos`;

      copyToClipboard(posUrl);

      console.log('\x1b[32m%s\x1b[0m', '----------------------------------------------------------------------');
      console.log('\x1b[1m\x1b[32m%s\x1b[0m', '  🎉 TAUTAN AKSES PUBLIK BREWPOINT POS & KDS AKTIF!');
      console.log('\x1b[32m%s\x1b[0m', '----------------------------------------------------------------------\n');

      console.log('\x1b[33m%s\x1b[0m', '📱 SCAN QR CODE DENGAN HP ANDROID UNTUK BUKA APLIKASI KASIR:');
      qrcode.generate(posUrl, { small: true });

      console.log('\n\x1b[36m%s\x1b[0m', '👉 LINK KASIR POS (Sudah otomatis di-Copy ke Clipboard Windows!):');
      console.log('\x1b[1m\x1b[33m%s\x1b[0m\n', `   ${posUrl}`);

      console.log('\x1b[90m%s\x1b[0m', '📋 DAFTAR AKSES HALAMAN PER-ROLE & PIN LOGIN:');
      console.log('   - 💳 Kasir POS (Dina)        : \x1b[36m' + `${baseUrl}/pos` + '\x1b[0m  \x1b[32m[PIN: 1234]\x1b[0m');
      console.log('   - ☕ Barista Dapur KDS (Reza) : \x1b[36m' + `${baseUrl}/kds` + '\x1b[0m  \x1b[32m[PIN: 5678]\x1b[0m');
      console.log('   - 👑 Owner & Laporan Laba    : \x1b[36m' + `${baseUrl}/dashboard` + '\x1b[0m  \x1b[32m[PIN: 9999]\x1b[0m');
      console.log('   - 🖥️ Layar Pelanggan (QRIS)  : \x1b[36m' + `${baseUrl}/customer-display` + '\x1b[0m\n');

      console.log('\x1b[32m%s\x1b[0m', '💡 Tips Android: Buka di Chrome HP -> Ketuk "Install Aplikasi" agar menjadi APK!');
      console.log('\x1b[32m%s\x1b[0m', '✓ [SUKSES DISALIN] Tinggal buka WhatsApp dan tekan Ctrl + V (Paste)!\n');
      console.log('\x1b[90m%s\x1b[0m', 'Catatan: Biarkan jendela ini tetap terbuka selama HP masih mengakses aplikasi.');
      console.log('\x1b[90m%s\x1b[0m', 'Tekan Ctrl + C untuk berhenti.\n');
    }
  };

  tunnel.stdout.on('data', handleOutput);
  tunnel.stderr.on('data', handleOutput);

  tunnel.on('close', (code) => {
    console.log(`\x1b[33m⚡ Tunnel terputus (kode ${code}). Menghubungkan ulang otomatis dalam 3 detik...\x1b[0m`);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel().catch((err) => {
  console.error('Error saat menjalankan tunnel:', err);
});
