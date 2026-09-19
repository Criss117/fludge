CREATE TABLE `category` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`created_by` text NOT NULL,
	`organization_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_category_created_by_member_id_fk` FOREIGN KEY (`created_by`) REFERENCES `member`(`id`),
	CONSTRAINT `fk_category_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `customer` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`credit_limit` integer NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`document_type` text,
	`document_number` text,
	`organization_id` text NOT NULL,
	`created_by` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_customer_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_customer_created_by_member_id_fk` FOREIGN KEY (`created_by`) REFERENCES `member`(`id`),
	CONSTRAINT "customer_name_length_check" CHECK(length("name") BETWEEN 2 AND 120),
	CONSTRAINT "customer_phone_length_check" CHECK("phone" IS NULL OR length("phone") BETWEEN 7 AND 20),
	CONSTRAINT "customer_email_length_check" CHECK("email" IS NULL OR length("email") BETWEEN 5 AND 160),
	CONSTRAINT "customer_document_number_length_check" CHECK("document_number" IS NULL OR length("document_number") BETWEEN 5 AND 30),
	CONSTRAINT "customer_credit_limit_non_negative_check" CHECK("credit_limit" IS NULL OR "credit_limit" >= 0),
	CONSTRAINT "customer_document_pair_check" CHECK(("document_type" IS NULL AND "document_number" IS NULL)
          OR ("document_type" IS NOT NULL AND "document_number" IS NOT NULL)),
	CONSTRAINT "customer_contact_required_check" CHECK("phone" IS NOT NULL OR "email" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE `group` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`permissions` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_by` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_group_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_group_created_by_member_id_fk` FOREIGN KEY (`created_by`) REFERENCES `member`(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_member` (
	`group_id` text NOT NULL,
	`member_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `group_member_pk` PRIMARY KEY(`group_id`, `member_id`),
	CONSTRAINT `fk_group_member_group_id_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_group_member_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_group_member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_group_member_created_by_member_id_fk` FOREIGN KEY (`created_by`) REFERENCES `member`(`id`)
);
--> statement-breakpoint
CREATE TABLE `member` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`assigned_by` text,
	`organization_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_member_assigned_by_member_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `member`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text,
	`metadata` text,
	`legal_name` text NOT NULL,
	`tax_id` text NOT NULL,
	`address` text NOT NULL,
	`phone` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`search_blob` text NOT NULL,
	`description` text NOT NULL,
	`category_id` text,
	`stock` integer NOT NULL,
	`min_stock` integer NOT NULL,
	`allow_negative_stock` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	CONSTRAINT `fk_product_category_id_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_product_created_by_member_id_fk` FOREIGN KEY (`created_by`) REFERENCES `member`(`id`),
	CONSTRAINT `fk_product_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT "product_minimum_stock_check" CHECK("min_stock" >= 0),
	CONSTRAINT "product_stock_quantity_check" CHECK("allow_negative_stock" = true OR "stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE `product_presentation` (
	`id` text PRIMARY KEY,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`search_blob` text NOT NULL,
	`barcode` text,
	`conversion_factor` integer NOT NULL,
	`price_sale` integer NOT NULL,
	`price_purchase` integer,
	`price_wholesale` integer,
	`created_by` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	CONSTRAINT `fk_product_presentation_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_product_presentation_created_by_member_id_fk` FOREIGN KEY (`created_by`) REFERENCES `member`(`id`),
	CONSTRAINT `fk_product_presentation_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT "presentation_conversion_factor_check" CHECK("conversion_factor" >= 1),
	CONSTRAINT "presentation_price_sale_check" CHECK("price_sale" >= 0),
	CONSTRAINT "presentation_price_purchase_check" CHECK(
        "price_purchase" IS NULL
        OR "price_purchase" >= 0
      ),
	CONSTRAINT "presentation_price_wholesale_check" CHECK(
        "price_wholesale" IS NULL
        OR "price_wholesale" >= 0
      )
);
--> statement-breakpoint
CREATE TABLE `sale` (
	`id` text PRIMARY KEY,
	`sale_number` text NOT NULL,
	`payment_type` text NOT NULL,
	`customer_id` text,
	`completed_at` integer,
	`cancelled_at` integer,
	`total` integer NOT NULL,
	`cancel_reason` text,
	`notes` text,
	`status` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_sale_customer_id_customer_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_sale_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_sale_created_by_member_id_fk` FOREIGN KEY (`created_by`) REFERENCES `member`(`id`)
);
--> statement-breakpoint
CREATE TABLE `sale_item` (
	`id` text PRIMARY KEY,
	`sale_id` text NOT NULL,
	`product_id` text,
	`product_presentation_id` text,
	`product_snapshot` text,
	`name` text NOT NULL,
	`unit_price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`organization_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_sale_item_sale_id_sale_id_fk` FOREIGN KEY (`sale_id`) REFERENCES `sale`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_sale_item_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_sale_item_product_presentation_id_product_presentation_id_fk` FOREIGN KEY (`product_presentation_id`) REFERENCES `product_presentation`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_sale_item_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`is_root` integer NOT NULL,
	`phone` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ticket` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`is_active` integer NOT NULL,
	`organization_id` text NOT NULL,
	CONSTRAINT `fk_ticket_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `ticket_product` (
	`id` text PRIMARY KEY,
	`ticket_id` text NOT NULL,
	`product_id` text,
	`type` text NOT NULL,
	`organization_id` text NOT NULL,
	CONSTRAINT `fk_ticket_product_ticket_id_ticket_id_fk` FOREIGN KEY (`ticket_id`) REFERENCES `ticket`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_ticket_product_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_ticket_product_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `ticket_product_presentation` (
	`id` text PRIMARY KEY,
	`ticket_product_id` text NOT NULL,
	`presentation_id` text,
	`name` text NOT NULL,
	`original_price` real NOT NULL,
	`wholesale_price` real,
	`conversion_factor` real NOT NULL,
	`price_sale` real NOT NULL,
	`quantity` real NOT NULL,
	`organization_id` text NOT NULL,
	CONSTRAINT `fk_ticket_product_presentation_ticket_product_id_ticket_product_id_fk` FOREIGN KEY (`ticket_product_id`) REFERENCES `ticket_product`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_ticket_product_presentation_presentation_id_product_presentation_id_fk` FOREIGN KEY (`presentation_id`) REFERENCES `product_presentation`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_ticket_product_presentation_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_organization_name_unique` ON `category` (`organization_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_organization_slug_unique` ON `category` (`organization_id`,`slug`);--> statement-breakpoint
CREATE INDEX `category_name_idx` ON `category` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `customer_org_document_unique` ON `customer` (`organization_id`,`document_number`);--> statement-breakpoint
CREATE INDEX `customer_org_status_idx` ON `customer` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `customer_org_name_idx` ON `customer` (`organization_id`,`name`);--> statement-breakpoint
CREATE INDEX `group_slug_idx` ON `group` (`slug`);--> statement-breakpoint
CREATE INDEX `group_name_idx` ON `group` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `group_organization_id_slug_unique` ON `group` (`organization_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `group_organization_id_name_unique` ON `group` (`organization_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `member_organization_user_unique` ON `member` (`organization_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `member_organization_assignedBy_idx` ON `member` (`organization_id`,`assigned_by`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_name_unique` ON `organization` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_slug_unique` ON `organization` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_legal_name_unique` ON `organization` (`legal_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_tax_id_unique` ON `organization` (`tax_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_organization_slug_unique` ON `product` (`organization_id`,`slug`);--> statement-breakpoint
CREATE INDEX `product_organization_idx` ON `product` (`organization_id`);--> statement-breakpoint
CREATE INDEX `product_organization_search_blob_idx` ON `product` (`organization_id`,`search_blob`);--> statement-breakpoint
CREATE INDEX `product_organization_category_idx` ON `product` (`organization_id`,`category_id`);--> statement-breakpoint
CREATE INDEX `product_organization_status_idx` ON `product` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `product_organization_category_status_idx` ON `product` (`organization_id`,`category_id`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `presentation_product_name_unique` ON `product_presentation` (`product_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `presentation_product_factor_unique` ON `product_presentation` (`product_id`,`conversion_factor`);--> statement-breakpoint
CREATE UNIQUE INDEX `presentation_organization_barcode_unique` ON `product_presentation` (`organization_id`,`barcode`) WHERE "product_presentation"."barcode" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `presentation_organization_product_idx` ON `product_presentation` (`organization_id`,`product_id`);--> statement-breakpoint
CREATE INDEX `presentation_organization_status_idx` ON `product_presentation` (`organization_id`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `ticket_organization_name_unique` ON `ticket` (`organization_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `ticket_organization_active_unique` ON `ticket` (`organization_id`,`is_active`) WHERE "ticket"."is_active" = 1;--> statement-breakpoint
CREATE UNIQUE INDEX `ticket_product_unique_idx` ON `ticket_product` (`ticket_id`,`product_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `presentation_unique_idx` ON `ticket_product_presentation` (`ticket_product_id`,`presentation_id`);