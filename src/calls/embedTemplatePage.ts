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
  const tokenPayload = parseTokenPayload(sdk.token);

  const {workspaceHandle} = tokenPayload;

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

function parseTokenPayload(
  token: string,
): z.infer<typeof sdkTokenPayloadSchema> {
  const tokenPayloadResult = sdkTokenPayloadSchema.safeParse(
    JSON.parse(atob(token.split(".")[1] ?? "")),
  );

  if (!tokenPayloadResult.success) {
    throw new Error("Invalid token payload");
  }

  return tokenPayloadResult.data;
}

const permissionsSchema = z.templateLiteral([
  z.enum(["template", "pass", "campaign", "user"]),
  ":",
  z.enum(["read", "write"]),
]);

const sdkTokenPayloadSchema = z.object({
  workspaceId: z.string(),
  workspaceHandle: z.string(),
  templateId: z.optional(z.string()),
  permissions: z.array(permissionsSchema),
});
