-- AlterTable
ALTER TABLE "Url" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Url_slug_isAdmin_idx" ON "Url"("slug", "isAdmin");
