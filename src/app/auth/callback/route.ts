import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/feed";

  console.log("Auth callback received:", { code: !!code, token_hash: !!token_hash, type, next });

  const supabase = await createClient();

  // Handle OAuth callback (Google, GitHub, etc.)
  if (code) {
    console.log("Processing OAuth callback with code");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log("OAuth successful, redirecting to:", next);
      redirect(next);
    } else {
      console.error("OAuth error:", error);
      redirect("/error");
    }
  }

  // Handle email OTP verification
  if (token_hash && type) {
    console.log("Processing email OTP verification");
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      console.log("OTP successful, redirecting to:", next);
      redirect(next);
    } else {
      console.error("OTP error:", error);
      redirect("/error");
    }
  }

  // If neither code nor token_hash is present, redirect to error
  console.log("No valid auth parameters found");
  redirect("/error");
}
