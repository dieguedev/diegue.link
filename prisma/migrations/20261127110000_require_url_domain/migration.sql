UPDATE "Url"
SET "domainId" = (SELECT "id" FROM "Domain" WHERE "host" = 'diegue.link')
WHERE "domainId" IS NULL;

ALTER TABLE "Url" ALTER COLUMN "domainId" SET NOT NULL;
