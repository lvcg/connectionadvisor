const protectedPaths = ["/dashboard", "/expenses", "/maintenance", "/appliances", "/vendors", "/projects", "/vehicles", "/scanner", "/reports", "/settings"];

export function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function sanitizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isSafeInternalPath(value: string | null | undefined) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !value.includes("://"));
}

export function safeNextPath(value: string | null | undefined, fallback = "/dashboard") {
  return isSafeInternalPath(value) ? value as string : fallback;
}

export function passwordPolicyMessage(password: string) {
  if (password.length < 12) return "Use at least 12 characters.";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add at least one symbol.";
  return null;
}

export function friendlyAuthError(message?: string) {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("invalid login") || normalized.includes("invalid credentials")) {
    return "The email or password is not correct.";
  }
  if (normalized.includes("email rate limit")) {
    return "Too many emails were requested. Wait a few minutes, then try again.";
  }
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "That email may already have an account. Try logging in or use password recovery.";
  }
  if (normalized.includes("provider")) {
    return "This sign-in method is not enabled yet. Enable Google in Supabase Auth, then add the Google Client ID and Client Secret.";
  }
  return message || "Something went wrong. Please try again.";
}
