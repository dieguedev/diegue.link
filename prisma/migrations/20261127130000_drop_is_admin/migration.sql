DROP INDEX "Url_userId_slug_key";

DROP INDEX "Url_slug_isAdmin_idx";

ALTER TABLE "Url" DROP COLUMN "isAdmin";

ALTER TABLE "User" DROP COLUMN "isAdmin";
