ALTER TABLE `user` ADD `status` text DEFAULT 'N';--> statement-breakpoint
ALTER TABLE `user` ADD `is_admin` text DEFAULT 'N';--> statement-breakpoint
ALTER TABLE `user` ADD `sort` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `user` ADD `del_flag` text DEFAULT 'N';--> statement-breakpoint
ALTER TABLE `user` ADD `last_sign_in_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `created_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `updated_by` integer;