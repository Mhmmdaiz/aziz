import { createClient } from "@/utils/supabase/server";
import ArticleClient from "./ArticleClient";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, image_url, category")
    .eq("slug", slug)
    .single();

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${article.title} | ${article.category}`,
    description: article.excerpt || `Read ${article.title} on DAEMONIUM Journal.`,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image_url?.split(',')[0]],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  let related: any[] = [];
  if (article?.related_products && article.related_products.length > 0) {
    const { data: relData } = await supabase
      .from("products")
      .select("*")
      .in("id", article.related_products);
    related = relData || [];
  }

  return <ArticleClient initialArticle={article} initialRelatedProducts={related} />;
}
