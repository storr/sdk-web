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
): void {
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
  permissions: SdkPermission[],
  features?: TemplateEmbedFeatures,
): void {
  const hasPermission = (validPermissionSets: SdkPermission[][]) => {
    return validPermissionSets.every((permissionSet) =>
      permissionSet.some((permission) => permissions.includes(permission)),
    );
  };

  if (!hasPermission(REQUIRED_PERMISSIONS.base)) {
    throw new Error(
      "workspace:read, user:read, and template:read permissions are required",
    );
  }

  if (!features) {
    return;
  }

  if (features.passList && !hasPermission(REQUIRED_PERMISSIONS.passList)) {
    throw new Error("passList feature requires pass:read permission");
  }

  if (
    features.templateEditor &&
    !hasPermission(REQUIRED_PERMISSIONS.templateEditor)
  ) {
    throw new Error(
      "templateEditor feature requires template:write permission",
    );
  }

  if (features.campaigns && !hasPermission(REQUIRED_PERMISSIONS.campaigns)) {
    throw new Error("campaigns feature requires campaign:read permission");
  }

  if (
    features.campaignEditor &&
    !hasPermission(REQUIRED_PERMISSIONS.campaignEditor)
  ) {
    throw new Error(
      "campaignEditor feature requires campaign:write permission",
    );
  }
}

type SdkPermission = z.infer<typeof sdkPermissionSchema>;
const sdkPermissionSchema = z.enum([
  "workspace:read",
  "workspace:write",
  "template:read",
  "template:write",
  "pass:read",
  "pass:write",
  "campaign:read",
  "campaign:write",
  "user:read",
  "user:write",
]);

type SdkTokenPayload = z.infer<typeof sdkTokenPayloadSchema>;
const sdkTokenPayloadSchema = z.object({
  workspaceHandle: z.string(),
  permissions: z.array(sdkPermissionSchema),
});

// Each feature requires at least one permission from each inner permission set
const REQUIRED_PERMISSIONS: Record<
  keyof TemplateEmbedFeatures | "base",
  SdkPermission[][]
> = {
  base: [
    ["workspace:read", "workspace:write"],
    ["user:read", "user:write"],
    ["template:read", "template:write"],
  ],
  passList: [["pass:read", "pass:write"]],
  templateEditor: [["template:write"]],
  campaigns: [["campaign:read", "campaign:write"]],
  campaignEditor: [["campaign:write"]],
};
