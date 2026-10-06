import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updates = {
  "bluetooth-speaker": "/images/bluetooth-speaker.jpg",
  "smart-watch": "/images/smart-watch.jpg",
  "wireless-earbuds": "/images/wireless-earbuds.jpg",
  "navy-backpack": "/images/navy-backpack.jpg",
  "stainless-steel-bottle": "/images/stainless-steel-bottle.jpg",
  "classic-sunglasses": "/images/classic-sunglasses.jpg",
};

async function run() {
  for (const [slug, imageUrl] of Object.entries(updates)) {
    await prisma.product.updateMany({
      where: { slug },
      data: { imageUrl },
    });
  }
  console.log("Product images updated in database successfully!");
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
