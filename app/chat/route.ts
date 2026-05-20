import { NextRequest } from "next/server";
import { PRODUCTS as LOCAL_PRODUCTS, getSlug, Product } from "../data/products";

const PRODUCTS_URL = "https://raw.githubusercontent.com/00YellowLemon/Sales-assistant-eccomerce/apple-products-data-8384851639734225394/apple.json";

// Dynamic retrieval of products to stay in sync with the remote repository source
async function getLiveProducts(): Promise<Product[]> {
  try {
    const res = await fetch(PRODUCTS_URL, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.products)) {
        return data.products;
      }
    }
  } catch (error) {
    console.error("Failed to fetch live products inside /chat handler, using local fallback:", error);
  }
  return LOCAL_PRODUCTS;
}

// Helper function to find matching products based on text queries
function findProductsByKeyword(query: string, products: Product[]): Product[] {
  const normalized = query.toLowerCase();
  return products.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(normalized);
    const descMatch = p.description.toLowerCase().includes(normalized);
    const categoryMatch = p.category.toLowerCase().includes(normalized);
    const chipMatch = p.specs.processor_chip.toLowerCase().includes(normalized);
    return nameMatch || descMatch || categoryMatch || chipMatch;
  });
}

// Helper to extract specifically mentioned products in a query
function extractMentionedProducts(query: string, products: Product[]): Product[] {
  const normalized = query.toLowerCase();
  // Sort products by length descending so we match "iPhone 16 Pro Max" before "iPhone 16"
  const sortedProducts = [...products].sort((a, b) => b.name.length - a.name.length);
  const found: Product[] = [];
  
  for (const product of sortedProducts) {
    if (normalized.includes(product.name.toLowerCase())) {
      found.push(product);
      // Remove matched product name from temp query to avoid double matching substrings
    }
  }

  // Fallback to partial word matching if no exact matches found
  if (found.length === 0) {
    if (normalized.includes("16 pro max")) return [products.find(p => p.name === "iPhone 16 Pro Max")!];
    if (normalized.includes("16 pro")) return [products.find(p => p.name === "iPhone 16 Pro")!];
    if (normalized.includes("16 plus")) return [products.find(p => p.name === "iPhone 16 Plus")!];
    if (normalized.includes("iphone 16")) return [products.find(p => p.name === "iPhone 16")!];
    if (normalized.includes("15 pro max")) return [products.find(p => p.name === "iPhone 15 Pro Max")!];
    if (normalized.includes("15 pro")) return [products.find(p => p.name === "iPhone 15 Pro")!];
    if (normalized.includes("15 plus")) return [products.find(p => p.name === "iPhone 15 Plus")!];
    if (normalized.includes("iphone 15")) return [products.find(p => p.name === "iPhone 15")!];
    if (normalized.includes("max (usb-c)") || normalized.includes("airpods max")) return [products.find(p => p.name === "AirPods Max (USB-C)")!];
    if (normalized.includes("pro 2") || normalized.includes("airpods pro")) return [products.find(p => p.name === "AirPods Pro 2 (USB-C)")!];
    if (normalized.includes("airpods 4 anc") || normalized.includes("airpods 4 noise")) return [products.find(p => p.name === "AirPods 4 with Active Noise Cancellation")!];
    if (normalized.includes("airpods 4")) return [products.find(p => p.name === "AirPods 4")!];
    if (normalized.includes("solo 4")) return [products.find(p => p.name === "Beats Solo 4")!];
    if (normalized.includes("studio pro")) return [products.find(p => p.name === "Beats Studio Pro")!];
    if (normalized.includes("buds+")) return [products.find(p => p.name === "Beats Studio Buds+")!];
  }

  return found.filter(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    const { messages, threadId } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ reply: "Hello! How can I assist you with your shopping experience today?" });
    }

    // Retrieve the user's last message
    const userMessages = messages.filter((m) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1];
    const query = lastUserMessage ? lastUserMessage.content : "";
    const normalizedQuery = query.toLowerCase().trim();

    // ----------------------------------------------------
    // Remote Agent Call (Primary Mechanism)
    // ----------------------------------------------------
    const REMOTE_AGENT_URL = "https://sales-assistant-1013482758027.us-central1.run.app/chat";
    try {
      // Setup AbortController for a 15-second timeout so the storefront remains responsive
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const remoteRes = await fetch(REMOTE_AGENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          thread_id: threadId || undefined,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        if (data && data.response) {
          return Response.json({ reply: data.response });
        }
      } else {
        console.warn(`Remote Sales Assistant returned status ${remoteRes.status}: ${remoteRes.statusText}`);
      }
    } catch (remoteError) {
      console.error("Failed to fetch from remote Sales Assistant, falling back to local simulation:", remoteError);
    }

    // ----------------------------------------------------
    // Local Simulated Assistant Fallback
    // ----------------------------------------------------
    // Retrieve dynamically loaded products from the remote repository source URL
    const productsList = await getLiveProducts();

    let reply = "";

    // 1. GREETINGS & BASICS
    if (
      normalizedQuery === "" ||
      normalizedQuery === "hello" ||
      normalizedQuery === "hi" ||
      normalizedQuery === "hey" ||
      normalizedQuery === "sup" ||
      normalizedQuery === "greetings" ||
      normalizedQuery.includes("who are you") ||
      normalizedQuery.includes("help")
    ) {
      reply = `Hello! 👋 Welcome to **Shopy**, your premium destination for top-tier Apple & Beats audio gear. 

I am your dedicated **Shopy Assistant**, an expert on our complete inventory. I can help you:
- 📱 Compare specifications across standard & Pro iPhones
- 💻 Find the perfect MacBook Pro or Air for your workflow
- 🎧 Compare high-fidelity ANC earbuds and headphones
- 🚚 Explain our **free premium shipping** and **comprehensive product warranties**

What kind of device are you looking to explore today?`;
    }
    
    // 2. SHIPPING / WARRANTY / PERKS
    else if (
      normalizedQuery.includes("ship") ||
      normalizedQuery.includes("deliver") ||
      normalizedQuery.includes("warranty") ||
      normalizedQuery.includes("guarantee") ||
      normalizedQuery.includes("return") ||
      normalizedQuery.includes("perk")
    ) {
      reply = `### 🌟 The Shopy Premium Guarantee

We want you to shop with absolute peace of mind. Every single order from Shopy includes our standard premium perks:

- 🚚 **Free Premium Shipping:** Fully tracked, signature-guaranteed shipping on all orders, arriving in 2-3 business days.
- 🛡️ **Comprehensive 1-Year Warranty:** Covers all manufacturing defects, battery health anomalies, and hardware concerns.
- 🔄 **30-Day Easy Returns:** No restocking fees. If you're not completely in love with your new Apple device, return it in its original packaging.

How can I help you find your next device today?`;
    }

    // 3. COMPARISON REQUESTS (e.g. iPhone 16 Pro vs iPhone 15 Pro, M3 vs M4, comparison tables)
    else if (
      normalizedQuery.includes("compare") ||
      normalizedQuery.includes(" versus ") ||
      normalizedQuery.includes(" vs ") ||
      normalizedQuery.includes("difference")
    ) {
      const detected = extractMentionedProducts(normalizedQuery, productsList);

      if (detected.length >= 2) {
        // Compare the first two detected products
        const p1 = detected[0];
        const p2 = detected[1];

        reply = `### 📊 Comparison: ${p1.name} vs ${p2.name}

Here is a side-by-side spec comparison to help you choose between these two incredible devices:

| Feature | [${p1.name}](/product/${getSlug(p1.name)}) | [${p2.name}](/product/${getSlug(p2.name)}) |
| :--- | :--- | :--- |
| **Category** | ${p1.category} | ${p2.category} |
| **Release Year** | ${p1.release_year} | ${p2.release_year} |
| **Starting Price** | **$${p1.specs.starting_price}** | **$${p2.specs.starting_price}** |
| **Processor Chip** | \`${p1.specs.processor_chip}\` | \`${p2.specs.processor_chip}\` |
| **Screen Size** | ${p1.specs.screen_size} | ${p2.specs.screen_size} |
| **Storage Options** | ${p1.specs.storage_capacities.join(", ")} | ${p2.specs.storage_capacities.join(", ")} |
| **Colors** | ${p1.colors.map(c => c.color).join(", ")} | ${p2.colors.map(c => c.color).join(", ")} |

#### 💡 Expert Verdict & Recommendations:
- If you're looking for **newer features** and top-tier **future-proofing**, the **[${p1.name}](/product/${getSlug(p1.name)})** featuring the **${p1.specs.processor_chip}** chip is a spectacular investment.
- If you're seeking **incredible value** while maintaining pro-grade capability, the **[${p2.name}](/product/${getSlug(p2.name)})** represents a highly smart, cost-effective option.

Both models qualify for our **free premium shipping** and **1-year comprehensive warranty**! Which color way has caught your eye?`;
      } 
      
      // Category comparisons if we couldn't resolve exactly two distinct products
      else if (normalizedQuery.includes("iphone") || normalizedQuery.includes("phone")) {
        reply = `### 📱 iPhone Series Spec Comparison

If you're deciding on a new iPhone, here is a quick breakdown of our flagship **iPhone 16 Series** options:

| Model | Screen Size | Chip | Pro Camera System | Price |
| :--- | :--- | :--- | :--- | :--- |
| **[iPhone 16 Pro Max](/product/iphone-16-pro-max)** | 6.9" | A18 Pro | 5x Telephoto + Control | From $1,199 |
| **[iPhone 16 Pro](/product/iphone-16-pro)** | 6.3" | A18 Pro | 5x Telephoto + Control | From $999 |
| **[iPhone 16 Plus](/product/iphone-16-plus)** | 6.7" | A18 | Standard + Wide Angle | From $899 |
| **[iPhone 16](/product/iphone-16)** | 6.1" | A18 | Standard + Wide Angle | From $799 |

*All models feature the brand new dynamic physical **Camera Control** button and qualify for free signature shipping.*

Would you like details on a specific iPhone model?`;
      } 
      
      else if (normalizedQuery.includes("macbook") || normalizedQuery.includes("laptop") || normalizedQuery.includes("m3") || normalizedQuery.includes("m4")) {
        reply = `### 💻 MacBook Pro vs MacBook Air Comparison

To help you decide between raw pro performance and ultra-light portability:

| Laptop Type | Key Advantages | Chip Configs | Starting Price | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **[MacBook Pro Series](/product/macbook-pro-14-inch-m4-m4-pro-m4-max)** | Liquid Retina XDR, active cooling, maximum ports | M4, M4 Pro, M4 Max | From $1,599 | Coding, video editing, 3D rendering |
| **[MacBook Air Series](/product/macbook-air-13-inch-m3)** | Ultra-thin fanless design, lightweight, all-day battery | M3, M2 | From $1,099 | Students, standard office work, travel |

Which workflow are you planning to power with your new MacBook?`;
      }
      
      else {
        reply = `I can definitely help you compare our products! What specific items are you comparing? For example, you can ask me to:
- "Compare iPhone 16 Pro vs iPhone 15 Pro"
- "What's the difference between AirPods Pro 2 and AirPods 4?"
- "Compare MacBook Pro and MacBook Air"`;
      }
    }

    // 4. BUDGET / PRICE INQUIRIES (e.g. cheapest, price under 1000, how much)
    else if (
      normalizedQuery.includes("cheap") ||
      normalizedQuery.includes("budget") ||
      normalizedQuery.includes("lowest price") ||
      normalizedQuery.includes("cost") ||
      normalizedQuery.includes("how much") ||
      normalizedQuery.includes("price")
    ) {
      // Check if they want specific category budget
      if (normalizedQuery.includes("audio") || normalizedQuery.includes("airpods") || normalizedQuery.includes("beats") || normalizedQuery.includes("headphone") || normalizedQuery.includes("earbud")) {
        const audioItems = productsList.filter(p => p.category === "Earbuds" || p.category === "Headphones")
          .sort((a, b) => a.specs.starting_price - b.specs.starting_price);
        
        reply = `### 🎧 Best Budget Audio & Sound Gear

If you're looking for high-quality audio at a fantastic price point, here are our most accessible options:

1. **[AirPods 4](/product/airpods-4)** ($129) - Redesigned open-ear fit, immersive spatial audio, powered by the H2 chip.
2. **[Beats Studio Buds+](/product/beats-studio-buds-plus)** ($169) - True wireless earbuds with advanced active noise cancellation and a cool transparent colorway option.
3. **[Beats Solo 4](/product/beats-solo-4)** ($199) - Ultra-comfortable on-ear headphones with custom acoustics and up to 50 hours of battery life.

*All items ship absolutely free and include our full 1-year product warranty.*`;
      } 
      
      else if (normalizedQuery.includes("macbook") || normalizedQuery.includes("laptop") || normalizedQuery.includes("mac")) {
        const laptops = productsList.filter(p => p.category === "Laptop")
          .sort((a, b) => a.specs.starting_price - b.specs.starting_price);

        reply = `### 💻 Best Value MacBooks

To get the power of macOS and Apple Silicon at our best price points:

1. **[MacBook Air 13-inch (M3)](/product/macbook-air-13-inch-m3)** ($1,099) - The ultimate ultraportable. Incredible value with the latest M3 processor and fanless silent performance.
2. **[MacBook Air 15-inch (M3)](/product/macbook-air-15-inch-m3)** ($1,299) - Offers the same ultra-thin design and M3 chip, but with a beautiful, spacious 15.3-inch Liquid Retina display.

Would you like to explore the technical configurations of our MacBook Air line?`;
      } 
      
      else {
        // General budget items under $1000
        const budgetIphones = productsList.filter(p => p.category === "Phone" && p.specs.starting_price < 1000)
          .sort((a, b) => a.specs.starting_price - b.specs.starting_price);

        reply = `### 📱 Outstanding Value Apple Devices Under $1,000

Looking for premium performance without crossing the $1,000 threshold? Here are our highly recommended devices:

#### Phones & Handhelds:
- **[iPhone 16](/product/iphone-16)** (From $799) - Powered by the all-new A18 chip and physical Camera Control.
- **[iPhone 15](/product/iphone-15)** (From $799) - Features Dynamic Island, USB-C, and a fantastic 48MP main camera.
- **[iPhone 16 Plus](/product/iphone-16-plus)** (From $899) - Exceptional battery life and a large 6.7-inch screen.
- **[iPhone 16 Pro](/product/iphone-16-pro)** (From $999) - Pro titanium chassis, A18 Pro chip, and the advanced 5x zoom camera.

We also offer premium audio options like **[AirPods 4](/product/airpods-4)** starting at just **$129**. 

All orders qualify for **free premium shipping** and a **1-year warranty**. What kind of device fits your budget target?`;
      }
    }

    // 5. SPECIFIC PRODUCT QUERIES (Check if they mentioned a specific product in our inventory)
    else {
      const matchedProducts = extractMentionedProducts(normalizedQuery, productsList);
      
      if (matchedProducts.length > 0) {
        const product = matchedProducts[0];
        const slug = getSlug(product.name);

        reply = `### 📱 Product Spotlight: [${product.name}](/product/${slug})

The **${product.name}** (${product.release_year}) is a premium ${product.category.toLowerCase()} designed to deliver exceptional experiences:

> "${product.description}"

#### ⚙️ Technical Specifications:
- 💰 **Starting Price:** $${product.specs.starting_price}
- 🧠 **Processor Chip:** \`${product.specs.processor_chip}\`
- 🖥️ **Screen Size:** ${product.specs.screen_size}
- 💾 **Storage Capacities:** ${product.specs.storage_capacities.join(", ")}

#### 🎨 Premium Color Ways:
${product.colors.map(c => `- **${c.color}**`).join("\n")}

✨ *Every purchase of the **[${product.name}](/product/${slug})** includes **free premium shipping** and our **1-year hardware warranty**.*

[👉 View Product Details & Add to Cart](/product/${slug})`;
      } 
      
      // 6. CATEGORY LEVEL BROWSES / DETECT KEYWORDS
      else if (
        normalizedQuery.includes("iphone") ||
        normalizedQuery.includes("phone") ||
        normalizedQuery.includes("mobile")
      ) {
        reply = `### 📱 Explore Our Premium iPhone Lineup

We stock a curated, brand-new selection of high-fidelity iPhones. Select a model to learn more:

- **[iPhone 16 Pro Max](/product/iphone-16-pro-max)** (From $1,199) - 6.9" display, A18 Pro chip, Grade 5 titanium structure.
- **[iPhone 16 Pro](/product/iphone-16-pro)** (From $999) - 6.3" display, A18 Pro chip, advanced triple-lens camera.
- **[iPhone 16 Plus](/product/iphone-16-plus)** (From $899) - 6.7" display, A18 chip, stunning pastel and bright colors.
- **[iPhone 16](/product/iphone-16)** (From $799) - 6.1" display, standard A18 power, Action & Camera Control.
- **[iPhone 15 Pro Max](/product/iphone-15-pro-max)** (From $1,199) - 6.7" display, A17 Pro chip, premium 5x telephoto zoom.

Which iPhone screen size or features do you prefer?`;
      } 
      
      else if (
        normalizedQuery.includes("macbook") ||
        normalizedQuery.includes("laptop") ||
        normalizedQuery.includes("mac") ||
        normalizedQuery.includes("computer")
      ) {
        reply = `### 💻 Explore Our MacBook Laptops

Unleash your productivity with our catalog of state-of-the-art Apple Silicon laptops:

#### Pro Powerhouses (For developers, creators, & designers):
- **[MacBook Pro 16-inch (M4)](/product/macbook-pro-16-inch-m4-pro-m4-max)** (From $2,499) - Ultimate performance, massive Liquid Retina XDR screen.
- **[MacBook Pro 14-inch (M4)](/product/macbook-pro-14-inch-m4-m4-pro-m4-max)** (From $1,599) - The perfect hybrid of extreme performance and 14" ultra-portability.

#### Sleek & Portable (For daily tasks, students, & travel):
- **[MacBook Air 15-inch (M3)](/product/macbook-air-15-inch-m3)** (From $1,299) - Ultra-thin fanless design with a gorgeous 15.3" screen.
- **[MacBook Air 13-inch (M3)](/product/macbook-air-13-inch-m3)** (From $1,099) - The light-as-air 13.6" travel powerhouse.

What kind of work or apps do you plan to run on your new MacBook?`;
      } 
      
      else if (
        normalizedQuery.includes("airpods") ||
        normalizedQuery.includes("beats") ||
        normalizedQuery.includes("headphone") ||
        normalizedQuery.includes("earbud") ||
        normalizedQuery.includes("audio") ||
        normalizedQuery.includes("sound") ||
        normalizedQuery.includes("music")
      ) {
        reply = `### 🎧 Explore High-Fidelity Audio Gear

Enhance your sonic experience with our curated premium line of headphones and wireless earbuds:

#### Apple AirPods Series:
- **[AirPods Max (USB-C)](/product/airpods-max-usb-c)** ($549) - Pure high-fidelity over-ear comfort with advanced Active Noise Cancellation (ANC).
- **[AirPods Pro 2 (USB-C)](/product/airpods-pro-2-usb-c)** ($249) - True wireless earbuds with best-in-class adaptive ANC and dust resistance.
- **[AirPods 4 with ANC](/product/airpods-4-with-active-noise-cancellation)** ($179) - Redesigned open-ear design featuring powerful ANC.
- **[AirPods 4](/product/airpods-4)** ($129) - Redesigned standard open-ear acoustics.

#### Beats Audio Series:
- **[Beats Studio Pro](/product/beats-studio-pro)** ($349) - Premium over-ear headphones with personalized spatial audio.
- **[Beats Solo 4](/product/beats-solo-4)** ($199) - On-ear high-fidelity headphones with up to 50 hours of battery life.
- **[Beats Studio Buds+](/product/beats-studio-buds-plus)** ($169) - True wireless active earbuds with a beautiful transparent model option.

Are you looking for in-ear convenience (earbuds) or over-ear immersion (headphones)?`;
      } 
      
      // 7. KEYWORD SEARCH AS A GENERAL FALLBACK
      else {
        const matches = findProductsByKeyword(normalizedQuery, productsList);
        
        if (matches.length > 0) {
          reply = `I found some devices in our catalog that match your interest:

${matches.map((m) => `- **[${m.name}](/product/${getSlug(m.name)})** ($${m.specs.starting_price}) - ${m.description}`).join("\n")}

Would you like more details, specs, or color options for any of these models?`;
        } 
        
        // 8. FINAL ULTIMATE ENGAGING AI SHOP ASSISTANT CONVERSATIONAL REPLY
        else {
          reply = `That sounds like a fascinating question! While I focus on our catalog of premium Apple devices (iPhones, MacBooks, AirPods) and Beats audio gear, I'd love to help you find the perfect match.

Could you tell me a bit more about:
- Which category you're interested in (Phones, Laptops, or Sound gear)?
- What your budget target is?
- Any specific features you need (like maximum battery life, pro cameras, or active noise cancellation)?

Alternatively, you can ask me to **compare models** or detail any product in our menu!`;
        }
      }
    }

    return Response.json({ reply });
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return Response.json(
      { error: "Internal Server Error", message: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

