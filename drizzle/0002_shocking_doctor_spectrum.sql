ALTER TABLE "restaurants" DROP CONSTRAINT "restaurants_description_unique";--> statement-breakpoint
ALTER TABLE "restaurants" ALTER COLUMN "description" DROP NOT NULL;