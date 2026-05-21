import { NextRequest } from "next/server";
import { getSlug, Product } from "../data/products";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Dynamic retrieval of products strictly from Firestore database
async function getLiveProducts(): Promise<Product[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const fetchedProducts: Product[] = [];
    querySnapshot.forEach((doc) => {
      fetchedProducts.push(doc.data() as Product);
    });
    // Sort items by release_year desc by default so flagship models stay on top
    fetchedProducts.sort((a, b) => b.release_year - a.release_year);
    return fetchedProducts;
  } catch (error) {
    console.error("Failed to fetch live products from Firestore inside /chat handler:", error);
    return [];
  }
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
    }
  }

  // Fallback to partial word matching in product names from our inventory, NOT hardcoded Apple models!
  if (found.length === 0) {
    for (const product of sortedProducts) {
      // Split product name into tokens to check if user's query mentions significant parts of it
      const nameTokens = product.name.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      if (nameTokens.length > 0 && nameTokens.every(token => normalized.includes(token))) {
        found.push(product);
        break; // Match the first best one
      }
    }
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
      reply = `Hello! 👋 Welcome to **Shopy**, your premium destination for top-tier consumer electronics, tech gear, and smart devices. 

I am your dedicated **Shopy Assistant**, an expert on our complete inventory. I can help you:
- 📱 Compare specifications and features of our latest models
- 💻 Find the perfect device for your specific workflow
- 🎧 Explore high-fidelity audio, smartwear, and entertainment accessories
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
- 🔄 **30-Day Easy Returns:** No restocking fees. If you're not completely in love with your new device, return it in its original packaging.

How can I help you find your next device today?`;
    }

    // 3. COMPARISON REQUESTS (e.g. specs vs specs, difference, compare)
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
| **Processor/Spec** | \`${p1.specs.processor_chip || 'N/A'}\` | \`${p2.specs.processor_chip || 'N/A'}\` |
| **Display/Size** | ${p1.specs.screen_size || 'N/A'} | ${p2.specs.screen_size || 'N/A'} |
| **Storage Options** | ${p1.specs.storage_capacities ? p1.specs.storage_capacities.join(", ") : 'N/A'} | ${p2.specs.storage_capacities ? p2.specs.storage_capacities.join(", ") : 'N/A'} |
| **Colors** | ${p1.colors ? p1.colors.map(c => c.color).join(", ") : 'N/A'} | ${p2.colors ? p2.colors.map(c => c.color).join(", ") : 'N/A'} |

#### 💡 Expert Verdict & Recommendations:
- If you're looking for **newer features** and top-tier **future-proofing**, the **[${p1.name}](/product/${getSlug(p1.name)})** featuring the **${p1.specs.processor_chip || 'advanced design'}** is a spectacular investment.
- If you're seeking **incredible value** while maintaining pro-grade capability, the **[${p2.name}](/product/${getSlug(p2.name)})** represents a highly smart, cost-effective option.

Both models qualify for our **free premium shipping** and **1-year comprehensive warranty**! Which color way has caught your eye?`;
      } 
      
      // Category comparisons if we couldn't resolve exactly two distinct products
      else {
        // Find if a category was mentioned
        const categories = Array.from(new Set(productsList.map(p => p.category)));
        const matchedCategory = categories.find(cat => normalizedQuery.includes(cat.toLowerCase()));
        
        if (matchedCategory) {
          const categoryProducts = productsList.filter(p => p.category === matchedCategory).slice(0, 4);
          if (categoryProducts.length > 0) {
            reply = `### 📊 ${matchedCategory} Spec Comparison\n\n`;
            reply += `Here is a side-by-side comparison of our available **${matchedCategory}** products:\n\n`;
            
            // Build markdown table dynamically
            reply += `| Model | Processor / Spec | Starting Price | Release Year |\n`;
            reply += `| :--- | :--- | :--- | :--- |\n`;
            for (const p of categoryProducts) {
              reply += `| **[${p.name}](/product/${getSlug(p.name)})** | ${p.specs.processor_chip || 'N/A'} | $${p.specs.starting_price} | ${p.release_year} |\n`;
            }
            
            reply += `\nWould you like details on any specific model?`;
          } else {
            reply = `We carry premium products in the **${matchedCategory}** category. Please check our storefront to see our current inventory.`;
          }
        } else {
          // If no categories matched, check if we have any products to suggest comparing
          const sampleProducts = productsList.slice(0, 3);
          if (sampleProducts.length >= 2) {
            reply = `I can definitely help you compare our products! What specific items are you comparing? For example, you can ask me to:\n`;
            reply += `- "Compare ${sampleProducts[0].name} vs ${sampleProducts[1].name}"\n`;
            if (sampleProducts[2]) {
              reply += `- "What's the difference between ${sampleProducts[1].name} and ${sampleProducts[2].name}?"\n`;
            }
          } else {
            reply = `I can definitely help you compare our products! What specific items are you looking to compare today?`;
          }
        }
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
      const sortedByPrice = [...productsList].sort((a, b) => a.specs.starting_price - b.specs.starting_price);
      
      if (sortedByPrice.length > 0) {
        reply = `### 💰 Best Budget & Value Deals at Shopy\n\n`;
        reply += `If you're looking for outstanding performance at an accessible price point, here are our most value-packed options:\n\n`;
        
        const topBudgets = sortedByPrice.slice(0, 3);
        topBudgets.forEach((p, idx) => {
          reply += `${idx + 1}. **[${p.name}](/product/${getSlug(p.name)})** ($${p.specs.starting_price}) - ${p.description}\n`;
        });
        
        reply += `\n*All items ship absolutely free and include our full 1-year product warranty. What kind of device fits your budget target?*`;
      } else {
        reply = `We offer premium electronics at competitive prices! Every purchase qualifies for **free premium shipping** and a **1-year warranty**. What kind of device fits your budget target?`;
      }
    }

    // 5. SPECIFIC PRODUCT QUERIES & CATEGORY DETECTS
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
- 🧠 **Processor/Spec Chip:** \`${product.specs.processor_chip || 'N/A'}\`
- 🖥️ **Display/Size:** ${product.specs.screen_size || 'N/A'}
- 💾 **Storage/Capacities:** ${product.specs.storage_capacities ? product.specs.storage_capacities.join(", ") : 'N/A'}

#### 🎨 Premium Color Ways:
${product.colors ? product.colors.map(c => `- **${c.color}**`).join("\n") : ''}

✨ *Every purchase of the **[${product.name}](/product/${slug})** includes **free premium shipping** and our **1-year hardware warranty**.*

[👉 View Product Details & Add to Cart](/product/${slug})`;
      } 
      
      // 6. CATEGORY LEVEL BROWSES / DETECT KEYWORDS
      else {
        // See if query mentions any category name
        const categories = Array.from(new Set(productsList.map(p => p.category)));
        const matchedCategory = categories.find(cat => normalizedQuery.includes(cat.toLowerCase()));
        
        if (matchedCategory) {
          const categoryProducts = productsList.filter(p => p.category === matchedCategory);
          reply = `### 📱 Explore Our Premium ${matchedCategory} Lineup\n\n`;
          reply += `We stock a curated selection of state-of-the-art **${matchedCategory}** products. Select a model to learn more:\n\n`;
          
          categoryProducts.slice(0, 5).forEach((p) => {
            reply += `- **[${p.name}](/product/${getSlug(p.name)})** (From $${p.specs.starting_price}) - ${p.description}\n`;
          });
          
          reply += `\nWhich model or features do you prefer?`;
        }
        
        // 7. KEYWORD SEARCH AS A GENERAL FALLBACK
        else {
          const matches = findProductsByKeyword(normalizedQuery, productsList);
          
          if (matches.length > 0) {
            reply = `I found some devices in our catalog that match your interest:\n\n`;
            reply += matches.map((m) => `- **[${m.name}](/product/${getSlug(m.name)})** ($${m.specs.starting_price}) - ${m.description}`).join("\n");
            reply += `\n\nWould you like more details, specs, or options for any of these models?`;
          } 
          
          // 8. FINAL ULTIMATE ENGAGING AI SHOP ASSISTANT CONVERSATIONAL REPLY
          else {
            reply = `That sounds like a fascinating question! I'd love to help you find the perfect match from our catalog of premium electronics and tech gear.

Could you tell me a bit more about:
- Which category you're interested in? ${categories.length > 0 ? `(We carry: ${categories.join(", ")})` : ""}
- What your budget target is?
- Any specific features you need (like maximum battery life, performance chips, or unique finishes)?

Alternatively, you can ask me to **compare models** or detail any product in our menu!`;
          }
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

