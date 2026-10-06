import fs from "fs";
import path from "path";
import https from "https";

const IMAGES = {
  "over-ear-headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  "power-bank-20000mah": "https://images.unsplash.com/photo-1609592426868-b732f7823528?w=800&auto=format&fit=crop&q=80",
  "gaming-controller": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80",
  "car-phone-mount": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80",
  "dash-cam-1080p": "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80",
  "leather-handbag": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
  "white-sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
  "tailored-blazer": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
  "yoga-mat": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80",
  "running-cap": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80",
  "skincare-trio-set": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
  "rose-lip-tint": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80",
  "modern-table-lamp": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
  "velvet-armchair": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80",
  "ceramic-plant-pot": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80",
  "teddy-bear-plush": "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&auto=format&fit=crop&q=80",
  "bestseller-book-bundle": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
  "dog-chew-toy-set": "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80",
};

const targetDir = path.join(process.cwd(), "public", "images");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirect
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Status ${response.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve());
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log("Downloading mockups for all products...");
  for (const [slug, url] of Object.entries(IMAGES)) {
    const dest = path.join(targetDir, `${slug}.jpg`);
    try {
      await download(url, dest);
      const stat = fs.statSync(dest);
      console.log(`✓ ${slug}.jpg (${Math.round(stat.size / 1024)} KB)`);
    } catch (err) {
      console.error(`✗ Failed for ${slug}:`, err.message);
    }
  }
  console.log("Done downloading product mockups.");
}

run();
