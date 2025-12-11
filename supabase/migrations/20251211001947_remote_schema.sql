

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_one_unwatched_video"("user_uuid" "uuid") RETURNS TABLE("id" "text", "title" "text", "description" "text", "latitude" numeric, "longitude" numeric, "location_description" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "created_by" "uuid", "is_active" boolean, "is_favorited" boolean, "restaurant_name" "text", "restaurant_address" "text", "restaurant_rating" numeric, "restaurant_price_level" integer, "restaurant_photos" "text"[], "restaurant_reviews" json)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.latitude,
    v.longitude,
    v.location_description,
    v.created_at,
    v.updated_at,
    v.created_by,
    v.is_active,
    CASE WHEN vf.id IS NOT NULL THEN TRUE ELSE FALSE END as is_favorited,
    r.name as restaurant_name,
    r.address as restaurant_address,
    r.rating as restaurant_rating,
    r.price_level as restaurant_price_level,
    r.photos as restaurant_photos,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', rr.id,
          'author_name', rr.author_name,
          'comment', rr.comment,
          'rating', rr.rating,
          'created_at', rr.created_at
        )
      ) FROM restaurant_reviews rr WHERE rr.restaurant_id = r.id),
      '[]'::json
    ) as restaurant_reviews
  FROM videos v
  LEFT JOIN video_favorites vf ON v.id = vf.video_id AND vf.user_id = user_uuid
  LEFT JOIN restaurants r ON v.id = r.video_id
  WHERE v.is_active = TRUE 
    AND v.id NOT IN (
      SELECT video_id FROM watched_videos WHERE user_id = user_uuid
    )
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_one_unwatched_video"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_favorites"("user_uuid" "uuid") RETURNS TABLE("video_id" "text", "title" "text", "favorited_at" timestamp with time zone, "restaurant_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as video_id,
    v.title,
    vf.created_at as favorited_at,
    r.name as restaurant_name
  FROM video_favorites vf
  JOIN videos v ON vf.video_id = v.id
  LEFT JOIN restaurants r ON v.id = r.video_id
  WHERE vf.user_id = user_uuid AND v.is_active = TRUE
  ORDER BY vf.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_favorites"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_watched_videos"("user_uuid" "uuid") RETURNS TABLE("video_id" "text", "title" "text", "restaurant_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as video_id,
    v.title,
    r.name as restaurant_name
  FROM watched_videos wv
  JOIN videos v ON wv.video_id = v.id
  LEFT JOIN restaurants r ON v.id = r.video_id
  WHERE wv.user_id = user_uuid AND v.is_active = TRUE
  ORDER BY wv.id DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_watched_videos"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_videos_with_favorite_status"("user_uuid" "uuid") RETURNS TABLE("id" "text", "title" "text", "description" "text", "thumbnail_url" "text", "latitude" numeric, "longitude" numeric, "location_description" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "created_by" "uuid", "is_active" boolean, "is_favorited" boolean, "restaurant_name" "text", "restaurant_address" "text", "restaurant_rating" numeric, "restaurant_price_level" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.*,
    CASE WHEN vf.id IS NOT NULL THEN TRUE ELSE FALSE END as is_favorited,
    r.name as restaurant_name,
    r.address as restaurant_address,
    r.rating as restaurant_rating,
    r.price_level as restaurant_price_level
  FROM videos v
  LEFT JOIN video_favorites vf ON v.id = vf.video_id AND vf.user_id = user_uuid
  LEFT JOIN restaurants r ON v.id = r.video_id
  WHERE v.is_active = TRUE
  ORDER BY v.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_videos_with_favorite_status"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'email'
    );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_video_watched"("video_id_param" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO watched_videos (user_id, video_id)
  VALUES (auth.uid(), video_id_param)
  ON CONFLICT (user_id, video_id) DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."mark_video_watched"("video_id_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text",
    "avatar_url" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."restaurant_reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "author_name" "text",
    "comment" "text",
    "rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."restaurant_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."restaurants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "video_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "price_level" integer,
    "rating" numeric(3,2),
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "photos" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."restaurants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."video_favorites" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "video_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."video_favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."videos" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "thumbnail_url" "text",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "location_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."videos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."watched_videos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "video_id" "text" NOT NULL
);


ALTER TABLE "public"."watched_videos" OWNER TO "postgres";


ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurant_reviews"
    ADD CONSTRAINT "restaurant_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_video_id_key" UNIQUE ("video_id");



ALTER TABLE ONLY "public"."video_favorites"
    ADD CONSTRAINT "video_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."video_favorites"
    ADD CONSTRAINT "video_favorites_user_id_video_id_key" UNIQUE ("user_id", "video_id");



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."watched_videos"
    ADD CONSTRAINT "watched_videos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."watched_videos"
    ADD CONSTRAINT "watched_videos_user_id_video_id_key" UNIQUE ("user_id", "video_id");



CREATE INDEX "idx_restaurant_reviews_restaurant_id" ON "public"."restaurant_reviews" USING "btree" ("restaurant_id");



CREATE INDEX "idx_restaurants_location" ON "public"."restaurants" USING "btree" ("latitude", "longitude");



CREATE INDEX "idx_restaurants_video_id" ON "public"."restaurants" USING "btree" ("video_id");



CREATE INDEX "idx_video_favorites_created_at" ON "public"."video_favorites" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_video_favorites_user_id" ON "public"."video_favorites" USING "btree" ("user_id");



CREATE INDEX "idx_video_favorites_video_id" ON "public"."video_favorites" USING "btree" ("video_id");



CREATE INDEX "idx_videos_created_at" ON "public"."videos" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_videos_created_by" ON "public"."videos" USING "btree" ("created_by");



CREATE INDEX "idx_videos_location" ON "public"."videos" USING "btree" ("latitude", "longitude");



CREATE INDEX "idx_watched_videos_user_id" ON "public"."watched_videos" USING "btree" ("user_id");



CREATE INDEX "idx_watched_videos_video_id" ON "public"."watched_videos" USING "btree" ("video_id");



CREATE OR REPLACE TRIGGER "update_restaurants_updated_at" BEFORE UPDATE ON "public"."restaurants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_videos_updated_at" BEFORE UPDATE ON "public"."videos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurant_reviews"
    ADD CONSTRAINT "restaurant_reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."video_favorites"
    ADD CONSTRAINT "video_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."video_favorites"
    ADD CONSTRAINT "video_favorites_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."watched_videos"
    ADD CONSTRAINT "watched_videos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."watched_videos"
    ADD CONSTRAINT "watched_videos_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE CASCADE;



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Restaurant reviews are viewable by everyone" ON "public"."restaurant_reviews" FOR SELECT USING (true);



CREATE POLICY "Restaurants are viewable by everyone" ON "public"."restaurants" FOR SELECT USING (true);



CREATE POLICY "Users can create restaurant reviews" ON "public"."restaurant_reviews" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can create restaurants" ON "public"."restaurants" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can create their own favorites" ON "public"."video_favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own watched videos" ON "public"."watched_videos" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create videos" ON "public"."videos" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete their own favorites" ON "public"."video_favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own videos" ON "public"."videos" FOR DELETE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete their own watched videos" ON "public"."watched_videos" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own videos" ON "public"."videos" FOR UPDATE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update their own watched videos" ON "public"."watched_videos" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own favorites" ON "public"."video_favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own watched videos" ON "public"."watched_videos" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Videos are viewable by everyone" ON "public"."videos" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."restaurant_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."restaurants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."video_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."videos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."watched_videos" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_one_unwatched_video"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_one_unwatched_video"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_one_unwatched_video"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_favorites"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_favorites"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_favorites"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_watched_videos"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_watched_videos"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_watched_videos"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_videos_with_favorite_status"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_videos_with_favorite_status"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_videos_with_favorite_status"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_video_watched"("video_id_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_video_watched"("video_id_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_video_watched"("video_id_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."restaurant_reviews" TO "anon";
GRANT ALL ON TABLE "public"."restaurant_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurant_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."restaurants" TO "anon";
GRANT ALL ON TABLE "public"."restaurants" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurants" TO "service_role";



GRANT ALL ON TABLE "public"."video_favorites" TO "anon";
GRANT ALL ON TABLE "public"."video_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."video_favorites" TO "service_role";



GRANT ALL ON TABLE "public"."videos" TO "anon";
GRANT ALL ON TABLE "public"."videos" TO "authenticated";
GRANT ALL ON TABLE "public"."videos" TO "service_role";



GRANT ALL ON TABLE "public"."watched_videos" TO "anon";
GRANT ALL ON TABLE "public"."watched_videos" TO "authenticated";
GRANT ALL ON TABLE "public"."watched_videos" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


