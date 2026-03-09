-- AlterTable
ALTER TABLE `growth_logs` ADD COLUMN `moodIntensity` INTEGER NULL,
    ADD COLUMN `specificEvent` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `user_growth_snapshots` ADD COLUMN `verbalizationClarity` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `verbalization_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `logId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `rawThoughts` TEXT NOT NULL,
    `thinkingDurationMs` INTEGER NULL,
    `probingQuestion` VARCHAR(500) NULL,
    `probingAnswer` TEXT NULL,
    `aiInsightJa` TEXT NULL,
    `aiInsightKo` TEXT NULL,
    `verbalizationScore` INTEGER NULL,
    `completedSteps` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verbalization_sessions_logId_key`(`logId`),
    INDEX `verbalization_sessions_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `verbalization_sessions` ADD CONSTRAINT `verbalization_sessions_logId_fkey` FOREIGN KEY (`logId`) REFERENCES `growth_logs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verbalization_sessions` ADD CONSTRAINT `verbalization_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
