/*
  Warnings:

  - A unique constraint covering the columns `[propertyId]` on the table `Comments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `propertyId` to the `Comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "propertyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Comments_propertyId_key" ON "Comments"("propertyId");
