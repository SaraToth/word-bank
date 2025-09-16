-- CreateEnum
CREATE TYPE "public"."CategoryType" AS ENUM ('DEFAULT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."Grade" AS ENUM ('FORGOT', 'HARD', 'OKAY', 'EASY');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "type" "public"."CategoryType" NOT NULL,
    "user_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."words" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "kr" TEXT NOT NULL,
    "en" TEXT NOT NULL,
    "example" TEXT,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReviewProcess" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "last_reviewed" TIMESTAMP(3),
    "next_review" TIMESTAMP(3),
    "interval" INTEGER NOT NULL DEFAULT 1,
    "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "grade" "public"."Grade",

    CONSTRAINT "ReviewProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CategoryWords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryWords_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_slug_key" ON "public"."categories"("user_id", "slug");

-- CreateIndex
CREATE INDEX "_CategoryWords_B_index" ON "public"."_CategoryWords"("B");

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."words" ADD CONSTRAINT "words_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewProcess" ADD CONSTRAINT "ReviewProcess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewProcess" ADD CONSTRAINT "ReviewProcess_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CategoryWords" ADD CONSTRAINT "_CategoryWords_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CategoryWords" ADD CONSTRAINT "_CategoryWords_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
