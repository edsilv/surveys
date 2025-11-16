import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "respondents_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "respondents" (
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
  
  ALTER TABLE "members_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "members_sessions" CASCADE;
  DROP TABLE "members" CASCADE;
  ALTER TABLE "surveys_rels" DROP CONSTRAINT "surveys_rels_members_fk";
  
  ALTER TABLE "survey_responses" DROP CONSTRAINT "survey_responses_member_id_members_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_members_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_members_fk";
  
  DROP INDEX "surveys_rels_members_id_idx";
  DROP INDEX "survey_responses_member_idx";
  DROP INDEX "payload_locked_documents_rels_members_id_idx";
  DROP INDEX "payload_preferences_rels_members_id_idx";
  ALTER TABLE "surveys_rels" ADD COLUMN "respondents_id" integer;
  ALTER TABLE "survey_responses" ADD COLUMN "respondent_id" integer NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "respondents_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "respondents_id" integer;
  ALTER TABLE "respondents_sessions" ADD CONSTRAINT "respondents_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."respondents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "respondents_sessions_order_idx" ON "respondents_sessions" USING btree ("_order");
  CREATE INDEX "respondents_sessions_parent_id_idx" ON "respondents_sessions" USING btree ("_parent_id");
  CREATE INDEX "respondents_updated_at_idx" ON "respondents" USING btree ("updated_at");
  CREATE INDEX "respondents_created_at_idx" ON "respondents" USING btree ("created_at");
  CREATE UNIQUE INDEX "respondents_email_idx" ON "respondents" USING btree ("email");
  ALTER TABLE "surveys_rels" ADD CONSTRAINT "surveys_rels_respondents_fk" FOREIGN KEY ("respondents_id") REFERENCES "public"."respondents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_respondent_id_respondents_id_fk" FOREIGN KEY ("respondent_id") REFERENCES "public"."respondents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_respondents_fk" FOREIGN KEY ("respondents_id") REFERENCES "public"."respondents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_respondents_fk" FOREIGN KEY ("respondents_id") REFERENCES "public"."respondents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "surveys_rels_respondents_id_idx" ON "surveys_rels" USING btree ("respondents_id");
  CREATE INDEX "survey_responses_respondent_idx" ON "survey_responses" USING btree ("respondent_id");
  CREATE INDEX "payload_locked_documents_rels_respondents_id_idx" ON "payload_locked_documents_rels" USING btree ("respondents_id");
  CREATE INDEX "payload_preferences_rels_respondents_id_idx" ON "payload_preferences_rels" USING btree ("respondents_id");
  ALTER TABLE "surveys_rels" DROP COLUMN "members_id";
  ALTER TABLE "survey_responses" DROP COLUMN "member_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "members_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "members_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  
  ALTER TABLE "respondents_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "respondents" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "respondents_sessions" CASCADE;
  DROP TABLE "respondents" CASCADE;
  ALTER TABLE "surveys_rels" DROP CONSTRAINT "surveys_rels_respondents_fk";
  
  ALTER TABLE "survey_responses" DROP CONSTRAINT "survey_responses_respondent_id_respondents_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_respondents_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_respondents_fk";
  
  DROP INDEX "surveys_rels_respondents_id_idx";
  DROP INDEX "survey_responses_respondent_idx";
  DROP INDEX "payload_locked_documents_rels_respondents_id_idx";
  DROP INDEX "payload_preferences_rels_respondents_id_idx";
  ALTER TABLE "surveys_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "survey_responses" ADD COLUMN "member_id" integer NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "members_sessions_order_idx" ON "members_sessions" USING btree ("_order");
  CREATE INDEX "members_sessions_parent_id_idx" ON "members_sessions" USING btree ("_parent_id");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  ALTER TABLE "surveys_rels" ADD CONSTRAINT "surveys_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "surveys_rels_members_id_idx" ON "surveys_rels" USING btree ("members_id");
  CREATE INDEX "survey_responses_member_idx" ON "survey_responses" USING btree ("member_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_preferences_rels_members_id_idx" ON "payload_preferences_rels" USING btree ("members_id");
  ALTER TABLE "surveys_rels" DROP COLUMN "respondents_id";
  ALTER TABLE "survey_responses" DROP COLUMN "respondent_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "respondents_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "respondents_id";`)
}
