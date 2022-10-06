import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";
import { requireAdminUser } from "~/session.server";
import invariant from "tiny-invariant";

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

type LoaderData = {
  post: { title: string; slug: string; markdown: string; createdAt: Date };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  if (params.slug == "new") return json({});
  invariant(params.slug, "slug is required");
  const post = await getPost(params.slug);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ post });
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  invariant(params.slug, "slug is required");
  const formData = await request.formData();
  if (formData.get("intent") === "delete") {
    await deletePost(params.slug);
    return redirect("/posts/admin");
  }
  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "slug is required",
    markdown: markdown ? null : "markdown is required",
  };

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  const hasErrors = Object.values(errors).some((e) => e);
  if (hasErrors) {
    return json<ActionData>(errors);
  }
  if (params.slug === "new") await createPost({ title, slug, markdown });
  else await updatePost(params.slug, { title, slug, markdown });
  return redirect("/posts/admin");
};

export default function NewPostRoute() {
  const { post } = useLoaderData() as unknown as LoaderData;
  const errors = useActionData() as ActionData;
  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";
  const isNewPost = !post;
  const inputStyles =
    "h-10 rounded-md bg-blue-600 pl-3 text-white focus:outline-none border-blue-300 border focus:border-blue-200 placeholder:text-blue-300";
  return (
    <div className="  w-[500px] rounded-lg  bg-blue-700 p-8 shadow-lg">
      <Form className="flex flex-col space-y-4" method="post">
        <div className="relative flex flex-col">
          <label htmlFor="title" className="mb-2">
            Add a Title:
            <span className="absolute right-3 italic text-yellow-400">
              {errors?.title ? errors.title : null}
            </span>
          </label>
          <input
            className={inputStyles}
            type="text"
            name="title"
            placeholder="e.g. My first Post!"
            autoComplete="off"
            defaultValue={post?.title}
          />
        </div>
        <div className="relative flex flex-col">
          <label htmlFor="slug" className="mb-2">
            Add a Slug:
            <span className="absolute right-3 italic text-yellow-400">
              {errors?.slug ? errors.slug : null}
            </span>
          </label>
          <input
            type="text"
            name="slug"
            placeholder="e.g. my-first-post "
            autoComplete="off"
            className={inputStyles}
            defaultValue={post?.slug}
          />
        </div>
        <div className="relative flex flex-col">
          <span className="absolute right-3 italic text-yellow-400">
            {errors?.markdown ? errors.markdown : null}
          </span>
          <label htmlFor="markdown" className="mb-2">
            Write your post here:
          </label>
          <textarea
            defaultValue={post?.markdown}
            name="markdown"
            cols={30}
            rows={10}
            placeholder="Markdown supported!"
            className=" mb-3 rounded-md border border-blue-300 bg-blue-600 pl-3 pt-2  text-white placeholder:text-blue-300 focus:border focus:border-blue-200 focus:outline-none"
          ></textarea>
        </div>

        <button
          name="intent"
          value={isNewPost ? "create" : "update"}
          type="submit"
          disabled={isCreating || isUpdating}
          className=" flex h-10 items-center justify-center rounded-md bg-yellow-400 text-black hover:shadow-xl disabled:bg-zinc-400"
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create Post") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update"}
        </button>
        <button
          name="intent"
          value="delete"
          type="submit"
          disabled={isDeleting}
          className=" flex h-10 items-center justify-center rounded-md bg-red-400 text-black hover:shadow-xl disabled:bg-zinc-400"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </Form>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <div>Uh oh! The post with the slug: "{params.slug}" does not exist</div>
    );
  }
  throw new Error(`Unsoported thrown response status code:${caught.status}`);
}

export function ErrorBoundary({ error }: { error: unknown }) {
  if (error instanceof Error)
    return (
      <div>
        Oh no, something went wrong!
        <p>{error.message}</p>
      </div>
    );
  else return <div>Something went super wrong</div>;
}
