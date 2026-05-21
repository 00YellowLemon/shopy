"use client";

import React, { useState, useEffect } from "react";
import { getSlug, Product, ColorOption, formatCategoryLabel } from "../data/products";
import { useCart, getStoragePriceModifier } from "../context/CartContext";
import Header from "./Header";
import CartDrawer from "./CartDrawer";
import AssistantDrawer from "./AssistantDrawer";
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Check,
  Cpu,
  Smartphone,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Heart,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Local state for options
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string>("N/A");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const docRef = doc(db, "products", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const activeProduct = docSnap.data() as Product;
          setProduct(activeProduct);
          setSelectedColor(activeProduct.colors[0]);
          setSelectedStorage(activeProduct.specs.storage_capacities[0] || "N/A");
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error loading product from Firestore:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list: Product[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as Product);
        });
        if (list.length > 0) {
          setProductsList(list);
        }
      } catch (err) {
        console.error("Error fetching recommended products:", err);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col flex-1 animate-pulse">
        <Header searchQuery="" setSearchQuery={() => {}} activeCategory="all" setActiveCategory={() => {}} categories={[]} />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 space-y-12">
          <div className="h-6 w-1/4 bg-zinc-900 rounded-md animate-pulse" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7 h-96 bg-zinc-900/40 rounded-3xl animate-pulse" />
            <div className="lg:col-span-5 space-y-6">
              <div className="h-8 bg-zinc-900 rounded-md w-3/4 animate-pulse" />
              <div className="h-4 bg-zinc-900 rounded-md w-1/2 animate-pulse" />
              <div className="h-24 bg-zinc-900/30 rounded-2xl animate-pulse" />
              <div className="h-12 bg-zinc-900/30 rounded-full animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product || !selectedColor) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-zinc-400 mb-6 max-w-sm">
          Sorry, the product you are looking for does not exist in our catalog.
        </p>
        <Link
          href="/"
          className="rounded-full bg-white text-black py-2.5 px-6 font-bold text-xs hover:bg-zinc-200 transition-all"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Calculate dynamic price
  const basePrice = product.specs.starting_price;
  const storageModifier = getStoragePriceModifier(product.specs.storage_capacities, selectedStorage);
  const currentPrice = basePrice + storageModifier;

  // Rating metrics
  const rating = 4.2 + (product.name.charCodeAt(0) % 8) / 10;
  const reviewsCount = 45 + (product.name.charCodeAt(1) % 150);

  // Handlers
  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedStorage);
  };

  // 1. AMAZON-STYLE RECOMMENDATION: "Frequently Bought Together" Bundle
  // Deterministically find a recommended accessory
  const getBundleAccessory = (): Product | null => {
    if (productsList.length === 0) return null;
    // Find the first product that has a different category than the current product
    const differentCategoryProduct = productsList.find((p) => p.category !== product.category && p.name !== product.name);
    if (differentCategoryProduct) return differentCategoryProduct;
    // Fallback to any other product that is not this product
    const otherProduct = productsList.find((p) => p.name !== product.name);
    return otherProduct || productsList[0] || null;
  };

  const bundleAccessory = getBundleAccessory();
  const bundleAccessoryColor = bundleAccessory?.colors[0];
  const bundleAccessoryStorage = bundleAccessory?.specs.storage_capacities[0] || "N/A";
  const bundleDiscount = 20; // $20 bundle savings
  const bundleTotal = bundleAccessory ? (currentPrice + bundleAccessory.specs.starting_price - bundleDiscount) : 0;

  const handleAddBundleToCart = () => {
    if (!bundleAccessory || !bundleAccessoryColor) return;
    // Add both products
    addToCart(product, selectedColor, selectedStorage);
    addToCart(bundleAccessory, bundleAccessoryColor, bundleAccessoryStorage);
    setIsCartOpen(true);
  };

  // 2. AMAZON-STYLE RECOMMENDATION: "More to Explore" (Related Products)
  const relatedProducts = productsList.filter(
    (p) => p.category === product.category && p.name !== product.name
  )
    .slice(0, 4);

  // If there are fewer than 3 related items, fill up with other top items in the catalog
  if (relatedProducts.length < 3 && productsList.length > 0) {
    const fillers = productsList.filter(
      (p) => p.name !== product.name && !relatedProducts.some((r) => r.name === p.name)
    ).slice(0, 4 - relatedProducts.length);
    relatedProducts.push(...fillers);
  }

  // Dynamic Categories list for the header
  const categoriesList = ["all", ...Array.from(new Set(productsList.map((p) => p.category)))];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col flex-1">
      {/* Brand Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          router.push("/"); // Navigate home if user filters categories from Header
        }}
        categories={categoriesList}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Catalog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-400 capitalize">{formatCategoryLabel(product.category)}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-300 line-clamp-1">{product.name}</span>
        </nav>

        {/* Dynamic Details Splitting layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start mb-16">
          
          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            
            {/* Back Button */}
            <Link
              href="/"
              className="absolute top-0 left-0 z-10 flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            {/* Glowing background ring */}
            <div className="absolute h-96 w-96 rounded-full bg-purple-500/5 blur-[80px]" />

            {/* Main Dynamic Image Display */}
            <div className="relative z-10 h-[360px] w-[360px] sm:h-[480px] sm:w-[480px] transition-transform duration-500 ease-out transform hover:scale-[1.02] p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedColor.image_url}
                alt={`${product.name} - ${selectedColor.color}`}
                className="h-full w-full object-contain filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>

            {/* Active Color Palette Swatch */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-extrabold">
                Select Finish: <span className="text-zinc-300 font-bold ml-1">{selectedColor.color}</span>
              </span>
              <div className="flex gap-3 rounded-full border border-zinc-800 bg-zinc-900/40 p-2 backdrop-blur-sm">
                {product.colors.map((c) => {
                  const lower = c.color.toLowerCase().trim();
                  let inlineBg: string | undefined = undefined;
                  
                  if (lower.includes("desert") || lower.includes("gold") || lower.includes("sand")) inlineBg = "#d4c5b9";
                  else if (lower.includes("natural") || lower.includes("silver") || lower.includes("titanium") || lower.includes("gray")) inlineBg = "#a6a19a";
                  else if (lower.includes("white") || lower.includes("ivory")) inlineBg = "#f2f1ed";
                  else if (lower.includes("black") || lower.includes("dark") || lower.includes("charcoal") || lower.includes("midnight") || lower.includes("matte")) inlineBg = "#232426";
                  else if (lower.includes("blue") || lower.includes("ultramarine")) inlineBg = "#2b4c7e";
                  else if (lower.includes("red")) inlineBg = "#b82e2e";
                  else if (lower.includes("green") || lower.includes("teal")) inlineBg = "#2e6f40";
                  else if (lower.includes("pink")) inlineBg = "#ffc0cb";
                  else if (lower.includes("purple")) inlineBg = "#800080";
                  else if (lower.includes("yellow")) inlineBg = "#facc15";
                  else if (lower.includes("starlight")) inlineBg = "#f0e8db";
                  
                  if (!inlineBg && /^(#[0-9a-f]{3,8}|[a-z]+)$/i.test(lower)) {
                    inlineBg = lower;
                  }

                  const isSelected = selectedColor.color === c.color;

                  return (
                    <button
                      key={c.color}
                      onClick={() => setSelectedColor(c)}
                      style={{ backgroundColor: inlineBg }}
                      className={`h-7 w-7 rounded-full transition-all duration-300 cursor-pointer ${
                        !inlineBg ? "bg-zinc-800" : ""
                      } ${
                        isSelected 
                          ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-zinc-950 scale-110 shadow-lg shadow-purple-500/20" 
                          : "opacity-80 hover:opacity-100"
                      }`}
                      title={c.color}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Spec Specifications & Buy Block */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Title Block */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-0.5 text-[10px] font-bold text-purple-400">
                  {product.category}
                </span>
                <span className="rounded-full bg-zinc-800 px-3 py-0.5 text-[10px] font-bold text-zinc-400">
                  Released in {product.release_year}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {product.name}
              </h1>

              {/* Review metrics */}
              <div className="mt-4 flex items-center gap-1 text-amber-400">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 fill-current ${
                        i < Math.floor(rating) ? "text-amber-400" : "text-zinc-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-300 ml-1">{rating.toFixed(1)}</span>
                <span className="text-[10px] text-zinc-500">({reviewsCount} customers verified reviews)</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-zinc-400">
              {product.description} Built using precision-machined materials and supercharged by advanced system architectures to handle heavy multitasking, responsive gaming, and AI workflows seamlessly.
            </p>

            {/* Micro Specs Card Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-4 space-y-1">
                <Cpu className="h-5 w-5 text-purple-400 mb-1" />
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Processor Chip</span>
                <span className="text-sm font-bold text-white">{product.specs.processor_chip}</span>
              </div>
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-4 space-y-1">
                <Smartphone className="h-5 w-5 text-pink-400 mb-1" />
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Display Size</span>
                <span className="text-sm font-bold text-white">{product.specs.screen_size}</span>
              </div>
            </div>

            {/* Capacity Upgrade Selector */}
            {product.specs.storage_capacities[0] !== "N/A" && (
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
                  Select Storage Capacity
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {product.specs.storage_capacities.map((cap) => {
                    const activeModifier = getStoragePriceModifier(product.specs.storage_capacities, cap);
                    const capPrice = basePrice + activeModifier;
                    const isSelected = selectedStorage === cap;

                    return (
                      <button
                        key={cap}
                        onClick={() => setSelectedStorage(cap)}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/5 text-white ring-1 ring-purple-500/50 shadow-md shadow-purple-500/5"
                            : "border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-sm font-bold">{cap}</span>
                        <span className="mt-1 text-[10px] font-semibold opacity-75">
                          ${capPrice}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Cards & Cart CTA block */}
            <div className="rounded-3xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-5">
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">Your Price</span>
                  <span className="text-3xl font-extrabold text-white tracking-tight mt-1">
                    ${currentPrice}
                  </span>
                </div>
                <div className="text-xs text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  In Stock & Ready
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 group flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-zinc-200 text-black py-4 text-sm font-bold transition-all duration-300 hover:scale-102 cursor-pointer shadow-lg shadow-white/5"
                >
                  <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Add to Cart
                </button>
                
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-300 transition-all hover:bg-zinc-900 hover:border-zinc-700 ${
                    isWishlisted ? "text-pink-500 border-pink-500/30 bg-pink-500/5 hover:text-pink-400" : ""
                  }`}
                  aria-label="Wishlist Item"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* 1. AMAZON-STYLE BANNER: FREQUENTLY BOUGHT TOGETHER */}
        {bundleAccessory && bundleAccessoryColor && (
          <section className="rounded-3xl border border-zinc-900 bg-zinc-900/30 p-6 sm:p-8 mb-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent opacity-60" />
            
            <div className="relative z-10">
              <h3 className="text-lg font-bold tracking-tight text-white mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Frequently Bought Together
              </h3>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                
                {/* Product Plus Connector Visual */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-1">
                  
                  {/* Product 1 */}
                  <div className="flex items-center gap-4 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 w-full sm:w-auto">
                    <div className="h-16 w-16 flex-shrink-0 flex items-center justify-center p-1 bg-zinc-900/50 rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedColor.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 max-w-[140px]">{product.name}</h4>
                      <span className="text-xs font-extrabold text-zinc-400">${currentPrice}</span>
                    </div>
                  </div>

                  {/* Plus Operator */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <Plus className="h-4 w-4" />
                  </div>

                  {/* Product 2 (Accessory) */}
                  <div className="flex items-center gap-4 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 w-full sm:w-auto">
                    <div className="h-16 w-16 flex-shrink-0 flex items-center justify-center p-1 bg-zinc-900/50 rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bundleAccessoryColor.image_url}
                        alt={bundleAccessory.name}
                        className="h-full w-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 max-w-[140px]">{bundleAccessory.name}</h4>
                      <span className="text-xs font-extrabold text-zinc-400">${bundleAccessory.specs.starting_price}</span>
                    </div>
                  </div>

                </div>

                {/* Bundle Checkout Box */}
                <div className="rounded-2xl bg-zinc-950/80 p-5 border border-zinc-800 md:min-w-[280px] space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Bundle Subtotal:</span>
                      <span className="line-through">${currentPrice + bundleAccessory.specs.starting_price}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-green-400">
                      <span>Bundle Savings:</span>
                      <span>-${bundleDiscount}</span>
                    </div>
                    <div className="border-t border-zinc-850 pt-2 flex justify-between text-sm font-extrabold text-white">
                      <span>Combo Price:</span>
                      <span>${bundleTotal}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddBundleToCart}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 text-xs transition-all duration-300 shadow-md shadow-purple-600/10 cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Add Both to Cart
                  </button>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* 2. AMAZON-STYLE RECOMMENDATION: RELATED CAROUSEL GRID */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 mb-12">
            <div className="border-b border-zinc-900 pb-4">
              <h3 className="text-xl font-bold tracking-tight text-white">
                Customers Also Viewed
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Explore more high-fidelity premium gear recommended for you
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const pRating = 4.2 + (p.name.charCodeAt(0) % 8) / 10;
                const pSlug = getSlug(p.name);
                
                return (
                  <div
                    key={p.name}
                    className="group relative flex flex-col rounded-2xl border border-zinc-900 bg-zinc-900/20 p-4 transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/50 cursor-pointer"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest(".quick-add-action")) {
                        return;
                      }
                      router.push(`/product/${pSlug}`);
                    }}
                  >
                    {/* Image wrapper */}
                    <div className="h-40 flex items-center justify-center p-4 bg-zinc-950/40 rounded-xl mb-4 relative overflow-hidden">
                      <div className="h-32 w-32 transition-transform duration-500 group-hover:scale-105">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.colors[0].image_url}
                          alt={p.name}
                          className="h-full w-full object-contain filter drop-shadow-[0_6px_15px_rgba(0,0,0,0.5)]"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80";
                          }}
                        />
                      </div>
                    </div>

                    {/* Title & Star Rating */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors line-clamp-1">
                          {p.name}
                        </h4>
                        
                        <div className="mt-1 flex items-center gap-1 text-amber-400">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-[10px] font-bold">{pRating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Price and Add button */}
                      <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-white">
                          ${p.specs.starting_price}
                        </span>
                        
                        <button
                          onClick={() => {
                            addToCart(p, p.colors[0], p.specs.storage_capacities[0] || "N/A");
                          }}
                          className="quick-add-action flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 hover:bg-white text-zinc-300 hover:text-black transition-all cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* Global slide-over Cart drawer */}
      <CartDrawer />

      {/* Interactive AI Shop Assistant floating widget */}
      <AssistantDrawer />
    </div>
  );
}
