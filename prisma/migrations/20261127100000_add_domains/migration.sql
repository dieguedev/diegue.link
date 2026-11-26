DO $$
DECLARE
    admins INTEGER;
BEGIN
    SELECT count(*) INTO admins FROM "User" WHERE "isAdmin";
    IF EXISTS (SELECT 1 FROM "User") AND admins <> 1 THEN
        RAISE EXCEPTION 'Se necesita exactamente un Usuario con isAdmin para asignar diegue.link; hay %', admins;
    END IF;
END $$;

CREATE TABLE "Domain" (
    "id" SERIAL NOT NULL,
    "host" VARCHAR(253) NOT NULL,
    "ownerId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Domain_host_key" ON "Domain"("host");

CREATE INDEX "Domain_ownerId_idx" ON "Domain"("ownerId");

ALTER TABLE "Domain" ADD CONSTRAINT "Domain_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "Domain" ("host", "ownerId", "verifiedAt")
VALUES
    ('trim.cat', NULL, CURRENT_TIMESTAMP),
    ('diegue.link', (SELECT "id" FROM "User" WHERE "isAdmin"), CURRENT_TIMESTAMP);

ALTER TABLE "Url" ADD COLUMN "domainId" INTEGER,
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(255);

ALTER TABLE "Url" ADD CONSTRAINT "Url_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE "Url" SET "domainId" = (SELECT "id" FROM "Domain" WHERE "host" = 'diegue.link');
