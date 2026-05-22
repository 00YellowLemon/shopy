"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { getSlug, Product } from "../data/products";
import { ShoppingCart, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function HeroSection({ products }: { products?: Product[] }) {
  const { addToCart } = useCart();
  
  // Handle initial loading states beautifully with a skeleton loader
  if (!products || products.length === 0) {
    return (
      <div className="relative overflow-hidden bg-zinc-950 py-16 lg:py-24 border-b border-zinc-900 animate-pulse">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-5 bg-zinc-900 rounded-full w-28" />
              <div className="h-16 bg-zinc-900 rounded-2xl w-3/4" />
              <div className="h-6 bg-zinc-900 rounded-lg w-1/2" />
              <div className="space-y-3">
                <div className="h-4 bg-zinc-900 rounded w-full" />
                <div className="h-4 bg-zinc-900 rounded w-5/6" />
              </div>
              <div className="flex gap-4 pt-4">
                <div className="h-12 bg-zinc-900 rounded-full w-40" />
                <div className="h-12 bg-zinc-900 rounded-full w-40" />
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="h-80 w-80 rounded-full bg-zinc-900/50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Select the top loaded item as flagship
  const heroProduct = products[0];
  
  // Local state for active selected color option in Hero (safely fallback to index 0)
  const [selectedColor, setSelectedColor] = useState(heroProduct.colors[0]);

  const handleAddToCart = () => {
    addToCart(heroProduct, selectedColor, heroProduct.specs.storage_capacities[0] || "256GB"); // default to base storage
  };

  // Helper to determine if a color string can be used as a CSS background color
  const getDynamicColorStyle = (colorStr: string) => {
    const lower = colorStr.toLowerCase().trim();
    if (lower.includes("desert") || lower.includes("gold") || lower.includes("sand")) return "#d4c5b9";
    if (lower.includes("natural") || lower.includes("silver") || lower.includes("gray") || lower.includes("titanium")) return "#a6a19a";
    if (lower.includes("white")) return "#f2f1ed";
    if (lower.includes("black") || lower.includes("dark") || lower.includes("charcoal")) return "#232426";
    if (lower.includes("blue")) return "#2b4c7e";
    if (lower.includes("red")) return "#b82e2e";
    if (lower.includes("green")) return "#2e6f40";
    if (lower.includes("pink")) return "#ffc0cb";
    if (lower.includes("purple")) return "#800080";
    if (lower.includes("yellow")) return "#facc15";
    
    // Check if it's a simple standard CSS color word or hex
    if (/^(#[0-9a-f]{3,8}|[a-z]+)$/i.test(lower)) {
      return lower;
    }
    return undefined;
  };

  return (
    <section className="relative overflow-hidden bg-zinc-950 py-16 lg:py-24 border-b border-zinc-900">
      {/* Background glowing mesh gradients */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-purple-900/30 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-indigo-900/25 blur-[120px]" />
        <div className="absolute -bottom-48 left-1/3 h-[600px] w-[600px] rounded-full bg-pink-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Column: Copywriting content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-purple-400 ring-1 ring-white/10 ring-inset">
              <Zap className="h-3 w-3 text-purple-400" />
              Flagship Device
            </span>

            <h1 className="mt-6 font-sans text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block text-zinc-100">{heroProduct.name}</span>
              <span className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                Experience Next-Gen Innovation.
              </span>
            </h1>

            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-base leading-relaxed text-zinc-400 sm:text-lg">
              {heroProduct.description}
            </p>

            {/* Quick Specs Badges */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
              {heroProduct.specs.processor_chip && heroProduct.specs.processor_chip !== "N/A" && (
                <div className="flex items-center gap-1 rounded-xl bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Chip</span>
                  <span className="text-xs font-bold text-zinc-200">{heroProduct.specs.processor_chip}</span>
                </div>
              )}
              {heroProduct.specs.screen_size && heroProduct.specs.screen_size !== "N/A" && (
                <div className="flex items-center gap-1 rounded-xl bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Screen</span>
                  <span className="text-xs font-bold text-zinc-200">{heroProduct.specs.screen_size}</span>
                </div>
              )}
              {selectedColor?.color && (
                <div className="flex items-center gap-1 rounded-xl bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Finish</span>
                  <span className="text-xs font-bold text-zinc-200">{selectedColor.color}</span>
                </div>
              )}
            </div>

            {/* CTA Actions */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button
                onClick={handleAddToCart}
                className="group flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all duration-300 hover:bg-zinc-200 hover:scale-102 hover:shadow-lg hover:shadow-white/5 active:scale-98"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart • ${heroProduct.specs.starting_price}
              </button>
              
              <Link
                href={`/product/${getSlug(heroProduct.name)}`}
                className="group flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-8 py-4 text-sm font-bold text-zinc-300 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
              >
                Learn More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-6 flex justify-center lg:justify-start items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Free shipping and 1-year official warranty included
            </div>
          </div>

          {/* Right Column: Large Dynamic Interactive Product Image rendering */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Glowing background ring */}
            <div className="absolute h-72 w-72 rounded-full bg-purple-500/10 blur-[60px]" />

            {/* Main Interactive Product Image */}
            <div className="relative z-10 h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] transition-all duration-500 ease-out transform hover:scale-[1.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {selectedColor?.image_url && (
                <img
                  src={selectedColor.image_url}
                  alt={`${heroProduct.name} in ${selectedColor.color}`}
                  className="h-full w-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    // Fallback for image loading error
                    const target = e.currentTarget;
                    target.src = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80";
                  }}
                />
              )}
            </div>

            {/* Color Swatch Circle Selectors */}
            {heroProduct.colors && heroProduct.colors.length > 0 && (
              <div className="mt-8 relative z-10 flex items-center gap-4 rounded-full border border-zinc-800 bg-zinc-900/60 p-2.5 backdrop-blur-sm">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold px-2">Colors</span>
                <div className="flex gap-2.5">
                  {heroProduct.colors.map((c) => {
                    const bgColorHex = getDynamicColorStyle(c.color);
                    const isSelected = selectedColor?.color === c.color;

                    return (
                      <button
                        key={c.color}
                        onClick={() => setSelectedColor(c)}
                        style={{ backgroundColor: bgColorHex }}
                        className={`h-6 w-6 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 relative ${
                          !bgColorHex ? "bg-zinc-800" : ""
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
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
