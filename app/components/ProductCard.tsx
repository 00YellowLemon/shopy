"use client";

import React, { useState } from "react";
import { Product, ColorOption, getSlug } from "../data/products";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Star, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  
  // Local state for active selected color dot on the card
  const [selectedColor, setSelectedColor] = useState<ColorOption>(product.colors[0]);

  // Generate a random rating and review count deterministically based on the name
  const rating = 4.2 + (product.name.charCodeAt(0) % 8) / 10;
  const reviewsCount = 45 + (product.name.charCodeAt(1) % 150);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on the color swatch buttons or the Add to Cart button
    const target = e.target as HTMLElement;
    if (target.closest(".interactive-action")) {
      return;
    }
    router.push(`/product/${getSlug(product.name)}`);
  };

  const handleAddToCart = () => {
    // Adds product to cart with selected color and the default starting storage capacity
    const defaultStorage = product.specs.storage_capacities[0] || "N/A";
    addToCart(product, selectedColor, defaultStorage);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/30 transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/60 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
    >
      
      {/* Product Category Tag & Year */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
        <span className="rounded-full bg-zinc-950/80 px-2.5 py-1 text-[10px] font-bold text-zinc-300 backdrop-blur-sm border border-zinc-800">
          {product.category}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-zinc-950/80 px-2.5 py-1 text-[10px] font-medium text-zinc-400 backdrop-blur-sm border border-zinc-800">
          <Calendar className="h-3 w-3 text-zinc-500" />
          {product.release_year}
        </span>
      </div>

      {/* Image Container */}
      <div className="flex h-56 items-center justify-center p-6 bg-gradient-to-b from-zinc-900/10 to-zinc-900/40 relative overflow-hidden">
        
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Product image with bounce hover effect */}
        <div className="relative h-44 w-44 transition-transform duration-500 group-hover:scale-105">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedColor.image_url}
            alt={`${product.name} - ${selectedColor.color}`}
            className="h-full w-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
            onError={(e) => {
              // Fallback for image loading error
              const target = e.currentTarget;
              target.src = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80";
            }}
          />
        </div>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Rating Row */}
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span className="text-xs font-bold">{rating.toFixed(1)}</span>
          <span className="text-[10px] text-zinc-500">({reviewsCount})</span>
        </div>

        {/* Product Name */}
        <h3 className="mt-2 text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-purple-400 transition-colors">
          {product.name}
        </h3>

        {/* Specs summary list */}
        <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Swatch Options selection */}
        <div className="interactive-action mt-4 flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Finish</span>
          <div className="flex gap-1.5">
            {product.colors.slice(0, 4).map((c) => {
              // Get swatch bg colors based on names
              let swatchColor = "bg-zinc-800";
              const label = c.color.toLowerCase();
              if (label.includes("desert")) swatchColor = "bg-[#d4c5b9]";
              else if (label.includes("natural")) swatchColor = "bg-[#a6a19a]";
              else if (label.includes("white") || label.includes("silver") || label.includes("ivory")) swatchColor = "bg-[#f2f1ed]";
              else if (label.includes("black") || label.includes("midnight") || label.includes("matte")) swatchColor = "bg-[#232426]";
              else if (label.includes("blue")) swatchColor = "bg-[#547285]";
              else if (label.includes("ultramarine")) swatchColor = "bg-[#4352a5]";
              else if (label.includes("teal")) swatchColor = "bg-[#3b8790]";
              else if (label.includes("pink")) swatchColor = "bg-[#faadb9]";
              else if (label.includes("yellow")) swatchColor = "bg-[#fae2a5]";
              else if (label.includes("green")) swatchColor = "bg-[#abdca5]";
              else if (label.includes("purple")) swatchColor = "bg-[#8b5cf6]";
              else if (label.includes("orange")) swatchColor = "bg-[#f97316]";
              else if (label.includes("starlight")) swatchColor = "bg-[#f0e8db]";
              else if (label.includes("gray")) swatchColor = "bg-[#71717a]";
              else if (label.includes("gold")) swatchColor = "bg-[#fbbf24]";
              else if (label.includes("transparent")) swatchColor = "bg-zinc-700 border border-zinc-500/50";

              const isSelected = selectedColor.color === c.color;

              return (
                <button
                  key={c.color}
                  onClick={() => setSelectedColor(c)}
                  className={`h-4.5 w-4.5 rounded-full transition-all duration-200 cursor-pointer ${swatchColor} ${
                    isSelected 
                      ? "ring-1.5 ring-purple-500 ring-offset-1.5 ring-offset-zinc-950 scale-110" 
                      : "opacity-75 hover:opacity-100"
                  }`}
                  title={c.color}
                />
              );
            })}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-zinc-500 font-semibold pl-1 self-center">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Action row */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-zinc-800/40">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Starting from</span>
            <span className="text-lg font-extrabold text-white tracking-tight">
              ${product.specs.starting_price}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="interactive-action group/btn flex items-center justify-center gap-1.5 rounded-full bg-zinc-800 hover:bg-white text-zinc-200 hover:text-black py-2 px-4 text-xs font-bold transition-all duration-300 hover:scale-102 cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" />
            Add
          </button>
        </div>

      </div>

    </div>
  );
}
