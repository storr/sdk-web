import type {BadgeSdk} from "../sdk.ts";

export interface SdkOptions {
  token: string;
  path?: string;
}

export function makeSdk(options: SdkOptions): BadgeSdk {
  return {
    token: options.token,
    path: options.path ?? "https://app.trybadge.com/_embed",
  };
}
