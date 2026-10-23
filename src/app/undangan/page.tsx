'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WEDDING_DATA, WeddingData } from './wedding-data';
import {
  MailOpen,
  Disc3,
  Heart,
  Users,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Gift,
  MessageSquare,
  ChevronDown,
  Instagram,
  CalendarPlus,
  Clock,
  MapPin,
  Navigation,
  Map,
  Copy,
  Package,
  Send,
  MessageCircle,
  MessagesSquare,
  CheckCircle2,
  X,
  PartyPopper,
  HeartHandshake,
  Sliders
} from 'lucide-react';

interface Wish {
  name: string;
  status: string;
  message: string;
  time: string;
}

const INITIAL_WISHES: Wish[] = [
  {
    name: "Dimas & Rara",
    status: "Hadir",
    message: "Barakallahu lakum wa baraka alaikum wa jama'a bainakuma fii khoir. Selamat Arya & Annisa!",
    time: "1 jam yang lalu"
  },
  {
    name: "Keluarga Besar Bpk. Hendra",
    status: "Hadir",
    message: "Selamat menempuh hidup baru untuk kedua mempelai. Semoga menjadi keluarga sakinah, mawaddah, warahmah.",
    time: "3 jam yang lalu"
  },
  {
    name: "Fajar Pratama",
    status: "Hadir",
    message: "Lancar sampai hari H bro Arya! Semoga pernikahannya penuh berkah dan kebahagiaan selalu.",
    time: "Kemarin"
  }
];

