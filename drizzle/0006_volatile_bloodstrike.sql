ALTER TABLE "auth-links" DROP CONSTRAINT "auth-links_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "auth-links" ADD CONSTRAINT "auth-links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;