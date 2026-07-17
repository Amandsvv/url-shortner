CREATE TABLE "urls" (
	"id" uuid PRIMARY KEY NOT NULL,
	"short_code" text NOT NULL,
	"original_url" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "urls_short_code_unique" UNIQUE("short_code")
);
