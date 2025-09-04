import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNews() {
  try {
    console.log('Seeding categories and news...');

    const catTraditional = await prisma.category.upsert({
      where: { slug_language: { slug: 'traditional-medicine', language: 'vi' } },
      update: {},
      create: {
        name: 'Y học cổ truyền',
        slug: 'traditional-medicine',
        description: 'Bài viết về y học cổ truyền, châm cứu, xoa bóp',
      },
    });

    const catPhysical = await prisma.category.upsert({
      where: { slug_language: { slug: 'physical-therapy', language: 'vi' } },
      update: {},
      create: {
        name: 'Vật lý trị liệu',
        slug: 'physical-therapy',
        description: 'Thông tin về vật lý trị liệu và phục hồi chức năng',
      },
    });

    const catSpinal = await prisma.category.upsert({
      where: { slug_language: { slug: 'spinal-health', language: 'vi' } },
      update: {},
      create: {
        name: 'Sức khỏe cột sống',
        slug: 'spinal-health',
        description: 'Các bài viết về chăm sóc và điều trị cột sống',
      },
    });

    const newsData = [
      {
        title: 'Chiro Therapy trong điều trị các vấn đề về cột sống',
        titleEn: 'Chiro Therapy in Treating Spinal Issues',
        slug: 'chiro-therapy-trong-dieu-tri-cac-van-de-ve-cot-song',
        description:
          'Phương pháp điều trị hiện đại kết hợp y học cổ truyền, hiệu quả cho đau lưng/đau cổ.',
        descriptionEn:
          'Modern treatment combined with traditional medicine, effective for back/neck pain.',
        shortDescription: 'Chiro Therapy kết hợp y học cổ truyền.',
        shortDescriptionEn: 'Chiro Therapy with traditional medicine.',
        status: 'PUBLISHED',
        showOnHomepage: true,
        pin: true,
        categoryId: catSpinal.id,
        metaTitle: 'Chiro Therapy điều trị cột sống hiệu quả | HTC',
      },
      {
        title: 'Lợi ích của châm cứu trong y học cổ truyền',
        titleEn: 'Benefits of Acupuncture in Traditional Medicine',
        slug: 'loi-ich-cua-cham-cuu-trong-y-hoc-co-truyen',
        description: 'Châm cứu giúp cân bằng năng lượng, giảm đau và tăng cường sức khỏe.',
        descriptionEn: 'Acupuncture balances energy, relieves pain, boosts health.',
        shortDescription: 'Châm cứu - phương pháp hiệu quả.',
        shortDescriptionEn: 'Acupuncture - effective method.',
        status: 'PUBLISHED',
        showOnHomepage: true,
        pin: false,
        categoryId: catTraditional.id,
        metaTitle: 'Châm cứu y học cổ truyền hiệu quả | HTC',
      },
      {
        title: 'Vật lý trị liệu hiện đại trong phục hồi chức năng',
        titleEn: 'Modern Physical Therapy in Rehabilitation',
        slug: 'vat-ly-tri-lieu-hien-dai-trong-phuc-hoi-chuc-nang',
        description:
          'Kết hợp công nghệ tiên tiến giúp phục hồi chức năng nhanh và hiệu quả.',
        descriptionEn:
          'Advanced technologies enable quick and effective functional recovery.',
        shortDescription: 'Vật lý trị liệu hiện đại.',
        shortDescriptionEn: 'Modern physical therapy.',
        status: 'PUBLISHED',
        showOnHomepage: true,
        pin: false,
        categoryId: catPhysical.id,
        metaTitle: 'Vật lý trị liệu hiện đại | HTC',
      },
      {
        title: 'Phòng ngừa và điều trị đau vai gáy',
        titleEn: 'Prevention and Treatment of Neck and Shoulder Pain',
        slug: 'phong-ngua-va-dieu-tri-dau-vai-gay',
        description: 'Bài tập và phương pháp điều trị hiệu quả cho đau vai gáy.',
        descriptionEn: 'Effective exercises and treatments for neck/shoulder pain.',
        shortDescription: 'Điều trị đau vai gáy hiệu quả.',
        shortDescriptionEn: 'Effective neck/shoulder treatment.',
        status: 'PUBLISHED',
        showOnHomepage: false,
        pin: false,
        categoryId: catSpinal.id,
        metaTitle: 'Điều trị đau vai gáy | HTC',
      },
    ];

    for (const n of newsData) {
      const created = await prisma.news.upsert({
        where: { slug: n.slug },
        update: n,
        create: n,
      });
      console.log(`✓ Upserted news: ${created.title}`);
    }

    console.log('✅ Seeding completed.');
  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedNews();


