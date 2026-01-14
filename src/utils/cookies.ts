const TOKEN_KEY = "access_token";

/**
 * Get access token from cookies using native browser API
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((cookie) => cookie.startsWith(`${TOKEN_KEY}=`));
  
  if (tokenCookie) {
    return tokenCookie.split("=")[1] || null;
  }
  
  return null;
}

/**
 * Set access token in cookies using native browser API
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  
  const expiresInDays = 7;
  const date = new Date();
  date.setTime(date.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
  const expires = date.toUTCString();
  
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=${token}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

/**
 * Remove access token from cookies using native browser API
 */
export function removeAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
