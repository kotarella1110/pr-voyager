import type { Package } from "@manypkg/get-packages";

export function getCommentBody(
  packages: Package[],
  tag: string,
  commitSha: string,
) {
  const installPackagesText = packages
    .map((pkg) => `${pkg.packageJson.name}@${tag}`)
    .join(" ");
  return `### :rocket: Embark on a PR Voyage!

Latest commit: ${commitSha}

**Prepare to embark on an adventurous voyage with the PR Voyager! New packages have been published for testing as part of this pull request.**

<details><summary>How to test the changes locally</summary>

You can set sail on this exciting journey and test the changes in this pull request by installing the updated packages using the following commands:

#### Using npm

\`\`\`
npm install ${installPackagesText}
\`\`\`

#### Using yarn

\`\`\`
yarn add ${installPackagesText}
\`\`\`

#### Using pnpm

\`\`\`
pnpm add ${installPackagesText}
\`\`\`

</details>
`;
}
