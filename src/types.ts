import * as github from "@actions/github";

export type Octokit = ReturnType<typeof github.getOctokit>;
