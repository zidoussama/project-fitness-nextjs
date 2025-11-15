import { auth, signOut } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="p-8">
      {session?.user ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">
            Welcome, {session.user.firstname} {session.user.lastname}!
          </h1>
          <p className="text-gray-600">Email: {session.user.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold">Welcome to Fitness App</h1>
          <p className="mt-2 text-gray-600">
            Please{" "}
            <a href="/auth/signin" className="text-blue-600 hover:underline">
              sign in
            </a>{" "}
            to continue.
          </p>
        </div>
      )}
    </div>
  );
}

