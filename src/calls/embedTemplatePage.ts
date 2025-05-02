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

  validatePermissions(permissions, features ?? {});

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
  features: TemplateEmbedFeatures,
): void {
  const hasPermission = (validPermissionSets: SdkPermission[][]) => {
    return validPermissionSets.every((permissionSet) =>
      permissionSet.some((permission) => permissions.includes(permission)),
    );
  };

  if (!hasPermission(REQUIRED_PERMISSIONS)) {
    throw new Error(
      REQUIRED_PERMISSIONS.map((set) => set.join(" or ")).join(", ") +
        " permissions are required",
    );
  }

  const failedPermissions = Object.entries(features)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => ({
      feature,
      permissions:
        REQUIRED_PERMISSIONS_BY_FEATURE[feature as keyof TemplateEmbedFeatures],
    }))
    .filter(({permissions}) => permissions !== undefined)
    .filter(({permissions}) => !hasPermission(permissions));

  if (failedPermissions.length > 0) {
    throw new Error(
      failedPermissions
        .map(
          ({feature, permissions}) =>
            `${feature} feature requires ${permissions.map((set) => set.join(" or ")).join(", ")} permission(s)`,
        )
        .join("\n"),
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

const REQUIRED_PERMISSIONS: SdkPermission[][] = [
  ["workspace:read", "workspace:write"],
  ["user:read", "user:write"],
  ["template:read", "template:write"],
];

// Each feature requires at least one permission from each inner permission set
const REQUIRED_PERMISSIONS_BY_FEATURE: Record<
  keyof TemplateEmbedFeatures,
  SdkPermission[][]
> = {
  passList: [["pass:read", "pass:write"]],
  templateEditor: [["template:write"]],
  campaigns: [["campaign:read", "campaign:write"]],
  campaignEditor: [["campaign:write"]],
};
