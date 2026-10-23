import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const port = 3001;
let isReady = false;

console.log('🔄 Memulai Inisialisasi WhatsApp Bot...');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

client.on('qr', (qr) => {
  console.log('\n📲 Pindai QR Code ini menggunakan WhatsApp Anda:');
  qrcode.generate(qr, { small: true });
  
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
  console.log('\nAtau klik link ini untuk melihat QR Code sebagai gambar:');
  console.log(qrImageUrl);
  console.log('--- QR_CODE_GENERATED ---');
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot Berhasil Terkoneksi & Siap Digunakan!');
  isReady = true;
});

client.on('auth_failure', () => {
  console.error('❌ Autentikasi Gagal! Coba hapus folder .wwebjs_auth dan jalankan ulang.');
});

client.on('disconnected', (reason) => {
  console.log('❌ WhatsApp Bot Terputus:', reason);
  isReady = false;
});

client.initialize();

app.post('/send', async (req, res) => {
  const { number, message } = req.body;
  
  if (!isReady) {
    return res.status(503).json({ error: 'WhatsApp Bot belum siap. Harap tunggu atau scan QR.' });
  }

  if (!number || !message) {
    return res.status(400).json({ error: 'Parameter number dan message diperlukan.' });
  }

  try {
    const chatId = `${number.replace(/[^0-9]/g, '')}@c.us`;
    await client.sendMessage(chatId, message);
    console.log(`📤 Pesan WA berhasil dikirim ke ${number}`);
    res.json({ success: true, message: 'Pesan terkirim' });
  } catch (error) {
    console.error(`❌ Gagal mengirim pesan ke ${number}:`, error);
    res.status(500).json({ error: 'Gagal mengirim pesan WhatsApp' });
  }
});

app.listen(port, () => {
  console.log(`🚀 WA API Server berjalan di http://localhost:${port}`);
});
