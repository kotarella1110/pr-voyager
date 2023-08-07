import { exec } from "@actions/exec";
import { Package } from "@manypkg/get-packages";
import fs from "fs-extra";
import path from "node:path";

export async function runPublish(
  publishScript: string,
  packages: Package[],
  prNumber: number,
  commitSha: string,
) {
  const cwd = process.cwd();
  const tag = getTag(prNumber);
  const prPackages = packages.map((pkg) => ({
    ...pkg,
    packageJson: {
      ...pkg.packageJson,
      version: getVersion(
        pkg.packageJson.version.split("-")[0],
        tag,
        commitSha,
      ),
    },
  }));
  for (const pkg of prPackages) {
    await fs.writeFile(
      path.join(pkg.dir, "package.json"),
      JSON.stringify(pkg.packageJson, null, "  "),
    );
  }

  let [publishCommand, ...publishArgs] = publishScript.split(/\s+/);
  publishArgs.push("--no-git-checks");
  publishArgs.push("--tag", tag);
  await exec(`${publishCommand}`, publishArgs, { cwd });

  return {
    tag,
  };
}

function getTag(prNumber: number) {
  return `pr${prNumber}`;
}

function getVersion(version: string, tag: string, commitSha: string) {
  return `${version}-${tag}.${commitSha.slice(0, 7)}`;
}
