-- AlterTable
ALTER TABLE `growth_logs` MODIFY `praiseJa` TEXT NULL;

-- CreateTable
CREATE TABLE `user_growth_snapshots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `dogLevel` ENUM('BABY', 'JUNIOR', 'SENIOR', 'MASTER') NOT NULL DEFAULT 'BABY',
    `dogEmotion` ENUM('HAPPY', 'NEUTRAL', 'SAD') NOT NULL DEFAULT 'NEUTRAL',
    `vocabulary` INTEGER NOT NULL DEFAULT 0,
    `grammarAccuracy` INTEGER NOT NULL DEFAULT 0,
    `consistency` INTEGER NOT NULL DEFAULT 0,
    `positivity` INTEGER NOT NULL DEFAULT 0,
    `revisionEffort` INTEGER NOT NULL DEFAULT 0,
    `radarAvgScore` DOUBLE NOT NULL DEFAULT 0,
    `computedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_growth_snapshots_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_growth_snapshots` ADD CONSTRAINT `user_growth_snapshots_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
