# :rocket: PR Voyager

PR Voyager is an automated workflow powered by GitHub Actions that streamlines the process of npm package publishing for each Pull Request (PR). It ensures that every code change in your PR is accompanied by a new npm package version, facilitating smooth integration and testing of your updates.

![PR Voyager's comment](https://github.com/kotarella1110/pr-voyager/assets/12913947/4508d3e4-4cba-48aa-ade0-e58a68a6f495)

## Features

- Seamlessly integrates with your PR workflow on GitHub.
- Automatically publishes npm packages with version updates tied to your PR.
- Ensures that every code change is released as part of the PR process.
- Simplifies local testing by providing clear instructions for installing and using the updated packages.
- Enhances collaboration by enabling team members to easily test and review PR changes using the latest package versions.

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
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: pnpm

      - name: Install Dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Publish to npm
        uses: kotarella1110/pr-voyager@0
        with:
          publish: pnpm publish -r
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

By default, the GitHub Action creates an `.npmrc` file to authenticate with the npm registry when publishing packages.

However, if you already have an `.npmrc` file in your repository, the GitHub Action recognizes it and doesn't recreate the file. This is useful if you need to customize your `.npmrc` file for any specific configurations.

For instance, if you want to manually create the `.npmrc` file before running the GitHub Action, you can add a step like this:

```diff
+ - name: Creating .npmrc
+   run: |
+     echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" >> $HOME/.npmrc
+   env:
+     NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  - name: Publish to npm
    uses: kotarella1110/pr-voyager
    with:
      publish: pnpm publish -r
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
-     NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
