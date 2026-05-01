import type { User } from "@/types/user";

export function isAuthenticated(user: User | null | undefined): user is User {
  return Boolean(user?.id);
}

export function createPlaceholderUser(): User {
  return {
    id: "preview-customer",
    name: "Preview Customer",
    email: "customer@wicked.local",
    phone: "+27 82 555 0140",
    createdAt: "2026-04-29T00:00:00.000Z",
    addresses: [
      {
        id: "addr-preview-1",
        label: "Default delivery",
        recipientName: "Preview Customer",
        phone: "+27 82 555 0140",
        line1: "18 Bree Street",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "8001",
        country: "South Africa",
        isDefault: true,
      },
    ],
    preferences: {
      marketingEmails: true,
      orderSmsUpdates: true,
    },
  };
}

export async function getCurrentUser(): Promise<User | null> {
  // TODO(auth): Replace this with backend session claims from cookies/JWT and
  // a database lookup. This placeholder is intentionally opt-in so it is not
  // mistaken for production authentication.
  if (process.env.WICKED_PREVIEW_AUTH !== "true") {
    return null;
  }

  return createPlaceholderUser();
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  return isAuthenticated(user) ? user : null;
}
