import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-blue-900">
      <div className="w-[260px] space-y-4">
        {!user ? (
          <div className="flex space-x-3">
            <Link
              to="/join"
              className="flex h-12 w-32 items-center justify-center rounded-md border border-transparent bg-white text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="flex h-12 w-32 items-center justify-center rounded-md bg-yellow-400 font-medium hover:bg-yellow-500"
            >
              Log In
            </Link>
          </div>
        ) : null}

        <Link
          to="/posts"
          className=" flex h-12 w-full items-center justify-center rounded-md bg-blue-500 font-medium shadow-sm hover:bg-blue-400"
        >
          Blog Posts
        </Link>
      </div>
    </main>
  );
}
