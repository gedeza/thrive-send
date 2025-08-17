// Client Type and Industry Categories Configuration
// This provides structured options for client categorization

export const CLIENT_TYPES = [
  { value: "MUNICIPALITY", label: "Municipality" },
  { value: "BUSINESS", label: "Business" },
  { value: "STARTUP", label: "Startup" },
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "NONPROFIT", label: "Nonprofit" },
] as const;

export const INDUSTRY_CATEGORIES = [
  // Technology & Telecommunications
  { value: "TELECOMMUNICATIONS", label: "Telecommunications", description: "Mobile networks, internet providers (e.g. Vodacom, MTN, Telkom)" },
  { value: "TECHNOLOGY", label: "Technology", description: "Software, hardware, IT services" },
  { value: "FINTECH", label: "Financial Technology", description: "Digital banking, payment solutions" },
  
  // Financial Services
  { value: "BANKING", label: "Banking & Finance", description: "Banks, investment firms (e.g. Standard Bank, FNB, Absa)" },
  { value: "INSURANCE", label: "Insurance", description: "Life, health, property insurance" },
  { value: "MICROFINANCE", label: "Microfinance", description: "Small loans, community banking" },
  
  // Government & Public Sector
  { value: "LOCAL_GOVERNMENT", label: "Local Government", description: "City councils, metropolitan municipalities" },
  { value: "PROVINCIAL_GOVERNMENT", label: "Provincial Government", description: "Provincial departments and agencies" },
  { value: "NATIONAL_GOVERNMENT", label: "National Government", description: "National departments and SOEs" },
  { value: "PUBLIC_UTILITIES", label: "Public Utilities", description: "Water, electricity, waste management" },
  
  // Healthcare & Wellness
  { value: "HEALTHCARE", label: "Healthcare", description: "Hospitals, clinics, medical services" },
  { value: "PHARMACEUTICALS", label: "Pharmaceuticals", description: "Drug manufacturers, medical devices" },
  { value: "WELLNESS", label: "Wellness & Fitness", description: "Gyms, spas, wellness centers" },
  
  // Retail & Consumer
  { value: "RETAIL", label: "Retail", description: "Shopping centers, stores, e-commerce" },
  { value: "FMCG", label: "Fast Moving Consumer Goods", description: "Food, beverages, household products" },
  { value: "AUTOMOTIVE", label: "Automotive", description: "Car dealerships, auto services" },
  
  // Education & Training
  { value: "EDUCATION", label: "Education", description: "Schools, universities, training centers" },
  { value: "ONLINE_LEARNING", label: "Online Learning", description: "E-learning platforms, digital education" },
  
  // Media & Entertainment
  { value: "MEDIA", label: "Media & Broadcasting", description: "TV, radio, news outlets" },
  { value: "ENTERTAINMENT", label: "Entertainment", description: "Music, gaming, events" },
  { value: "ADVERTISING", label: "Advertising & Marketing", description: "Ad agencies, marketing firms" },
  
  // Real Estate & Construction
  { value: "REAL_ESTATE", label: "Real Estate", description: "Property development, real estate agencies" },
  { value: "CONSTRUCTION", label: "Construction", description: "Building, infrastructure, engineering" },
  
  // Energy & Resources
  { value: "ENERGY", label: "Energy", description: "Oil, gas, renewable energy" },
  { value: "MINING", label: "Mining", description: "Coal, gold, platinum, other minerals" },
  { value: "RENEWABLE_ENERGY", label: "Renewable Energy", description: "Solar, wind, hydroelectric" },
  
  // Agriculture & Food
  { value: "AGRICULTURE", label: "Agriculture", description: "Farming, livestock, agribusiness" },
  { value: "FOOD_BEVERAGE", label: "Food & Beverage", description: "Restaurants, food processing, breweries" },
  
  // Transportation & Logistics
  { value: "TRANSPORTATION", label: "Transportation", description: "Airlines, shipping, public transport" },
  { value: "LOGISTICS", label: "Logistics", description: "Freight, warehousing, supply chain" },
  
  // Tourism & Hospitality
  { value: "TOURISM", label: "Tourism", description: "Tour operators, travel agencies" },
  { value: "HOSPITALITY", label: "Hospitality", description: "Hotels, restaurants, accommodations" },
  
  // Professional Services
  { value: "LEGAL", label: "Legal Services", description: "Law firms, legal consultancy" },
  { value: "CONSULTING", label: "Consulting", description: "Business, management, strategy consulting" },
  { value: "ACCOUNTING", label: "Accounting", description: "Auditing, tax services, bookkeeping" },
  
  // Non-Profit & Social
  { value: "NGO", label: "Non-Governmental Organization", description: "Charities, social enterprises" },
  { value: "SOCIAL_ENTERPRISE", label: "Social Enterprise", description: "Mission-driven businesses" },
  { value: "COOPERATIVE", label: "Cooperative", description: "Community-owned businesses" },
  
  // Other
  { value: "MANUFACTURING", label: "Manufacturing", description: "Industrial production, factories" },
  { value: "SPORTS", label: "Sports", description: "Sports teams, fitness, recreation" },
  { value: "OTHER", label: "Other", description: "Industries not listed above" },
] as const;

