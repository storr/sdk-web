import * as z from "@zod/mini";
import type {BadgeSdk} from "../sdk.ts";

export interface EmbedTemplatePageOptions {
  /**
   * id of the template to show
   */
  templateId: string;
  features?: TemplateEmbedFeatures | undefined;
  fonts?: FontSource[] | undefined;
  appearance?: AppearanceConfig | undefined;
}

/**
 * requires template:read
 */
export function embedTemplatePage(
  sdk: BadgeSdk,
  element: HTMLElement,
  options: EmbedTemplatePageOptions,
) {
  const {templateId, features, fonts, appearance} = options;
  const {workspaceHandle, permissions} = parseTokenPayload(sdk.token);

  validatePermissions(permissions, features);

  const iframe = createEmbedIframe({
    token: sdk.token,
    path: sdk.path,
    workspaceHandle,
    templateId,
    config: {
      features,
      fonts,
      appearance,
    },
  });

  element.replaceChildren(iframe);
}

interface CreateIframeOptions {
  token: string;
  path: string;
  workspaceHandle: string;
  templateId: string;
  config: TemplateEmbedConfig;
}

interface TemplateEmbedConfig {
  features?: TemplateEmbedFeatures | undefined;
  fonts?: FontSource[] | undefined;
  appearance?: AppearanceConfig | undefined;
}

export type FontSource = CssFontSource | CustomFontSource;

export interface CssFontSource {
  cssSrc: string;
}

export interface CustomFontSource {
  family: string;
  src: string;
  weight?:
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  style?: "normal" | "italic" | "oblique";
  unicodeRange?: string;
}

export interface AppearanceConfig {
  fontFamily?: string | undefined;
  colors?: {
    primary?: string | undefined;
    neutral?: string | undefined;
  };
}

export interface TemplateEmbedFeatures {
  passList?: boolean;
  templateEditor?: boolean;
  campaigns?: boolean;
  campaignEditor?: boolean;
}

function createEmbedIframe(options: CreateIframeOptions): HTMLIFrameElement {
  const {path, token, workspaceHandle, templateId, config} = options;

  const iframe = document.createElement("iframe");

  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  const iframeUrl = new URL(path);

  iframeUrl.searchParams.set("token", token);
  iframeUrl.searchParams.set("config", JSON.stringify(config));

  iframeUrl.hash = `/${workspaceHandle}/templates/${templateId}/overview`;

  iframe.src = iframeUrl.toString();

  return iframe;
}

function parseTokenPayload(token: string): SdkTokenPayload {
  const tokenPayloadResult = sdkTokenPayloadSchema.safeParse(
    JSON.parse(atob(token.split(".")[1] ?? "")),
  );

  if (!tokenPayloadResult.success) {
    throw new Error("Invalid token payload");
  }

  return tokenPayloadResult.data;
}

function validatePermissions(
  permissions: SdkTokenPayload["permissions"],
  features?: TemplateEmbedFeatures,
): void {
  const hasPermission = (scope: SdkScope, access: SdkAccess) =>
    access === "read"
      ? permissions.includes(`${scope}:read`) ||
        permissions.includes(`${scope}:write`)
      : permissions.includes(`${scope}:write`);

  if (!hasPermission("workspace", "read")) {
    throw new Error("workspace:read permission is required");
  }

  if (!hasPermission("user", "read")) {
    throw new Error("user:read permission is required");
  }

  if (!hasPermission("template", "read")) {
    throw new Error("template:read permission is required");
  }

  if (!features) {
    return;
  }

  if (features.passList && !hasPermission("pass", "read")) {
    throw new Error("passList feature requires pass:read permission");
  }

  if (features.templateEditor && !hasPermission("template", "write")) {
    throw new Error(
      "templateEditor feature requires template:write permission",
    );
  }

  if (features.campaigns && !hasPermission("campaign", "read")) {
    throw new Error("campaigns feature requires campaign:read permission");
  }

  if (features.campaignEditor && !hasPermission("campaign", "write")) {
    throw new Error(
      "campaignEditor feature requires campaign:write permission",
    );
  }
}

type SdkScope = z.infer<typeof sdkScopeSchema>;
const sdkScopeSchema = z.enum([
  "workspace",
  "template",
  "pass",
  "campaign",
  "user",
]);

type SdkAccess = z.infer<typeof sdkAccessSchema>;
const sdkAccessSchema = z.enum(["read", "write"]);

const sdkPermissionsSchema = z.templateLiteral([
  sdkScopeSchema,
  ":",
  sdkAccessSchema,
]);

type SdkTokenPayload = z.infer<typeof sdkTokenPayloadSchema>;
const sdkTokenPayloadSchema = z.object({
  workspaceHandle: z.string(),
  permissions: z.array(sdkPermissionsSchema),
});
