CREATE TABLE `resource` (
	`status` text DEFAULT 'N',
	`remark` text,
	`sort` integer DEFAULT 0,
	`del_flag` text DEFAULT 'N',
	`created_at` integer,
	`updated_at` integer,
	`created_by` text,
	`updated_by` text,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parent_id` integer DEFAULT 0,
	`resource_code` text NOT NULL,
	`resource_name` text NOT NULL,
	`resource_type` text NOT NULL,
	`path` text,
	`active_path` text,
	`component` text,
	`icon` text,
	`is_link` text DEFAULT 'N',
	`is_cache` text DEFAULT 'N',
	`is_affix` text DEFAULT 'N',
	`is_hide` text DEFAULT 'N'
);
--> statement-breakpoint
CREATE TABLE `role_to_resource` (
	`status` text DEFAULT 'N',
	`remark` text,
	`sort` integer DEFAULT 0,
	`del_flag` text DEFAULT 'N',
	`created_at` integer,
	`updated_at` integer,
	`created_by` text,
	`updated_by` text,
	`role_code` text NOT NULL,
	`resource_code` text NOT NULL,
	PRIMARY KEY(`role_code`, `resource_code`),
	FOREIGN KEY (`role_code`) REFERENCES `role`(`role_code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resource_code`) REFERENCES `resource`(`resource_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `role` (
	`status` text DEFAULT 'N',
	`remark` text,
	`sort` integer DEFAULT 0,
	`del_flag` text DEFAULT 'N',
	`created_at` integer,
	`updated_at` integer,
	`created_by` text,
	`updated_by` text,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_code` text NOT NULL,
	`role_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_to_role` (
	`status` text DEFAULT 'N',
	`remark` text,
	`sort` integer DEFAULT 0,
	`del_flag` text DEFAULT 'N',
	`created_at` integer,
	`updated_at` integer,
	`created_by` text,
	`updated_by` text,
	`username` text NOT NULL,
	`role_code` text NOT NULL,
	PRIMARY KEY(`username`, `role_code`),
	FOREIGN KEY (`username`) REFERENCES `user`(`username`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_code`) REFERENCES `role`(`role_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`status` text DEFAULT 'N',
	`remark` text,
	`sort` integer DEFAULT 0,
	`del_flag` text DEFAULT 'N',
	`created_at` integer,
	`updated_at` integer,
	`created_by` text,
	`updated_by` text,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`is_admin` text DEFAULT 'N',
	`last_sign_in_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resource_resource_code_unique` ON `resource` (`resource_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `role_role_code_unique` ON `role` (`role_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);