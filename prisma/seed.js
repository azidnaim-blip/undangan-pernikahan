const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.pettyCash.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.recipeItem.deleteMany({});
  await prisma.ingredient.deleteMany({});
  await prisma.modifierOption.deleteMany({});
  await prisma.productModifierGroup.deleteMany({});
  await prisma.modifierGroup.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Users...');
  const owner = await prisma.user.create({
    data: { name: 'Owner / Manager', role: 'OWNER', pin: '9999' },
  });
  const cashier = await prisma.user.create({
    data: { name: 'Dina (Kasir 1)', role: 'CASHIER', pin: '1234' },
  });
  const barista = await prisma.user.create({
    data: { name: 'Reza (Barista)', role: 'BARISTA', pin: '5678' },
  });

  console.log('Seeding Ingredients (Bahan Baku)...');
  const ingKopiBlend = await prisma.ingredient.create({
    data: { name: 'Biji Kopi Espresso Blend', unit: 'gr', currentStock: 4500, minStock: 1000, costPerUnit: 220 },
  });
  const ingKopiArabica = await prisma.ingredient.create({
    data: { name: 'Biji Kopi Arabica Gayo', unit: 'gr', currentStock: 2800, minStock: 500, costPerUnit: 340 },
  });
  const ingFreshMilk = await prisma.ingredient.create({
    data: { name: 'Fresh Milk Greenfield', unit: 'ml', currentStock: 18500, minStock: 4000, costPerUnit: 24 },
  });
  const ingOatMilk = await prisma.ingredient.create({
    data: { name: 'Oat Milk Barista Edition', unit: 'ml', currentStock: 7500, minStock: 2000, costPerUnit: 46 },
  });
  const ingAren = await prisma.ingredient.create({
    data: { name: 'Sirup Gula Aren Murni', unit: 'ml', currentStock: 4200, minStock: 1000, costPerUnit: 35 },
  });
  const ingCaramel = await prisma.ingredient.create({
    data: { name: 'Sirup Caramel Gourmet', unit: 'ml', currentStock: 1800, minStock: 400, costPerUnit: 58 },
  });
  const ingMatcha = await prisma.ingredient.create({
    data: { name: 'Pure Uji Matcha Powder', unit: 'gr', currentStock: 1200, minStock: 300, costPerUnit: 420 },
  });
  const ingChoco = await prisma.ingredient.create({
    data: { name: 'Belgian Dark Chocolate Powder', unit: 'gr', currentStock: 1800, minStock: 400, costPerUnit: 260 },
  });
  const ingEarlGrey = await prisma.ingredient.create({
    data: { name: 'Teh Earl Grey Premium', unit: 'gr', currentStock: 950, minStock: 200, costPerUnit: 180 },
  });
  const ingCupCold = await prisma.ingredient.create({
    data: { name: 'Cup Cold 12oz + Lid', unit: 'pcs', currentStock: 420, minStock: 100, costPerUnit: 850 },
  });
  const ingCupHot = await prisma.ingredient.create({
    data: { name: 'Paper Cup Hot 8oz', unit: 'pcs', currentStock: 280, minStock: 60, costPerUnit: 750 },
  });
  const ingCroissant = await prisma.ingredient.create({
    data: { name: 'Butter Croissant Dough', unit: 'pcs', currentStock: 35, minStock: 10, costPerUnit: 11000 },
  });
  const ingBrioche = await prisma.ingredient.create({
    data: { name: 'Roti Brioche Sourdough', unit: 'pcs', currentStock: 25, minStock: 8, costPerUnit: 7500 },
  });

  console.log('Seeding Modifier Groups...');
  const mgSize = await prisma.modifierGroup.create({
    data: {
      name: 'Ukuran Cup (Size)',
      selectionType: 'SINGLE',
      isRequired: true,
      minSelect: 1,
      maxSelect: 1,
      sortOrder: 1,
      options: {
        create: [
          { name: 'Regular (Small)', price: 0, isDefault: true, sortOrder: 1 },
          { name: 'Large (+5k)', price: 5000, isDefault: false, sortOrder: 2 },
        ],
      },
    },
  });

  const mgTemp = await prisma.modifierGroup.create({
    data: {
      name: 'Suhu Penyajian',
      selectionType: 'SINGLE',
      isRequired: true,
      minSelect: 1,
      maxSelect: 1,
      sortOrder: 2,
      options: {
        create: [
          { name: 'Iced (Dingin)', price: 0, isDefault: true, sortOrder: 1 },
          { name: 'Hot (Panas)', price: 0, isDefault: false, sortOrder: 2 },
        ],
      },
    },
  });

  const mgSugar = await prisma.modifierGroup.create({
    data: {
      name: 'Tingkat Gula (Sugar)',
      selectionType: 'SINGLE',
      isRequired: false,
      minSelect: 0,
      maxSelect: 1,
      sortOrder: 3,
      options: {
        create: [
          { name: 'Normal (100%)', price: 0, isDefault: true, sortOrder: 1 },
          { name: 'Less Sugar (70%)', price: 0, isDefault: false, sortOrder: 2 },
          { name: 'Half Sugar (50%)', price: 0, isDefault: false, sortOrder: 3 },
          { name: 'No Sugar (0%)', price: 0, isDefault: false, sortOrder: 4 },
        ],
      },
    },
  });

  const mgIce = await prisma.modifierGroup.create({
    data: {
      name: 'Level Es (Ice)',
      selectionType: 'SINGLE',
      isRequired: false,
      minSelect: 0,
      maxSelect: 1,
      sortOrder: 4,
      options: {
        create: [
          { name: 'Normal Ice', price: 0, isDefault: true, sortOrder: 1 },
          { name: 'Less Ice', price: 0, isDefault: false, sortOrder: 2 },
          { name: 'No Ice', price: 0, isDefault: false, sortOrder: 3 },
        ],
      },
    },
  });

  const mgMilk = await prisma.modifierGroup.create({
    data: {
      name: 'Pilihan Susu',
      selectionType: 'SINGLE',
      isRequired: false,
      minSelect: 0,
      maxSelect: 1,
      sortOrder: 5,
      options: {
        create: [
          { name: 'Fresh Milk', price: 0, isDefault: true, sortOrder: 1 },
          { name: 'Oat Milk Barista (+8k)', price: 8000, isDefault: false, sortOrder: 2 },
        ],
      },
    },
  });

  const mgAddons = await prisma.modifierGroup.create({
    data: {
      name: 'Tambahan (Add-ons)',
      selectionType: 'MULTIPLE',
      isRequired: false,
      minSelect: 0,
      maxSelect: 5,
      sortOrder: 6,
      options: {
        create: [
          { name: 'Extra Espresso Shot (+5k)', price: 5000, isDefault: false, sortOrder: 1 },
          { name: 'Caramel Drizzle (+4k)', price: 4000, isDefault: false, sortOrder: 2 },
          { name: 'Vanilla Syrup (+4k)', price: 4000, isDefault: false, sortOrder: 3 },
          { name: 'Cincau Grass Jelly (+4k)', price: 4000, isDefault: false, sortOrder: 4 },
        ],
      },
    },
  });

  console.log('Seeding Categories & Products with Aesthetic Images...');
  // 1. Coffee (matches reference image "Coffee")
  const catCoffee = await prisma.category.create({
    data: { name: 'Coffee', icon: 'Coffee', sortOrder: 1 },
  });

  const prodCappuccino = await prisma.product.create({
    data: {
      name: 'Cappuccino',
      description: 'Espresso kaya aroma berpadu dengan microfoam susu lembut khas barista Italia',
      price: 24000,
      costPrice: 7500,
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
      categoryId: catCoffee.id,
      sortOrder: 1,
    },
  });

  const prodLatte = await prisma.product.create({
    data: {
      name: 'Coffee Latte',
      description: 'Espresso halus dengan velvety steamed milk yang seimbang, creamy dan lembut',
      price: 25000,
      costPrice: 7800,
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
      categoryId: catCoffee.id,
      sortOrder: 2,
    },
  });

  const prodAmericano = await prisma.product.create({
    data: {
      name: 'Americano',
      description: 'Double shot espresso blend dengan air dingin/panas, aroma harum bersih menyegarkan',
      price: 20000,
      costPrice: 4800,
      image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&auto=format&fit=crop&q=80',
      categoryId: catCoffee.id,
      sortOrder: 3,
    },
  });

  const prodV60 = await prisma.product.create({
    data: {
      name: 'Manual Brew V60',
      description: 'Single origin Arabica Gayo diseduh perlahan, fruity, floral, dan manis alami',
      price: 28000,
      costPrice: 6000,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80',
      categoryId: catCoffee.id,
      sortOrder: 4,
    },
  });

  const prodAren = await prisma.product.create({
    data: {
      name: 'Kopi Susu Gula Aren',
      description: 'Espresso bold dipadu susu segar creamy dan sirup aren organik khas Nusantara',
      price: 22000,
      costPrice: 8500,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=80',
      categoryId: catCoffee.id,
      sortOrder: 5,
    },
  });

  const prodCaramelMacc = await prisma.product.create({
    data: {
      name: 'Caramel Macchiato',
      description: 'Layered espresso, vanilla milk, dan lelehan golden caramel drizzle di atasnya',
      price: 29000,
      costPrice: 9800,
      image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=80',
      categoryId: catCoffee.id,
      sortOrder: 6,
    },
  });

  // 2. Non Coffee
  const catNonCoffee = await prisma.category.create({
    data: { name: 'Non Coffee', icon: 'CupSoda', sortOrder: 2 },
  });

  const prodMatcha = await prisma.product.create({
    data: {
      name: 'Uji Matcha Latte',
      description: 'Bubuk green tea autentik Jepang dari Kyoto dengan fresh milk creamy yang nikmat',
      price: 28000,
      costPrice: 10500,
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
      categoryId: catNonCoffee.id,
      sortOrder: 1,
    },
  });

  const prodChoco = await prisma.product.create({
    data: {
      name: 'Belgian Dark Chocolate',
      description: 'Cokelat hitam pekat Belgia meleleh lembut bersama susu hangat atau dingin',
      price: 27000,
      costPrice: 9200,
      image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=80',
      categoryId: catNonCoffee.id,
      sortOrder: 2,
    },
  });

  const prodEarlGrey = await prisma.product.create({
    data: {
      name: 'Earl Grey Milk Tea',
      description: 'Teh hitam bergamot aromatik dipadukan susu manis lembut dan harum',
      price: 23000,
      costPrice: 6500,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
      categoryId: catNonCoffee.id,
      sortOrder: 3,
    },
  });

  const prodBerryMocktail = await prisma.product.create({
    data: {
      name: 'Summer Berry Sparkler',
      description: 'Mocktail soda dingin menyegarkan dengan sari buah berry dan irisan lemon',
      price: 26000,
      costPrice: 7000,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
      categoryId: catNonCoffee.id,
      sortOrder: 4,
    },
  });

  // 3. Food & Snack
  const catFood = await prisma.category.create({
    data: { name: 'Food', icon: 'Utensils', sortOrder: 3 },
  });

  const prodBrioche = await prisma.product.create({
    data: {
      name: 'Kaya Butter Brioche Toast',
      description: 'Roti brioche panggang lembut dengan selai kaya pandan dan potongan salted butter',
      price: 22000,
      costPrice: 9000,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
      categoryId: catFood.id,
      sortOrder: 1,
    },
  });

  const prodFries = await prisma.product.create({
    data: {
      name: 'Golden Truffle Fries',
      description: 'Kentang goreng renyah dengan aroma minyak truffle dan parutan keju parmesan',
      price: 26000,
      costPrice: 8500,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
      categoryId: catFood.id,
      sortOrder: 2,
    },
  });

  // 4. Dessert & Pastry
  const catDessert = await prisma.category.create({
    data: { name: 'Dessert', icon: 'Croissant', sortOrder: 4 },
  });

  const prodCroissant = await prisma.product.create({
    data: {
      name: 'French Butter Croissant',
      description: 'Pastry renyah berlapis dengan aroma butter Prancis yang harum dan gurih renyah',
      price: 24000,
      costPrice: 12000,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
      categoryId: catDessert.id,
      sortOrder: 1,
    },
  });

  console.log('Linking Modifiers to Products...');
  const drinkProducts = [prodCappuccino, prodLatte, prodAmericano, prodV60, prodAren, prodCaramelMacc, prodMatcha, prodChoco, prodEarlGrey];
  for (const prod of drinkProducts) {
    await prisma.productModifierGroup.create({ data: { productId: prod.id, modifierGroupId: mgSize.id } });
    await prisma.productModifierGroup.create({ data: { productId: prod.id, modifierGroupId: mgTemp.id } });
    await prisma.productModifierGroup.create({ data: { productId: prod.id, modifierGroupId: mgSugar.id } });
    await prisma.productModifierGroup.create({ data: { productId: prod.id, modifierGroupId: mgIce.id } });
    await prisma.productModifierGroup.create({ data: { productId: prod.id, modifierGroupId: mgMilk.id } });
    await prisma.productModifierGroup.create({ data: { productId: prod.id, modifierGroupId: mgAddons.id } });
  }

  console.log('Seeding Recipes (Bahan Baku per Porsi)...');
  await prisma.recipeItem.create({ data: { productId: prodAren.id, ingredientId: ingKopiBlend.id, quantity: 18 } });
  await prisma.recipeItem.create({ data: { productId: prodAren.id, ingredientId: ingFreshMilk.id, quantity: 120 } });
  await prisma.recipeItem.create({ data: { productId: prodAren.id, ingredientId: ingAren.id, quantity: 25 } });
  await prisma.recipeItem.create({ data: { productId: prodAren.id, ingredientId: ingCupCold.id, quantity: 1 } });

  await prisma.recipeItem.create({ data: { productId: prodCappuccino.id, ingredientId: ingKopiBlend.id, quantity: 18 } });
  await prisma.recipeItem.create({ data: { productId: prodCappuccino.id, ingredientId: ingFreshMilk.id, quantity: 150 } });
  await prisma.recipeItem.create({ data: { productId: prodCappuccino.id, ingredientId: ingCupCold.id, quantity: 1 } });

  await prisma.recipeItem.create({ data: { productId: prodLatte.id, ingredientId: ingKopiBlend.id, quantity: 18 } });
  await prisma.recipeItem.create({ data: { productId: prodLatte.id, ingredientId: ingFreshMilk.id, quantity: 180 } });
  await prisma.recipeItem.create({ data: { productId: prodLatte.id, ingredientId: ingCupCold.id, quantity: 1 } });

  await prisma.recipeItem.create({ data: { productId: prodAmericano.id, ingredientId: ingKopiBlend.id, quantity: 18 } });
  await prisma.recipeItem.create({ data: { productId: prodAmericano.id, ingredientId: ingCupCold.id, quantity: 1 } });

  await prisma.recipeItem.create({ data: { productId: prodV60.id, ingredientId: ingKopiArabica.id, quantity: 15 } });
  await prisma.recipeItem.create({ data: { productId: prodV60.id, ingredientId: ingCupCold.id, quantity: 1 } });

  await prisma.recipeItem.create({ data: { productId: prodMatcha.id, ingredientId: ingMatcha.id, quantity: 15 } });
  await prisma.recipeItem.create({ data: { productId: prodMatcha.id, ingredientId: ingFreshMilk.id, quantity: 160 } });
  await prisma.recipeItem.create({ data: { productId: prodMatcha.id, ingredientId: ingCupCold.id, quantity: 1 } });

  await prisma.recipeItem.create({ data: { productId: prodChoco.id, ingredientId: ingChoco.id, quantity: 30 } });
  await prisma.recipeItem.create({ data: { productId: prodChoco.id, ingredientId: ingFreshMilk.id, quantity: 150 } });
  await prisma.recipeItem.create({ data: { productId: prodChoco.id, ingredientId: ingCupCold.id, quantity: 1 } });

  await prisma.recipeItem.create({ data: { productId: prodCroissant.id, ingredientId: ingCroissant.id, quantity: 1 } });
  await prisma.recipeItem.create({ data: { productId: prodBrioche.id, ingredientId: ingBrioche.id, quantity: 1 } });

  console.log('Seeding Initial Shift...');
  const currentShift = await prisma.shift.create({
    data: {
      userId: cashier.id,
      userName: cashier.name,
      startingCash: 250000,
      expectedCash: 250000,
      totalCashSales: 0,
      totalQrisSales: 0,
      totalPettyCash: 0,
      status: 'OPEN',
      notes: 'Shift Pagi - Kasir Aktif',
    },
  });

  console.log('Database seeded with aesthetic images & sizes successfully! Shift ID:', currentShift.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
