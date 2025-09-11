import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_BOOST_PRODUCTS = [
  {
    name: 'Municipal Engagement Pro',
    description: 'Specialized boost for government communications with citizen engagement focus',
    type: 'engagement',
    category: 'Government',
    price: 299.00,
    originalPrice: 399.00,
    duration: '30 days',
    features: [
      'Targeted citizen demographics',
      'Peak hour optimization', 
      'Community event promotion',
      'Public notice amplification',
      'Feedback collection boost'
    ],
    clientTypes: ['municipality', 'government'],
    popularity: 'bestseller',
    rating: 4.9,
    reviews: 89,
    estimatedROI: '340%',
    isRecommended: true,
    metrics: {
      targetIncrease: '285%',
      estimatedSuccessRate: 94,
      clientsUsed: 127
    }
  },
  {
    name: 'Business Growth Accelerator',
    description: 'Drive conversions and sales for business clients with advanced targeting',
    type: 'conversion',
    category: 'Business',
    price: 459.00,
    duration: '45 days',
    features: [
      'Purchase intent targeting',
      'Competitor audience reach',
      'Shopping behavior optimization',
      'Local business promotion',
      'Call-to-action enhancement'
    ],
    clientTypes: ['business', 'startup'],
    popularity: 'hot',
    rating: 4.7,
    reviews: 156,
    estimatedROI: '520%',
    metrics: {
      targetIncrease: '420%',
      estimatedSuccessRate: 89,
      clientsUsed: 203
    }
  },
  {
    name: 'Startup Viral Launch',
    description: 'Maximum exposure for startup launches and product announcements',
    type: 'reach',
    category: 'Startup',
    price: 199.00,
    originalPrice: 249.00,
    duration: '14 days',
    features: [
      'Viral content optimization',
      'Influencer network reach',
      'Trending hashtag boost',
      'Launch event promotion',
      'Investor audience targeting'
    ],
    clientTypes: ['startup', 'creator'],
    popularity: 'trending',
    rating: 4.8,
    reviews: 67,
    estimatedROI: '280%',
    metrics: {
      targetIncrease: '650%',
      estimatedSuccessRate: 91,
      clientsUsed: 78
    }
  },
  {
    name: 'Premium Brand Authority',
    description: 'Elite positioning for high-end clients requiring luxury market reach',
    type: 'premium',
    category: 'Branding',
    price: 899.00,
    duration: '60 days',
    features: [
      'Premium audience targeting',
      'Luxury market positioning',
      'Thought leadership boost',
      'Executive network reach',
      'Brand authority signals'
    ],
    clientTypes: ['business', 'executive'],
    popularity: 'new',
    rating: 4.9,
    reviews: 23,
    estimatedROI: '450%',
    metrics: {
      targetIncrease: '180%',
      estimatedSuccessRate: 96,
      clientsUsed: 34
    }
  },
  {
    name: 'Community Awareness Campaign',
    description: 'Build awareness for community initiatives and social causes',
    type: 'awareness',
    category: 'Social Impact',
    price: 149.00,
    duration: '21 days',
    features: [
      'Community targeting',
      'Social cause alignment',
      'Local media boost',
      'Volunteer recruitment',
      'Donation drive support'
    ],
    clientTypes: ['municipality', 'nonprofit'],
    popularity: 'hot',
    rating: 4.6,
    reviews: 112,
    estimatedROI: '210%',
    metrics: {
      targetIncrease: '320%',
      estimatedSuccessRate: 87,
      clientsUsed: 165
    }
  }
];

async function seedMarketplace() {
  console.log('🌱 Seeding marketplace with boost products...');

  try {
    // Clear existing demo boost products (optional)
    await prisma.boostProduct.deleteMany({
      where: {
        organizationId: null // Only delete products without organization
      }
    });

    // Create boost products
    for (const productData of DEMO_BOOST_PRODUCTS) {
      const product = await prisma.boostProduct.create({
        data: {
          ...productData,
          price: productData.price,
          originalPrice: productData.originalPrice || undefined,
          rating: productData.rating,
          isActive: true
        }
      });

      console.log(`✅ Created boost product: ${product.name} (${product.id})`);
    }

    console.log(`🎉 Successfully seeded ${DEMO_BOOST_PRODUCTS.length} boost products!`);
    
    // Display summary
    const totalProducts = await prisma.boostProduct.count();
    console.log(`📊 Total boost products in database: ${totalProducts}`);

  } catch (_error) {
    console.error("", _error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedMarketplace();
}

export default seedMarketplace;