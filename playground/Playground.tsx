import * as badge from "@badge-sdk/web";
import {
  AppShell,
  Burger,
  Button,
  Code,
  Collapse,
  ColorInput,
  Group,
  MultiSelect,
  Select,
  Stack,
  Switch,
  TextInput,
  Title,
} from "@mantine/core";
import {
  useDebouncedCallback,
  useDisclosure,
  useLocalStorage,
} from "@mantine/hooks";
import {useEffect, useRef, useState} from "react";

interface Settings {
  apiKey: string;
  templateId: string | null;
  permissions: string[];
  features: Required<badge.TemplateEmbedFeatures>;
  sdkPath: string;
  googleFont: string;
  primaryColor: string;
  neutralColor: string;
  apiUrl: string;
}

export function Playground() {
  const ref = useRef<HTMLDivElement>(null);
  const [opened, {toggle}] = useDisclosure();

  const [settings, setSettings, resetSettings] = useLocalStorage({
    key: "state",
    defaultValue: DEFAULT_SETTINGS,
    serialize: JSON.stringify,
    deserialize: JSON.parse as (
      value: string | undefined,
    ) => typeof DEFAULT_SETTINGS,
    getInitialValueInEffect: false,
  });

  const [appearanceVisible, setAppearanceVisible] = useState(
    !!settings.googleFont || !!settings.primaryColor || !!settings.neutralColor,
  );
  const [urlsVisible, setUrlsVisible] = useState(false);

  const [sdkCall, setSdkCall] = useState<{
    sdkOptions: badge.SdkOptions;
    embedTemplatePageOptions: badge.EmbedTemplatePageOptions;
  }>();

  function launchEmbed() {
    if (!ref.current) {
      return;
    }

    const element = ref.current;

    const templateId = settings.templateId;
    if (!templateId) {
      alert("Please select a template");
      return;
    }

    fetch(`${settings.apiUrl}/v0/sdkToken`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${settings.apiKey}`,
        accept: "application/json",
      },
      body: JSON.stringify({
        templateId: settings.templateId,
        permissions: settings.permissions,
      }),
    })
      .then((res) => res.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any) => {
        const sdkOptions: badge.SdkOptions = {
          token: data.token,
          path: settings.sdkPath || undefined,
        };
        const sdk = badge.makeSdk(sdkOptions);

        const googleFont = settings.googleFont || undefined;
        const primaryColor = settings.primaryColor || undefined;
        const neutralColor = settings.neutralColor || undefined;

        const embedTemplatePageOptions: badge.EmbedTemplatePageOptions = {
          templateId,
          features: settings.features,
          fonts: googleFont
            ? [
                {
                  cssSrc: `https://fonts.googleapis.com/css2?family=${googleFont.replace(/ /g, "+")}&display=swap`,
                },
              ]
            : undefined,
          appearance: {
            fontFamily: googleFont,
            colors: {
              primary: primaryColor,
              neutral: neutralColor,
            },
          },
        };

        badge.embedTemplatePage(sdk, element, embedTemplatePageOptions);

        setSdkCall({
          sdkOptions,
          embedTemplatePageOptions,
        });
      })
      .catch(alert);
  }

  function settingChanged<Key extends keyof typeof settings>(
    name: Key,
    value: (typeof settings)[Key],
  ) {
    setSettings((prev) => ({...prev, [name]: value}));
  }

  const [templates, setTemplates] = useState<{id: string; name: string}[]>([]);

  function fetchTemplates(apiKey: string) {
    setTemplates([]);
    if (!apiKey) {
      return;
    }

    fetch(`${settings.apiUrl}/v0/passTemplates`, {
      method: "GET",
      headers: {accept: "application/json", authorization: `Bearer ${apiKey}`},
    })
      .then((res) => res.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data) => setTemplates((data as any).passTemplates))
      .catch(() => {
        setTemplates([]);
        alert("Failed to fetch templates");
      });
  }

  const handleApiKeyChange = useDebouncedCallback(async (apiKey: string) => {
    fetchTemplates(apiKey);
  }, 500);

  useEffect(() => {
    handleApiKeyChange(settings.apiKey);
  }, [handleApiKeyChange, settings.apiKey]);

  return (
    <AppShell
      header={{height: 60}}
      navbar={{
        width: 400,
        breakpoint: "sm",
        collapsed: {mobile: !opened},
      }}
      h="100%"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <span>Badge SDK Playground</span>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" styles={{navbar: {overflowY: "scroll"}}}>
        <Stack align="stretch" gap="md">
          <TextInput
            label="API Key"
            value={settings.apiKey}
            onChange={(e) => {
              settingChanged("apiKey", e.target.value);
            }}
          />
          <Select
            label="Template ID"
            data={templates.map((t) => ({value: t.id, label: t.name}))}
            value={settings.templateId}
            onChange={(value) => {
              settingChanged("templateId", value);
            }}
          />
          <MultiSelect
            label="Permissions"
            data={ALL_PERMISSIONS}
            value={settings.permissions}
            onChange={(value) => {
              settingChanged("permissions", value);
            }}
          />
          <MultiSelect
            label="Features"
            data={Object.keys(settings.features)}
            value={Object.entries(settings.features)
              .filter(([_, value]) => value)
              .map(([key]) => key)}
            onChange={(value) => {
              settingChanged("features", {
                ...ALL_DISABLED,
                ...Object.fromEntries(value.map((flag) => [flag, true])),
              });
            }}
          />
          <Switch
            label="Show Appearance Settings"
            checked={appearanceVisible}
            onChange={(event) =>
              setAppearanceVisible(event.currentTarget.checked)
            }
          />
          <Collapse in={appearanceVisible}>
            <Stack align="stretch" gap="md">
              <TextInput
                label="Google Font"
                value={settings.googleFont}
                onChange={(e) => {
                  settingChanged("googleFont", e.target.value);
                }}
              />
              <ColorInput
                label="Primary Color"
                value={settings.primaryColor}
                onChange={(color) => {
                  settingChanged("primaryColor", color);
                }}
              />
              <ColorInput
                label="Neutral Color"
                value={settings.neutralColor}
                onChange={(color) => {
                  settingChanged("neutralColor", color);
                }}
              />
            </Stack>
          </Collapse>
          <Switch
            label="Show Endpoint Settings"
            checked={urlsVisible}
            onChange={(event) => setUrlsVisible(event.currentTarget.checked)}
          />
          <Collapse in={urlsVisible}>
            <TextInput
              label="Api Url"
              value={settings.apiUrl}
              onChange={(e) => {
                settingChanged("apiUrl", e.target.value);
              }}
            />
            <TextInput
              label="SDK Path"
              value={settings.sdkPath}
              onChange={(e) => {
                settingChanged("sdkPath", e.target.value);
              }}
            />
          </Collapse>
          <Button onClick={launchEmbed}>Launch</Button>
          <Button color="red" variant="outline" onClick={resetSettings}>
            Reset Inputs
          </Button>
          {!!sdkCall && (
            <>
              <Title order={3}>SDK Call</Title>
              <Code block>{`
const sdk = badge.makeSdk(${JSON.stringify(sdkCall.sdkOptions, null, 2)});

badge.embedTemplatePage(sdk, element, ${JSON.stringify(sdkCall.embedTemplatePageOptions, null, 2)});`}</Code>
            </>
          )}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main
        ref={ref}
        h="100%"
        flex={1}
        styles={{main: {overflowY: "hidden"}}}
      />
    </AppShell>
  );
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  templateId: null,
  permissions: ["workspace:read", "user:write", "template:write"],
  features: {
    passList: true,
    templateEditor: true,
    campaigns: true,
  },
  sdkPath: "",
  googleFont: "",
  primaryColor: "",
  neutralColor: "",
  apiUrl: "https://api.trybadge.com",
};

const ALL_DISABLED: Required<badge.TemplateEmbedFeatures> = {
  passList: false,
  templateEditor: false,
  campaigns: false,
};

const ALL_PERMISSIONS = [
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
];
