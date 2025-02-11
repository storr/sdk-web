import type {BadgeSdk} from "../sdk.ts";

export interface TemplateOptions {
  /**
   * id of the template to show
   */
  templateId: string;
  features?: TemplateEmbedFeatures | undefined;
}

/**
 * requires template:read
 */
export function embedTemplatePage(
  sdk: BadgeSdk,
  element: HTMLElement,
  options: TemplateOptions,
) {
  const {templateId, features} = options;
  const tokenPayload = JSON.parse(atob(sdk.token.split(".")[1] ?? ""));

  if (
    !(
      tokenPayload !== null &&
      typeof tokenPayload === "object" &&
      "workspaceHandle" in tokenPayload &&
      typeof tokenPayload.workspaceHandle === "string"
    )
  ) {
    throw new Error("Invalid token payload");
  }

  const {workspaceHandle} = tokenPayload;

  const iframe = createEmbedIframe({
    token: sdk.token,
    path: sdk.path,
    workspaceHandle,
    templateId,
    config: {
      features,
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
}

export interface TemplateEmbedFeatures {
  passList?: boolean;
  templateEditor?: boolean;
  campaigns?: boolean;
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
