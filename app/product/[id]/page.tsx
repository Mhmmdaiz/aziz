import { createClient } from "@/utils/supabase/server";
import ProductClient from "./ProductClient";
import { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: product } = await supabase
    .from("products")
    .select("name, short_description, image_url, category")
    .eq("id", id)
    .single();

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | ${product.category}`,
    description: product.short_description || `Detail for ${product.name}. Architectural streetwear artifact.`,
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: [product.image_url],
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  const { data: related } = await supabase
    .from("products")
    .select("*")
    .neq("id", id)
    .limit(4);

  return <ProductClient initialProduct={product} relatedProducts={related || []} />;
}
