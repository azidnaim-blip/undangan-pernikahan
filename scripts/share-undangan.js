const http = require('http');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

const PORT = 3000;
const ROOT_DIR = path.resolve(__dirname, '..');
const CLOUDFLARED_BIN = path.join(ROOT_DIR, 'cloudflared.exe');

console.clear();
console.log('\x1b[33m%s\x1b[0m', '======================================================================');
console.log('\x1b[1m\x1b[33m%s\x1b[0m', '       💌 BAGIKAN UNDANGAN PERNIKAHAN ONLINE KE HP / WHATSAPP        ');
console.log('\x1b[33m%s\x1b[0m', '======================================================================\n');

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
  const startBin = 'npx.cmd';
  const startArgs = hasBuild ? ['next', 'start', '-H', '0.0.0.0', '-p', `${PORT}`] : ['next', 'dev', '-H', '0.0.0.0', '-p', `${PORT}`];
  console.log('\x1b[33m%s\x1b[0m', `⚡ Menyalakan server Next.js (${hasBuild ? 'Production Mode' : 'Dev Mode'})...`);
  const serverProcess = spawn(startBin, startArgs, {
    cwd: ROOT_DIR,
    stdio: 'ignore',
    detached: true,
    shell: true,
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
    return;
  }

  console.log('\x1b[36m%s\x1b[0m', '⚡ Menghubungkan Cloudflare Tunnel publik gratis...');
  console.log('\x1b[90m%s\x1b[0m', '(Tautan bisa dibuka dari HP mana saja via Kuota 4G/5G tanpa harus 1 WiFi)\n');

  const tunnel = spawn(CLOUDFLARED_BIN, ['tunnel', '--url', `http://localhost:${PORT}`]);

  let foundUrl = false;

  const handleOutput = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9\-]+\.trycloudflare\.com/);
    if (match && !foundUrl) {
      foundUrl = true;
      const baseUrl = match[0];
      const weddingUrl = `${baseUrl}/`;

      copyToClipboard(weddingUrl);
      try {
        fs.writeFileSync(path.join(ROOT_DIR, 'tunnel-url.txt'), weddingUrl, 'utf8');
      } catch (e) {}

      console.log('\x1b[32m%s\x1b[0m', '----------------------------------------------------------------------');
      console.log('\x1b[1m\x1b[32m%s\x1b[0m', '  🎉 TAUTAN UNDANGAN PERNIKAHAN AKTIF & SIAP DIBUKA DI HP!');
      console.log('\x1b[32m%s\x1b[0m', '----------------------------------------------------------------------\n');

      console.log('\x1b[33m%s\x1b[0m', '📱 SCAN QR CODE DENGAN KAMERA HP UNTUK LANGSUNG BUKA UNDANGAN:');
      qrcode.generate(weddingUrl, { small: true });

      console.log('\n\x1b[36m%s\x1b[0m', '👉 LINK UTAMA UNDANGAN (Sudah otomatis di-Copy ke Clipboard!):');
      console.log('\x1b[1m\x1b[33m%s\x1b[0m\n', `   ${weddingUrl}`);

      console.log('\x1b[90m%s\x1b[0m', '💌 CONTOH LINK UNDANGAN DENGAN NAMA TAMU KHUSUS:');
      console.log('   - Untuk Budi Santoso   : \x1b[36m' + `${baseUrl}/?to=Budi+Santoso` + '\x1b[0m');
      console.log('   - Untuk Bpk Hendra     : \x1b[36m' + `${baseUrl}/?to=Bpk.+Hendra+%26+Keluarga` + '\x1b[0m');
      console.log('   - Form Atur Undangan   : \x1b[36m' + `${baseUrl}/undangan/edit` + '\x1b[0m\n');

      console.log('\x1b[32m%s\x1b[0m', '✓ [SUKSES DISALIN] Tinggal buka WhatsApp dan tekan Ctrl + V (Paste)!\n');
      console.log('\x1b[90m%s\x1b[0m', 'Catatan: Biarkan jendela ini tetap terbuka selama HP masih mengakses undangan.');
      console.log('\x1b[90m%s\x1b[0m', 'Tekan Ctrl + C untuk berhenti.\n');
    }
  };

  tunnel.stdout.on('data', handleOutput);
  tunnel.stderr.on('data', handleOutput);

  tunnel.on('close', (code) => {
    console.log(`\nTunnel terhenti dengan kode ${code}`);
  });
}

startTunnel();
