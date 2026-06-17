import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding VoxReal database...");

  // ──────────────────────────────────────────────
  // 1. KATEGORİLER
  // ──────────────────────────────────────────────

  const categoryData: { name: string; slug: string; icon: string; sortOrder: number; children: { name: string; slug: string; icon: string; sortOrder: number }[] }[] = [
    {
      name: "Teknoloji", slug: "teknoloji", icon: "💻", sortOrder: 1,
      children: [
        { name: "Yapay Zeka", slug: "yapay-zeka", icon: "🤖", sortOrder: 1 },
        { name: "Mobil", slug: "mobil", icon: "📱", sortOrder: 2 },
        { name: "Yazılım", slug: "yazilim", icon: "💾", sortOrder: 3 },
      ],
    },
    {
      name: "Spor", slug: "spor", icon: "⚽", sortOrder: 2,
      children: [
        { name: "Futbol", slug: "futbol", icon: "⚽", sortOrder: 1 },
        { name: "Basketbol", slug: "basketbol", icon: "🏀", sortOrder: 2 },
        { name: "Tenis", slug: "tenis", icon: "🎾", sortOrder: 3 },
      ],
    },
    {
      name: "Siyaset", slug: "siyaset", icon: "🏛️", sortOrder: 3,
      children: [
        { name: "İç Politika", slug: "ic-politika", icon: "🇹🇷", sortOrder: 1 },
        { name: "Dış Politika", slug: "dis-politika", icon: "🌍", sortOrder: 2 },
      ],
    },
    {
      name: "Sağlık", slug: "saglik", icon: "💊", sortOrder: 4,
      children: [
        { name: "Beslenme", slug: "beslenme", icon: "🥗", sortOrder: 1 },
        { name: "Egzersiz", slug: "egzersiz", icon: "🏋️", sortOrder: 2 },
        { name: "Ruh Sağlığı", slug: "ruh-sagligi", icon: "🧠", sortOrder: 3 },
      ],
    },
    {
      name: "Eğitim", slug: "egitim", icon: "📚", sortOrder: 5,
      children: [
        { name: "Online Eğitim", slug: "online-egitim", icon: "💻", sortOrder: 1 },
        { name: "Kariyer", slug: "kariyer", icon: "🚀", sortOrder: 2 },
      ],
    },
    {
      name: "Eğlence", slug: "eglence", icon: "🎭", sortOrder: 6,
      children: [
        { name: "Film & Dizi", slug: "film-ve-dizi", icon: "🎬", sortOrder: 1 },
        { name: "Müzik", slug: "muzik", icon: "🎵", sortOrder: 2 },
        { name: "Mizah", slug: "mizah", icon: "😂", sortOrder: 3 },
      ],
    },
    {
      name: "Oyun", slug: "oyun", icon: "🎮", sortOrder: 7,
      children: [
        { name: "PC Oyunları", slug: "pc-oyunlari", icon: "🖥️", sortOrder: 1 },
        { name: "Mobil Oyunlar", slug: "mobil-oyunlar", icon: "📱", sortOrder: 2 },
      ],
    },
    {
      name: "Finans", slug: "finans", icon: "💰", sortOrder: 8,
      children: [
        { name: "Yatırım", slug: "yatirim", icon: "📈", sortOrder: 1 },
        { name: "Kripto Para", slug: "kripto-para", icon: "🪙", sortOrder: 2 },
        { name: "Bireysel Finans", slug: "bireysel-finans", icon: "🏦", sortOrder: 3 },
      ],
    },
    {
      name: "Seyahat", slug: "seyahat", icon: "✈️", sortOrder: 9,
      children: [
        { name: "Yurt İçi", slug: "yurt-ici", icon: "🇹🇷", sortOrder: 1 },
        { name: "Yurt Dışı", slug: "yurt-disi", icon: "🌏", sortOrder: 2 },
      ],
    },
    {
      name: "Moda", slug: "moda", icon: "👗", sortOrder: 10,
      children: [
        { name: "Giyim", slug: "giyim", icon: "👕", sortOrder: 1 },
        { name: "Aksesuar", slug: "aksesuar", icon: "⌚", sortOrder: 2 },
      ],
    },
    {
      name: "Bilim", slug: "bilim", icon: "🔬", sortOrder: 11,
      children: [
        { name: "Fizik", slug: "fizik", icon: "⚛️", sortOrder: 1 },
        { name: "Biyoloji", slug: "biyoloji", icon: "🧬", sortOrder: 2 },
        { name: "Uzay", slug: "uzay", icon: "🚀", sortOrder: 3 },
      ],
    },
    {
      name: "Yemek", slug: "yemek", icon: "🍽️", sortOrder: 12,
      children: [
        { name: "Tarifler", slug: "tarifler", icon: "📖", sortOrder: 1 },
        { name: "Restoranlar", slug: "restoranlar", icon: "🍝", sortOrder: 2 },
      ],
    },
    {
      name: "İş Dünyası", slug: "is-dunyasi", icon: "💼", sortOrder: 13,
      children: [
        { name: "Girişimcilik", slug: "girisimcilik", icon: "🚀", sortOrder: 1 },
        { name: "Liderlik", slug: "liderlik", icon: "👔", sortOrder: 2 },
      ],
    },
    {
      name: "İlişkiler", slug: "iliskiler", icon: "💞", sortOrder: 14,
      children: [
        { name: "Arkadaşlık", slug: "arkadaslik", icon: "🤝", sortOrder: 1 },
        { name: "Aile", slug: "aile", icon: "👨‍👩‍👧‍👦", sortOrder: 2 },
      ],
    },
    {
      name: "Genel Kültür", slug: "genel-kultur", icon: "📖", sortOrder: 15,
      children: [
        { name: "Tarih", slug: "tarih", icon: "🏺", sortOrder: 1 },
        { name: "Coğrafya", slug: "cografya", icon: "🌎", sortOrder: 2 },
      ],
    },
  ];

  console.log("📁 Seeding categories...");

  for (const cat of categoryData) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });

    for (const child of cat.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          icon: child.icon,
          sortOrder: child.sortOrder,
          parentId: parent.id,
          isActive: true,
        },
        create: {
          name: child.name,
          slug: child.slug,
          icon: child.icon,
          sortOrder: child.sortOrder,
          parentId: parent.id,
          isActive: true,
        },
      });
    }
  }

  // ──────────────────────────────────────────────
  // 2. BADGE'LER
  // ──────────────────────────────────────────────

  console.log("🏅 Seeding badges...");
  const badges = [
    { name: "Gezgin", description: "50 anket oluşturma başarısı", icon: "🧭", threshold: 50 },
    { name: "Lider", description: "500 anket oluşturma başarısı", icon: "🏆", threshold: 500 },
    { name: "Usta", description: "2000 anket oluşturma başarısı", icon: "👑", threshold: 2000 },
    { name: "Truth Seeker", description: "%95 üzeri tutarlılık oranı", icon: "🔍", threshold: 95 },
  ];

  for (const badge of badges) {
    const existing = await prisma.badge.findFirst({ where: { name: badge.name } });
    if (existing) {
      await prisma.badge.update({
        where: { id: existing.id },
        data: { description: badge.description, icon: badge.icon, threshold: badge.threshold },
      });
    } else {
      await prisma.badge.create({ data: badge });
    }
  }

  // ──────────────────────────────────────────────
  // 3. ÖRNEK KULLANICI (anketler için)
  // ──────────────────────────────────────────────

  console.log("👤 Seeding sample users...");

  const defaultPasswordHash = await bcrypt.hash("password123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@voxreal.app" },
    update: { displayName: "VoxReal Admin", passwordHash: defaultPasswordHash, lastActiveAt: new Date() },
    create: {
      email: "admin@voxreal.app",
      displayName: "VoxReal Admin",
      name: "Admin",
      passwordHash: defaultPasswordHash,
      trustScore: 85,
      tokenBalance: 1000,
      isVerified: true,
    },
  });

  const sampleUser = await prisma.user.upsert({
    where: { email: "demo@voxreal.app" },
    update: { displayName: "Demo User", passwordHash: defaultPasswordHash, lastActiveAt: new Date() },
    create: {
      email: "demo@voxreal.app",
      displayName: "Demo User",
      name: "Demo",
      passwordHash: defaultPasswordHash,
      trustScore: 65,
      tokenBalance: 250,
      isVerified: true,
    },
  });

  // ──────────────────────────────────────────────
  // 3b. MVP HARDCODED USER (API auth için)
  // ──────────────────────────────────────────────

  console.log("🔑 Seeding MVP hardcoded user...");

  await prisma.user.upsert({
    where: { id: "user_mvp_placeholder" },
    update: { displayName: "MVP User", lastActiveAt: new Date() },
    create: {
      id: "user_mvp_placeholder",
      email: "mvp@voxreal.app",
      displayName: "MVP User",
      name: "MVP User",
      passwordHash: defaultPasswordHash,
      trustScore: 50,
      tokenBalance: 100,
      isVerified: true,
    },
  });

  // ──────────────────────────────────────────────
  // 4. ÖRNEK ANKETLER (10 farklı anket)
  // ──────────────────────────────────────────────

  console.log("📊 Seeding sample polls...");

  // Alt kategorilerin ID'lerini al
  const subCategories = await prisma.category.findMany({
    where: { parentId: { not: null } },
  });

  const getCategoryId = (slug: string) => {
    const cat = subCategories.find((c) => c.slug === slug);
    if (!cat) throw new Error(`Category not found: ${slug}`);
    return cat.id;
  };

  const polls = [
    {
      question: "Yapay zekanın iş gücüne etkisi sizce nasıl olacak?",
      categorySlug: "yapay-zeka",
      options: JSON.stringify([
        { id: "a", text: "Pek çok işi otomatize edip işsizlik yaratacak" },
        { id: "b", text: "Yeni iş alanları açarak dengeyi koruyacak" },
        { id: "c", text: "Sadece bazı sektörleri dönüştürecek" },
        { id: "d", text: "Hiçbir önemli etkisi olmayacak" },
      ]),
      pollType: "single",
    },
    {
      question: "Hangi futbol ligini izlemeyi tercih edersiniz?",
      categorySlug: "futbol",
      options: JSON.stringify([
        { id: "a", text: "Premier Lig (İngiltere)" },
        { id: "b", text: "La Liga (İspanya)" },
        { id: "c", text: "Serie A (İtalya)" },
        { id: "d", text: "Süper Lig (Türkiye)" },
      ]),
      pollType: "single",
    },
    {
      question: "Ülkemizde en önemli sorun hangisidir?",
      categorySlug: "ic-politika",
      options: JSON.stringify([
        { id: "a", text: "Ekonomik sorunlar" },
        { id: "b", text: "Eğitim sistemi" },
        { id: "c", text: "Adalet sistemi" },
        { id: "d", text: "Sağlık hizmetleri" },
      ]),
      pollType: "single",
    },
    {
      question: "Sağlıklı beslenme için hangisini daha önemli buluyorsunuz?",
      categorySlug: "beslenme",
      options: JSON.stringify([
        { id: "a", text: "Organik gıda tüketimi" },
        { id: "b", text: "Düzenli öğün saatleri" },
        { id: "c", text: "Kalori takibi" },
        { id: "d", text: "Su tüketimi" },
      ]),
      pollType: "single",
    },
    {
      question: "Uzaktan eğitim yüz yüze eğitimin yerini tutar mı?",
      categorySlug: "online-egitim",
      options: JSON.stringify([
        { id: "a", text: "Evet, tamamen yerini tutar" },
        { id: "b", text: "Kısmen, bazı dersler için uygun" },
        { id: "c", text: "Hayır, asla yerini tutamaz" },
        { id: "d", text: "Kararsızım" },
      ]),
      pollType: "single",
    },
    {
      question: "Hangi film türünü daha çok seviyorsunuz?",
      categorySlug: "film-ve-dizi",
      options: JSON.stringify([
        { id: "a", text: "Bilim Kurgu" },
        { id: "b", text: "Komedi" },
        { id: "c", text: "Gerilim" },
        { id: "d", text: "Dram" },
      ]),
      pollType: "single",
    },
    {
      question: "Hangi oyun platformunu daha çok kullanıyorsunuz?",
      categorySlug: "pc-oyunlari",
      options: JSON.stringify([
        { id: "a", text: "Steam" },
        { id: "b", text: "Epic Games" },
        { id: "c", text: "Xbox Game Pass" },
        { id: "d", text: "Battle.net" },
      ]),
      pollType: "single",
    },
    {
      question: "Kripto paraların geleceği hakkında ne düşünüyorsunuz?",  // fixed apostrophe
      categorySlug: "kripto-para",
      options: JSON.stringify([
        { id: "a", text: "Ana akım ödeme yöntemi olacak" },
        { id: "b", text: "Sadece yatırım aracı olarak kalacak" },
        { id: "c", text: "Devletler tarafından yasaklanacak" },
        { id: "d", text: "Tamamen değersizleşecek" },
      ]),
      pollType: "single",
    },
    {
      question: "Tatile giderken hangi ulaşım aracını tercih edersiniz?",
      categorySlug: "yurt-ici",
      options: JSON.stringify([
        { id: "a", text: "Özel araç" },
        { id: "b", text: "Uçak" },
        { id: "c", text: "Otobüs" },
        { id: "d", text: "Tren" },
      ]),
      pollType: "single",
    },
    {
      question: "Sizce hangi gezegende yaşam belirtisi bulma ihtimali en yüksek?",  // fixed apostrophe
      categorySlug: "uzay",
      options: JSON.stringify([
        { id: "a", text: "Mars" },
        { id: "b", text: "Europa (Jüpiter'in uydusu)" },
        { id: "c", text: "Enceladus (Satürn'ün uydusu)" },
        { id: "d", text: "Venüs" },
      ]),
      pollType: "single",
    },
  ];

  const users = [adminUser, sampleUser];

  for (let i = 0; i < polls.length; i++) {
    const poll = polls[i];
    const categoryId = getCategoryId(poll.categorySlug);
    const user = users[i % users.length];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Use a unique identifier for upsert: we can use a slug from the question
    const pollSlug = `poll-${poll.categorySlug}-${i}`;

    // Since Poll has no unique field other than id and cuid makes it unpredictable,
    // let's just create them with try-catch to handle duplicates
    try {
      await prisma.poll.create({
        data: {
          userId: user.id,
          categoryId,
          question: poll.question,
          options: poll.options,
          pollType: poll.pollType,
          duration: 604800, // 7 days in seconds
          status: "active",
          totalVotes: Math.floor(Math.random() * 50) + 5,
          expiresAt,
        },
      });
    } catch (err: any) {
      if (err?.code === "P2002") {
        // Unique constraint violation - skip, already exists
        console.log(`  ⏭️ Poll already exists: "${poll.question.substring(0, 40)}..."`);
      } else {
        throw err;
      }
    }
  }

  // ──────────────────────────────────────────────
  // 5. ÖRNEK KULLANICI İLGİ ALANLARI
  // ──────────────────────────────────────────────

  console.log("🎯 Seeding user interests...");

  const allCategories = await prisma.category.findMany();
  // Admin'in ilgi alanları
  for (let i = 0; i < Math.min(5, allCategories.length); i++) {
    const cat = allCategories[i];
    try {
      await prisma.userInterest.upsert({
        where: { userId_categoryId: { userId: adminUser.id, categoryId: cat.id } },
        update: { weight: 1.0 },
        create: { userId: adminUser.id, categoryId: cat.id, weight: 1.0 },
      });
    } catch {
      // skip duplicates
    }
  }

  // Demo kullanıcının ilgi alanları
  for (let i = 3; i < Math.min(8, allCategories.length); i++) {
    const cat = allCategories[i];
    try {
      await prisma.userInterest.upsert({
        where: { userId_categoryId: { userId: sampleUser.id, categoryId: cat.id } },
        update: { weight: 0.8 },
        create: { userId: sampleUser.id, categoryId: cat.id, weight: 0.8 },
      });
    } catch {
      // skip duplicates
    }
  }

  // ──────────────────────────────────────────────
  // 6. ÖRNEK TRUST LOG
  // ──────────────────────────────────────────────

  console.log("📋 Seeding trust logs...");

  await prisma.trustLog.create({
    data: {
      userId: adminUser.id,
      scoreChange: 10,
      reason: "İlk seed verisi - hoş geldin bonusu",
    },
  });

  await prisma.trustLog.create({
    data: {
      userId: sampleUser.id,
      scoreChange: 5,
      reason: "Demo kullanıcı hoş geldin bonusu",
    },
  });

  console.log("");
  console.log("✅ Seed tamamlandı!");
  console.log(`   📁 ${categoryData.length} ana kategori + ${categoryData.reduce((acc, c) => acc + c.children.length, 0)} alt kategori`);
  console.log(`   🏅 ${badges.length} badge`);
  console.log(`   👤 ${users.length} kullanıcı`);
  console.log(`   📊 ${polls.length} anket`);
}

main()
  .catch((e) => {
    console.error("❌ Seed sırasında hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
