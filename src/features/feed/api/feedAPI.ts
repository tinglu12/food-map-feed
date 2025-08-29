import { createClient } from "@/utils/supabase/client";

export const getFeed = async () => {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Get one random unwatched video
  const { data: unwatchedVideo, error: unwatchedVideoError } = await supabase.rpc(
    "get_one_unwatched_video",
    {
      user_uuid: user.id,
    },
  );

  if (unwatchedVideoError) {
    console.error("Error fetching unwatched video:", unwatchedVideoError);
    throw unwatchedVideoError;
  }

  const { error: watchedVideoError } = await supabase
    .from("watched_videos")
    .insert({
      user_id: user.id,
      video_id: unwatchedVideo?.[0].id,
    })
    .select()
    .single();

  if (watchedVideoError && watchedVideoError.code !== "23505") {
    // Ignore unique constraint violations
    console.error("Error marking video as watched:", watchedVideoError);
    throw watchedVideoError;
  }

  // Return the video or null if no unwatched videos
  return unwatchedVideo?.[0] || null;
};
