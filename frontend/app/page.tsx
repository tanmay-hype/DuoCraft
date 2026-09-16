import { FeaturedGifts } from "@/components/home/featured-gifts";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyDuoCraft } from "@/components/home/why-duocraft";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getFeaturedProducts } from "@/lib/api/catalog";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <FeaturedGifts products={featuredProducts} />
        <HowItWorks />
        <WhyDuoCraft />
        <FinalCta />
      </main>

      <Footer />
    </>
  );
}