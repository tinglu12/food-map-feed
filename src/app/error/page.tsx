"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const ErrorPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            An error occurred while processing your request. Please try again or navigate to a
            different page.
          </p>

          <div className="space-y-3">
            <Button onClick={() => router.push("/")} className="w-full" variant="default">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>

            <Button onClick={() => router.push("/login")} className="w-full" variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Go to Login
            </Button>

            <Button onClick={() => router.push("/signup")} className="w-full" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Go to Signup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
