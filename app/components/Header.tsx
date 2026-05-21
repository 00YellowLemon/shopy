"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { ShoppingBag, Search, Sparkles, Lock } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
}: HeaderProps) {
  const { cartCount, setIsCartOpen } = useCart();

  const navItems = [
    { label: "All Products", id: "all" },
    { label: "Phones", id: "Phone" },
    { label: "Laptops", id: "Laptop" },
    { label: "Audio", id: "audio-combined" }, // combined category for earbuds & headphones
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setActiveCategory("all");
            setSearchQuery("");
          }}
          className="flex cursor-pointer items-center gap-2 font-sans text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            shopy
          </span>
        </div>

        {/* Categories Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.id === "audio-combined"
                ? activeCategory === "Earbuds" || activeCategory === "Headphones"
                : activeCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "audio-combined") {
                    setActiveCategory("Earbuds"); // Default to Earbuds, logic in page will filter both Earbuds & Headphones
                  } else {
                    setActiveCategory(item.id);
                  }
                }}
                className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white bg-zinc-800/80 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Search & Cart Actions */}
        <div className="flex items-center gap-4 w-full max-w-xs md:max-w-sm justify-end">
          {/* Search Input Bar */}
          <div className="relative w-full max-w-[180px] sm:max-w-[220px]">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-zinc-800 bg-zinc-900/50 py-1.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 shadow-inner outline-none transition-all duration-300 focus:border-purple-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-purple-500/30"
            />
          </div>

          {/* Admin Link Button */}
          <Link
            href="/admin"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/30 text-zinc-300 transition-all duration-300 hover:border-zinc-750 hover:bg-zinc-900 hover:text-white"
            aria-label="Admin Panel"
          >
            <Lock className="h-4 w-4 transition-transform group-hover:scale-105" />
          </Link>

          {/* Cart Bag Icon Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/30 text-zinc-300 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
            aria-label="Open Cart"
          >
            <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-105" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-bold text-white ring-2 ring-zinc-950">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
