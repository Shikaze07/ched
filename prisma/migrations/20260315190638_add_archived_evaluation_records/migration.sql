-- CreateTable
CREATE TABLE `ArchivedEvaluationRecord` (
    `id` VARCHAR(25) NOT NULL,
    `originalId` VARCHAR(191) NOT NULL,
    `personnelName` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `academicYear` VARCHAR(191) NOT NULL,
    `selectedCMOs` JSON NOT NULL,
    `selectedPrograms` JSON NOT NULL,
    `refNo` VARCHAR(191) NOT NULL,
    `orNumber` VARCHAR(191) NOT NULL,
    `dateOfEvaluation` DATETIME(3) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `archivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `archivedReason` VARCHAR(191) NOT NULL DEFAULT 'Template deleted',
    `archivedCmoId` VARCHAR(25) NOT NULL,
    `archivedCmoNumber` VARCHAR(191) NOT NULL,
    `archivedCmoTitle` VARCHAR(191) NOT NULL,
    `responses` JSON NOT NULL,

    UNIQUE INDEX `ArchivedEvaluationRecord_originalId_key`(`originalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
