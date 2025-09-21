/*
  Warnings:

  - You are about to drop the `ReviewProcess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ReviewProcess" DROP CONSTRAINT "ReviewProcess_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReviewProcess" DROP CONSTRAINT "ReviewProcess_wordId_fkey";

-- DropTable
DROP TABLE "public"."ReviewProcess";

-- CreateTable
CREATE TABLE "public"."review_process" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "last_reviewed" TIMESTAMP(3),
    "next_review" TIMESTAMP(3),
    "interval" INTEGER NOT NULL DEFAULT 1,
    "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "grade" "public"."Grade",

    CONSTRAINT "review_process_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."review_process" ADD CONSTRAINT "review_process_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_process" ADD CONSTRAINT "review_process_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
