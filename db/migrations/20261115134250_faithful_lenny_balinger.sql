-- void:allow-destructive
-- Drops price, quantity and most_wanted: removed from the product before any data existed.
ALTER TABLE `reservations` DROP COLUMN `quantity`;--> statement-breakpoint
ALTER TABLE `wishes` DROP COLUMN `price`;--> statement-breakpoint
ALTER TABLE `wishes` DROP COLUMN `quantity`;--> statement-breakpoint
ALTER TABLE `wishes` DROP COLUMN `most_wanted`;