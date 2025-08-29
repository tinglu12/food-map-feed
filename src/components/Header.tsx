import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LogoutButton from "./auth/LogoutButton";
import UserProfile from "./auth/UserProfile";

export const Header = () => {
  return (
    <header className="flex gap-2 justify-between items-center w-full p-4 ">
      <div className="flex gap-2 justify-start items-center">
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/feed">Feed</Link>
        </Button>
      </div>
      <div className="flex gap-2">
        <UserProfile />
      </div>
    </header>
  );
};
