import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Image from "next/image";
import Link from "next/link";

type Post = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  status: "Draft" | "Published";
  coverUrl?: string;
};

// TODO: thay bằng dữ liệu thật từ API/DB
const posts: Post[] = [
  {
    id: 1,
    title: "Welcome to our blog",
    author: "Admin",
    createdAt: "2025-10-10",
    status: "Published",
    coverUrl: "", // có thể là URL Firebase nếu đã upload
  },
  {
    id: 2,
    title: "Roadmap Q4",
    author: "MKT",
    createdAt: "2025-10-07",
    status: "Draft",
    coverUrl: "",
  },
];

export default function BlogListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Blog / All Posts" />
      <div className="space-y-6">
        <ComponentCard
          title="All Posts"
          rightArea={
            <Link
              href="/blog/create"
              className="rounded-lg bg-brand-500 px-3 py-2 text-sm text-white hover:bg-brand-600"
            >
              + Create Post
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800">
                  <th className="px-4 py-3 text-sm">ID</th>
                  <th className="px-4 py-3 text-sm">Cover</th>
                  <th className="px-4 py-3 text-sm">Title</th>
                  <th className="px-4 py-3 text-sm">Author</th>
                  <th className="px-4 py-3 text-sm">Created</th>
                  <th className="px-4 py-3 text-sm">Status</th>
                  <th className="px-4 py-3 text-sm">Actions</th>
                </tr>
              </thead>

              <tbody>
                {posts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 align-middle">{p.id}</td>

                    {/* Cover */}
                    <td className="px-4 py-3 align-middle">
                      {p.coverUrl ? (
                        <Image
                          src={p.coverUrl}
                          alt={p.title}
                          width={64}
                          height={40}
                          className="rounded object-cover ring-1 ring-gray-200 dark:ring-gray-800"
                        />
                      ) : (
                        <div className="h-10 w-16 rounded bg-gray-100 dark:bg-gray-800" />
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3 align-middle">
                      <Link
                        href={`/blog/${p.id}`}
                        className="hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3 align-middle">{p.author}</td>

                    {/* Created */}
                    <td className="px-4 py-3 align-middle">{p.createdAt}</td>

                    {/* Status */}
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.status === "Published"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/blog/${p.id}`}
                          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                        >
                          View
                        </Link>
                        <Link
                          href={`/blog/${p.id}/edit`}
                          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {posts.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No posts yet.{" "}
                      <Link
                        className="text-brand-500 hover:underline"
                        href="/blog/create"
                      >
                        Create one
                      </Link>
                      .
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
