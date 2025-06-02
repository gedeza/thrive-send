-- This is an empty migration.

-- Create ContentList table
CREATE TABLE "ContentList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ContentList_pkey" PRIMARY KEY ("id")
);

-- Create ContentListItem table for many-to-many relationship
CREATE TABLE "ContentListItem" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentListId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentListItem_pkey" PRIMARY KEY ("id")
);

-- Create index on contentListId
CREATE INDEX "ContentListItem_contentListId_idx" ON "ContentListItem"("contentListId");

-- Create index on contentId
CREATE INDEX "ContentListItem_contentId_idx" ON "ContentListItem"("contentId");

-- Create unique constraint to prevent duplicate content in a list
CREATE UNIQUE INDEX "ContentListItem_contentId_contentListId_key" ON "ContentListItem"("contentId", "contentListId");

-- Create indexes for ContentList
CREATE INDEX "ContentList_ownerId_idx" ON "ContentList"("ownerId");
CREATE INDEX "ContentList_organizationId_idx" ON "ContentList"("organizationId");

-- Add foreign key constraints
ALTER TABLE "ContentList" ADD CONSTRAINT "ContentList_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentList" ADD CONSTRAINT "ContentList_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key constraints for ContentListItem
ALTER TABLE "ContentListItem" ADD CONSTRAINT "ContentListItem_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentListItem" ADD CONSTRAINT "ContentListItem_contentListId_fkey" FOREIGN KEY ("contentListId") REFERENCES "ContentList"("id") ON DELETE CASCADE ON UPDATE CASCADE;