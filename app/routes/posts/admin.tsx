import { Outlet, useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getPostsForListing } from "~/models/post.server";
import { requireAdminUser } from "~/session.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPostsForListing>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);
  const posts = await getPostsForListing();
  return json<LoaderData>({ posts });
};

export default function AdminRoute() {
  const { posts } = useLoaderData() as unknown as LoaderData;
  return (
    <main className="relative flex min-h-screen flex-col items-center space-x-5 bg-blue-900 text-white">
      <Link
        to="/posts"
        className="absolute top-5 left-5 rounded-md bg-blue-700 p-3 text-yellow-400 hover:text-white hover:shadow-md"
      >
        Back to Posts
      </Link>

      <div className="my-5">
        <h1 className=" mb-3 text-4xl font-bold">Blog Admin</h1>
        <div className="flex h-[2px] w-full bg-blue-500" />
      </div>
      <div className="flex space-x-5">
        <ul className="space-y-3 ">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="relative flex w-80 justify-between rounded-md bg-blue-700  px-5 py-2 text-yellow-400 "
            >
              <div className="w-[150px]">{post.title}</div>
              <Link to={post.slug} className="underline hover:text-white">
                edit
              </Link>
              <Link
                prefetch="intent"
                className="underline hover:text-white"
                to={`/posts/${post.slug}`}
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
        <div className="min-w-[320px]">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
