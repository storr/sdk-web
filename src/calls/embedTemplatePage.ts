import type {BadgeSdk} from "../sdk.ts";

export interface TemplateOptions {
  /**
   * id of the template to show
   */
  templateId: string;
}

/**
 * requires template:read
 */
export function embedTemplatePage(
  sdk: BadgeSdk,
  element: HTMLElement,
  options: TemplateOptions,
) {
  const {templateId} = options;
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

  element.innerHTML = `<iframe src="${sdk.path}?token=${sdk.token}#/${workspaceHandle}/templates/${templateId}/overview" style="${IFRAME_STYLE}" />`;
}

const IFRAME_STYLE = ["width: 100%", "height: 100%", "border: none"].join(";");
