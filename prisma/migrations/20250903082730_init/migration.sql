-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'vi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "shortDescription" TEXT,
    "shortDescriptionEn" TEXT,
    "keywords" TEXT,
    "enKeywords" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "featureImageId" TEXT,
    "featureImageEnId" TEXT,
    "metaTitle" TEXT,
    "metaTitleEn" TEXT,
    "metaDescription" TEXT,
    "metaDescriptionEn" TEXT,
    "metaKeywords" TEXT,
    "metaKeywordsEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "imageId" TEXT,
    "imageEnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."News" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "shortDescription" TEXT,
    "shortDescriptionEn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "pin" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "categoryEnId" TEXT,
    "featureImageId" TEXT,
    "featureImageEnId" TEXT,
    "metaTitle" TEXT,
    "metaTitleEn" TEXT,
    "metaDescription" TEXT,
    "metaDescriptionEn" TEXT,
    "metaKeywords" TEXT,
    "metaKeywordsEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "originalName" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "imageId" TEXT,
    "imageEnId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Banner" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "link" TEXT,
    "imageId" TEXT,
    "imageEnId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "addressEn" TEXT,
    "businessHours" TEXT,
    "businessHoursEn" TEXT,
    "facebookUrl" TEXT,
    "zaloUrl" TEXT,
    "instagramUrl" TEXT,
    "appointmentLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "Category_language_idx" ON "public"."Category"("language");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_language_key" ON "public"."Category"("slug", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "public"."Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_featureImageId_key" ON "public"."Service"("featureImageId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_featureImageEnId_key" ON "public"."Service"("featureImageEnId");

-- CreateIndex
CREATE INDEX "Service_showOnHomepage_idx" ON "public"."Service"("showOnHomepage");

-- CreateIndex
CREATE INDEX "Service_showOnHomepage_createdAt_idx" ON "public"."Service"("showOnHomepage", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_name_key" ON "public"."Equipment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_imageId_key" ON "public"."Equipment"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_imageEnId_key" ON "public"."Equipment"("imageEnId");

-- CreateIndex
CREATE INDEX "Equipment_showOnHomepage_idx" ON "public"."Equipment"("showOnHomepage");

-- CreateIndex
CREATE INDEX "Equipment_order_idx" ON "public"."Equipment"("order");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "public"."News"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "News_featureImageId_key" ON "public"."News"("featureImageId");

-- CreateIndex
CREATE UNIQUE INDEX "News_featureImageEnId_key" ON "public"."News"("featureImageEnId");

-- CreateIndex
CREATE INDEX "News_showOnHomepage_idx" ON "public"."News"("showOnHomepage");

-- CreateIndex
CREATE INDEX "News_showOnHomepage_createdAt_idx" ON "public"."News"("showOnHomepage", "createdAt");

-- CreateIndex
CREATE INDEX "News_categoryId_idx" ON "public"."News"("categoryId");

-- CreateIndex
CREATE INDEX "News_categoryEnId_idx" ON "public"."News"("categoryEnId");

-- CreateIndex
CREATE INDEX "News_pin_idx" ON "public"."News"("pin");

-- CreateIndex
CREATE INDEX "News_pin_createdAt_idx" ON "public"."News"("pin", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_imageId_key" ON "public"."TeamMember"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_imageEnId_key" ON "public"."TeamMember"("imageEnId");

-- CreateIndex
CREATE UNIQUE INDEX "Banner_type_key" ON "public"."Banner"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Banner_imageId_key" ON "public"."Banner"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Banner_imageEnId_key" ON "public"."Banner"("imageEnId");

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_featureImageEnId_fkey" FOREIGN KEY ("featureImageEnId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_featureImageId_fkey" FOREIGN KEY ("featureImageId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Equipment" ADD CONSTRAINT "Equipment_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Equipment" ADD CONSTRAINT "Equipment_imageEnId_fkey" FOREIGN KEY ("imageEnId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."News" ADD CONSTRAINT "News_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."News" ADD CONSTRAINT "News_categoryEnId_fkey" FOREIGN KEY ("categoryEnId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."News" ADD CONSTRAINT "News_featureImageEnId_fkey" FOREIGN KEY ("featureImageEnId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."News" ADD CONSTRAINT "News_featureImageId_fkey" FOREIGN KEY ("featureImageId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_imageEnId_fkey" FOREIGN KEY ("imageEnId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Banner" ADD CONSTRAINT "Banner_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Banner" ADD CONSTRAINT "Banner_imageEnId_fkey" FOREIGN KEY ("imageEnId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
