import fs from "fs-extra";
import * as core from "@actions/core";

export async function createOrUpdateNpmrc() {
  let userNpmrcPath = `${process.env.HOME}/.npmrc`;
  let projectNpmrcPath = `${process.cwd()}/.npmrc`;
  if (await fs.exists(userNpmrcPath)) {
    await updateNpmrc(userNpmrcPath);
    return;
  }
  if (await fs.exists(projectNpmrcPath)) {
    await updateNpmrc(projectNpmrcPath);
    return;
  }
  createNpmrc(userNpmrcPath);
}

async function updateNpmrc(npmrcPath: string) {
  const userNpmrcContent = await fs.readFile(npmrcPath, "utf8");
  const authLine = userNpmrcContent.split("\n").find((line) => {
    // check based on https://github.com/npm/cli/blob/8f8f71e4dd5ee66b3b17888faad5a7bf6c657eed/test/lib/adduser.js#L103-L105
    return /^\s*\/\/registry\.npmjs\.org\/:[_-]authToken=/i.test(line);
  });
  if (authLine) {
    core.info(
      "Found existing auth token for the npm registry in the .npmrc file",
    );
    return;
  }

  if (!process.env.NPM_TOKEN) {
    core.info(
      "No NPM_TOKEN found. If you're using npm trusted publishers with OIDC, this is expected. Otherwise, please add the NPM_TOKEN to the env",
    );
    return;
  }

  core.info(
    "Didn't find existing auth token for the npm registry in the user .npmrc file, creating one",
  );
  fs.appendFileSync(
    npmrcPath,
    `\n//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}\n`,
  );
}

async function createNpmrc(npmrcPath: string) {
  if (!process.env.NPM_TOKEN) {
    core.info(
      "No user .npmrc file found and no NPM_TOKEN provided. If you're using npm trusted publishers with OIDC, this is expected. Otherwise, please add the NPM_TOKEN to the env",
    );
    return;
  }
  core.info("No user .npmrc file found, creating one");
  await fs.writeFile(
    npmrcPath,
    `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}\n`,
  );
}
