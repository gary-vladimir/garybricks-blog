import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getPost } from "~/models/post.server";
import invariant from "tiny-invariant";

type LoaderData = {
  post: { title: string; slug: string; markdown: string; createdAt: Date };
};

export const loader: LoaderFunction = async ({ params }) => {
  const { slug } = params;
  invariant(slug, "slug is required");
  const post = await getPost(slug);
  invariant(post, `post not found ${slug}`);
  const showdown = require("showdown");
  const converter = new showdown.Converter();
  const html = converter.makeHtml(post?.markdown);

  post.markdown = html;
  return json<LoaderData>({ post });
};

export default function PostRoute() {
  const { post } = useLoaderData() as unknown as LoaderData;
  return (
    <main className="relative flex min-h-screen justify-center bg-blue-900 text-white">
      <Link
        to="/posts"
        className="absolute top-5 left-5 rounded-md bg-blue-700 p-3 text-yellow-400 hover:text-white hover:shadow-md"
      >
        Back to Posts
      </Link>
      <div className=" w-[80%] sm:w-[600px]">
        <h1 className="mt-7 text-center text-2xl font-bold">{post.title}</h1>
        <p className="mb-1 mt-2">
          {new Date(post.createdAt).toLocaleDateString("en-US")}
        </p>
        <p
          className="text-justify"
          dangerouslySetInnerHTML={{ __html: post.markdown }}
        ></p>
      </div>
    </main>
  );
}
