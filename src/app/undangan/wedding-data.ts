// Data Konfigurasi Undangan Pernikahan untuk Halaman Next.js (/undangan)

export interface WeddingData {
  groom: {
    nickname: string;
    fullName: string;
    father: string;
    mother: string;
    instagram: string;
    photo: string;
    bio: string;
  };
  bride: {
    nickname: string;
    fullName: string;
    father: string;
    mother: string;
    instagram: string;
    photo: string;
    bio: string;
  };
  heroImage: string;
  backgroundMusic: string;
  weddingDate: string;
  displayDate: string;
  quote: {
    arabic: string;
    translation: string;
    source: string;
  };
  events: {
    akad: {
      title: string;
      date: string;
      time: string;
      venue: string;
      address: string;
      mapsUrl: string;
      mapsEmbed: string;
    };
    resepsi: {
      title: string;
      date: string;
      time: string;
      venue: string;
      address: string;
      mapsUrl: string;
      mapsEmbed: string;
    };
  };
  loveStory: Array<{
    year: string;
    title: string;
    story: string;
  }>;
  gallery: Array<{
    url: string;
    title: string;
  }>;
  gifts: {
    banks: Array<{
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      logo: string;
    }>;
    physicalGift: {
      recipientName: string;
      phone: string;
      address: string;
    };
  };
  whatsappNumber: string;
}

export const WEDDING_DATA: WeddingData = {
  groom: {
    nickname: "Arya",
    fullName: "Raden Arya Wijaya, S.Kom.",
    father: "Bpk. Bambang Wijaya",
    mother: "Ibu Sri Rahayu",
    instagram: "https://instagram.com",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    bio: "Putra pertama dari Bpk. Bambang Wijaya & Ibu Sri Rahayu"
  },
  bride: {
    nickname: "Annisa",
    fullName: "Siti Annisa Putri, S.Farm.",
    father: "Bpk. H. Rahmat Hidayat",
    mother: "Ibu Hj. Siti Nurjanah",
    instagram: "https://instagram.com",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    bio: "Putri kedua dari Bpk. H. Rahmat Hidayat & Ibu Hj. Siti Nurjanah"
  },
  heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
  backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=romantic-wedding-piano-111162.mp3",
  weddingDate: "2026-11-28T08:00:00",
  displayDate: "Sabtu, 28 November 2026",
  quote: {
    arabic: "وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً ۗاِنَّ فِيْ ذٰلِكَ لَاٰيٰتٍ لِّقَوْمٍ يَّتَفَكَّرُوْنَ",
    translation: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir.",
    source: "QS. Ar-Rum Ayat 21"
  },
  events: {
    akad: {
      title: "Akad Nikah",
      date: "Sabtu, 28 November 2026",
      time: "08.00 - 10.00 WIB",
      venue: "Masjid Agung Al-Barkah",
      address: "Jl. Veteran No. 45, Margajaya, Bekasi Selatan",
      mapsUrl: "https://maps.google.com/?q=Masjid+Agung+Al-Barkah+Bekasi",
      mapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1951912624536!2d106.9928734!3d-6.237996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698c2579df668b%3A0xe5a34ec081498b8c!2sMasjid%20Agung%20Al-Barkah!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
    },
    resepsi: {
      title: "Resepsi Pernikahan",
      date: "Sabtu, 28 November 2026",
      time: "11.00 - 15.00 WIB",
      venue: "Grand Ballroom Hotel Horison",
      address: "Jl. KH. Noer Ali No. 1, Pekayon Jaya, Bekasi Selatan",
      mapsUrl: "https://maps.google.com/?q=Hotel+Horison+Bekasi",
      mapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.178335804364!2d106.9902641!3d-6.2402127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698c24fb7038e9%3A0x86131c20f1882fe2!2sHotel%20Horison%20Ultima%20Bekasi!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
    }
  },
  loveStory: [
    {
      year: "September 2021",
      title: "Awal Pertemuan",
      story: "Pertama kali kami dipertemukan dalam sebuah seminar teknologi di Jakarta. Percakapan hangat tentang buku dan impian menjadi awal perkenalan yang manis."
    },
    {
      year: "Maret 2023",
      title: "Menjalin Komitmen",
      story: "Setelah saling mengenal karakter, nilai kehidupan, dan keluarga masing-masing, kami sepakat untuk melangkah ke jenjang yang lebih serius dengan niat ibadah."
    },
    {
      year: "Mei 2026",
      title: "Hari Lamaran",
      story: "Di hadapan kedua keluarga besar, kami melangsungkan acara khitbah (lamaran). Sebuah ikatan janji suci untuk mempersiapkan hari pernikahan kami."
    },
    {
      year: "November 2026",
      title: "Menuju Pelaminan",
      story: "Insya Allah hari bahagia kami akan tiba. Memulai babak baru kehidupan bersama sebagai sepasang suami istri di bawah ridho Allah SWT."
    }
  ],
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
      title: "Tatapan Hangat"
    },
    {
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop",
      title: "Langkah Bersama"
    },
    {
      url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop",
      title: "Senyuman Bahagia"
    },
    {
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop",
      title: "Genggaman Tangan"
    },
    {
      url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop",
      title: "Janji Suci"
    }
  ],
  gifts: {
    banks: [
      {
        bankName: "BCA",
        accountNumber: "8801234567",
        accountHolder: "Raden Arya Wijaya",
        logo: "BCA"
      },
      {
        bankName: "Bank Mandiri",
        accountNumber: "1560012345678",
        accountHolder: "Siti Annisa Putri",
        logo: "MANDIRI"
      }
    ],
    physicalGift: {
      recipientName: "Arya & Annisa",
      phone: "081234567890",
      address: "Jl. Kemang Pratama Raya No. 12, Kel. Bojong Rawalumbu, Kota Bekasi, Jawa Barat 17116"
    }
  },
  whatsappNumber: "6281234567890"
};
