ALTER TABLE "comments" ADD COLUMN "report_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "hidden_at" timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_report_count_non_negative" CHECK ("comments"."report_count" >= 0);