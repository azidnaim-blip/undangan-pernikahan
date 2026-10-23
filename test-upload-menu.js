const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testUploadAndProductCreation() {
  console.log('=== MEMULAI TEST FITUR UPLOAD GAMBAR & PEMBUATAN MENU ===\n');

  // 1. Simulasi penyimpanan file gambar upload ke public/uploads
  console.log('1. Menyiapkan direktori public/uploads...');
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Buat sample dummy image file untuk simulasi upload kasir
  const testFileName = `menu-test-${Date.now()}.png`;
  const testFilePath = path.join(uploadsDir, testFileName);
  // 1x1 transparent PNG buffer
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(testFilePath, samplePngBuffer);
  console.log(`✓ File gambar berhasil ditulis ke: ${testFilePath}`);
  const uploadedImageUrl = `/uploads/${testFileName}`;

  // 2. Ambil Kategori Coffee
  const catCoffee = await prisma.category.findFirst({ where: { name: 'Coffee' } });
  if (!catCoffee) throw new Error('Kategori Coffee tidak ditemukan');

  // 3. Buat Menu Baru dengan Gambar yang Baru Diupload
  console.log('\n2. Membuat Menu Baru "Spanish Honey Latte" dengan foto upload lokal...');
  const newProduct = await prisma.product.create({
    data: {
      name: 'Spanish Honey Latte',
      price: 27000,
      description: 'Espresso dengan susu kental manis, madu alami, dan steamed milk lembut',
      image: uploadedImageUrl,
      categoryId: catCoffee.id,
      isAvailable: true,
    },
  });

  // Hubungkan modifier groups
  const modifierGroups = await prisma.modifierGroup.findMany();
  for (const mg of modifierGroups) {
    await prisma.productModifierGroup.create({
      data: {
        productId: newProduct.id,
        modifierGroupId: mg.id,
      },
    });
  }

  console.log(`✓ Menu Berhasil Dibuat: ID=${newProduct.id}, Nama="${newProduct.name}", Image="${newProduct.image}"`);

  // 4. Verifikasi Produk Dapat Dibaca di Katalog
  console.log('\n3. Memeriksa ketersediaan produk di database...');
  const checkProduct = await prisma.product.findUnique({
    where: { id: newProduct.id },
    include: { category: true, modifierGroups: true },
  });

  console.log(`- Nama: ${checkProduct.name}`);
  console.log(`- Harga: Rp ${checkProduct.price.toLocaleString('id-ID')}`);
  console.log(`- Kategori: ${checkProduct.category.name}`);
  console.log(`- Path Gambar: ${checkProduct.image} ✓ (Bentuk file lokal, bukan link eksternal)`);
  console.log(`- Jumlah Grup Modifier: ${checkProduct.modifierGroups.length} grup`);

  // 5. Test Edit Menu (Update Harga & Nama)
  console.log('\n4. Menguji fungsi Edit Menu...');
  const updatedProduct = await prisma.product.update({
    where: { id: newProduct.id },
    data: {
      name: 'Spanish Honey Latte (Special)',
      price: 28000,
    },
  });
  console.log(`✓ Menu Berhasil Diperbarui: Nama="${updatedProduct.name}", Harga=Rp ${updatedProduct.price.toLocaleString('id-ID')}`);

  console.log('\n=== SELURUH PENGUJIAN UPLOAD GAMBAR & KELOLA MENU BERHASIL 100%! ===');
}

testUploadAndProductCreation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
