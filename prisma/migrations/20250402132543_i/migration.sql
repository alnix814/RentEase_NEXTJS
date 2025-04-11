/*
  Warnings:

  - Added the required column `bathroom` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rooms` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sleeping` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aPassword` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "bathroom" INTEGER NOT NULL,
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "near" TEXT,
ADD COLUMN     "rooms" INTEGER NOT NULL,
ADD COLUMN     "sleeping" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aPassword" BOOLEAN NOT NULL,
ADD COLUMN     "password" TEXT,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
