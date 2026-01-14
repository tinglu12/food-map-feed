"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "@/utils/cookies";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract access_token from URL query parameters
    const accessToken = searchParams.get("access_token");
    const error = searchParams.get("error");

    if (error) {
      // Handle error case
      console.error("Auth error:", error);
      router.push("/error");
      return;
    }

    if (accessToken) {
      // Store the access token in cookies
      setAccessToken(accessToken);

      console.log("Access token stored successfully");

      // Redirect to main app/dashboard
      router.push("/feed");
    } else {
      // No access token found, redirect to error page
      console.error("No access token found in callback");
      router.push("/error");
    }
  }, [searchParams, router]);

  // Show loading state while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
