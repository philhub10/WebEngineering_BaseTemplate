CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_role_valid" CHECK ("users"."role" IN ('user', 'moderator')),
	CONSTRAINT "users_password_hash_argon2" CHECK ("users"."password_hash" LIKE '$argon2%')
);
