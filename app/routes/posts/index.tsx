import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getPostsForListing } from "~/models/post.server";
import { useOptionalAdminUser } from "~/utils";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPostsForListing>>;
};

export const loader: LoaderFunction = async () => {
  const posts = await getPostsForListing();
  return json<LoaderData>({ posts });
};

export default function PostsRoute() {
  const { posts } = useLoaderData() as unknown as LoaderData;
  const isAdmin = useOptionalAdminUser();

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-blue-900 text-white">
      <div>
        <h1 className=" mb-3 text-lg font-bold">GaryBricks Latests Posts:</h1>
        <ul className="relative max-h-[500px] space-y-3">
          {posts.map((post) => (
            <Link
              prefetch="intent"
              to={post.slug}
              key={post.slug}
              className="flex w-80 items-center justify-between rounded-md bg-blue-700  py-3 px-5 text-yellow-400 underline hover:cursor-pointer hover:text-yellow-100 hover:shadow-md"
            >
              <span>{post.title}</span>

              <span>
                {new Date(post.createdAt).toLocaleDateString("en-US")}
              </span>
            </Link>
          ))}
        </ul>
        {isAdmin ? (
          <Link
            to="admin"
            className="mt-5 flex h-10 items-center justify-center rounded-md bg-yellow-400 text-black hover:shadow-xl"
          >
            Admin
          </Link>
        ) : null}
      </div>
    </main>
  );
}
