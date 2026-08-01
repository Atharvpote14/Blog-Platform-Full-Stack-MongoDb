import { Categories } from "@/components/Categories";
import { CTA } from "@/components/CTA";
import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { LatestBlogs } from "@/components/LatestBlogs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <LatestBlogs />
      <Categories />
      <CTA />
    </>
  );
}
