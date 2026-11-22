-- CreateTable
CREATE TABLE "Click" (
    "id" BIGSERIAL NOT NULL,
    "urlId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" VARCHAR(2),
    "city" VARCHAR(100),
    "referrer" VARCHAR(255),
    "device" VARCHAR(20),
    "browser" VARCHAR(50),
    "os" VARCHAR(50),
    "isBot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Click_urlId_createdAt_idx" ON "Click"("urlId", "createdAt");

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE CASCADE ON UPDATE CASCADE;
