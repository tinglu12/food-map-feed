-- Reset database - Drop existing tables and functions
-- WARNING: This will delete all data!

-- Drop triggers first (due to dependencies)
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;

-- Drop functions (after triggers are dropped)
DROP FUNCTION IF EXISTS get_user_watch_stats(UUID);
DROP FUNCTION IF EXISTS get_user_favorites(UUID);
DROP FUNCTION IF EXISTS get_user_watched_videos(UUID);
DROP FUNCTION IF EXISTS get_videos_with_status(UUID);
DROP FUNCTION IF EXISTS mark_video_watched(TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS restaurant_reviews CASCADE;
DROP TABLE IF EXISTS video_favorites CASCADE;
DROP TABLE IF EXISTS watched_videos CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS videos CASCADE;

-- Now run the new schema from database_schema.sql
