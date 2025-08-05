import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const boostProducts = [
  {
    id: 'boost-1',
    name: 'Municipal Engagement Pro',
    description: 'Specialized boost for government communications with citizen engagement focus',
    type: 'engagement',
    category: 'Government',
    price: 299,
    originalPrice: 399,
    duration: '30 days',
    features: [
      'Targeted citizen demographics',
      'Peak hour optimization',
      'Community event promotion',
      'Public notice amplification',
      'Feedback collection boost'
    ],
    metrics: {
      averageIncrease: '+285%',
      successRate: 94,
      clientsUsed: 127
    },
    clientTypes: ['municipality', 'government'],
    popularity: 'bestseller',
    rating: 4.9,
    reviews: 89,
    estimatedROI: '340%',
    isRecommended: true,
    isActive: true
  },
  {
    id: 'boost-2',
    name: 'Business Growth Accelerator',
    description: 'Drive conversions and sales for business clients with advanced targeting',
    type: 'conversion',
    category: 'Business',
    price: 459,
    duration: '45 days',
    features: [
      'Purchase intent targeting',
      'Competitor audience reach',
      'Shopping behavior optimization',
      'Local business promotion',
      'Call-to-action enhancement'
    ],
    metrics: {
      averageIncrease: '+420%',
      successRate: 89,
      clientsUsed: 203
    },
    clientTypes: ['business', 'startup'],
    popularity: 'hot',
    rating: 4.7,
    reviews: 156,
    estimatedROI: '520%',
    isRecommended: false,
    isActive: true
  },
  {
    id: 'boost-3',
    name: 'Startup Viral Launch',
    description: 'Maximum exposure for startup launches and product announcements',
    type: 'reach',
    category: 'Startup',
    price: 199,
    originalPrice: 249,
    duration: '14 days',
    features: [
      'Viral content optimization',
      'Influencer network reach',
      'Trending hashtag boost',
      'Launch event promotion',
      'Investor audience targeting'
    ],
    metrics: {
      averageIncrease: '+650%',
      successRate: 91,
      clientsUsed: 78
    },
    clientTypes: ['startup', 'creator'],
    popularity: 'trending',
    rating: 4.8,
    reviews: 67,
    estimatedROI: '280%',
    isRecommended: false,
    isActive: true
  },
  {
    id: 'boost-4',
    name: 'Premium Brand Authority',
    description: 'Elite positioning for high-end clients requiring luxury market reach',
    type: 'premium',
    category: 'Branding',
    price: 899,
    duration: '60 days',
    features: [
      'Premium audience targeting',
      'Luxury market positioning',
      'Thought leadership boost',
      'Executive network reach',
      'Brand authority signals'
    ],
    metrics: {
      averageIncrease: '+180%',
      successRate: 96,
      clientsUsed: 34
    },
    clientTypes: ['business', 'executive'],
    popularity: 'new',
    rating: 4.9,
    reviews: 23,
    estimatedROI: '450%',
    isRecommended: false,
    isActive: true
  },
  {
    id: 'boost-5',
    name: 'Community Awareness Campaign',
    description: 'Build awareness for community initiatives and social causes',
    type: 'awareness',
    category: 'Social Impact',
    price: 149,
    duration: '21 days',
    features: [
      'Community targeting',
      'Social cause alignment',
      'Local media boost',
      'Volunteer recruitment',
      'Donation drive support'
    ],
    metrics: {
      averageIncrease: '+320%',
      successRate: 87,
      clientsUsed: 165
    },
    clientTypes: ['municipality', 'nonprofit'],
    popularity: 'hot',
    rating: 4.6,
    reviews: 112,
    estimatedROI: '210%',
    isRecommended: false,
    isActive: true
  }
];

async function seedBoostProducts() {
  console.log('🌱 Seeding boost products...');
  
  try {
    // Delete existing boost products
    await prisma.boostProduct.deleteMany({});
    console.log('🗑️  Cleared existing boost products');

    // Create new boost products
    for (const product of boostProducts) {
      await prisma.boostProduct.create({
        data: product
      });
      console.log(`✅ Created boost product: ${product.name}`);
    }

    console.log(`🎉 Successfully seeded ${boostProducts.length} boost products!`);
  } catch (error) {
    console.error('❌ Error seeding boost products:', error);
    throw error;
  }
}

async function main() {
  await seedBoostProducts();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });