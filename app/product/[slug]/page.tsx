import React from "react";
import { Metadata } from "next";
import { Product } from "@/app/data/products";
import ProductDetailClient from "@/app/components/ProductDetailClient";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SEO Dynamic Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let product: Product | undefined;

  try {
    const docSnap = await getDoc(doc(db, "products", slug));
    if (docSnap.exists()) {
      product = docSnap.data() as Product;
    }
  } catch (e) {
    console.error("Error fetching product metadata from Firestore:", e);
  }

  if (!product) {
    return {
      title: "Device Not Found - Shopy",
      description: "The requested Apple device does not exist in our catalog.",
    };
  }

  const siteTitle = `${product.name} - Buy Now | Shopy`;
  const siteDesc = `Supercharge your tech with the ${product.name} released in ${product.release_year}. ${product.description} Free shipping and warranty included.`;

  return {
    title: siteTitle,
    description: siteDesc,
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      type: "website",
      images: [
        {
          url: product.colors[0].image_url,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDesc,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Verify product exists in Firestore
  let exists = false;
  try {
    const docSnap = await getDoc(doc(db, "products", slug));
    exists = docSnap.exists();
  } catch (e) {
    console.error("Error checking product in Firestore:", e);
  }

  if (!exists) {
    notFound();
  }

  return <ProductDetailClient slug={slug} />;
}

