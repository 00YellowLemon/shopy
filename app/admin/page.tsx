"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db, storage } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Home,
  DollarSign,
  Layers,
  Cpu,
  Tv,
  LogOut,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";

// Helper function to generate URL-safe slugs
function getSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface ColorInput {
  color: string;
  file: File | null;
  previewUrl: string;
}

export default function AdminPage() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");

  // Product Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Phone");
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState<number | "">("");
  const [screenSize, setScreenSize] = useState("");
  const [processorChip, setProcessorChip] = useState("");
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorInput[]>([
    { color: "", file: null, previewUrl: "" },
  ]);

  // Submission / Status States
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Storage presets
  const storagePresets = ["128GB", "256GB", "512GB", "1TB", "2TB", "N/A"];

  // Handle Authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      colors.forEach((c) => {
        if (c.previewUrl && c.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(c.previewUrl);
        }
      });
    };
  }, [colors]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (!email || !password) {
      setAuthError("Please fill out all fields.");
      setAuthLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error("Auth error:", error);
      let msg = error.message || "Authentication failed.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        msg = "Invalid email or password.";
      } else if (error.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists.";
      } else if (error.code === "auth/weak-password") {
        msg = "Password must be at least 6 characters.";
      } else if (error.code === "auth/invalid-credential") {
        msg = "Invalid credentials provided.";
      } else if (error.code === "auth/configuration-not-found") {
        msg = "Firebase Authentication is not fully configured. Please enable the 'Email/Password' provider in the Firebase Console (Authentication > Sign-in method).";
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error("Google Auth error:", error);
      let msg = error.message || "Google authentication failed.";
      if (error.code === "auth/configuration-not-found") {
        msg = "Google Sign-In is not fully configured. Please enable the 'Google' provider in the Firebase Console (Authentication > Sign-in method).";
      } else if (error.code === "auth/popup-closed-by-user") {
        msg = "Google sign-in popup was closed before completing authentication.";
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Manage Dynamic Color Inputs
  const addColorRow = () => {
    setColors([...colors, { color: "", file: null, previewUrl: "" }]);
  };

  const removeColorRow = (index: number) => {
    if (colors.length === 1) return;
    const newColors = [...colors];
    if (newColors[index].previewUrl && newColors[index].previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(newColors[index].previewUrl);
    }
    newColors.splice(index, 1);
    setColors(newColors);
  };

  const handleColorNameChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index].color = value;
    setColors(newColors);
  };

  const handleImageFileChange = (index: number, file: File | null) => {
    if (!file) return;
    const newColors = [...colors];
    newColors[index].file = file;
    if (newColors[index].previewUrl && newColors[index].previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(newColors[index].previewUrl);
    }
    newColors[index].previewUrl = URL.createObjectURL(file);
    setColors(newColors);
  };

  // Manage Storage Capacity Checkboxes
  const handleStorageCheckboxChange = (capacity: string) => {
    if (selectedStorage.includes(capacity)) {
      setSelectedStorage(selectedStorage.filter((item) => item !== capacity));
    } else {
      setSelectedStorage([...selectedStorage, capacity]);
    }
  };

  // Form Submission
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Field Validations
    if (!name.trim()) return setErrorMessage("Product Name is required.");
    if (!startingPrice || startingPrice <= 0) return setErrorMessage("A valid starting price is required.");
    if (!description.trim()) return setErrorMessage("Product Description is required.");
    if (!screenSize.trim()) return setErrorMessage("Screen Size is required.");
    if (!processorChip.trim()) return setErrorMessage("Processor Chip is required.");
    if (selectedStorage.length === 0) return setErrorMessage("Please select at least one Storage Capacity.");
    if (colors.length === 0 || colors.some((c) => !c.color.trim() || !c.file)) {
      return setErrorMessage("Please add at least one color option and upload an image for it.");
    }

    setSubmitting(true);
    const slug = getSlug(name);

    try {
      // 1. Check if product already exists to avoid unintended overwrites
      setUploadProgress("Checking product catalog...");
      const docRef = doc(db, "products", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        throw new Error(`A product with name '${name}' (slug: '${slug}') already exists in the database.`);
      }

      // 2. Upload images sequentially to Firebase Storage
      const uploadedColors = [];
      for (let i = 0; i < colors.length; i++) {
        const item = colors[i];
        setUploadProgress(`Uploading ${item.color} image (${i + 1}/${colors.length})...`);
        
        // Storage path: products/{slug}/{colorName}_{timestamp}
        const fileExtension = item.file!.name.split(".").pop() || "png";
        const storagePath = `products/${slug}/${item.color.toLowerCase().replace(/[^a-z0-9]+/g, "-")}_${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, storagePath);
        
        // Perform upload
        const uploadSnapshot = await uploadBytes(storageRef, item.file!);
        const downloadUrl = await getDownloadURL(uploadSnapshot.ref);

        uploadedColors.push({
          color: item.color.trim(),
          image_url: downloadUrl,
        });
      }

      // 3. Assemble and save final product details to Firestore
      setUploadProgress("Publishing product to catalog...");
      const finalProduct = {
        name: name.trim(),
        category,
        release_year: Number(releaseYear),
        description: description.trim(),
        specs: {
          starting_price: Number(startingPrice),
          storage_capacities: selectedStorage,
          screen_size: screenSize.trim(),
          processor_chip: processorChip.trim(),
        },
        colors: uploadedColors,
        slug,
      };

      await setDoc(docRef, finalProduct);

      // 4. Success feedback and clear inputs
      setSuccessMessage(`Success! "${name}" has been published to the catalog.`);
      
      // Reset Form State
      setName("");
      setDescription("");
      setStartingPrice("");
      setScreenSize("");
      setProcessorChip("");
      setSelectedStorage([]);
      setColors([{ color: "", file: null, previewUrl: "" }]);
      
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Publishing error:", error);
      setErrorMessage(error.message || "An error occurred while publishing the product. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  };

  // Full screen loading indicator while checking auth initially
  if (authLoading && !user) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 text-white font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="mt-4 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Verifying Authorization Gate...</p>
      </div>
    );
  }

  // RENDER: Not Authenticated (Login Form)
  if (!user) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 px-4 py-12 text-white font-sans overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-[100px] glow-background" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-pink-500/10 blur-[120px] glow-background" />

        <div className="w-full max-w-md z-10">
          {/* Shopy Logo Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              shopy
            </h1>
            <p className="mt-2 text-xs font-semibold tracking-wider text-purple-400/80 uppercase">
              Developer Authorization Panel
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-panel p-8 rounded-3xl shadow-2xl relative">
            <div className="absolute top-0 right-0 p-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white mb-2">
              {isSignUp ? "Create Admin Credentials" : "Admin Authentication"}
            </h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              {isSignUp
                ? "Setup your secret credentials to manage catalog products and media assets."
                : "Authorize to access the secret route and add/modify hardware products."}
            </p>

            {authError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@shopy.com"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-purple-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-purple-500/30"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                  Secret Key / Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 pl-11 pr-11 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-purple-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-purple-500/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3 right-3 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-6 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:opacity-95 text-white py-3 text-sm font-bold shadow-lg shadow-purple-500/10 cursor-pointer flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {authLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : isSignUp ? (
                  "Create Admin Account"
                ) : (
                  "Unlock Gate"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                <span className="bg-zinc-950 px-3 text-zinc-500">Or Continue With</span>
              </div>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700 py-3 text-sm font-bold text-white transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:-translate-y-0 disabled:cursor-not-allowed shadow-md hover:shadow-purple-500/5"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Mode Toggle */}
            <div className="mt-6 border-t border-zinc-900 pt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError("");
                }}
                className="text-xs font-semibold text-zinc-400 hover:text-purple-400 transition-colors"
              >
                {isSignUp ? "Already have an account? Sign In" : "Register a new admin account"}
              </button>
            </div>
          </div>

          {/* Catalog Return Link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-all"
            >
              <Home className="h-3.5 w-3.5" />
              Return to Shopy Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Authenticated Dashboard (Add Product Panel)
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
      {/* Admin Panel Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow shadow-purple-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Shopy Control Hub
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                Authorized
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs font-semibold text-zinc-500">
              User: <span className="text-zinc-300 font-bold">{user.email}</span>
            </span>

            {/* View Catalog */}
            <Link
              href="/"
              className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/30 px-4 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-900 hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Catalog</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/10 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Work Area */}
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col">
        
        {/* Banner Headers */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            Launch New Device
          </h2>
          <p className="mt-1.5 text-xs text-zinc-500 max-w-2xl leading-relaxed">
            Expand the Shopy catalog by creating a new premium Apple device. All media files will be securely loaded to our
            Firebase Storage bucket and connected in Firestore.
          </p>
        </div>

        {/* Action Feedbacks */}
        {successMessage && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-5 text-sm text-green-400 font-medium">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400 mt-0.5 animate-bounce" />
            <div>
              <p className="font-bold text-white mb-0.5">Device Published Successfully</p>
              <p className="text-xs text-zinc-400">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400 font-medium">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-0.5">Failed to Publish Device</p>
              <p className="text-xs text-zinc-400">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: PRODUCT FORM PANEL */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-zinc-900 pb-3 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-purple-400" />
                Product Details Schema
              </h3>

              <form onSubmit={handlePublish} className="space-y-6">
                
                {/* 1. Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. iPhone 17 Pro Max"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-purple-500/50 focus:bg-zinc-900"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 px-3.5 text-sm text-white outline-none transition-all focus:border-purple-500/50 focus:bg-zinc-900 appearance-none cursor-pointer"
                        disabled={submitting}
                      >
                        <option value="Phone" className="bg-zinc-950 text-white">Phone</option>
                        <option value="Laptop" className="bg-zinc-950 text-white">Laptop</option>
                        <option value="Earbuds" className="bg-zinc-950 text-white">Earbuds</option>
                        <option value="Headphones" className="bg-zinc-950 text-white">Headphones</option>
                      </select>
                      <Layers className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* 2. Release Year */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">
                    Release Year
                  </label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    min={2000}
                    max={2100}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 px-3.5 text-sm text-white outline-none transition-all focus:border-purple-500/50 focus:bg-zinc-900"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* 3. Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">
                    Product Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a stunning marketing blurb describing screen enhancements, camera specifications, and performance chips..."
                    rows={4}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-purple-500/50 focus:bg-zinc-900 resize-none"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* 4. Specifications Grid */}
                <div className="border-t border-zinc-900/60 pt-5">
                  <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest mb-4">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-zinc-500" /> Starting Price ($)
                      </label>
                      <input
                        type="number"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 999"
                        min={1}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-purple-500/50 focus:bg-zinc-900"
                        required
                        disabled={submitting}
                      />
                    </div>

                    {/* Screen Size */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase flex items-center gap-1">
                        <Tv className="h-3 w-3 text-zinc-500" /> Screen Size
                      </label>
                      <input
                        type="text"
                        value={screenSize}
                        onChange={(e) => setScreenSize(e.target.value)}
                        placeholder="e.g. 6.3 inches or N/A"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-purple-500/50 focus:bg-zinc-900"
                        required
                        disabled={submitting}
                      />
                    </div>

                    {/* Processor */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase flex items-center gap-1">
                        <Cpu className="h-3 w-3 text-zinc-500" /> Processor Chip
                      </label>
                      <input
                        type="text"
                        value={processorChip}
                        onChange={(e) => setProcessorChip(e.target.value)}
                        placeholder="e.g. A18 Pro"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-purple-500/50 focus:bg-zinc-900"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Storage Capacity Checkboxes */}
                <div className="border-t border-zinc-900/60 pt-5">
                  <label className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase block mb-3">
                    Available Storage Options
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {storagePresets.map((preset) => {
                      const isSelected = selectedStorage.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleStorageCheckboxChange(preset)}
                          disabled={submitting}
                          className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "border-purple-500 bg-purple-500/10 text-white shadow shadow-purple-500/10"
                              : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700 hover:text-white"
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Dynamic Colors & Image Upload */}
                <div className="border-t border-zinc-900/60 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">
                      Color Specifications & Product Images
                    </label>
                    <button
                      type="button"
                      onClick={addColorRow}
                      disabled={submitting}
                      className="rounded-full bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <Plus className="h-3.5 w-3.5 text-purple-400" />
                      Add Option
                    </button>
                  </div>

                  <div className="space-y-4">
                    {colors.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-2xl border border-zinc-900/80 bg-zinc-900/15 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative group/row"
                      >
                        {/* Remove Row Button */}
                        {colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeColorRow(index)}
                            disabled={submitting}
                            className="absolute -top-2.5 -right-2 sm:static shrink-0 h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900 hover:border-red-900 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Color Name Input */}
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={item.color}
                            onChange={(e) => handleColorNameChange(index, e.target.value)}
                            placeholder="e.g. Natural Titanium"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2 px-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/50"
                            required
                            disabled={submitting}
                          />
                        </div>

                        {/* File Upload Selector */}
                        <div className="flex-1 flex items-center gap-3">
                          <label className="flex-1 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-650 bg-zinc-900/20 px-3 py-2 text-center text-xs font-bold text-zinc-400 hover:text-white cursor-pointer transition-all relative flex items-center justify-center gap-1.5 overflow-hidden">
                            <Upload className="h-3.5 w-3.5 text-purple-400" />
                            <span className="truncate max-w-[120px]">
                              {item.file ? item.file.name : "Select Image"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageFileChange(index, e.target.files?.[0] || null)}
                              className="hidden"
                              required={!item.file}
                              disabled={submitting}
                            />
                          </label>

                          {/* Image Thumbnail Preview */}
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                            {item.previewUrl ? (
                              <img
                                src={item.previewUrl}
                                alt="Preview"
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="h-4 w-4 bg-zinc-950 rounded-sm" />
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Action Button Panel */}
                <div className="border-t border-zinc-900 pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white py-3.5 text-sm font-bold shadow-lg shadow-purple-500/10 cursor-pointer flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:-translate-y-0 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>{uploadProgress || "Publishing..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-white" />
                        <span>Publish Product to Catalog</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* RIGHT: REAL-TIME PRODUCT LIVE PREVIEW CARD */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-1 mb-3 text-center">
              <span className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                Catalog Real-Time Card Preview
              </span>
            </div>

            {/* Replicated E-commerce Catalog Card */}
            <div className="group relative flex flex-col rounded-3xl border border-zinc-900 bg-zinc-900/35 p-5 space-y-4 shadow-xl overflow-hidden hover:border-zinc-850 transition-all duration-300">
              {/* Product Badge */}
              <div className="absolute top-4 left-4 z-10 rounded-full bg-zinc-950/80 border border-zinc-900 px-3 py-1 text-[10px] font-bold text-zinc-400 tracking-wide">
                {releaseYear} Model
              </div>

              <div className="absolute top-4 right-4 z-10 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                {category}
              </div>

              {/* Product Image Frame */}
              <div className="relative flex h-52 w-full items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-900/60 p-6 overflow-hidden">
                {colors[0]?.previewUrl ? (
                  <img
                    src={colors[0].previewUrl}
                    alt={name || "Device"}
                    className="h-full w-full object-contain transition-all duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-700 text-center select-none">
                    <Sparkles className="h-10 w-10 text-zinc-800 mb-2 animate-pulse" />
                    <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-600">Waiting for Color Image</p>
                  </div>
                )}
              </div>

              {/* Title & Price Header */}
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-bold text-white tracking-tight leading-snug truncate max-w-[200px]">
                    {name || "Apple Device Name"}
                  </h4>
                  <div className="text-sm font-extrabold text-white shrink-0">
                    ${startingPrice ? startingPrice.toLocaleString() : "—"}
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 font-semibold truncate">
                  Chip: <span className="text-zinc-300 font-bold">{processorChip || "—"}</span>
                  <span className="mx-2 font-light text-zinc-700">|</span>
                  Screen: <span className="text-zinc-300 font-bold">{screenSize || "—"}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                {description || "Provide a custom description to display Apple product specs, premium benefits, and special launch offers."}
              </p>

              {/* Storage Capacities Tag list */}
              <div className="pt-2 border-t border-zinc-900 flex flex-col gap-2">
                <span className="text-[9px] font-extrabold text-zinc-600 uppercase tracking-widest">
                  Memory Options
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedStorage.length > 0 ? (
                    selectedStorage.map((cap) => (
                      <span
                        key={cap}
                        className="rounded bg-zinc-900 border border-zinc-850 px-2 py-0.5 text-[10px] font-bold text-zinc-400"
                      >
                        {cap}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-750 tracking-wider uppercase italic">None selected</span>
                  )}
                </div>
              </div>

              {/* Color Circles */}
              {colors.some((c) => c.color) && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-900">
                  <span className="text-[9px] font-extrabold text-zinc-600 uppercase tracking-widest mr-2">
                    Colors:
                  </span>
                  <div className="flex items-center gap-1">
                    {colors
                      .filter((c) => c.color.trim())
                      .map((c, i) => (
                        <div
                          key={i}
                          className="h-3 px-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 text-[9px] font-semibold text-zinc-400 flex items-center justify-center"
                          title={c.color}
                        >
                          {c.color}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Replicate Buy Button */}
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-white text-zinc-300 hover:text-black py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Configure Device</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
