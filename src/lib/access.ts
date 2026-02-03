export const ACCESS_CODE = "imfat";
const ACCESS_KEY = "calorieai_access";

export function hasAccess(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ACCESS_KEY) === "granted";
}

export function setAccess(granted: boolean) {
  if (typeof window === "undefined") return;
  if (granted) {
    localStorage.setItem(ACCESS_KEY, "granted");
  } else {
    localStorage.removeItem(ACCESS_KEY);
  }
}

export function validateAccessCode(input: string): boolean {
  return input.trim().toLowerCase() === ACCESS_CODE;
}
