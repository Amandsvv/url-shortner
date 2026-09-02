CREATE TABLE "click_flush_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"batch_id" uuid NOT NULL,
	"short_code" text NOT NULL,
	"click_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "click_flush_items_batch_id_short_code_unique" UNIQUE("batch_id","short_code")
);
--> statement-breakpoint
CREATE TABLE "click_flush_batches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "click_flush_items" ADD CONSTRAINT "click_flush_items_batch_id_click_flush_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."click_flush_batches"("id") ON DELETE cascade ON UPDATE no action;