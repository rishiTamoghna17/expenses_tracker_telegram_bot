/*
  Warnings:

  - Added the required column `email_id` to the `SpreadSheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpreadSheet" ADD COLUMN     "email_id" TEXT NOT NULL;
