import * as core from "@actions/core";
import type { Octokit } from "./types";

type Options = {
  octokit: Octokit;
  repository: string;
  issueNumber?: number;
  commentId?: number;
};

export async function createOrUpdateComment(options: Options, body: string) {
  const [owner, repo] = options.repository.split("/");
  let commentId: number | undefined;

  if (typeof options.commentId !== "undefined") {
    commentId = await updateComment(
      options.octokit,
      owner,
      repo,
      options.commentId,
      body,
    );
  } else if (typeof options.issueNumber !== "undefined") {
    commentId = await createComment(
      options.octokit,
      owner,
      repo,
      options.issueNumber,
      body,
    );
  }
  core.setOutput("comment-id", commentId);

  return commentId;
}

async function createComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
): Promise<number> {
  const { data: comment } = await octokit.rest.issues.createComment({
    owner: owner,
    repo: repo,
    issue_number: issueNumber,
    body: truncateBody(body),
  });
  core.info(`Created comment id '${comment.id}' on issue '${issueNumber}'.`);
  return comment.id;
}

async function updateComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  commentId: number,
  body: string,
): Promise<number> {
  if (body) {
    await octokit.rest.issues.updateComment({
      owner: owner,
      repo: repo,
      comment_id: commentId,
      body: truncateBody(body),
    });
    core.info(`Updated comment id '${commentId}'.`);
  }
  return commentId;
}

function truncateBody(body: string) {
  // 65536 characters is the maximum allowed for issue comments.
  if (body.length > 65536) {
    core.warning(`Comment body is too long. Truncating to 65536 characters.`);
    return body.substring(0, 65536);
  }
  return body;
}
