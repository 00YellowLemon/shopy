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


