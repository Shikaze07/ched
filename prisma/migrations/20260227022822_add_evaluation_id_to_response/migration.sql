-- DropIndex
DROP INDEX `Account_userId_fkey` ON `account`;

-- DropIndex
DROP INDEX `CmoProgram_programId_fkey` ON `cmoprogram`;

-- DropIndex
DROP INDEX `EvaluationResponse_requirementId_fkey` ON `evaluationresponse`;

-- DropIndex
DROP INDEX `Requirement_cmoId_fkey` ON `requirement`;

-- DropIndex
DROP INDEX `Requirement_sectionId_fkey` ON `requirement`;

-- DropIndex
DROP INDEX `Section_cmoId_fkey` ON `section`;

-- DropIndex
DROP INDEX `Session_userId_fkey` ON `session`;

-- AlterTable
ALTER TABLE `evaluationresponse` ADD COLUMN `evaluationId` VARCHAR(25) NULL;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmoProgram` ADD CONSTRAINT `CmoProgram_cmoId_fkey` FOREIGN KEY (`cmoId`) REFERENCES `Cmo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmoProgram` ADD CONSTRAINT `CmoProgram_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_cmoId_fkey` FOREIGN KEY (`cmoId`) REFERENCES `Cmo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Requirement` ADD CONSTRAINT `Requirement_cmoId_fkey` FOREIGN KEY (`cmoId`) REFERENCES `Cmo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Requirement` ADD CONSTRAINT `Requirement_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationResponse` ADD CONSTRAINT `EvaluationResponse_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `Requirement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationResponse` ADD CONSTRAINT `EvaluationResponse_evaluationId_fkey` FOREIGN KEY (`evaluationId`) REFERENCES `EvaluationRecord`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
