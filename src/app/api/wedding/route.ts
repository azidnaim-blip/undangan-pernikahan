import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { WEDDING_DATA, WeddingData } from '@/app/undangan/wedding-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'wedding-data.json');
const TMP_FILE = path.join(os.tmpdir(), 'wedding-data.json');

export async function GET() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(raw), {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(raw), {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }
  } catch (error) {
    console.error('Error reading wedding data file:', error);
  }

  return NextResponse.json(WEDDING_DATA, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function POST(request: Request) {
  try {
    const body: Partial<WeddingData> = await request.json();

    let currentData = WEDDING_DATA;
    try {
      if (fs.existsSync(DATA_FILE)) {
        currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      } else if (fs.existsSync(TMP_FILE)) {
        currentData = JSON.parse(fs.readFileSync(TMP_FILE, 'utf-8'));
      }
    } catch (e) {
      currentData = WEDDING_DATA;
    }

    const mergedData: WeddingData = {
      ...currentData,
      ...body,
      groom: { ...currentData.groom, ...body.groom },
      bride: { ...currentData.bride, ...body.bride },
      quote: { ...currentData.quote, ...body.quote },
      events: {
        ...currentData.events,
        ...body.events,
        akad: { ...currentData.events.akad, ...body.events?.akad },
        resepsi: { ...currentData.events.resepsi, ...body.events?.resepsi },
      },
      gifts: {
        ...currentData.gifts,
        ...body.gifts,
        banks: body.gifts?.banks || currentData.gifts.banks,
        physicalGift: { ...currentData.gifts.physicalGift, ...body.gifts?.physicalGift },
      },
    };

    // Coba simpan ke folder data/ (lokal/VPS) atau ke /tmp (Vercel/serverless)
    let saved = false;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(mergedData, null, 2), 'utf-8');
      saved = true;
    } catch (fsErr) {
      // Fallback ke os.tmpdir() jika filesystem berstatus read-only (misal di Vercel)
      try {
        fs.writeFileSync(TMP_FILE, JSON.stringify(mergedData, null, 2), 'utf-8');
        saved = true;
      } catch (tmpErr) {
        console.warn('Unable to persist to disk on read-only filesystem:', tmpErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data undangan berhasil disimpan!',
      data: mergedData,
    });
  } catch (error) {
    console.error('Error saving wedding data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses data undangan.' },
      { status: 500 }
    );
  }
}
