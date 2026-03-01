/*
  Warnings:

  - You are about to drop the column `cmoNumber` on the `Cmo` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Cmo` table. All the data in the column will be lost.
  - You are about to drop the `CmoProgram` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[programId]` on the table `Cmo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `Cmo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `series` to the `Cmo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CmoProgram` DROP FOREIGN KEY `CmoProgram_cmoId_fkey`;

-- DropForeignKey
ALTER TABLE `CmoProgram` DROP FOREIGN KEY `CmoProgram_programId_fkey`;

-- AlterTable
ALTER TABLE `Cmo` DROP COLUMN `cmoNumber`,
    DROP COLUMN `year`,
    ADD COLUMN `number` VARCHAR(191) NOT NULL,
    ADD COLUMN `programId` VARCHAR(25) NULL,
    ADD COLUMN `series` INTEGER NOT NULL;

-- DropTable
DROP TABLE `CmoProgram`;

-- CreateIndex
CREATE UNIQUE INDEX `Cmo_programId_key` ON `Cmo`(`programId`);

-- AddForeignKey
ALTER TABLE `Cmo` ADD CONSTRAINT `Cmo_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
