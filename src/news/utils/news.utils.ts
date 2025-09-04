import { News } from '@prisma/client';

export const DEFAULT_NEWS_IMAGE = "/images/default_news_ai.jpeg";

export const getLocalizedNews = (news: News & {
  featureImage?: { url: string } | null;
  featureImageEn?: { url: string } | null;
  category?: { name: string } | null;
  categoryEn?: { name: string } | null;
}, locale: string) => {
  return {
    title: locale === "en" ? news.titleEn || news.title : news.title || news.titleEn,
    description: locale === "en" ? news.descriptionEn || news.description : news.description || news.descriptionEn,
    image: (locale === "en" ? news.featureImageEn?.url || news.featureImage?.url : news.featureImage?.url || news.featureImageEn?.url) || DEFAULT_NEWS_IMAGE,
    slug: news.slug,
    id: news.id,
    shortDescription: locale === "en" ? news.shortDescriptionEn || news.shortDescription : news.shortDescription || news.shortDescriptionEn,
    createdAt: news.createdAt,
    updatedAt: news.updatedAt,
    category: locale === "en" && news?.categoryEn ? news.categoryEn : news.category,
    categoryId: locale === "en" && news?.categoryEnId ? news.categoryEnId : news.categoryId,
  };
};

export function createSlug(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
