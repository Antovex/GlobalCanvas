// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  enableLogs: process.env.NODE_ENV !== 'production',
  integrations: [
    Sentry.replayIntegration(),
  ],
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
  enabled: Boolean(dsn)
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;