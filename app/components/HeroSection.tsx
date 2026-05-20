"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { PRODUCTS, getSlug } from "../data/products";
import { ShoppingCart, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  const { addToCart } = useCart();
  
  // Find iPhone 16 Pro Max in catalog
  const heroProduct = PRODUCTS.find((p) => p.name === "iPhone 16 Pro Max") || PRODUCTS[0];
  
  // Local state for active selected color option in Hero
  const [selectedColor, setSelectedColor] = useState(heroProduct.colors[3]); // Default to Desert Titanium (index 3)

  const handleAddToCart = () => {
    addToCart(heroProduct, selectedColor, heroProduct.specs.storage_capacities[0]); // default to 256GB base storage
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
                Built for Apple Intelligence.
              </span>
            </h1>

            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-base leading-relaxed text-zinc-400 sm:text-lg">
              {heroProduct.description} Fully interactive titanium design housing the massive A18 Pro chip, groundbreaking camera systems, and enhanced battery efficiency.
            </p>

            {/* Quick Specs Badges */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
              <div className="flex items-center gap-1 rounded-xl bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Chip</span>
                <span className="text-xs font-bold text-zinc-200">{heroProduct.specs.processor_chip}</span>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Screen</span>
                <span className="text-xs font-bold text-zinc-200">{heroProduct.specs.screen_size}</span>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-zinc-900/60 border border-zinc-800 px-3 py-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Finish</span>
                <span className="text-xs font-bold text-zinc-200">{selectedColor.color}</span>
              </div>
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
              Free shipping and 1-year official Apple Warranty included
            </div>
          </div>

          {/* Right Column: Large Dynamic Interactive Product Image rendering */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Glowing background ring */}
            <div className="absolute h-72 w-72 rounded-full bg-purple-500/10 blur-[60px]" />

            {/* Main Interactive Product Image */}
            <div className="relative z-10 h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] transition-all duration-500 ease-out transform hover:scale-[1.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            </div>

            {/* Color Swatch Circle Selectors */}
            <div className="mt-8 relative z-10 flex items-center gap-4 rounded-full border border-zinc-800 bg-zinc-900/60 p-2.5 backdrop-blur-sm">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold px-2">Colors</span>
              <div className="flex gap-2.5">
                {heroProduct.colors.map((c) => {
                  // Mappings for color circles using tailwind CSS inline styles or variables
                  let colorClass = "bg-zinc-800";
                  if (c.color.includes("Desert")) colorClass = "bg-[#d4c5b9]"; // warm sand titanium
                  else if (c.color.includes("Natural")) colorClass = "bg-[#a6a19a]"; // steel titanium
                  else if (c.color.includes("White")) colorClass = "bg-[#f2f1ed]"; // pure white
                  else if (c.color.includes("Black")) colorClass = "bg-[#232426]"; // charcoal black

                  const isSelected = selectedColor.color === c.color;

                  return (
                    <button
                      key={c.color}
                      onClick={() => setSelectedColor(c)}
                      className={`h-6 w-6 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 relative ${colorClass} ${
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

        </div>
      </div>
    </section>
  );
}
