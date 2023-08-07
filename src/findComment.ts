import type { Octokit } from "./types";

type Options = {
  octokit: Octokit;
  repository: string;
  issueNumber: number;
  commentAuthor?: string;
  bodyIncludes?: string;
  bodyRegex?: string;
  direction?: string;
  nth?: number;
};

type OtherOptions = Omit<Options, "direction" | "nth"> &
  Required<Pick<Options, "direction" | "nth">>;

type Comment = {
  id: number;
  body?: string;
  user: {
    login: string;
  } | null;
  created_at: string;
};

export async function findComment({
  direction = "first",
  nth = 0,
  ...rest
}: Options): Promise<Comment | undefined> {
  const options = {
    ...rest,
    direction,
    nth,
  };
  const comments = await fetchComments(options);
  return findMatchingComment(options, comments);
}

async function fetchComments(options: OtherOptions): Promise<Comment[]> {
  const [owner, repo] = options.repository.split("/");
  return await options.octokit.paginate(
    options.octokit.rest.issues.listComments,
    {
      owner: owner,
      repo: repo,
      issue_number: options.issueNumber,
    },
  );
}

function findMatchingComment(
  options: OtherOptions,
  comments: Comment[],
): Comment | undefined {
  if (options.direction == "last") {
    comments.reverse();
  }
  const matchingComments = comments.filter((comment) =>
    findCommentPredicate(options, comment),
  );
  const comment = matchingComments[options.nth];
  if (comment) {
    return comment;
  }
  return undefined;
}

function findCommentPredicate(
  options: OtherOptions,
  comment: Comment,
): boolean {
  return (
    (options.commentAuthor && comment.user
      ? comment.user.login === options.commentAuthor
      : true) &&
    (options.bodyIncludes && comment.body
      ? comment.body.includes(options.bodyIncludes)
      : true) &&
    (options.bodyRegex && comment.body
      ? comment.body.match(stringToRegex(options.bodyRegex)) !== null
      : true)
  );
}

function stringToRegex(s: string): RegExp {
  const m = s.match(/^(.)(.*?)\1([gimsuy]*)$/);
  if (m) return new RegExp(m[2], m[3]);
  else return new RegExp(s);
}
