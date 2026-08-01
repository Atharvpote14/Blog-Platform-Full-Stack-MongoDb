import { BlogCard } from "@/components/BlogCard";
import type { Blog } from "@/types";

export function BlogGrid({ blogs }: { blogs: Blog[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog, index) => (
        <BlogCard key={blog._id} blog={blog} index={index} />
      ))}
    </div>
  );
}
