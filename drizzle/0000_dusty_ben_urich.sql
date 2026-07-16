CREATE TABLE `submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`wechat` text NOT NULL,
	`bio` text NOT NULL,
	`channels` text NOT NULL,
	`other_channel` text DEFAULT '' NOT NULL,
	`expectations` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
