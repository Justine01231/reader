-- CreateTable
CREATE TABLE "reading_days" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "msRead" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reading_days_userId_date_idx" ON "reading_days"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "reading_days_userId_date_key" ON "reading_days"("userId", "date");

-- AddForeignKey
ALTER TABLE "reading_days" ADD CONSTRAINT "reading_days_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
