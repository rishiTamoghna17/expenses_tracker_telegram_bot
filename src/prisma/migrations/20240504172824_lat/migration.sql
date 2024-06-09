/*
  Warnings:

  - You are about to drop the column `user` on the `SpreadSheet` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `User` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `SpreadSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refresh_token` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpreadSheet" DROP COLUMN "user",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "key",
DROP COLUMN "value",
ADD COLUMN     "email_id" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refresh_token" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;
