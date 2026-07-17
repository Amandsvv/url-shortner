CREATE TABLE "reserved_short_codes" (
	"short_code" text PRIMARY KEY NOT NULL,
	"reserved_at" timestamp with time zone DEFAULT now() NOT NULL
);
