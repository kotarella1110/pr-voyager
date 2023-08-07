import { createOrUpdateNpmrc } from "./createOrUpdateNpmrc";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { getPackages } from "@manypkg/get-packages";
import { findComment } from "./findComment";
import { createOrUpdateComment } from "./createOrUpdateComment";
import { runPublish } from "./runPublish";
import { getCommentBody } from "./getCommentBody";

async function run() {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      core.setFailed("Please add the GITHUB_TOKEN to the env");
      return;
    }

    let publishScript = core.getInput("publish");
    if (!publishScript) {
      core.setFailed("Please add the publish script to the input");
      return;
    }

    const cwd = core.getInput("cwd");
    if (cwd) {
      core.info("changing directory to the one given as the input");
      process.chdir(cwd);
    }

    createOrUpdateNpmrc();

    const prNumber = github.context.payload.pull_request?.number;
    const commitSha = github.context.payload.pull_request?.head.sha;
    if (!prNumber) {
      core.setFailed("No PR number found");
      return;
    }
    if (!commitSha) {
      core.setFailed("No commit sha found");
      return;
    }
    const { packages } = await getPackages(cwd);
    const { tag } = await runPublish(
      publishScript,
      packages,
      prNumber,
      commitSha,
    );

    const octokit = github.getOctokit(githubToken);
    const repository = process.env.GITHUB_REPOSITORY!;
    const body = getCommentBody(packages, tag, commitSha);
    const foundComment = await findComment({
      octokit,
      repository,
      issueNumber: prNumber,
      bodyIncludes: body.slice(0, 10),
    });
    await createOrUpdateComment(
      {
        octokit,
        repository,
        commentId: foundComment?.id,
        issueNumber: prNumber,
      },
      body,
    );
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
