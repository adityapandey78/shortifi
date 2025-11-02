CREATE TABLE "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"ip" varchar(45),
	"user_agent" text,
	"referer" varchar(1024),
	"device_type" varchar(50),
	"device_vendor" varchar(100),
	"device_model" varchar(100),
	"browser" varchar(50),
	"browser_version" varchar(50),
	"os" varchar(50),
	"os_version" varchar(50),
	"country" varchar(100),
	"region" varchar(100),
	"city" varchar(100),
	"timezone" varchar(100),
	"clicked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "short_links" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "short_links" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "short_links" ADD COLUMN "click_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "short_links" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_link_id_short_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."short_links"("id") ON DELETE cascade ON UPDATE no action;