/*
  Warnings:

  - You are about to drop the column `body` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledFor` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Content` table. All the data in the column will be lost.
  - Added the required column `content` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentType` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Content_projectId_idx";

-- DropIndex
DROP INDEX "Content_scheduledFor_idx";

-- DropIndex
DROP INDEX "Content_userId_idx";

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "body",
DROP COLUMN "projectId",
DROP COLUMN "scheduledFor",
DROP COLUMN "type",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "mediaUrls" TEXT[],
ADD COLUMN     "preheaderText" TEXT,
ADD COLUMN     "publishDate" TIMESTAMP(3),
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "status" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