// Helper functions for easy access
export const getClientTypeLabel = (value: string) => {
  return CLIENT_TYPES.find(type => type.value === value)?.label || value;
};

export const getIndustryLabel = (value: string) => {
  return INDUSTRY_CATEGORIES.find(industry => industry.value === value)?.label || value;
};

export const getIndustryDescription = (value: string) => {
  return INDUSTRY_CATEGORIES.find(industry => industry.value === value)?.description || '';
};

// Group industries by sector for better UX
export const INDUSTRY_SECTORS = {
  "Technology": INDUSTRY_CATEGORIES.filter(i => 
    ['TELECOMMUNICATIONS', 'TECHNOLOGY', 'FINTECH'].includes(i.value)
  ),
  "Financial Services": INDUSTRY_CATEGORIES.filter(i => 
    ['BANKING', 'INSURANCE', 'MICROFINANCE'].includes(i.value)
  ),
  "Government": INDUSTRY_CATEGORIES.filter(i => 
    ['LOCAL_GOVERNMENT', 'PROVINCIAL_GOVERNMENT', 'NATIONAL_GOVERNMENT', 'PUBLIC_UTILITIES'].includes(i.value)
  ),
  "Healthcare": INDUSTRY_CATEGORIES.filter(i => 
    ['HEALTHCARE', 'PHARMACEUTICALS', 'WELLNESS'].includes(i.value)
  ),
  "Retail & Consumer": INDUSTRY_CATEGORIES.filter(i => 
    ['RETAIL', 'FMCG', 'AUTOMOTIVE'].includes(i.value)
  ),
  "Education": INDUSTRY_CATEGORIES.filter(i => 
    ['EDUCATION', 'ONLINE_LEARNING'].includes(i.value)
  ),
  "Media & Entertainment": INDUSTRY_CATEGORIES.filter(i => 
    ['MEDIA', 'ENTERTAINMENT', 'ADVERTISING'].includes(i.value)
  ),
  "Real Estate & Construction": INDUSTRY_CATEGORIES.filter(i => 
    ['REAL_ESTATE', 'CONSTRUCTION'].includes(i.value)
  ),
  "Energy & Resources": INDUSTRY_CATEGORIES.filter(i => 
    ['ENERGY', 'MINING', 'RENEWABLE_ENERGY'].includes(i.value)
  ),
  "Agriculture & Food": INDUSTRY_CATEGORIES.filter(i => 
    ['AGRICULTURE', 'FOOD_BEVERAGE'].includes(i.value)
  ),
  "Transportation": INDUSTRY_CATEGORIES.filter(i => 
    ['TRANSPORTATION', 'LOGISTICS'].includes(i.value)
  ),
  "Tourism & Hospitality": INDUSTRY_CATEGORIES.filter(i => 
    ['TOURISM', 'HOSPITALITY'].includes(i.value)
  ),
  "Professional Services": INDUSTRY_CATEGORIES.filter(i => 
    ['LEGAL', 'CONSULTING', 'ACCOUNTING'].includes(i.value)
  ),
  "Non-Profit": INDUSTRY_CATEGORIES.filter(i => 
    ['NGO', 'SOCIAL_ENTERPRISE', 'COOPERATIVE'].includes(i.value)
  ),
  "Other": INDUSTRY_CATEGORIES.filter(i => 
    ['MANUFACTURING', 'SPORTS', 'OTHER'].includes(i.value)
  ),
};