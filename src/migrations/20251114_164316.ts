import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_questions_type" AS ENUM('text', 'textarea', 'multiple_choice', 'multiple_select', 'multiple_select_with_other', 'rating', 'yes_no');
  CREATE TYPE "public"."enum_response_items_question_type" AS ENUM('text', 'textarea', 'multiple_choice', 'multiple_select', 'multiple_select_with_other', 'rating', 'yes_no');
  CREATE TABLE "members_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "questions_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"type" "enum_questions_type" NOT NULL,
  	"scale" numeric,
  	"validation_required" boolean DEFAULT false,
  	"validation_min_length" numeric,
  	"validation_max_length" numeric,
  	"validation_min_choices" numeric,
  	"validation_max_choices" numeric,
  	"condition_question_id" integer,
  	"condition_value" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "surveys_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_id" integer NOT NULL
  );
  
  CREATE TABLE "surveys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"description" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "surveys_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"members_id" integer
  );
  
  CREATE TABLE "survey_responses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"survey_id" integer NOT NULL,
  	"member_id" integer NOT NULL,
  	"completed" boolean DEFAULT false,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "response_items_array_value" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "response_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"survey_response_id" integer NOT NULL,
  	"question_id" integer NOT NULL,
  	"question_slug" varchar NOT NULL,
  	"question_type" "enum_response_items_question_type" NOT NULL,
  	"text_value" varchar,
  	"number_value" numeric,
  	"boolean_value" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "questions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "surveys_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "survey_responses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "response_items_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "questions_options" ADD CONSTRAINT "questions_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "questions" ADD CONSTRAINT "questions_condition_question_id_questions_id_fk" FOREIGN KEY ("condition_question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "surveys_questions" ADD CONSTRAINT "surveys_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "surveys_questions" ADD CONSTRAINT "surveys_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "surveys_rels" ADD CONSTRAINT "surveys_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "surveys_rels" ADD CONSTRAINT "surveys_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "response_items_array_value" ADD CONSTRAINT "response_items_array_value_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."response_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "response_items" ADD CONSTRAINT "response_items_survey_response_id_survey_responses_id_fk" FOREIGN KEY ("survey_response_id") REFERENCES "public"."survey_responses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "response_items" ADD CONSTRAINT "response_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "members_sessions_order_idx" ON "members_sessions" USING btree ("_order");
  CREATE INDEX "members_sessions_parent_id_idx" ON "members_sessions" USING btree ("_parent_id");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  CREATE INDEX "questions_options_order_idx" ON "questions_options" USING btree ("_order");
  CREATE INDEX "questions_options_parent_id_idx" ON "questions_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "questions_slug_idx" ON "questions" USING btree ("slug");
  CREATE INDEX "questions_condition_condition_question_idx" ON "questions" USING btree ("condition_question_id");
  CREATE INDEX "questions_updated_at_idx" ON "questions" USING btree ("updated_at");
  CREATE INDEX "questions_created_at_idx" ON "questions" USING btree ("created_at");
  CREATE INDEX "surveys_questions_order_idx" ON "surveys_questions" USING btree ("_order");
  CREATE INDEX "surveys_questions_parent_id_idx" ON "surveys_questions" USING btree ("_parent_id");
  CREATE INDEX "surveys_questions_question_idx" ON "surveys_questions" USING btree ("question_id");
  CREATE UNIQUE INDEX "surveys_slug_idx" ON "surveys" USING btree ("slug");
  CREATE INDEX "surveys_updated_at_idx" ON "surveys" USING btree ("updated_at");
  CREATE INDEX "surveys_created_at_idx" ON "surveys" USING btree ("created_at");
  CREATE INDEX "surveys_rels_order_idx" ON "surveys_rels" USING btree ("order");
  CREATE INDEX "surveys_rels_parent_idx" ON "surveys_rels" USING btree ("parent_id");
  CREATE INDEX "surveys_rels_path_idx" ON "surveys_rels" USING btree ("path");
  CREATE INDEX "surveys_rels_members_id_idx" ON "surveys_rels" USING btree ("members_id");
  CREATE INDEX "survey_responses_survey_idx" ON "survey_responses" USING btree ("survey_id");
  CREATE INDEX "survey_responses_member_idx" ON "survey_responses" USING btree ("member_id");
  CREATE INDEX "survey_responses_completed_idx" ON "survey_responses" USING btree ("completed");
  CREATE INDEX "survey_responses_completed_at_idx" ON "survey_responses" USING btree ("completed_at");
  CREATE INDEX "survey_responses_updated_at_idx" ON "survey_responses" USING btree ("updated_at");
  CREATE INDEX "survey_responses_created_at_idx" ON "survey_responses" USING btree ("created_at");
  CREATE INDEX "response_items_array_value_order_idx" ON "response_items_array_value" USING btree ("_order");
  CREATE INDEX "response_items_array_value_parent_id_idx" ON "response_items_array_value" USING btree ("_parent_id");
  CREATE INDEX "response_items_survey_response_idx" ON "response_items" USING btree ("survey_response_id");
  CREATE INDEX "response_items_question_idx" ON "response_items" USING btree ("question_id");
  CREATE INDEX "response_items_question_slug_idx" ON "response_items" USING btree ("question_slug");
  CREATE INDEX "response_items_question_type_idx" ON "response_items" USING btree ("question_type");
  CREATE INDEX "response_items_text_value_idx" ON "response_items" USING btree ("text_value");
  CREATE INDEX "response_items_number_value_idx" ON "response_items" USING btree ("number_value");
  CREATE INDEX "response_items_boolean_value_idx" ON "response_items" USING btree ("boolean_value");
  CREATE INDEX "response_items_updated_at_idx" ON "response_items" USING btree ("updated_at");
  CREATE INDEX "response_items_created_at_idx" ON "response_items" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_questions_fk" FOREIGN KEY ("questions_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_surveys_fk" FOREIGN KEY ("surveys_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_survey_responses_fk" FOREIGN KEY ("survey_responses_id") REFERENCES "public"."survey_responses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_response_items_fk" FOREIGN KEY ("response_items_id") REFERENCES "public"."response_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("questions_id");
  CREATE INDEX "payload_locked_documents_rels_surveys_id_idx" ON "payload_locked_documents_rels" USING btree ("surveys_id");
  CREATE INDEX "payload_locked_documents_rels_survey_responses_id_idx" ON "payload_locked_documents_rels" USING btree ("survey_responses_id");
  CREATE INDEX "payload_locked_documents_rels_response_items_id_idx" ON "payload_locked_documents_rels" USING btree ("response_items_id");
  CREATE INDEX "payload_preferences_rels_members_id_idx" ON "payload_preferences_rels" USING btree ("members_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "members_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "surveys_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "surveys" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "surveys_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "survey_responses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "response_items_array_value" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "response_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "members_sessions" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "questions_options" CASCADE;
  DROP TABLE "questions" CASCADE;
  DROP TABLE "surveys_questions" CASCADE;
  DROP TABLE "surveys" CASCADE;
  DROP TABLE "surveys_rels" CASCADE;
  DROP TABLE "survey_responses" CASCADE;
  DROP TABLE "response_items_array_value" CASCADE;
  DROP TABLE "response_items" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_members_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_questions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_surveys_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_survey_responses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_response_items_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_members_fk";
  
  DROP INDEX "payload_locked_documents_rels_members_id_idx";
  DROP INDEX "payload_locked_documents_rels_questions_id_idx";
  DROP INDEX "payload_locked_documents_rels_surveys_id_idx";
  DROP INDEX "payload_locked_documents_rels_survey_responses_id_idx";
  DROP INDEX "payload_locked_documents_rels_response_items_id_idx";
  DROP INDEX "payload_preferences_rels_members_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "members_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "questions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "surveys_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "survey_responses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "response_items_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "members_id";
  DROP TYPE "public"."enum_questions_type";
  DROP TYPE "public"."enum_response_items_question_type";`)
}
