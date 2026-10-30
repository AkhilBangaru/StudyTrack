CREATE TABLE "study_records" (
	"owner" text,
	"id" text,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"due" text DEFAULT '' NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "study_records_pkey" PRIMARY KEY("owner","id")
);
