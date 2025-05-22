/*
  Warnings:

  - You are about to drop the column `contentType` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrls` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `preheaderText` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `publishDate` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Content` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorId` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_userId_fkey";

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "contentType",
DROP COLUMN "mediaUrls",
DROP COLUMN "preheaderText",
DROP COLUMN "publishDate",
DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "media" JSONB,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");

-- CreateIndex
CREATE INDEX "Content_authorId_idx" ON "Content"("authorId");

-- CreateIndex
CREATE INDEX "Content_type_idx" ON "Content"("type");

-- CreateIndex
CREATE INDEX "Content_status_idx" ON "Content"("status");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
