// lib/seedData.js
export const seedPosts = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    caption: 'Golden hour in Bali 🌅',
    likes: 12,
    shares: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    author: {
      id: 'u1',
      username: 'travel_lover',
    },
    location: {
      id: 'l1',
      name: 'Bali, Indonesia',
    },
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    caption: 'Hiking the Swiss Alps 🏔️',
    likes: 45,
    shares: 5,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1 day ago
    author: {
      id: 'u2',
      username: 'mountain_mike',
    },
    location: {
      id: 'l2',
      name: 'Zermatt, Switzerland',
    },
  },
];
