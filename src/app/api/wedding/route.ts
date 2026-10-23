import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { WEDDING_DATA, WeddingData } from '@/app/undangan/wedding-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'wedding-data.json');

export async function GET() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }
  } catch (error) {
    console.error('Error reading wedding data file:', error);
  }

  return NextResponse.json(WEDDING_DATA, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body: Partial<WeddingData> = await request.json();

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let currentData = WEDDING_DATA;
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        currentData = JSON.parse(raw);
      } catch (e) {
        currentData = WEDDING_DATA;
      }
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

    fs.writeFileSync(DATA_FILE, JSON.stringify(mergedData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Data undangan berhasil disimpan ke server!',
      data: mergedData,
    });
  } catch (error) {
    console.error('Error saving wedding data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan data undangan ke server.' },
      { status: 500 }
    );
  }
}
