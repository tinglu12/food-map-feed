-- Enable UUID extension for user IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Videos table to store video metadata
CREATE TABLE videos (
  id TEXT PRIMARY KEY, -- YouTube video ID (e.g., "dQw4w9WgXcQ")
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  latitude DECIMAL(10, 8), -- For location data
  longitude DECIMAL(11, 8), -- For location data
  location_description TEXT, -- From YouTube recordingDetails
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Restaurants table to store restaurant data from Google Places
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  price_level INTEGER, -- 0-4 scale
  rating DECIMAL(3, 2), -- 0.0-5.0 scale
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id) -- One restaurant per video
);

-- Restaurant reviews table
CREATE TABLE restaurant_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT,
  comment TEXT,
  rating INTEGER, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watched videos table to track if user has seen a video
CREATE TABLE watched_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, video_id) -- One record per user per video
);

-- Favorites table for user-video relationships
CREATE TABLE video_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id) -- Prevent duplicate favorites
);

-- Indexes for better performance
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_location ON videos(latitude, longitude);
CREATE INDEX idx_videos_created_by ON videos(created_by);
CREATE INDEX idx_restaurants_video_id ON restaurants(video_id);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurant_reviews_restaurant_id ON restaurant_reviews(restaurant_id);
CREATE INDEX idx_watched_videos_user_id ON watched_videos(user_id);
CREATE INDEX idx_watched_videos_video_id ON watched_videos(video_id);

CREATE INDEX idx_video_favorites_user_id ON video_favorites(user_id);
CREATE INDEX idx_video_favorites_video_id ON video_favorites(video_id);
CREATE INDEX idx_video_favorites_created_at ON video_favorites(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos table
CREATE POLICY "Videos are viewable by everyone" ON videos
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can create videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for restaurants table
CREATE POLICY "Restaurants are viewable by everyone" ON restaurants
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create restaurants" ON restaurants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for restaurant_reviews table
CREATE POLICY "Restaurant reviews are viewable by everyone" ON restaurant_reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create restaurant reviews" ON restaurant_reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for watched_videos table
CREATE POLICY "Users can view their own watched videos" ON watched_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watched videos" ON watched_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watched videos" ON watched_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watched videos" ON watched_videos
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for video_favorites table
CREATE POLICY "Users can view their own favorites" ON video_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" ON video_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON video_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to mark video as watched (simple insert)
CREATE OR REPLACE FUNCTION mark_video_watched(video_id_param TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO watched_videos (user_id, video_id)
  VALUES (auth.uid(), video_id_param)
  ON CONFLICT (user_id, video_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- Function to get user's watched videos
CREATE OR REPLACE FUNCTION get_user_watched_videos(user_uuid UUID)
RETURNS TABLE (
  video_id TEXT,
  title TEXT,
  restaurant_name TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's favorite videos
CREATE OR REPLACE FUNCTION get_user_favorites(user_uuid UUID)
RETURNS TABLE (
  video_id TEXT,
  title TEXT,
  favorited_at TIMESTAMP WITH TIME ZONE,
  restaurant_name TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- Function to get one random unwatched video for a user
CREATE OR REPLACE FUNCTION get_one_unwatched_video(user_uuid UUID)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  is_active BOOLEAN,
  is_favorited BOOLEAN,
  restaurant_name TEXT,
  restaurant_address TEXT,
  restaurant_rating DECIMAL(3, 2),
  restaurant_price_level INTEGER,
  restaurant_photos TEXT[],
  restaurant_reviews JSON
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's watch history statistics
RETURNS TABLE (
  total_videos_watched INTEGER,
  total_watch_time INTEGER,
  completed_videos INTEGER,
  favorite_videos INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT wv.video_id)::INTEGER as total_videos_watched,
    0::INTEGER as total_watch_time, -- No longer tracking duration
    0::INTEGER as completed_videos, -- No longer tracking completion
    COUNT(DISTINCT vf.video_id)::INTEGER as favorite_videos
  FROM watched_videos wv
  LEFT JOIN video_favorites vf ON wv.video_id = vf.video_id AND vf.user_id = user_uuid
  WHERE wv.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
