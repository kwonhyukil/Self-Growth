-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `growth_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `happenedAt` DATETIME(0) NOT NULL,
    `moodTag` ENUM('JOY', 'PROUD', 'GRATEFUL', 'RELIEVED', 'EXCITED', 'CALM', 'CONFIDENT', 'MOTIVATED', 'CONNECTED', 'HOPEFUL') NOT NULL,
    `triggerKo` VARCHAR(200) NOT NULL,
    `praiseKo` TEXT NOT NULL,
    `praiseJa` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `growth_logs_userId_happenedAt_idx`(`userId`, `happenedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ja_check_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `logId` INTEGER NOT NULL,
    `toolName` VARCHAR(50) NOT NULL,
    `originalText` TEXT NOT NULL,
    `issuesJson` JSON NOT NULL,
    `issueCount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ja_check_results_logId_createdAt_idx`(`logId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `growth_logs` ADD CONSTRAINT `growth_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ja_check_results` ADD CONSTRAINT `ja_check_results_logId_fkey` FOREIGN KEY (`logId`) REFERENCES `growth_logs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
