export interface ColorOption {
  color: string;
  image_url: string;
}

export interface ProductSpecs {
  starting_price: number;
  storage_capacities: string[];
  screen_size: string;
  processor_chip: string;
}

export interface Product {
  name: string;
  category: string;
  release_year: number;
  description: string;
  specs: ProductSpecs;
  colors: ColorOption[];
}

export function getSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatCategoryLabel(category: string): string {
  if (!category) return "";
  const lower = category.toLowerCase().trim();
  if (lower === "all") return "All Products";
  if (lower === "phone") return "Phones";
  if (lower === "laptop") return "Laptops";
  if (lower === "earbuds") return "Earbuds";
  if (lower === "headphones") return "Headphones";
  if (lower === "smartwatch") return "Smartwatches";
  if (lower === "television" || lower === "tv") return "TVs & Displays";
  if (lower === "console" || lower === "gaming") return "Gaming Consoles";
  
  // Dynamic fallback: capitalize first letter and pluralize if needed
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  if (capitalized.toLowerCase().endsWith("s")) return capitalized;
  return capitalized + "s";
}



