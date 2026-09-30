-- CreateEnum
CREATE TYPE "ReaderTheme" AS ENUM ('PAPER', 'DARK', 'SEPIA', 'MIDNIGHT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "readerFontSize" INTEGER,
ADD COLUMN     "readerMeasure" INTEGER,
ADD COLUMN     "readerTheme" "ReaderTheme" NOT NULL DEFAULT 'PAPER';
