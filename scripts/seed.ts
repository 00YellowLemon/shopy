import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

// Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index > 0) {
      const key = trimmed.substring(0, index).trim();
      const val = trimmed.substring(index + 1).trim();
      process.env[key] = val;
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

function getSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PRODUCTS: Product[] = [
  {
    "name": "iPhone 16 Pro Max",
    "category": "Phone",
    "release_year": 2024,
    "description": "The ultimate iPhone with a larger 6.9-inch display, A18 Pro chip, and advanced Camera Control.",
    "specs": {
      "starting_price": 1199,
      "storage_capacities": ["256GB", "512GB", "1TB"],
      "screen_size": "6.9 inches",
      "processor_chip": "A18 Pro"
    },
    "colors": [
      {
        "color": "Black Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-max-black-titanium"
      },
      {
        "color": "White Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-max-white-titanium"
      },
      {
        "color": "Natural Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-max-natural-titanium"
      },
      {
        "color": "Desert Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-max-desert-titanium"
      }
    ]
  },
  {
    "name": "iPhone 16 Pro",
    "category": "Phone",
    "release_year": 2024,
    "description": "Powerful Pro iPhone with a 6.3-inch display, A18 Pro chip, and Grade 5 titanium design.",
    "specs": {
      "starting_price": 999,
      "storage_capacities": ["128GB", "256GB", "512GB", "1TB"],
      "screen_size": "6.3 inches",
      "processor_chip": "A18 Pro"
    },
    "colors": [
      {
        "color": "Black Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-black-titanium"
      },
      {
        "color": "White Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-white-titanium"
      },
      {
        "color": "Natural Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-natural-titanium"
      },
      {
        "color": "Desert Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-desert-titanium"
      }
    ]
  },
  {
    "name": "iPhone 16 Plus",
    "category": "Phone",
    "release_year": 2024,
    "description": "A larger version of the iPhone 16 with a 6.7-inch display and amazing battery life.",
    "specs": {
      "starting_price": 899,
      "storage_capacities": ["128GB", "256GB", "512GB"],
      "screen_size": "6.7 inches",
      "processor_chip": "A18"
    },
    "colors": [
      {
        "color": "Ultramarine",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-plus-ultramarine"
      },
      {
        "color": "Teal",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-plus-teal"
      },
      {
        "color": "Pink",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-plus-pink"
      },
      {
        "color": "White",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-plus-white"
      },
      {
        "color": "Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-plus-black"
      }
    ]
  },
  {
    "name": "iPhone 16",
    "category": "Phone",
    "release_year": 2024,
    "description": "The latest standard iPhone featuring the A18 chip, Camera Control, and improved battery life.",
    "specs": {
      "starting_price": 799,
      "storage_capacities": ["128GB", "256GB", "512GB"],
      "screen_size": "6.1 inches",
      "processor_chip": "A18"
    },
    "colors": [
      {
        "color": "Ultramarine",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-ultramarine"
      },
      {
        "color": "Teal",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-teal"
      },
      {
        "color": "Pink",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pink"
      },
      {
        "color": "White",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-white"
      },
      {
        "color": "Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-black"
      }
    ]
  },
  {
    "name": "iPhone 15 Pro Max",
    "category": "Phone",
    "release_year": 2023,
    "description": "Pro iPhone from 2023 with a 5x telephoto camera, titanium frame, and A17 Pro chip.",
    "specs": {
      "starting_price": 1199,
      "storage_capacities": ["256GB", "512GB", "1TB"],
      "screen_size": "6.7 inches",
      "processor_chip": "A17 Pro"
    },
    "colors": [
      {
        "color": "Natural Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium"
      },
      {
        "color": "Blue Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-blue-titanium"
      },
      {
        "color": "White Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-white-titanium"
      },
      {
        "color": "Black Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-black-titanium"
      }
    ]
  },
  {
    "name": "iPhone 15 Pro",
    "category": "Phone",
    "release_year": 2023,
    "description": "Pro iPhone from 2023 with a 6.1-inch screen, titanium frame, and A17 Pro chip.",
    "specs": {
      "starting_price": 999,
      "storage_capacities": ["128GB", "256GB", "512GB", "1TB"],
      "screen_size": "6.1 inches",
      "processor_chip": "A17 Pro"
    },
    "colors": [
      {
        "color": "Natural Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-natural-titanium"
      },
      {
        "color": "Blue Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-blue-titanium"
      },
      {
        "color": "White Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-white-titanium"
      },
      {
        "color": "Black Titanium",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-black-titanium"
      }
    ]
  },
  {
    "name": "iPhone 15 Plus",
    "category": "Phone",
    "release_year": 2023,
    "description": "Standard 2023 iPhone with a 6.7-inch display, Dynamic Island, and USB-C.",
    "specs": {
      "starting_price": 899,
      "storage_capacities": ["128GB", "256GB", "512GB"],
      "screen_size": "6.7 inches",
      "processor_chip": "A16 Bionic"
    },
    "colors": [
      {
        "color": "Pink",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-plus-pink"
      },
      {
        "color": "Yellow",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-plus-yellow"
      },
      {
        "color": "Green",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-plus-green"
      },
      {
        "color": "Blue",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-plus-blue"
      },
      {
        "color": "Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-plus-black"
      }
    ]
  },
  {
    "name": "iPhone 15",
    "category": "Phone",
    "release_year": 2023,
    "description": "Standard 2023 iPhone with a 6.1-inch display, Dynamic Island, and USB-C.",
    "specs": {
      "starting_price": 799,
      "storage_capacities": ["128GB", "256GB", "512GB"],
      "screen_size": "6.1 inches",
      "processor_chip": "A16 Bionic"
    },
    "colors": [
      {
        "color": "Pink",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pink"
      },
      {
        "color": "Yellow",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-yellow"
      },
      {
        "color": "Green",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-green"
      },
      {
        "color": "Blue",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-blue"
      },
      {
        "color": "Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-black"
      }
    ]
  },
  {
    "name": "MacBook Pro 16-inch (M4 Pro / M4 Max)",
    "category": "Laptop",
    "release_year": 2024,
    "description": "The ultimate pro laptop, featuring M4 Pro or M4 Max chips and long battery life.",
    "specs": {
      "starting_price": 2499,
      "storage_capacities": ["512GB", "1TB", "2TB", "4TB", "8TB"],
      "screen_size": "16.2 inches",
      "processor_chip": "M4 Pro / M4 Max"
    },
    "colors": [
      {
        "color": "Space Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-16-space-black-m4"
      },
      {
        "color": "Silver",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-16-silver-m4"
      }
    ]
  },
  {
    "name": "MacBook Pro 14-inch (M4 / M4 Pro / M4 Max)",
    "category": "Laptop",
    "release_year": 2024,
    "description": "Supercharged by M4 series chips, the 14-inch MacBook Pro delivers phenomenal performance in a compact size.",
    "specs": {
      "starting_price": 1599,
      "storage_capacities": ["512GB", "1TB", "2TB", "4TB", "8TB"],
      "screen_size": "14.2 inches",
      "processor_chip": "M4 / M4 Pro / M4 Max"
    },
    "colors": [
      {
        "color": "Space Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-space-black-m4"
      },
      {
        "color": "Silver",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-silver-m4"
      }
    ]
  },
  {
    "name": "MacBook Air 15-inch (M3)",
    "category": "Laptop",
    "release_year": 2024,
    "description": "Thin, light, and powerful with a larger 15.3-inch display and M3 chip.",
    "specs": {
      "starting_price": 1299,
      "storage_capacities": ["256GB", "512GB", "1TB", "2TB"],
      "screen_size": "15.3 inches",
      "processor_chip": "M3"
    },
    "colors": [
      {
        "color": "Midnight",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-midnight-m3"
      },
      {
        "color": "Starlight",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-starlight-m3"
      },
      {
        "color": "Space Gray",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-space-gray-m3"
      },
      {
        "color": "Silver",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-silver-m3"
      }
    ]
  },
  {
    "name": "MacBook Air 13-inch (M3)",
    "category": "Laptop",
    "release_year": 2024,
    "description": "Ultraportable 13.6-inch laptop supercharged by the M3 chip.",
    "specs": {
      "starting_price": 1099,
      "storage_capacities": ["256GB", "512GB", "1TB", "2TB"],
      "screen_size": "13.6 inches",
      "processor_chip": "M3"
    },
    "colors": [
      {
        "color": "Midnight",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-midnight-m3"
      },
      {
        "color": "Starlight",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-starlight-m3"
      },
      {
        "color": "Space Gray",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-space-gray-m3"
      },
      {
        "color": "Silver",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-silver-m3"
      }
    ]
  },
  {
    "name": "MacBook Pro 16-inch (M3 Pro / M3 Max)",
    "category": "Laptop",
    "release_year": 2023,
    "description": "2023 Pro laptop with the incredible power of M3 Pro or M3 Max.",
    "specs": {
      "starting_price": 2499,
      "storage_capacities": ["512GB", "1TB", "2TB", "4TB", "8TB"],
      "screen_size": "16.2 inches",
      "processor_chip": "M3 Pro / M3 Max"
    },
    "colors": [
      {
        "color": "Space Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-16-space-black-m3"
      },
      {
        "color": "Silver",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-16-silver-m3"
      }
    ]
  },
  {
    "name": "MacBook Pro 14-inch (M3 / M3 Pro / M3 Max)",
    "category": "Laptop",
    "release_year": 2023,
    "description": "2023 Pro laptop delivering massive performance in a 14-inch form factor.",
    "specs": {
      "starting_price": 1599,
      "storage_capacities": ["512GB", "1TB", "2TB", "4TB", "8TB"],
      "screen_size": "14.2 inches",
      "processor_chip": "M3 / M3 Pro / M3 Max"
    },
    "colors": [
      {
        "color": "Space Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-space-black-m3"
      },
      {
        "color": "Space Gray",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-space-gray-m3"
      },
      {
        "color": "Silver",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-silver-m3"
      }
    ]
  },
  {
    "name": "MacBook Air 15-inch (M2)",
    "category": "Laptop",
    "release_year": 2023,
    "description": "First 15-inch Air, offering plenty of screen space and the power of the M2 chip.",
    "specs": {
      "starting_price": 1299,
      "storage_capacities": ["256GB", "512GB", "1TB", "2TB"],
      "screen_size": "15.3 inches",
      "processor_chip": "M2"
    },
    "colors": [
      {
        "color": "Midnight",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-midnight-m2"
      },
      {
        "color": "Starlight",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-starlight-m2"
      },
      {
        "color": "Space Gray",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-space-gray-m2"
      },
      {
        "color": "Silver",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-silver-m2"
      }
    ]
  },
  {
    "name": "AirPods 4",
    "category": "Earbuds",
    "release_year": 2024,
    "description": "Next-generation standard AirPods featuring redesigned fit and improved audio.",
    "specs": {
      "starting_price": 129,
      "storage_capacities": ["N/A"],
      "screen_size": "N/A",
      "processor_chip": "H2"
    },
    "colors": [
      {
        "color": "White",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-4"
      }
    ]
  },
  {
    "name": "AirPods 4 with Active Noise Cancellation",
    "category": "Earbuds",
    "release_year": 2024,
    "description": "Next-generation AirPods adding Active Noise Cancellation in an open-ear design.",
    "specs": {
      "starting_price": 179,
      "storage_capacities": ["N/A"],
      "screen_size": "N/A",
      "processor_chip": "H2"
    },
    "colors": [
      {
        "color": "White",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-4-anc"
      }
    ]
  },
  {
    "name": "AirPods Max (USB-C)",
    "category": "Headphones",
    "release_year": 2024,
    "description": "Over-ear headphones updated with fresh colors and a USB-C port.",
    "specs": {
      "starting_price": 549,
      "storage_capacities": ["N/A"],
      "screen_size": "N/A",
      "processor_chip": "H1"
    },
    "colors": [
      {
        "color": "Midnight",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-midnight"
      },
      {
        "color": "Starlight",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-starlight"
      },
      {
        "color": "Blue",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-blue"
      },
      {
        "color": "Purple",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-purple"
      },
      {
        "color": "Orange",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-orange"
      }
    ]
  },
  {
    "name": "AirPods Pro 2 (USB-C)",
    "category": "Earbuds",
    "release_year": 2023,
    "description": "Premium wireless earbuds updated with a USB-C charging case and loss-less audio support with Vision Pro.",
    "specs": {
      "starting_price": 249,
      "storage_capacities": ["N/A"],
      "screen_size": "N/A",
      "processor_chip": "H2"
    },
    "colors": [
      {
        "color": "White",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-usb-c"
      }
    ]
  },
  {
    "name": "Beats Solo 4",
    "category": "Headphones",
    "release_year": 2024,
    "description": "On-ear headphones with custom acoustic architecture and up to 50 hours of battery life.",
    "specs": {
      "starting_price": 199,
      "storage_capacities": ["N/A"],
      "screen_size": "N/A",
      "processor_chip": "Custom Beats Platform"
    },
    "colors": [
      {
        "color": "Matte Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-solo-4-black"
      },
      {
        "color": "Slate Blue",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-solo-4-slate-blue"
      },
      {
        "color": "Cloud Pink",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-solo-4-cloud-pink"
      }
    ]
  },
  {
    "name": "Beats Studio Pro",
    "category": "Headphones",
    "release_year": 2023,
    "description": "Over-ear headphones featuring fully adaptive Active Noise Cancelling and personalized spatial audio.",
    "specs": {
      "starting_price": 349,
      "storage_capacities": ["N/A"],
      "screen_size": "N/A",
      "processor_chip": "Custom Beats Platform"
    },
    "colors": [
      {
        "color": "Black",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-studio-pro-black"
      },
      {
        "color": "Deep Brown",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-studio-pro-deep-brown"
      },
      {
        "color": "Navy",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-studio-pro-navy"
      },
      {
        "color": "Sandstone",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-studio-pro-sandstone"
      }
    ]
  },
  {
    "name": "Beats Studio Buds+",
    "category": "Earbuds",
    "release_year": 2023,
    "description": "True wireless earbuds with advanced ANC, transparency mode, and a transparent design option.",
    "specs": {
      "starting_price": 169,
      "storage_capacities": ["N/A"],
      "screen_size": "N/A",
      "processor_chip": "Custom Beats Platform"
    },
    "colors": [
      {
        "color": "Transparent",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-studio-buds-plus-transparent"
      },
      {
        "color": "Black / Gold",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-studio-buds-plus-black-gold"
      },
      {
        "color": "Ivory",
        "image_url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/beats-studio-buds-plus-ivory"
      }
    ]
  }
];

async function seed() {
  console.log("Seeding products to Firestore...");
  for (const product of PRODUCTS) {
    const slug = getSlug(product.name);
    const docRef = doc(db, "products", slug);
    await setDoc(docRef, {
      ...product,
      slug,
    });
    console.log(`Uploaded product: ${product.name} with document ID: ${slug}`);
  }
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
});
