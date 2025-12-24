# :rocket: PR Voyager

PR Voyager is an automated workflow powered by GitHub Actions that streamlines the process of npm package publishing for each Pull Request (PR). It ensures that every code change in your PR is accompanied by a new npm package version, facilitating smooth integration and testing of your updates.

![PR Voyager's comment](https://github.com/kotarella1110/pr-voyager/assets/12913947/4508d3e4-4cba-48aa-ade0-e58a68a6f495)

## Features

- Seamlessly integrates with your PR workflow on GitHub.
- Automatically publishes npm packages with version updates tied to your PR.
- Ensures that every code change is released as part of the PR process.
- Simplifies local testing by providing clear instructions for installing and using the updated packages.
- Enhances collaboration by enabling team members to easily test and review PR changes using the latest package versions.

## Package Versioning

For each PR, the package version in your `package.json` is automatically updated in the following format: `1.0.0-pr123.366b952`, where:

- `1.0.0` represents the current version.
- `123` is the PR number.
- `366b952` is the first 7 characters of the commit SHA.

The package is also published with a tag named `pr123`, where `123` is the PR number.

This versioning and tagging scheme ensures that each PR receives a unique package version and allows for easy identification and testing of changes.

## Usage

### Inputs

| Name      | Description                                      | Required | Default         |
| --------- | ------------------------------------------------ | -------- | --------------- |
| `publish` | The command to use to build and publish packages | `true`   |                 |
| `cwd`     | Sets the cwd for the node process.               | `false`  | `process.cwd()` |

### Example workflow

```yaml
name: PR Release

on:
  pull_request:

jobs:
  pr-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      # Uncomment this if you're using pnpm
      # - name: Install pnpm
      #   uses: pnpm/action-setup@v4
      #   with:
      #     version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm # or pnpm

      - name: Install Dependencies
        run: npm ci # or pnpm install

      - name: Build
        run: npm build # or pnpm build

      - name: Publish
        uses: kotarella1110/pr-voyager@v0
        with:
          publish: npm publish # or pnpm publish -r
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

By default, the GitHub Action creates an `.npmrc` file to authenticate with the npm registry when publishing packages.

However, if you already have an `.npmrc` file in your repository, the GitHub Action recognizes it and doesn't recreate the file. This is useful if you need to customize your `.npmrc` file for any specific configurations.

For instance, if you want to manually create the `.npmrc` file before running the GitHub Action, you can add a step like this:

```diff
+ - name: Create .npmrc
+   run: |
+     echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" >> $HOME/.npmrc
+   env:
+     NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
+
  - name: Publish
    uses: kotarella1110/pr-voyager
    with:
      publish: npm publish
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
-     NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Using npm Trusted Publishers

PR Voyager supports [npm trusted publishers](https://docs.npmjs.com/trusted-publishers/), which allows you to publish packages without managing long-lived access tokens. This uses OpenID Connect (OIDC) to authenticate with npm directly from GitHub Actions.

To use trusted publishers, add the `id-token: write` permission and omit the `NPM_TOKEN`:

```diff
+ permissions:
+   contents: read
+   pull-requests: write
+   id-token: write # Required for npm trusted publishers
+
+ # ...
+
  - name: Publish
    uses: kotarella1110/pr-voyager@v0
    with:
      publish: npm publish
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
-     NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Setup steps:**

1. Configure trusted publishing for your package on npm by following the [npm trusted publishers documentation](https://docs.npmjs.com/trusted-publishers/)
2. Add `id-token: write` to your workflow permissions
3. Remove the `NPM_TOKEN` from your workflow environment variables

GitHub Actions will automatically authenticate using OIDC tokens.

**Note:** If you're not using trusted publishers, you still need to provide the `NPM_TOKEN` environment variable as shown in the basic usage example.

## PR Voyager vs CodeSandbox CI

PR Voyager and [CodeSandbox CI](https://codesandbox.io/docs/learn/sandboxes/ci) offer distinct approaches for automating and managing your package testing and publishing workflows. Here's a summary of their key differences:

|                      | PR Voyager                                                                                   | CodeSandbox CI                                                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform             | GitHub Action                                                                                | GitHub App                                                                                                                                                                      |
| Support Repositories | Public and private repositories                                                              | Public repositories only                                                                                                                                                        |
| Configuration        | Created via a `.github/workflows/xxx.yml` workflow file. Flexible and customizable workflows | Configured via a `.codesandbox/ci.json` configuration file, enabling easy setup. However, it has limited flexibility and lacks the ability to specify package manager versions. |
| Publishing           | Publishes to npm with tagged name                                                            | Publishes to CodeSandbox CI registry. Does not publish to npm .                                                                                                                 |
| Integration          | Allows immediate local testing of the library.                                               | Integrates with CodeSandbox for immediate library testing, both locally and on CodeSandbox.                                                                                     |

Ultimately, both tools offer valuable contributions to your development workflow, allowing you to choose the one that best aligns with your priorities and preferences. Whether you prioritize flexibility and customization or seamless integration and simplicity, these solutions can enhance your package management process and contribute to more efficient and effective development.
