-- CreateTable
CREATE TABLE `ja_revisions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `logId` INTEGER NOT NULL,
    `beforeText` TEXT NOT NULL,
    `afterText` TEXT NOT NULL,
    `beforeResultId` INTEGER NULL,
    `afterResultId` INTEGER NULL,
    `beforeScore` INTEGER NULL,
    `afterScore` INTEGER NULL,
    `beforeIssueCount` INTEGER NULL,
    `afterIssueCount` INTEGER NULL,
    `deltaIssueCount` INTEGER NULL,
    `toolName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ja_revisions_logId_createdAt_idx`(`logId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ja_revisions` ADD CONSTRAINT `ja_revisions_logId_fkey` FOREIGN KEY (`logId`) REFERENCES `growth_logs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
