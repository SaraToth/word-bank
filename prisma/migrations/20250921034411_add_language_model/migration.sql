/*
  Warnings:

  - You are about to drop the column `author_id` on the `words` table. All the data in the column will be lost.
  - You are about to drop the column `en` on the `words` table. All the data in the column will be lost.
  - You are about to drop the column `kr` on the `words` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,slug,language_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `language_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `l1_word` to the `words` table without a default value. This is not possible if the table is not empty.
  - Added the required column `l2_word` to the `words` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language_id` to the `words` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `words` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."LanguageCode" AS ENUM ('KR', 'EN', 'FR', 'HU', 'ES', 'JA', 'ZH');

-- DropForeignKey
ALTER TABLE "public"."words" DROP CONSTRAINT "words_author_id_fkey";

-- DropIndex
DROP INDEX "public"."categories_user_id_slug_key";

-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "language_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."words" DROP COLUMN "author_id",
DROP COLUMN "en",
DROP COLUMN "kr",
ADD COLUMN     "l1_word" TEXT NOT NULL,
ADD COLUMN     "l2_word" TEXT NOT NULL,
ADD COLUMN     "language_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."languages" (
    "id" SERIAL NOT NULL,
    "l1" "public"."LanguageCode" NOT NULL,
    "l2" "public"."LanguageCode" NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_l1_l2_key" ON "public"."languages"("l1", "l2");

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_slug_language_id_key" ON "public"."categories"("user_id", "slug", "language_id");

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."words" ADD CONSTRAINT "words_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."words" ADD CONSTRAINT "words_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
