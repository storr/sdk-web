<img src="logo.png" height="40px" />

# @badge-sdk/web

`@badge-sdk/web` allows you to to embed Badge's
[Mobile Wallet management features](https://www.trybadge.com/saas-platform)
within your web application. For full SDK documentation visit:
https://docs.trybadge.com/docs/sdk

For information on the Badge platform, check out our
[website](https://www.trybadge.com) and [docs](https://docs.trybadge.com).

## What is Badge?

Badge, enables platforms to embed a version of Badge's no-code UI in your web
application or SaaS platform to enable mobile wallets for your customers.

With Badge, you can provide your customers access to pass editing, management,
metrics, and campaigns without leaving your your product.

## Who uses Badge?

Badge is built for businesses of all sizes that want to leverage the power of
mobile wallets.

Whether you're a small business looking to enhance the customer experience or a
large enterprise seeking to drive new revenue streams, Badge provides the tools
and flexibility to achieve your goals.

We offer the customization options and support to create tailored wallet
experiences that align perfectly with your brand, industry, and specific
marketing objectives.

## Usage

In order to use the SDK you need a
[Badge Workspace](https://app.trybadge.com/_/create-account) and an
[SDK Token](https://docs.trybadge.com/docs/sdk-getting-started#create-an-sdk-token).

With the SDK Token the Badge SDK can be initialized:

```ts
import * as badge from "@badge-sdk/web";

const badgeSdk = badge.makeSdk({token: badgeToken});
```

The SDK can now be used to embed a pass template:

```html
<div id="badge-template" style="height:100%">Loading...</div>
```

```ts
badge.embedTemplatePage(
  badgeSdk,
  window.document.getElementById("badge-template"),
  {
    templateId: templateId,
    features: {
      passList: true,
      templateEditor: true,
    },
  },
);
```

There are various features that can be enabled by setting attributes in
`features`. Additional details can be found in the
[SDK config doc](https://docs.trybadge.com/docs/sdk-config-embed#badge-features).

## License

This repository is MIT licensed.