function WeddingInvitationContent() {
  const searchParams = useSearchParams();
  const guestParam = searchParams.get('to') || searchParams.get('nama') || searchParams.get('u');
  const guestName = guestParam ? guestParam.replace(/\+/g, ' ') : "Tamu Undangan";

  // Data dinamis: default dari WEDDING_DATA, atau dari localStorage hasil editan mandiri
  const [data, setData] = useState<WeddingData>(WEDDING_DATA);

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RSVP Form & Wishes
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [rsvpName, setRsvpName] = useState(guestParam ? guestName : '');
  const [rsvpStatus, setRsvpStatus] = useState('Hadir');
  const [rsvpCount, setRsvpCount] = useState('1');
  const [rsvpMessage, setRsvpMessage] = useState('');

  // Muat data pernikahan terbaru dari server API (sinkronisasi dari link pengantin)
  useEffect(() => {
    fetch('/api/wedding')
      .then((res) => res.json())
      .then((serverData) => {
        if (serverData && serverData.groom) {
          setData(serverData);
        }
      })
      .catch((err) => {
        try {
          const customData = localStorage.getItem('custom_wedding_data');
          if (customData) {
            setData(JSON.parse(customData));
          }
        } catch {}
      });

    try {
      const storedWishes = localStorage.getItem('wedding_wishes_arya_annisa');
      if (storedWishes) {
        setWishes(JSON.parse(storedWishes));
      }
    } catch {
      // ignore
    }
  }, []);

  // Update Countdown real-time
  useEffect(() => {
    const target = new Date(data.weddingDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data.weddingDate]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log("Autoplay dicegah:", err);
      });
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const copyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`${label} berhasil disalin!`);
      });
    } else {
      showToast(`${label} berhasil disalin!`);
    }
  };

  const sendWhatsApp = () => {
    const name = rsvpName || guestName;
    const text = `Halo ${data.groom.nickname} & ${data.bride.nickname},\n\nSaya *${name}* ingin mengonfirmasi kehadiran di acara pernikahan Anda:\n- Status: *${rsvpStatus}*\n- Jumlah: *${rsvpCount} orang*\n- Doa & Ucapan: "${rsvpMessage || 'Semoga lancar dan berkah selalu'}"\n\nTerima kasih!`;
    const waUrl = `https://api.whatsapp.com/send?phone=${data.whatsappNumber}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpMessage.trim()) return;

    const newWish: Wish = {
      name: rsvpName || guestName,
      status: rsvpStatus,
      message: rsvpMessage,
      time: "Baru saja"
    };

    const updated = [newWish, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem('wedding_wishes_arya_annisa', JSON.stringify(updated));
    } catch {
      // ignore
    }
    sendWhatsApp();
    showToast("Membuka WhatsApp untuk mengirim konfirmasi buku tamu...");
  };

  const saveWishOnly = () => {
    if (!rsvpMessage.trim()) {
      showToast("Mohon tuliskan pesan ucapan & doa restu.");
      return;
    }

    const newWish: Wish = {
      name: rsvpName || guestName,
      status: rsvpStatus,
      message: rsvpMessage,
      time: "Baru saja"
    };

    const updated = [newWish, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem('wedding_wishes_arya_annisa', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setRsvpMessage('');
    showToast("Ucapan & doa Anda berhasil disimpan di buku tamu!");
  };

  return (
    <div className="min-h-screen bg-luxury-canvas text-[#2C2724] relative selection:bg-amber-100 selection:text-amber-900 font-sans overflow-x-hidden">
      {/* Audio Element */}
      <audio ref={audioRef} loop preload="auto">
        <source src={data.backgroundMusic} type="audio/mp3" />
      </audio>

      {/* Floating Golden Petals / Sparkles Background */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
        <div className="petal petal-1" />
        <div className="petal petal-2" />
        <div className="petal petal-3" />
        <div className="petal petal-4" />
        <div className="petal petal-5" />
        <div className="petal petal-6" />
      </div>


      {/* ==================================================================== */}
      {/* 1. COVER GATE SCREEN                                                 */}
      {/* ==================================================================== */}
      {!isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md transition-all duration-1000 p-4">
          <div 
            className="relative w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl overflow-hidden bg-cover bg-center shadow-2xl flex flex-col justify-between p-8 text-center text-white border border-amber-300/40"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(29, 26, 24, 0.68), rgba(29, 26, 24, 0.90)), url('${data.heroImage}')`
            }}
          >
            {/* Ornamen Floral Sudut Atas Kiri Cover */}
            <svg className="absolute -top-1 -left-1 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none z-10 animate-sway-left animate-shimmer" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cGoldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBF5EB"/>
                  <stop offset="45%" stopColor="#D4AF37"/>
                  <stop offset="100%" stopColor="#AA7A1E"/>
                </linearGradient>
                <linearGradient id="cBlushGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF1EC"/>
                  <stop offset="60%" stopColor="#F5D2C7"/>
                  <stop offset="100%" stopColor="#E2A191"/>
                </linearGradient>
              </defs>
              <path d="M0,0 C35,12 65,38 80,78 C65,72 38,55 0,0 Z" fill="url(#cGoldGrad1)" opacity="0.9"/>
              <path d="M0,25 C45,35 75,68 85,115 C70,105 45,75 0,25 Z" fill="url(#cGoldGrad1)" opacity="0.75"/>
              <path d="M0,0 Q65,45 115,115" stroke="url(#cGoldGrad1)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M30,22 Q60,10 85,25 Q60,40 30,22 Z" fill="url(#cGoldGrad1)" opacity="0.85"/>
              <path d="M55,48 Q90,35 110,55 Q85,75 55,48 Z" fill="url(#cGoldGrad1)" opacity="0.85"/>
              <circle cx="38" cy="38" r="14" fill="url(#cBlushGrad1)" opacity="0.9"/>
              <circle cx="38" cy="38" r="5" fill="url(#cGoldGrad1)"/>
              <circle cx="80" cy="80" r="11" fill="url(#cBlushGrad1)" opacity="0.85"/>
              <circle cx="80" cy="80" r="4" fill="url(#cGoldGrad1)"/>
            </svg>

            {/* Ornamen Floral Sudut Bawah Kanan Cover */}
            <svg className="absolute -bottom-1 -right-1 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none z-10 rotate-180 animate-sway-bottom-right animate-shimmer" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,0 C35,12 65,38 80,78 C65,72 38,55 0,0 Z" fill="url(#cGoldGrad1)" opacity="0.9"/>
              <path d="M0,25 C45,35 75,68 85,115 C70,105 45,75 0,25 Z" fill="url(#cGoldGrad1)" opacity="0.75"/>
              <path d="M0,0 Q65,45 115,115" stroke="url(#cGoldGrad1)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <circle cx="38" cy="38" r="14" fill="url(#cBlushGrad1)" opacity="0.9"/>
              <circle cx="38" cy="38" r="5" fill="url(#cGoldGrad1)"/>
            </svg>

            {/* Header Monogram & Judul */}
            <div className="pt-6 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-amber-300/70 bg-white/10 backdrop-blur-md mb-4 shadow-lg shadow-amber-500/20">
                <span className="font-cormorant text-2xl font-bold tracking-widest text-amber-200">
                  {data.groom.nickname[0]} & {data.bride.nickname[0]}
                </span>
              </div>
              <p className="font-cormorant tracking-[0.35em] uppercase text-xs text-amber-200/90 font-semibold">The Wedding Of</p>
              <h1 className="font-cursive text-5xl sm:text-6xl text-amber-100 my-2 drop-shadow-md">
                {data.groom.nickname} & {data.bride.nickname}
              </h1>
              <p className="font-cormorant tracking-widest text-sm text-gray-200 mt-1">{data.displayDate}</p>
            </div>

            {/* Kotak Penerima Tamu */}
            <div className="my-auto py-8 relative z-10">
              <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-amber-400/40 max-w-xs mx-auto shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
                <p className="text-xs uppercase tracking-wider text-amber-200 mb-1 font-medium">Kepada Yth.</p>
                <p className="text-xs text-gray-300 mb-2">Bapak/Ibu/Saudara/i:</p>
                <h2 className="font-playfair text-xl font-bold text-white tracking-wide break-words">
                  {guestName}
                </h2>
                <p className="text-[11px] text-gray-300/80 mt-2 italic">*Mohon maaf bila ada kesalahan penulisan nama/gelar</p>
              </div>
            </div>

            {/* Tombol Buka Undangan */}
            <div className="pb-6 relative z-10">
              <button 
                onClick={handleOpenInvitation}
                className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-900 font-semibold shadow-xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-200"
              >
                <MailOpen className="w-5 h-5 text-stone-900 group-hover:rotate-12 transition-transform" />
                <span className="tracking-wider text-sm font-bold">BUKA UNDANGAN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Music Button */}
      {isOpen && (
        <button 
          onClick={toggleMusic}
          title="Putar / Jeda Musik"
          className="fixed top-5 right-5 z-40 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-amber-700 hover:scale-110 active:scale-95 transition-all border border-amber-400"
        >
          <Disc3 className={`w-6 h-6 ${isPlaying ? 'animate-spin' : 'opacity-60'}`} />
        </button>
      )}

      {/* Floating Bottom Nav */}
      {isOpen && (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-full bg-white/85 backdrop-blur-md border border-amber-300/60 shadow-xl flex items-center gap-4 sm:gap-6 text-stone-800 text-xs font-medium">
          <a href="#hero" className="flex flex-col items-center gap-0.5 hover:text-amber-600 transition-colors" title="Awal">
            <Heart className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] hidden sm:inline">Awal</span>
          </a>
          <a href="#mempelai" className="flex flex-col items-center gap-0.5 hover:text-amber-600 transition-colors" title="Mempelai">
            <Users className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] hidden sm:inline">Mempelai</span>
          </a>
          <a href="#acara" className="flex flex-col items-center gap-0.5 hover:text-amber-600 transition-colors" title="Acara">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] hidden sm:inline">Acara</span>
          </a>
          <a href="#cerita" className="flex flex-col items-center gap-0.5 hover:text-amber-600 transition-colors" title="Kisah">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] hidden sm:inline">Kisah</span>
          </a>
          <a href="#galeri" className="flex flex-col items-center gap-0.5 hover:text-amber-600 transition-colors" title="Galeri">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] hidden sm:inline">Galeri</span>
          </a>
          <a href="#kado" className="flex flex-col items-center gap-0.5 hover:text-amber-600 transition-colors" title="Kado">
            <Gift className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] hidden sm:inline">Kado</span>
          </a>
          <a href="#rsvp" className="flex flex-col items-center gap-0.5 hover:text-amber-600 transition-colors" title="RSVP">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] hidden sm:inline">Ucapan</span>
          </a>
        </nav>
      )}

      {/* ==================================================================== */}
      {/* MAIN CONTAINER                                                       */}
      {/* ==================================================================== */}
      <main className="max-w-xl mx-auto min-h-screen bg-[#FAF8F5]/95 shadow-2xl relative border-x border-amber-300/50 pb-28 overflow-hidden">
        {/* Ambient Glowing Light Orbs in Background */}
        <div className="absolute top-40 -left-20 w-72 h-72 bg-amber-200/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[35%] -right-20 w-80 h-80 bg-amber-300/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[65%] -left-20 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* SECTION 1: HERO */}
        <section 
          id="hero" 
          className="relative min-h-[92vh] flex flex-col items-center justify-between p-8 text-center bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(250, 248, 245, 0.45), rgba(250, 248, 245, 0.98)), url('${data.heroImage}')`
          }}
        >
          {/* Ornamen Floral Mahkota Atas Hero (Botanical Arch Crown) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-24 pointer-events-none z-10 opacity-80 animate-shimmer">
            <svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="heroGold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#AA7A1E" stopOpacity="0.2"/>
                  <stop offset="30%" stopColor="#D4AF37"/>
                  <stop offset="50%" stopColor="#FBF5EB"/>
                  <stop offset="70%" stopColor="#D4AF37"/>
                  <stop offset="100%" stopColor="#AA7A1E" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              <path d="M10,40 Q80,70 160,50 Q240,70 310,40" stroke="url(#heroGold)" strokeWidth="2" fill="none"/>
              <path d="M160,40 C145,25 150,10 160,5 C170,10 175,25 160,40 Z" fill="#D4AF37"/>
              <circle cx="160" cy="50" r="6" fill="#D4AF37"/>
              <circle cx="130" cy="53" r="4" fill="#D4AF37" opacity="0.8"/>
              <circle cx="190" cy="53" r="4" fill="#D4AF37" opacity="0.8"/>
              <path d="M125,50 Q105,30 90,45 Q110,60 125,50 Z" fill="#D4AF37" opacity="0.75"/>
              <path d="M195,50 Q215,30 230,45 Q210,60 195,50 Z" fill="#D4AF37" opacity="0.75"/>
            </svg>
          </div>

          <div className="pt-10 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-amber-400 bg-white/80 backdrop-blur-md shadow-xl mb-4 hover:scale-105 transition-transform">
              <span className="font-cormorant text-2xl font-bold tracking-widest text-amber-700">
                {data.groom.nickname[0]} & {data.bride.nickname[0]}
              </span>
            </div>
            <p className="font-cormorant text-xs uppercase tracking-[0.38em] text-amber-700 font-bold">The Wedding of</p>
          </div>

          <div className="my-6 relative z-10">
            <h1 className="font-cursive text-6xl sm:text-7xl text-amber-800 drop-shadow-sm mb-4 leading-tight">
              {data.groom.nickname} & {data.bride.nickname}
            </h1>
            
            <div className="relative w-48 h-64 sm:w-56 sm:h-72 mx-auto rounded-t-full rounded-b-2xl overflow-hidden border-4 border-amber-400 shadow-2xl">
              <img 
                src={data.heroImage} 
                alt={`${data.groom.nickname} & ${data.bride.nickname}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>

            <p className="font-playfair text-lg text-stone-800 mt-6 font-semibold">{data.displayDate}</p>
            <p className="font-cormorant text-sm uppercase tracking-widest text-amber-700 font-semibold">
              {data.events.akad.venue || "Kota Bekasi, Jawa Barat"}
            </p>
          </div>

          <div className="pb-4 relative z-10">
            <a href="#ayat" className="inline-flex flex-col items-center text-amber-600 hover:text-amber-700 transition-colors animate-bounce">
              <span className="text-[11px] tracking-widest uppercase mb-1 font-semibold">Gulir ke Bawah</span>
              <ChevronDown className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* SECTION 2: AYAT & BASMALAH */}
        <section id="ayat" className="py-16 px-6 text-center border-t border-amber-200/60 relative">
          <p className="font-serif text-3xl sm:text-4xl text-amber-700 mb-4 leading-relaxed font-semibold">
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <p className="font-serif italic text-sm text-stone-800/80 mb-6 font-medium">
            Assalamu’alaikum Warahmatullahi Wabarakatuh
          </p>

          <div className="bg-gradient-to-br from-white via-[#FBF5EB] to-white p-6 sm:p-8 rounded-3xl max-w-lg mx-auto relative overflow-hidden border border-amber-300 shadow-md">
            <p className="font-serif text-xl sm:text-2xl text-stone-900 leading-loose mb-4 font-semibold text-right sm:text-center">
              {data.quote.arabic}
            </p>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto my-4"></div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed text-justify sm:text-center italic font-light">
              "{data.quote.translation}"
            </p>
            <p className="font-serif font-bold text-xs uppercase tracking-widest text-amber-700 mt-3">
              ({data.quote.source})
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-800/90 max-w-md mx-auto mt-8 leading-relaxed">
            Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala, kami bermaksud menyelenggarakan syukuran pernikahan putra-putri kami:
          </p>
        </section>

        {/* SECTION 3: MEMPELAI */}
        <section id="mempelai" className="py-12 px-6">
          <div className="text-center mb-10">
            <p className="font-serif text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Pasangan Pengantin</p>
            <h2 className="font-serif text-3xl font-bold text-stone-900">Kedua Mempelai</h2>
            <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-2"></div>
          </div>

          {/* Groom */}
          <div className="mb-12 text-center">
            <div className="relative w-44 h-56 mx-auto rounded-t-full rounded-b-2xl overflow-hidden border-4 border-amber-400 shadow-xl mb-4 group">
              <img 
                src={data.groom.photo} 
                alt={data.groom.fullName} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-1">{data.groom.fullName}</h3>
            <p className="text-xs text-amber-700 font-medium uppercase tracking-wider mb-2">Mempelai Pria</p>
            <p className="text-xs sm:text-sm text-stone-700 max-w-xs mx-auto leading-relaxed">
              Putra dari <br />
              <strong className="font-semibold text-stone-900">{data.groom.father}</strong> & <strong className="font-semibold text-stone-900">{data.groom.mother}</strong>
            </p>
            {data.groom.instagram && (
              <a 
                href={data.groom.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-300 text-xs text-amber-700 hover:bg-amber-50 transition-colors mt-3"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@{data.groom.nickname.toLowerCase()}</span>
              </a>
            )}
          </div>

          {/* Separator */}
          <div className="flex items-center justify-center gap-4 my-8">
            <div className="h-[1px] w-16 bg-amber-300"></div>
            <span className="font-serif italic text-5xl text-amber-600">&</span>
            <div className="h-[1px] w-16 bg-amber-300"></div>
          </div>

          {/* Bride */}
          <div className="text-center">
            <div className="relative w-44 h-56 mx-auto rounded-t-full rounded-b-2xl overflow-hidden border-4 border-amber-400 shadow-xl mb-4 group">
              <img 
                src={data.bride.photo} 
                alt={data.bride.fullName} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-1">{data.bride.fullName}</h3>
            <p className="text-xs text-amber-700 font-medium uppercase tracking-wider mb-2">Mempelai Wanita</p>
            <p className="text-xs sm:text-sm text-stone-700 max-w-xs mx-auto leading-relaxed">
              Putri dari <br />
              <strong className="font-semibold text-stone-900">{data.bride.father}</strong> & <strong className="font-semibold text-stone-900">{data.bride.mother}</strong>
            </p>
            {data.bride.instagram && (
              <a 
                href={data.bride.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-300 text-xs text-amber-700 hover:bg-amber-50 transition-colors mt-3"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@{data.bride.nickname.toLowerCase()}</span>
              </a>
            )}
          </div>
        </section>

        {/* SECTION 4: COUNTDOWN */}
        <section className="py-14 px-6 bg-gradient-to-b from-[#F4EFE6] to-[#FAF8F5] border-y border-amber-200/60 text-center">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Menghitung Hari</p>
          <h2 className="font-serif text-3xl font-bold text-stone-900 mb-2">Hari Bahagia Kami</h2>
          <p className="text-xs text-stone-700 mb-8">Insya Allah menuju ikatan suci pernikahan</p>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-sm mx-auto mb-8">
            <div className="bg-white/90 p-3 sm:p-4 rounded-2xl shadow-sm border border-amber-300">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-amber-700">{timeLeft.days}</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-700 font-medium">Hari</span>
            </div>
            <div className="bg-white/90 p-3 sm:p-4 rounded-2xl shadow-sm border border-amber-300">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-amber-700">{timeLeft.hours}</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-700 font-medium">Jam</span>
            </div>
            <div className="bg-white/90 p-3 sm:p-4 rounded-2xl shadow-sm border border-amber-300">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-amber-700">{timeLeft.minutes}</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-700 font-medium">Menit</span>
            </div>
            <div className="bg-white/90 p-3 sm:p-4 rounded-2xl shadow-sm border border-amber-300">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-amber-700">{timeLeft.seconds}</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-700 font-medium">Detik</span>
            </div>
          </div>

          <a 
            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${encodeURIComponent(data.groom.nickname)}+%26+${encodeURIComponent(data.bride.nickname)}&details=Undangan+Pernikahan+${encodeURIComponent(data.groom.fullName)}+%26+${encodeURIComponent(data.bride.fullName)}&location=${encodeURIComponent(data.events.resepsi.venue || data.events.akad.venue)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs tracking-wider uppercase shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Simpan ke Google Calendar</span>
          </a>
        </section>

        {/* SECTION 5: ACARA */}
        <section id="acara" className="py-14 px-6">
          <div className="text-center mb-10">
            <p className="font-serif text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Agenda Pernikahan</p>
            <h2 className="font-serif text-3xl font-bold text-stone-900">Rangkaian Acara</h2>
            <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-2"></div>
          </div>

          <div className="space-y-8 max-w-lg mx-auto">
            {/* Akad Card */}
            <div className="bg-gradient-to-br from-white via-[#FBF5EB] to-white p-7 rounded-3xl border border-amber-300 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 border border-amber-300">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">{data.events.akad.title}</h3>
                  <p className="text-xs text-amber-700 font-medium">Sakral & Khidmat</p>
                </div>
              </div>
              
              <div className="space-y-2.5 text-xs sm:text-sm text-stone-800">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{data.events.akad.date}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{data.events.akad.time}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-stone-900">{data.events.akad.venue}</strong>
                    <span className="text-stone-700">{data.events.akad.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200">
                <a 
                  href={data.events.akad.mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-amber-400 bg-white/70 hover:bg-amber-50 text-amber-900 text-xs font-semibold tracking-wider transition-all"
                >
                  <Navigation className="w-4 h-4 text-amber-600" />
                  <span>PETUNJUK ARAH LOKASI AKAD</span>
                </a>
              </div>
            </div>

            {/* Resepsi Card */}
            <div className="bg-gradient-to-br from-white via-[#FBF5EB] to-white p-7 rounded-3xl border border-amber-300 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 border border-amber-300">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">{data.events.resepsi.title}</h3>
                  <p className="text-xs text-amber-700 font-medium">Perayaan & Ramah Tamah</p>
                </div>
              </div>
              
              <div className="space-y-2.5 text-xs sm:text-sm text-stone-800">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{data.events.resepsi.date}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{data.events.resepsi.time}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-stone-900">{data.events.resepsi.venue}</strong>
                    <span className="text-stone-700">{data.events.resepsi.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200">
                <a 
                  href={data.events.resepsi.mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-amber-400 bg-white/70 hover:bg-amber-50 text-amber-900 text-xs font-semibold tracking-wider transition-all"
                >
                  <Navigation className="w-4 h-4 text-amber-600" />
                  <span>PETUNJUK ARAH LOKASI RESEPSI</span>
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="bg-white/90 p-4 rounded-3xl border border-amber-300 shadow-sm overflow-hidden">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3 text-center flex items-center justify-center gap-1.5">
                <Map className="w-4 h-4" />
                Peta Lokasi Acara
              </p>
              <div className="w-full h-56 rounded-2xl overflow-hidden border border-amber-200">
                <iframe 
                  src={data.events.resepsi.mapsEmbed} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: KISAH CINTA */}
        <section id="cerita" className="py-14 px-6 bg-gradient-to-b from-[#FAF8F5] to-[#F4EFE6] border-t border-amber-200/60">
          <div className="text-center mb-10">
            <p className="font-serif text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Perjalanan Cinta</p>
            <h2 className="font-serif text-3xl font-bold text-stone-900">Kisah Kami</h2>
            <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-2"></div>
          </div>

          <div className="relative max-w-md mx-auto pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-300">
            {data.loveStory.map((story, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow"></div>
                <div className="bg-white/90 p-5 rounded-2xl border border-amber-200 shadow-sm">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px] uppercase tracking-wider mb-1.5">
                    {story.year}
                  </span>
                  <h4 className="font-serif text-base font-bold text-stone-900 mb-1">{story.title}</h4>
                  <p className="text-xs text-stone-700 leading-relaxed">{story.story}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: GALERI */}
        <section id="galeri" className="py-14 px-6">
          <div className="text-center mb-10">
            <p className="font-serif text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Dokumentasi</p>
            <h2 className="font-serif text-3xl font-bold text-stone-900">Galeri Foto</h2>
            <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-2"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            {data.gallery.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setLightboxImg(img.url)}
                className={`${idx === 0 ? 'col-span-2 h-52' : 'h-44'} rounded-2xl overflow-hidden border border-amber-300 shadow cursor-pointer group`}
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            ))}
          </div>
        </section>

        {/* Lightbox Modal */}
        {lightboxImg && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <button 
              onClick={() => setLightboxImg(null)} 
              className="absolute top-6 right-6 text-white hover:text-amber-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={lightboxImg} 
              alt="Preview Foto" 
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" 
            />
          </div>
        )}

        {/* SECTION 8: TANDA KASIH */}
        <section id="kado" className="py-14 px-6 bg-gradient-to-b from-[#F4EFE6] to-[#FAF8F5] border-t border-amber-200/60">
          <div className="text-center mb-10">
            <p className="font-serif text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Tanda Kasih</p>
            <h2 className="font-serif text-3xl font-bold text-stone-900">Kado & Amplop Digital</h2>
            <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-2"></div>
            <p className="text-xs text-stone-700 max-w-sm mx-auto mt-3 leading-relaxed">
              Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Jika Anda bermaksud memberikan tanda kasih, Anda dapat menyalurkannya melalui:
            </p>
          </div>

          <div className="space-y-6 max-w-md mx-auto">
            {data.gifts.banks.map((bank, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white via-[#FBF5EB] to-white p-6 rounded-3xl border border-amber-300 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg text-amber-900 tracking-wider">{bank.bankName}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">Transfer Bank</span>
                </div>
                <p className="text-xs text-stone-700">Nomor Rekening:</p>
                <p className="font-mono text-xl font-bold text-stone-900 tracking-widest my-1">{bank.accountNumber}</p>
                <p className="text-xs text-stone-700 mb-4">a.n. <strong className="text-stone-900">{bank.accountHolder}</strong></p>
                
                <button 
                  onClick={() => copyText(bank.accountNumber, `Nomor rekening ${bank.bankName}`)}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs font-semibold tracking-wider transition-all shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>SALIN NOMOR REKENING</span>
                </button>
              </div>
            ))}

            {/* Kado Fisik */}
            {data.gifts.physicalGift && data.gifts.physicalGift.address && (
              <div className="bg-white/90 p-6 rounded-3xl border border-amber-300 shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <Package className="w-5 h-5" />
                  <h4 className="font-serif text-base font-bold">Kirim Kado Fisik</h4>
                </div>
                <p className="text-xs text-stone-700 mb-2">
                  Penerima: <strong>{data.gifts.physicalGift.recipientName} ({data.gifts.physicalGift.phone})</strong>
                </p>
                <p className="text-xs text-stone-800 leading-relaxed p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 mb-4">
                  {data.gifts.physicalGift.address}
                </p>
                <button 
                  onClick={() => copyText(data.gifts.physicalGift.address, "Alamat pengiriman")}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-amber-400 bg-white hover:bg-amber-50 text-amber-900 text-xs font-semibold tracking-wider transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>SALIN ALAMAT PENGIRIMAN</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 9: RSVP */}
        <section id="rsvp" className="py-14 px-6 border-t border-amber-200/60">
          <div className="text-center mb-10">
            <p className="font-serif text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Konfirmasi Kehadiran</p>
            <h2 className="font-serif text-3xl font-bold text-stone-900">Buku Tamu & RSVP</h2>
            <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-2"></div>
            <p className="text-xs text-stone-700 max-w-sm mx-auto mt-3">
              Mohon konfirmasikan kehadiran Anda serta tinggalkan doa restu bagi kami.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-8">
            <form onSubmit={handleRsvpSubmit} className="bg-gradient-to-br from-white via-[#FBF5EB] to-white p-6 rounded-3xl border border-amber-300 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required 
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1">Konfirmasi Kehadiran</label>
                  <select 
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-stone-800"
                  >
                    <option value="Hadir">Ya, Saya Akan Hadir</option>
                    <option value="Tidak Hadir">Mohon Maaf, Belum Bisa Hadir</option>
                    <option value="Masih Ragu">Masih Ragu / Belum Pasti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1">Jumlah Tamu</label>
                  <select 
                    value={rsvpCount}
                    onChange={(e) => setRsvpCount(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-stone-800"
                  >
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                    <option value="3">3 Orang</option>
                    <option value="4+">Lebih dari 3 Orang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1">Ucapan & Doa Restu</label>
                  <textarea 
                    rows={3} 
                    required 
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    placeholder="Tuliskan doa restu untuk kedua mempelai..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div className="pt-2 space-y-2.5">
                  <button 
                    type="submit" 
                    className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/30 active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>KIRIM BUKU TAMU KE WHATSAPP PENGANTIN</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={saveWishOnly}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-semibold tracking-wider transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-600" />
                    <span>Simpan Ucapan di Website Saja</span>
                  </button>
                </div>
              </div>
            </form>

            {/* List Ucapan */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h4 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <MessagesSquare className="w-4 h-4 text-amber-600" />
                  Buku Ucapan & Doa
                </h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                  {wishes.length} Ucapan
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {wishes.map((w, idx) => (
                  <div key={idx} className="bg-white/90 p-4 rounded-2xl border border-amber-200/80 text-xs shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-stone-900">{w.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        w.status === 'Tidak Hadir' ? 'bg-rose-100 text-rose-800' :
                        w.status === 'Masih Ragu' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                    <p className="text-stone-700 leading-relaxed mb-1.5 font-light">{w.message}</p>
                    <span className="text-[10px] text-stone-400 italic">{w.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: PENUTUP */}
        <footer className="pt-12 pb-16 px-6 text-center border-t border-amber-200/60 bg-[#F4EFE6]">
          <div className="max-w-md mx-auto">
            <p className="font-serif text-2xl font-bold text-amber-800 mb-3">Terima Kasih</p>
            <p className="text-xs text-stone-700 leading-relaxed mb-8">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
            </p>

            <p className="font-serif italic text-xs text-stone-900 mb-6 font-medium">
              Wassalamu’alaikum Warahmatullahi Wabarakatuh
            </p>

            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold">Kami Yang Berbahagia,</p>
              <h3 className="font-serif italic text-4xl text-amber-800 my-2">
                {data.groom.nickname} & {data.bride.nickname}
              </h3>
              <p className="text-xs text-stone-700 font-medium">Beserta Kedua Keluarga Besar</p>
            </div>

            <div className="w-16 h-0.5 bg-amber-300 mx-auto mb-6"></div>

            <p className="text-[10px] text-stone-500 uppercase tracking-widest">
              Created with Love &bull; Wedding Invitation
            </p>
          </div>
        </footer>

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-stone-900/90 text-white text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2 border border-amber-400/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function WeddingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-amber-800">Memuat Undangan...</div>}>
      <WeddingInvitationContent />
    </Suspense>
  );
}
