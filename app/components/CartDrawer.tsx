"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, CheckCircle2 } from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
    clearCart,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"idle" | "processing" | "success">("idle");

  // Prevent scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setCheckoutStep("processing");
    
    // Simulate transaction processing
    setTimeout(() => {
      setCheckoutStep("success");
    }, 2000);
  };

  const handleCloseCheckoutSuccess = () => {
    clearCart();
    setIsCheckingOut(false);
    setCheckoutStep("idle");
    setIsCartOpen(false);
  };

  return (
    <>
      {/* Drawer Container */}
      <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
        <div className="absolute inset-0 overflow-hidden">
          
          {/* Blurred overlay backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Slide-out Panel Panel */}
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-zinc-950 border-l border-zinc-800 text-white transition-all duration-300 ease-in-out shadow-2xl">
              
              <div className="flex h-full flex-col flex-1">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-purple-400" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Your Cart</h2>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                      {cartCount}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body Item List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {cart.length === 0 ? (
                    
                    /* Empty State */
                    <div className="flex h-[75%] flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-5">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight">Cart is empty</h3>
                      <p className="mt-2 max-w-[240px] text-xs text-zinc-500 leading-relaxed">
                        Looks like you haven&apos;t added any products to your bag yet.
                      </p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-6 rounded-full bg-white hover:bg-zinc-200 text-black px-6 py-2.5 text-xs font-bold transition-all duration-200"
                      >
                        Start Shopping
                      </button>
                    </div>

                  ) : (

                    /* Active Items Cards */
                    <div className="space-y-4">
                      {cart.map((item, idx) => (
                        <div
                          key={`${item.product.name}-${item.selectedColor.color}-${item.selectedStorage}-${idx}`}
                          className="flex gap-4 rounded-xl border border-zinc-900 bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900/60"
                        >
                          {/* Item Image */}
                          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-950 p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.selectedColor.image_url}
                              alt={item.product.name}
                              className="h-full w-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.src = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80";
                              }}
                            />
                          </div>

                          {/* Item Details */}
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                                {item.product.name}
                              </h4>
                              <div className="mt-1 flex flex-wrap gap-x-2 text-[10px] font-semibold text-zinc-500">
                                <span>{item.selectedColor.color}</span>
                                <span>•</span>
                                <span>{item.selectedStorage}</span>
                              </div>
                            </div>

                            {/* Quantity Controls & Price */}
                            <div className="mt-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-1 rounded-full bg-zinc-950 border border-zinc-800 p-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.name,
                                      item.selectedColor.color,
                                      item.selectedStorage,
                                      item.quantity - 1
                                    )
                                  }
                                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.name,
                                      item.selectedColor.color,
                                      item.selectedStorage,
                                      item.quantity + 1
                                    )
                                  }
                                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-sm font-extrabold text-white">
                                  ${item.price * item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    removeFromCart(
                                      item.product.name,
                                      item.selectedColor.color,
                                      item.selectedStorage
                                    )
                                  }
                                  className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Subtotal */}
                {cart.length > 0 && (
                  <div className="border-t border-zinc-800 bg-zinc-950/80 px-6 py-5 space-y-4">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Subtotal</span>
                        <span className="font-semibold text-white">${cartSubtotal}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Shipping</span>
                        <span className="font-semibold text-green-400">FREE</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Estimated Taxes</span>
                        <span className="font-semibold text-white">$0.00</span>
                      </div>
                      <div className="border-t border-zinc-800 pt-2 flex justify-between text-sm font-extrabold text-white">
                        <span>Order Total</span>
                        <span>${cartSubtotal}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:to-pink-400 py-3.5 text-sm font-bold text-white transition-all duration-300 shadow-md shadow-purple-500/10 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />
                      Proceed to Checkout
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Checkout Simulated Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
          
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 text-white shadow-2xl p-8 text-center">
            
            {checkoutStep === "processing" ? (
              <div className="py-8 space-y-6">
                {/* Simulated Loading Spinner */}
                <div className="relative mx-auto h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Processing Order</h3>
                  <p className="mt-2 text-xs text-zinc-400">
                    Connecting to Apple secure transaction server...
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-6">
                <div className="flex justify-center text-green-400">
                  <CheckCircle2 className="h-16 w-16 animate-bounce" />
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    Order Confirmed!
                  </h3>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed px-4">
                    Thank you for shopping at Shopy! Your transaction has completed successfully. A receipt and shipment tracker will be sent to your email shortly.
                  </p>
                </div>

                {/* Short Invoice Summary */}
                <div className="rounded-2xl bg-zinc-950 p-4 text-left border border-zinc-800 space-y-2">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Purchase Summary</div>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-zinc-400 line-clamp-1 max-w-[200px]">
                          {item.product.name} (x{item.quantity})
                        </span>
                        <span className="font-semibold">${item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800 pt-2 flex justify-between text-xs font-bold text-white">
                    <span>Total Paid</span>
                    <span>${cartSubtotal}</span>
                  </div>
                </div>

                <button
                  onClick={handleCloseCheckoutSuccess}
                  className="w-full rounded-full bg-white hover:bg-zinc-200 text-black py-3 text-xs font-bold transition-all duration-200"
                >
                  Close & Clear Cart
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
