ALTER TABLE "sessions" RENAME COLUMN "referesh_token_hash" TO "refresh_token_hash";--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_referesh_token_hash_unique";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_refresh_token_hash_unique" UNIQUE("refresh_token_hash");