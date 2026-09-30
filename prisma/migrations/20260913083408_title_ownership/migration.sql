-- AlterTable
ALTER TABLE "media" ADD COLUMN     "createdBy" TEXT;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
