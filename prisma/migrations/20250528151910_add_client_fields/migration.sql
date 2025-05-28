/*
  Warnings:

  - Added the required column `type` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "industry" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "website" TEXT;
