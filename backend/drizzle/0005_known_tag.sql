ALTER TABLE "urls" DROP CONSTRAINT "urls_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "urls" ADD CONSTRAINT "urls_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;