import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { requireAdminUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);
  return json({});
};

export default function AdminRoute() {
  return (
    <Link to="new">
      <div className="flex h-10 items-center justify-center rounded-md bg-yellow-400 text-black hover:shadow-md">
        Create new post
      </div>
    </Link>
  );
}
