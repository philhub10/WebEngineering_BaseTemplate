CREATE TABLE "bears" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"binomial" text NOT NULL,
	"image_url" text,
	"range" text NOT NULL,
	"position" integer NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bears_binomial_unique" UNIQUE("binomial")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"bear_id" text NOT NULL,
	"author" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comments_author_length" CHECK (char_length("comments"."author") BETWEEN 1 AND 80),
	CONSTRAINT "comments_text_length" CHECK (char_length("comments"."text") BETWEEN 1 AND 2000)
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_bear_id_bears_id_fk" FOREIGN KEY ("bear_id") REFERENCES "public"."bears"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_bear_created_idx" ON "comments" USING btree ("bear_id","created_at","id");