// prisma/seed.ts — Seed database with dummy posts for testing
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Using picsum.photos for reliable random images with different aspect ratios
const SAMPLE_IMAGES = [
  "https://picsum.photos/seed/pin1/400/600",
  "https://picsum.photos/seed/pin2/400/500",
  "https://picsum.photos/seed/pin3/400/700",
  "https://picsum.photos/seed/pin4/400/550",
  "https://picsum.photos/seed/pin5/400/400",
  "https://picsum.photos/seed/pin6/400/650",
  "https://picsum.photos/seed/pin7/400/480",
  "https://picsum.photos/seed/pin8/400/580",
  "https://picsum.photos/seed/pin9/400/520",
  "https://picsum.photos/seed/pin10/400/630",
  "https://picsum.photos/seed/pin11/400/450",
  "https://picsum.photos/seed/pin12/400/700",
  "https://picsum.photos/seed/pin13/400/380",
  "https://picsum.photos/seed/pin14/400/560",
  "https://picsum.photos/seed/pin15/400/490",
  "https://picsum.photos/seed/pin16/400/610",
];

const CAPTIONS = [
  "Aesthetic room decor ✨",
  "Sunset vibes 🌅",
  "Typography inspo",
  "Cozy winter outfit ideas",
  "Minimalist desk setup",
  "Street style photography",
  "Homemade pasta recipe 🍝",
  "Travel bucket list destinations",
  "Abstract art collection",
  "Plants for small spaces 🌿",
  "Vintage poster design",
  "Morning routine essentials",
  null,
  "DIY home decoration",
  null,
  "Color palette inspiration 🎨",
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Create dummy users (if they don't exist)
  const users = [];
  const userNames = [
    { email: "bila@test.com", username: "bila_design" },
    { email: "chris@test.com", username: "chris_art" },
    { email: "evelyn@test.com", username: "evelyn_creates" },
    { email: "shalwa@test.com", username: "shalwa_pin" },
    { email: "naomy@test.com", username: "naomy_dev" },
    { email: "demo@test.com", username: "demo_user" },
    { email: "atha@test.com", username: "atha_dev" },
    { email: "guest1@test.com", username: "aesthetic_lover" },
  ];

  for (const u of userNames) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        username: u.username,
        passwordHash: "$2a$12$LJ3m4ys3VZfXjCQG0Iqvl.0jMPcqfOqRi8U7dQrOhC7x1vPq7rZK", // password: "test123"
        provider: "EMAIL",
      },
    });
    users.push(user);
  }

  console.log(`✅ ${users.length} users created/found\n`);

  // Delete existing posts to re-seed cleanly
  await prisma.post.deleteMany({});

  // Create posts — max 2 per user
  let postCount = 0;
  for (let i = 0; i < SAMPLE_IMAGES.length; i++) {
    const user = users[i % users.length];

    // Check if user already has 2 posts
    const existingCount = await prisma.post.count({
      where: { creatorId: user.id },
    });

    if (existingCount >= 2) continue;

    await prisma.post.create({
      data: {
        imageUrl: SAMPLE_IMAGES[i],
        caption: CAPTIONS[i] || null,
        creatorId: user.id,
      },
    });
    postCount++;
  }

  console.log(`✅ ${postCount} posts created\n`);
  console.log("🎉 Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
