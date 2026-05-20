"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import { PRODUCTS } from "./data/products";
import { Sparkles, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low-high" | "price-high-low" | "year">("featured");

  // Filtering Logic
  const filteredProducts = PRODUCTS.filter((product) => {
    // 1. Category Filtering
    const matchesCategory =
      activeCategory === "all" ||
      product.category === activeCategory ||
      // Special case: if Header set activeCategory to "Earbuds" representing Audio, show both Earbuds & Headphones
      (activeCategory === "Earbuds" && (product.category === "Earbuds" || product.category === "Headphones"));

    // 2. Search Query Filtering
    const searchString = `${product.name} ${product.category} ${product.description} ${product.specs.processor_chip}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low-high") {
      return a.specs.starting_price - b.specs.starting_price;
    } else if (sortBy === "price-high-low") {
      return b.specs.starting_price - a.specs.starting_price;
    } else if (sortBy === "year") {
      return b.release_year - a.release_year;
    }
    // "featured": Keep default order (which is grouped by newest flagship series down to accessories)
    return 0;
  });

  const activeCategoryTitle = () => {
    if (activeCategory === "all") return "All Apple Products";
    if (activeCategory === "Phone") return "iPhones & Handhelds";
    if (activeCategory === "Laptop") return "MacBook Pro & Air Laptops";
    if (activeCategory === "Earbuds" || activeCategory === "Headphones") return "Audio & Sound Gear";
    return activeCategory;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col flex-1">
      {/* Brand Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Flagship Highlight Hero Section */}
      {searchQuery === "" && activeCategory === "all" && <HeroSection />}

      {/* Main Catalog Section */}
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col">
        
        {/* Title and Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              {searchQuery ? `Search Results for &quot;${searchQuery}&quot;` : activeCategoryTitle()}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Showing {sortedProducts.length} premium premium devices
            </p>
          </div>

          {/* Filtering and sorting controls */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            
            {/* Category quick selectors for mobile */}
            <div className="flex md:hidden items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${activeCategory === "all" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategory("Phone")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${activeCategory === "Phone" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
              >
                Phones
              </button>
              <button
                onClick={() => setActiveCategory("Laptop")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${activeCategory === "Laptop" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
              >
                Laptops
              </button>
              <button
                onClick={() => setActiveCategory("Earbuds")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${activeCategory === "Earbuds" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
              >
                Audio
              </button>
            </div>

            {/* Sort Selector Dropdown */}
            <div className="relative flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-zinc-300 border-none outline-none cursor-pointer pr-1"
              >
                <option value="featured" className="bg-zinc-900 text-zinc-300">Featured</option>
                <option value="price-low-high" className="bg-zinc-900 text-zinc-300">Price: Low to High</option>
                <option value="price-high-low" className="bg-zinc-900 text-zinc-300">Price: High to Low</option>
                <option value="year" className="bg-zinc-900 text-zinc-300">Newest Releases</option>
              </select>
            </div>

          </div>
        </div>

        {/* Product Cards Catalog Grid */}
        {sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-3xl my-6 flex-1">
            <SlidersHorizontal className="h-10 w-10 text-zinc-600 mb-4 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-tight">No products match search criteria</h3>
            <p className="mt-2 text-xs text-zinc-500 max-w-sm">
              We couldn&apos;t find any Apple products matching your filters. Try checking your spelling or adjusting filters.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
                setSortBy("featured");
              }}
              className="mt-6 rounded-full bg-zinc-800 hover:bg-white text-zinc-300 hover:text-black py-2.5 px-6 text-xs font-bold transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </div>
        )}

      </main>

      {/* Global slide-over Cart component */}
      <CartDrawer />
    </div>
  );
}
