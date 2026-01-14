"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({
  variant = "outline",
  size = "default",
  className = "",
  children,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await signOut();
    } catch (err) {
      console.error("Unexpected logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {children || "Logout"}
    </Button>
  );
}
