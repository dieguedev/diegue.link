UPDATE "Url"
SET "slug" = 'u/' || "User"."username" || '/' || "Url"."slug"
FROM "User"
WHERE "Url"."userId" = "User"."id"
  AND NOT "Url"."isAdmin"
  AND "Url"."slug" NOT LIKE '%/%';

CREATE UNIQUE INDEX "Url_domainId_slug_key" ON "Url"("domainId", "slug");
