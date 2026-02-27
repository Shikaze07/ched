-- DropForeignKey
ALTER TABLE `EvaluationResponse` DROP FOREIGN KEY `EvaluationResponse_requirementId_fkey`;

-- DropIndex
DROP INDEX `EvaluationResponse_requirementId_fkey` ON `EvaluationResponse`;
