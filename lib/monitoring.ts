type ErrorPayload = {
  message: string;
  stack?: string;
  digest?: string;
  route?: string;
};

export function reportClientError(error: ErrorPayload) {
  if (typeof window === "undefined") return;

  navigator.sendBeacon?.(
    "/api/monitoring/errors",
    new Blob([JSON.stringify({
      ...error,
      route: error.route || window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    })], { type: "application/json" }),
  );
}
