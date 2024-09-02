CREATE TABLE `role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_code` text NOT NULL,
	`role_name` text NOT NULL,
	`status` text DEFAULT 'N',
	`remark` text,
	`sort` integer DEFAULT 0,
	`del_flag` text DEFAULT 'N',
	`created_at` integer,
	`updated_at` integer,
	`created_by` text,
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `user_to_role` (
	`username` text NOT NULL,
	`role_code` text NOT NULL,
	`del_flag` text DEFAULT 'N',
	`created_at` integer,
	`updated_at` integer,
	`created_by` text,
	`updated_by` text,
	PRIMARY KEY(`username`, `role_code`),
	FOREIGN KEY (`username`) REFERENCES `user`(`username`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_code`) REFERENCES `role`(`role_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`status` text DEFAULT 'N',
	`is_admin` text DEFAULT 'N',
	`sort` integer DEFAULT 0,
	`del_flag` text DEFAULT 'N',
	`last_sign_in_at` integer,
	`created_at` integer,
	`updated_at` integer,
	`created_by` text,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `role_role_code_unique` ON `role` (`role_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);