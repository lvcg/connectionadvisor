const purchaseLink = process.env.NEXT_PUBLIC_REVENUECAT_PURCHASE_LINK || "";

type PurchaseLinkOptions = {
  appUserId?: string | null;
  email?: string | null;
  allowAnonymous?: boolean;
};

export function hasRevenueCatPurchaseLink() {
  return Boolean(purchaseLink);
}

export function createRevenueCatPurchaseUrl({ appUserId, email, allowAnonymous = false }: PurchaseLinkOptions = {}) {
  if (!purchaseLink) return "/settings#plan";
  if (!appUserId && !allowAnonymous) return "/login?next=/settings%23plan";

  const encodedUserId = appUserId ? encodeURIComponent(appUserId) : "";
  const urlWithUser = encodedUserId ? `${purchaseLink.replace(/\/$/, "")}/${encodedUserId}` : purchaseLink;
  let url: URL;

  try {
    url = new URL(urlWithUser);
  } catch {
    return "/settings#plan";
  }

  if (email) url.searchParams.set("email", email);
  url.searchParams.set("skip_purchase_success", "true");

  return url.toString();
}
