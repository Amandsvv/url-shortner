CREATE TYPE "public"."auth_provider" AS ENUM('GOOGLE');--> statement-breakpoint
CREATE TYPE "public"."user_plan" AS ENUM('FREE', 'PRO');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"provider" "auth_provider" NOT NULL,
	"provider_id" text NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"plan" "user_plan" DEFAULT 'FREE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "urls" ADD CONSTRAINT "urls_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;