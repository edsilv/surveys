import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "response_items" ADD COLUMN "sentiment" numeric;
  CREATE INDEX "response_items_sentiment_idx" ON "response_items" USING btree ("sentiment");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "response_items_sentiment_idx";
  ALTER TABLE "response_items" DROP COLUMN "sentiment";`)
}
