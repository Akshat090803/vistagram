import fs from 'fs';
import Papa from 'papaparse';
import { db } from '../../src/lib/prisma'; // adjust path


async function main() {
  try {
    // 1. Read User and Post data from CSVs
    const userRowsCsv = fs.readFileSync('User_rows.csv', 'utf8');
    const postRowsCsv = fs.readFileSync('posts_rows.csv', 'utf8');

    const { data: usersData } = Papa.parse(userRowsCsv, { header: true, skipEmptyLines: true });
    const { data: postsData } = Papa.parse(postRowsCsv, { header: true, skipEmptyLines: true });

    // Extract user IDs for random assignment to posts
    const userIds = usersData.map(user => user.id);

    // To store location IDs to avoid duplicates and reduce database calls
    const existingLocations = new Map();

    console.log('Starting data seeding...');

    // Seed Posts
    for (const post of postsData) {
      // Ensure post.likes and post.shares are valid numbers, default to 0 if not
      const likes = parseInt(post.likes) || 0;
      const shares = parseInt(post.shares) || 0;

      // Get a random authorId from the available user IDs
      const authorId = userIds[Math.floor(Math.random() * userIds.length)];

      // Find or create the location
      let locationId;
      const locationName = post.location.trim(); // Trim whitespace from location name

      if (existingLocations.has(locationName)) {
        locationId = existingLocations.get(locationName);
      } else {
        const createdLocation = await db.location.upsert({
          where: { name: locationName },
          update: {},
          create: {
            name: locationName,
          },
        });
        locationId = createdLocation.id;
        existingLocations.set(locationName, locationId);
      }

      await db.post.create({
        data: {
          imageUrl: post.image_url,
          caption: post.caption || null, // Ensure caption is null if empty string
          likes: likes,
          shares: shares,
          createdAt: new Date(post.timestamp), // Use the timestamp from CSV
          author: {
            connect: { id: authorId },
          },
          location: {
            connect: { id: locationId },
          },
        },
      });
    }

    console.log('Posts seeded successfully! 🎉');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();