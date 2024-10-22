CREATE TABLE `resource` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'N' NOT NULL,
	`remark` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`del_flag` text DEFAULT 'N' NOT NULL,
	`created_at` integer DEFAULT 1729592747042 NOT NULL,
	`updated_at` integer DEFAULT 1729592747042 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`parent_id` integer NOT NULL,
	`resource_code` text NOT NULL,
	`resource_name` text NOT NULL,
	`resource_type` text NOT NULL,
	`path` text,
	`active_path` text,
	`component` text,
	`icon` text,
	`is_link` text NOT NULL,
	`is_cache` text NOT NULL,
	`is_affix` text NOT NULL,
	`is_hide` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `role_to_resource` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'N' NOT NULL,
	`remark` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`del_flag` text DEFAULT 'N' NOT NULL,
	`created_at` integer DEFAULT 1729592747042 NOT NULL,
	`updated_at` integer DEFAULT 1729592747042 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`role_code` text NOT NULL,
	`resource_code` text NOT NULL,
	FOREIGN KEY (`role_code`) REFERENCES `role`(`role_code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resource_code`) REFERENCES `resource`(`resource_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'N' NOT NULL,
	`remark` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`del_flag` text DEFAULT 'N' NOT NULL,
	`created_at` integer DEFAULT 1729592747042 NOT NULL,
	`updated_at` integer DEFAULT 1729592747042 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`role_code` text NOT NULL,
	`role_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_to_role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'N' NOT NULL,
	`remark` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`del_flag` text DEFAULT 'N' NOT NULL,
	`created_at` integer DEFAULT 1729592747042 NOT NULL,
	`updated_at` integer DEFAULT 1729592747042 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`username` text NOT NULL,
	`role_code` text NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `user`(`username`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_code`) REFERENCES `role`(`role_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'N' NOT NULL,
	`remark` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`del_flag` text DEFAULT 'N' NOT NULL,
	`created_at` integer DEFAULT 1729592747042 NOT NULL,
	`updated_at` integer DEFAULT 1729592747042 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`is_admin` text DEFAULT 'N' NOT NULL,
	`last_sign_in_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resource_resource_code_unique` ON `resource` (`resource_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `role_to_resource_unique` ON `role_to_resource` (`role_code`,`resource_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `role_role_code_unique` ON `role` (`role_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_to_role_unique` ON `user_to_role` (`username`,`role_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);