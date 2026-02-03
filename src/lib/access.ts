// Client-side access utilities - uses secure server-side session

let cachedAuth: boolean | null = null;

export async function checkAccess(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth", { method: "GET" });
    const data = await response.json();
    cachedAuth = data.authenticated === true;
    return cachedAuth;
  } catch {
    return false;
  }
}

export async function validateAndSetAccess(code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (data.success) {
      cachedAuth = true;
      return { success: true };
    }

    return { success: false, error: data.error || "Invalid code" };
  } catch {
    return { success: false, error: "Connection failed" };
  }
}

export async function clearAccess(): Promise<void> {
  try {
    await fetch("/api/auth", { method: "DELETE" });
    cachedAuth = false;
  } catch {
    // Ignore errors
  }
}

// Sync check using cached value (for initial render)
export function hasAccessCached(): boolean {
  return cachedAuth === true;
}
