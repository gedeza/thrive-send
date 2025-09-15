import { CampaignTemplate } from '@/types/campaign';

export const DIRECTOR_LIABILITY_TEMPLATE: CampaignTemplate = {
  id: 'director-liability-awareness',
  name: 'Director Liability Awareness Campaign',
  industry: 'Legal & Compliance',
  description: 'Proven campaign that generated 50+ leads and 5 consultations for a legal consultancy targeting South African business owners about OHSA compliance.',
  difficulty: 'beginner',
  duration: '6 weeks',
  estimatedResults: {
    leads: 50,
    consultations: 5,
    roi: '400% ROI (ZAR 5,000 → ZAR 25,000 value)',
    timeToResults: '2-4 weeks'
  },
  campaignData: {
    name: 'Director Liability Awareness Q4',
    description: 'This campaign targets South African business owners, directors, and senior managers to educate them on their personal liability under Section 37(2) of the OHSA. The primary goal is to generate leads by offering a high-value free checklist ("The South African Business Owner\'s Checklist: 5 Steps to OHSA & COIDA Compliance") in exchange for their contact information. Leads will be nurtured via email towards booking a consultation for our Legal Liability workshops.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
    endDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 weeks from now
    budget: 5000,
    goals: 'Acquire a minimum of 50 qualified lead sign-ups (email addresses) by promoting the free OHSA/COIDA Compliance Checklist through targeted social media content and a foundational blog post. A secondary goal is to secure at least 5 booked consultations for our paid Legal Liability workshops from the nurtured email list.',
    status: 'draft' as const
  },
  contentAssets: [
    {
      id: 'blog-section-37-2',
      type: 'blog',
      title: 'What is Section 37(2) Director Liability? A South African Business Owner\'s Guide',
      content: `# What is Section 37(2) Director Liability? A South African Business Owner's Guide

## Introduction
As a South African business owner or director, understanding your legal obligations under the Occupational Health and Safety Act (OHSA) isn't just good practice—it's essential for protecting yourself from personal liability.

## What is Section 37(2)?
Section 37(2) of the OHSA makes directors and managers personally liable for workplace health and safety violations. This means you could face:
- Personal criminal charges
- Heavy fines
- Imprisonment
- Civil liability for damages

## The Hidden Risks Directors Face
Many business owners don't realize that corporate protection doesn't shield them from OHSA violations. Recent case studies show:
- 67% of prosecuted directors were unaware of their personal liability
- Average fines have increased by 300% in the last 3 years
- Personal assets can be seized to pay damages

## Your Protection Checklist
Download our comprehensive "5 Steps to OHSA & COIDA Compliance" checklist to ensure your business is protected.

[Download Free Checklist →]

## Need Expert Guidance?
Don't leave your business and personal assets at risk. Book a consultation with our legal liability experts.`,
      scheduledFor: 'week-1-day-1'
    },
    {
      id: 'landing-page-checklist',
      type: 'landing-page',
      title: 'Free OHSA & COIDA Compliance Checklist',
      content: `# Protect Your Business: Free OHSA & COIDA Compliance Checklist

## The South African Business Owner's Essential Guide
### 5 Steps to Legal Compliance & Personal Protection

**What You'll Get:**
✅ Complete OHSA compliance checklist
✅ Section 37(2) liability assessment
✅ COIDA registration requirements
✅ Emergency response procedures
✅ Legal protection strategies

**Why This Matters:**
- 67% of directors face personal liability without knowing it
- Recent fines increased by 300% in 3 years
- Your personal assets could be at risk

### Download Your Free Checklist Now
[Email Input Form]
[Get My Free Checklist Button]

*Join 1,000+ South African business owners protecting their companies and personal assets.*`,
      scheduledFor: 'week-1-day-1'
    }
  ],
  emailSequences: [
    {
      id: 'email-1-immediate',
      subject: '✅ Your OHSA Compliance Checklist is Ready (Plus Hidden Risk Alert)',
      content: `Hi {{firstName}},

Thank you for downloading "The South African Business Owner's Checklist: 5 Steps to OHSA & COIDA Compliance."

**Your checklist is attached** - print it out and keep it handy for quick reference.

But here's something that might surprise you...

Most business owners think their corporate structure protects them from personal liability. Unfortunately, under Section 37(2) of the OHSA, that's not true.

**The Hidden Truth:** Directors and managers can be held personally liable for workplace accidents - even if they weren't directly involved.

Your personal assets, home, and savings could be at risk.

**What's Next?**
1. Review your downloaded checklist
2. Assess your current compliance level
3. Watch for my next email (coming Wednesday) where I'll share a real case study of a Johannesburg director who faced R500,000 in personal liability

Stay protected,
[Your Name]

P.S. If you have urgent questions about your liability exposure, you can book a quick consultation here: [Link]`,
      delayDays: 0,
      triggerEvent: 'checklist_download'
    },
    {
      id: 'email-2-case-study',
      subject: 'Case Study: How a Johannesburg Director Lost R500,000 (and how to avoid it)',
      content: `Hi {{firstName}},

Yesterday I shared your OHSA compliance checklist. Today, I want to tell you about Michael (name changed for privacy).

**Michael's Story:**
- Successful manufacturing company owner in Johannesburg
- 15 years in business, never had a major incident
- Thought his company structure protected him personally

**What Went Wrong:**
A workplace accident occurred. During investigation, authorities found several OHSA compliance gaps. Under Section 37(2), Michael was held personally liable.

**The Cost:**
- R500,000 in personal fines and damages
- 6 months of legal stress
- Nearly lost his family home

**The Lesson:**
Corporate protection doesn't cover OHSA violations. Directors are personally exposed.

**How to Protect Yourself:**
1. Complete the compliance checklist I sent you
2. Conduct regular safety audits
3. Document all safety procedures
4. Get professional guidance

**Need Help?**
If Michael's story concerns you, I'm here to help. Book a 30-minute consultation where we'll review your specific situation and create a protection plan.

[Book Your Consultation →]

Stay safe,
[Your Name]`,
      delayDays: 3,
      triggerEvent: 'checklist_download'
    },
    {
      id: 'email-3-consultation',
      subject: 'Ready to Protect Your Business? (Final invitation)',
      content: `Hi {{firstName}},

Over the past week, I've shared:
✅ Your OHSA compliance checklist
✅ A real case study of director liability
✅ The hidden risks most business owners don't know about

Now it's time to take action.

**The Choice is Yours:**
Option 1: Hope nothing happens (risky)
Option 2: Take control and protect your business (smart)

**What Our Legal Liability Workshop Covers:**
- Complete OHSA compliance audit
- Personal liability assessment
- Custom protection strategies
- Legal documentation review
- Emergency response planning

**Special Offer for Checklist Downloaders:**
Book your consultation this week and receive:
- 50% off our full compliance audit (worth R2,500)
- Free legal documentation templates
- Priority support for 3 months

**Limited Spots Available:**
I can only take on 5 new clients this month due to the detailed nature of this work.

[Book Your Protected Spot Now →]

Questions? Simply reply to this email.

To your protection,
[Your Name]

P.S. Don't wait until it's too late. The best time to protect your business was yesterday. The second best time is now.`,
      delayDays: 7,
      triggerEvent: 'checklist_download'
    }
  ],
  socialPosts: [
    {
      id: 'linkedin-1',
      platform: 'linkedin',
      content: '🚨 ATTENTION SA BUSINESS OWNERS: Did you know that under Section 37(2) of the OHSA, you can be held PERSONALLY liable for workplace accidents - even if you weren\'t directly involved?\n\nYour corporate structure won\'t protect you. Your personal assets could be at risk.\n\n📋 Get our free "5 Steps to OHSA & COIDA Compliance" checklist to protect yourself: [Link]\n\n#OHSA #DirectorLiability #SouthAfricanBusiness #WorkplaceSafety',
      scheduledFor: 'week-1-day-2',
      hashtags: ['OHSA', 'DirectorLiability', 'SouthAfricanBusiness', 'WorkplaceSafety']
    },
    {
      id: 'facebook-1',
      platform: 'facebook',
      content: '⚠️ South African Business Owners: Are you protected from personal liability?\n\nMany directors don\'t realize they can be held personally responsible for workplace safety violations.\n\nRecent case: A Johannesburg manufacturer faced R500,000 in personal fines after a workplace incident.\n\n✅ Download our FREE compliance checklist to protect your business and personal assets: [Link]\n\n#BusinessProtection #OHSA #SouthAfrica',
      scheduledFor: 'week-1-day-3',
      hashtags: ['BusinessProtection', 'OHSA', 'SouthAfrica']
    },
    {
      id: 'linkedin-2',
      platform: 'linkedin',
      content: '📊 SHOCKING STATISTIC: 67% of prosecuted directors were unaware of their personal liability under OHSA Section 37(2).\n\nDon\'t be part of this statistic.\n\n✅ What every SA business owner needs:\n→ Complete OHSA compliance audit\n→ Personal liability assessment\n→ Legal protection strategies\n\nStart with our free checklist: [Link]\n\n#ComplianceMatters #DirectorLiability #BusinessRisk',
      scheduledFor: 'week-2-day-1',
      hashtags: ['ComplianceMatters', 'DirectorLiability', 'BusinessRisk']
    },
    {
      id: 'facebook-2',
      platform: 'facebook',
      content: '🏭 MANUFACTURING & CONSTRUCTION BUSINESS OWNERS:\n\nYour industry has the highest risk of OHSA violations. But did you know the average fine has increased by 300% in the last 3 years?\n\nAnd directors can be held personally liable.\n\n🛡️ Protect yourself with our comprehensive compliance guide: [Link]\n\n#Manufacturing #Construction #WorkplaceSafety #OHSA',
      scheduledFor: 'week-2-day-2',
      hashtags: ['Manufacturing', 'Construction', 'WorkplaceSafety', 'OHSA']
    },
    {
      id: 'linkedin-3',
      platform: 'linkedin',
      content: '💡 BUSINESS PROTECTION TIP:\n\nThinking your corporate structure protects you from workplace safety liability? Think again.\n\nSection 37(2) of the OHSA makes directors personally liable. This means:\n→ Personal criminal charges\n→ Heavy fines from YOUR pocket\n→ Possible imprisonment\n→ Civil liability for damages\n\n📋 Get protected: [Link]\n\n#LegalTip #OHSA #BusinessOwners',
      scheduledFor: 'week-2-day-4',
      hashtags: ['LegalTip', 'OHSA', 'BusinessOwners']
    },
    {
      id: 'facebook-3',
      platform: 'facebook',
      content: '🎯 TARGET ACHIEVED: Our client reduced their OHSA compliance risk by 95% in just 30 days.\n\nHow? By following our proven 5-step compliance framework.\n\n✅ The same framework we\'re giving away FREE in our compliance checklist.\n\nNo catch. No strings attached. Just practical protection for SA business owners.\n\nDownload now: [Link]\n\n#Success #ComplianceWins #BusinessProtection',
      scheduledFor: 'week-3-day-1',
      hashtags: ['Success', 'ComplianceWins', 'BusinessProtection']
    },
    {
      id: 'linkedin-4',
      platform: 'linkedin',
      content: '🚀 SCALING YOUR BUSINESS? Don\'t forget about scaling your compliance.\n\nAs your team grows, so does your OHSA liability exposure. More employees = more risk.\n\nSmart growth includes:\n→ Updated safety procedures\n→ Regular compliance audits\n→ Director liability protection\n→ Emergency response plans\n\nStart your protection journey: [Link]\n\n#BusinessGrowth #ScalingSafely #OHSA',
      scheduledFor: 'week-3-day-3',
      hashtags: ['BusinessGrowth', 'ScalingSafely', 'OHSA']
    },
    {
      id: 'facebook-4',
      platform: 'facebook',
      content: '⏰ URGENT REMINDER: Have you downloaded your free OHSA compliance checklist yet?\n\nOver 1,000 SA business owners have already protected themselves.\n\nDon\'t wait for an incident to happen. Prevention is always cheaper than cure.\n\nEspecially when your personal assets are on the line.\n\n📥 Get your free protection guide: [Link]\n\n#UrgentReminder #OHSA #BusinessProtection #SouthAfrica',
      scheduledFor: 'week-3-day-5',
      hashtags: ['UrgentReminder', 'OHSA', 'BusinessProtection', 'SouthAfrica']
    },
    {
      id: 'linkedin-5',
      platform: 'linkedin',
      content: '💼 FINAL CALL: Limited consultation spots available this month.\n\nIf you\'re serious about protecting your business and personal assets from OHSA liability, now\'s the time to act.\n\nWhat you get:\n✅ Complete liability assessment\n✅ Custom protection strategy\n✅ Legal documentation review\n✅ 3 months priority support\n\n🎁 Special offer: 50% off compliance audit for checklist downloaders.\n\nBook now: [Link]\n\n#FinalCall #BusinessProtection #LimitedSpots',
      scheduledFor: 'week-4-day-1',
      hashtags: ['FinalCall', 'BusinessProtection', 'LimitedSpots']
    }
  ],
  targetAudience: {
    demographics: ['Age 35-65', 'Business Owners', 'Senior Executives', 'High Income'],
    industries: ['Manufacturing', 'Construction', 'Corporate Services', 'Legal Services', 'Consulting'],
    jobTitles: ['Director', 'CEO', 'Managing Director', 'Operations Manager', 'Business Owner', 'General Manager'],
    locations: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein']
  },
  successMetrics: {
    primary: 'Generate 50+ qualified leads',
    secondary: ['Book 5+ consultations', 'Achieve 15%+ email open rate', 'Get 1,000+ blog post views'],
    kpis: [
      { name: 'Email Sign-ups', target: 50, unit: 'leads' },
      { name: 'Consultation Bookings', target: 5, unit: 'bookings' },
      { name: 'Blog Post Views', target: 1000, unit: 'views' },
      { name: 'Social Media Engagement', target: 200, unit: 'interactions' },
      { name: 'Email Open Rate', target: 15, unit: '%' },
      { name: 'Landing Page Conversion', target: 8, unit: '%' },
      { name: 'Cost Per Lead', target: 100, unit: 'ZAR' },
      { name: 'Return on Investment', target: 400, unit: '%' }
    ]
  }
};

// Municipality Public Engagement Template
export const MUNICIPALITY_ENGAGEMENT_TEMPLATE: CampaignTemplate = {
  id: 'municipality-public-engagement',
  name: 'Municipality Public Engagement Campaign',
  industry: 'Government & Public Sector',
  description: 'Proven campaign for South African municipalities to increase citizen engagement, improve service delivery communication, and enhance public participation in local governance.',
  difficulty: 'intermediate',
  duration: '8 weeks',
  estimatedResults: {
    leads: 200,
    consultations: 15,
    roi: '300% ROI (Improved citizen satisfaction & engagement)',
    timeToResults: '3-6 weeks'
  },
  campaignData: {
    name: 'Municipal Citizen Engagement Initiative',
    description: 'This campaign targets municipal residents to improve communication about municipal services, increase participation in community meetings, and enhance citizen satisfaction. The campaign focuses on service delivery updates, community participation opportunities, and transparent governance communication.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 8000,
    goals: 'Increase citizen engagement by 40%, improve service delivery communication reach by 60%, and achieve 200+ new participants in community programs. Secondary goal: enhance municipality brand trust and transparency ratings.',
    status: 'draft' as const
  },
  contentAssets: [
    {
      id: 'blog-service-delivery',
      type: 'blog',
      title: 'Municipal Service Delivery Update: What You Need to Know',
      content: `# Municipal Service Delivery Update: What You Need to Know

## Your Voice Matters - New Ways to Connect with Your Municipality

Dear residents, we're committed to improving how we serve you. Here's what's changing and how you can get involved.

## Recent Service Improvements
✅ New online portal for service requests
✅ Extended operating hours for customer service
✅ Mobile service units in underserved areas
✅ SMS updates for service progress

## How to Stay Informed
- Follow our official social media channels
- Sign up for community newsletters
- Attend monthly ward meetings
- Use our new municipal app

## Upcoming Community Meetings
Join us for transparent discussions about:
- Infrastructure development plans
- Budget allocation updates
- Environmental initiatives
- Youth development programs

## Have Your Say
Your input shapes our priorities. Here's how to participate:
[Download Community Participation Guide →]

## Contact Your Ward
Find your ward councillor and upcoming meeting dates.`,
      scheduledFor: 'week-1-day-1'
    },
    {
      id: 'landing-page-community-guide',
      type: 'landing-page',
      title: 'Free Community Participation Guide',
      content: `# Your Voice, Your Community: Free Participation Guide

## Municipal Community Engagement Handbook
### How to Make Your Voice Heard in Local Government

**What You'll Get:**
✅ Complete guide to municipal processes
✅ How to submit service requests
✅ Community meeting schedules
✅ Contact details for all departments
✅ Budget participation opportunities

**Why This Matters:**
- Your input directly influences municipal planning
- Better services through community feedback
- Transparent governance builds stronger communities

### Download Your Free Guide Now
[Email Input Form]
[Get My Free Guide Button]

*Join 5,000+ engaged Municipal residents building a better community.*`,
      scheduledFor: 'week-1-day-1'
    }
  ],
  emailSequences: [
    {
      id: 'email-1-welcome',
      subject: '🏛️ Welcome to Municipal Community Connect (Your Participation Guide Inside)',
      content: `Dear {{firstName}},

Thank you for downloading the "Municipal Community Participation Guide."

**Your guide is attached** - this is your complete resource for engaging with your local government.

**Here's what makes this special:**
Most residents don't know how to effectively engage with their municipality. This guide changes that.

**What's Inside:**
• Step-by-step guide to municipal processes
• Direct contact details for all departments
• How to track your service requests
• Community meeting schedules and agendas

**Your Next Steps:**
1. Review the attached guide
2. Identify your ward councillor
3. Mark upcoming community meetings in your calendar
4. Follow us on social media for real-time updates

**Important:** Our next community meeting is {{nextMeetingDate}} at {{meetingLocation}}. Come with questions - we're here to listen.

Building a better Municipal together,
Municipal Communications Team

P.S. Have an urgent service request? Use our new online portal: [Link]`,
      delayDays: 0,
      triggerEvent: 'guide_download'
    },
    {
      id: 'email-2-meeting-reminder',
      subject: '📅 Community Meeting This Week + Your Questions Answered',
      content: `Hi {{firstName}},

This week's community meeting is happening: {{meetingDate}} at {{meetingTime}}.

**Meeting Agenda:**
• Q3 Budget Update Presentation
• Infrastructure Development Plans
• Youth Development Program Launch
• Open Floor for Resident Questions

**Popular Questions from Last Week:**
Q: "When will the potholes on [Street Name] be fixed?"
A: Road maintenance schedule is available online. Report specific issues via our portal for priority assessment.

Q: "How can I get involved in budget planning?"
A: Attend our monthly budget consultations. Next session: [Date]

**Can't Attend?**
• Send questions via email: [Email]
• Watch the live stream: [Link]
• Access meeting minutes online: [Portal Link]

**Service Delivery Updates:**
• 95% of last month's service requests completed
• New mobile service unit deployed in [Area]
• Extended customer service hours now active

See you at the meeting!

Municipal Team`,
      delayDays: 5,
      triggerEvent: 'guide_download'
    },
    {
      id: 'email-3-engagement-opportunities',
      subject: '🤝 Special Invitation: Shape Your Community\'s Future',
      content: `Dear {{firstName}},

You've shown interest in community engagement. Now we'd like to invite you to take the next step.

**Exclusive Opportunities for Engaged Residents:**

🏛️ **Municipal Advisory Committee**
Join our resident advisory panel. Meet quarterly to provide input on major municipal decisions.

📊 **Budget Participation Program**
Help decide how municipal funds are allocated. Training provided.

🌱 **Environmental Action Group**
Lead local environmental initiatives. Resources and support included.

👥 **Community Ambassador Program**
Become a link between your neighborhood and the municipality.

**Why Get More Involved?**
• Direct influence on municipal decisions
• Networking with like-minded residents
• Skills development and training
• Recognition for community contribution

**Limited Spots Available**
We can only accommodate 25 new participants across all programs this quarter.

**Apply Now:**
Reply to this email with:
1. Which program interests you most
2. Your availability for meetings
3. Any relevant experience or skills

**Application Deadline:** {{deadline}}

We believe engaged residents build stronger communities. Will you join us?

Best regards,
[Community Engagement Manager Name]
Municipal

P.S. All participants receive priority access to municipal services and direct communication with department heads.`,
      delayDays: 14,
      triggerEvent: 'guide_download'
    }
  ],
  socialPosts: [
    {
      id: 'facebook-1',
      platform: 'facebook',
      content: '🏛️ Municipal residents! Did you know you can track your service requests online 24/7?\n\nNew features now live:\n✅ Real-time status updates\n✅ Photo uploads for requests\n✅ SMS notifications\n✅ Historical request tracking\n\n📱 Download our Community Participation Guide to learn how: [Link]\n\n#MunicipalMetro #ServiceDelivery #CommunityFirst',
      scheduledFor: 'week-1-day-2',
      hashtags: ['MunicipalMetro', 'ServiceDelivery', 'CommunityFirst']
    },
    {
      id: 'twitter-1',
      platform: 'twitter',
      content: '📢 Community Meeting Alert!\n\n📅 This Thursday, 6PM\n📍 [Community Hall Name]\n🗣️ Open floor for all questions\n\nTopics: Budget update, infrastructure plans, youth programs\n\nCan\'t attend? Watch live: [Link]\n\n#MunicipalMeets #CommunityEngagement',
      scheduledFor: 'week-1-day-3',
      hashtags: ['MunicipalMeets', 'CommunityEngagement']
    },
    {
      id: 'facebook-2',
      platform: 'facebook',
      content: '🎯 RESULTS UPDATE: Thanks to YOUR feedback!\n\n✅ 847 potholes filled this month\n✅ 12 new streetlights installed\n✅ 3 parks renovated\n✅ 95% service request completion rate\n\nYour voice = Real change! 💪\n\nGet involved: Download our free participation guide [Link]\n\n#ResultsThatMatter #CommunityPower #Municipal',
      scheduledFor: 'week-2-day-1',
      hashtags: ['ResultsThatMatter', 'CommunityPower', 'Municipal']
    },
    {
      id: 'twitter-2',
      platform: 'twitter',
      content: '💡 DID YOU KNOW?\n\nYou can participate in municipal budget planning! 💰\n\n🗓️ Next session: [Date]\n🕕 Time: 6PM\n📍 Location: City Hall\n\nHelp decide how YOUR tax money is spent.\n\nLearn more: [Link]\n\n#BudgetParticipation #YourMoneyYourChoice',
      scheduledFor: 'week-2-day-3',
      hashtags: ['BudgetParticipation', 'YourMoneyYourChoice']
    },
    {
      id: 'facebook-3',
      platform: 'facebook',
      content: '🌟 SUCCESS STORY: Meet Sarah, a local resident\n\n"I used the online portal to report a broken streetlight. Within 48 hours, it was fixed! The SMS updates kept me informed throughout."\n\n👏 This is what community engagement looks like!\n\nYour turn: [Portal Link]\n\n#CommunitySuccess #ServiceDelivery #MunicipalWorks',
      scheduledFor: 'week-3-day-2',
      hashtags: ['CommunitySuccess', 'ServiceDelivery', 'MunicipalWorks']
    },
    {
      id: 'twitter-3',
      platform: 'twitter',
      content: '🚀 NEW: Mobile service units now active!\n\n📍 Visiting underserved areas weekly\n🛠️ On-site service requests\n📋 Community registration\n\nNext stops:\n• [Area 1] - Monday\n• [Area 2] - Wednesday\n• [Area 3] - Friday\n\nBringing services to YOU! 🚐',
      scheduledFor: 'week-3-day-4',
      hashtags: ['MobileServices', 'ServiceDelivery', 'CommunityFirst']
    },
    {
      id: 'facebook-4',
      platform: 'facebook',
      content: '🎓 FREE WORKSHOP: "How to Navigate Municipal Services"\n\n📅 Saturday, 10AM-12PM\n📍 Community Center\n\nLearn:\n✅ How to submit effective service requests\n✅ Understanding municipal departments\n✅ Your rights and responsibilities\n✅ Emergency contact procedures\n\n🎁 FREE lunch + participation certificate!\n\nRegister: [Link]\n\n#CommunityWorkshop #EmpowerYourself #MunicipalEducation',
      scheduledFor: 'week-4-day-1',
      hashtags: ['CommunityWorkshop', 'EmpowerYourself', 'MunicipalEducation']
    },
    {
      id: 'twitter-4',
      platform: 'twitter',
      content: '📊 TRANSPARENCY REPORT:\n\nYour recent service requests:\n• Water issues: 89% resolved\n• Road repairs: 92% completed\n• Waste collection: 98% on schedule\n• Electricity: 85% resolved\n\nWhere we can improve: [Link to full report]\n\n#TransparentGovernance #AccountabilityMatters',
      scheduledFor: 'week-4-day-3',
      hashtags: ['TransparentGovernance', 'AccountabilityMatters']
    },
    {
      id: 'facebook-5',
      platform: 'facebook',
      content: '🤝 FINAL CALL: Community Ambassador Program\n\nBecome the bridge between your neighborhood and the municipality!\n\n✨ Benefits:\n• Monthly stipend\n• Skills training\n• Direct access to officials\n• Community recognition\n• Networking opportunities\n\n📋 Only 5 spots remaining!\n\nApply now: [Link]\n\n#CommunityAmbassador #LeadershipOpportunity #LastChance',
      scheduledFor: 'week-5-day-2',
      hashtags: ['CommunityAmbassador', 'LeadershipOpportunity', 'LastChance']
    }
  ],
  targetAudience: {
    demographics: ['Age 25-65', 'Community Leaders', 'Property Owners', 'Local Business Owners', 'Parents'],
    industries: ['Government', 'Education', 'Healthcare', 'Local Business', 'Community Organizations'],
    jobTitles: ['Community Leader', 'Ward Committee Member', 'Local Business Owner', 'Resident', 'Ratepayer'],
    locations: ['Municipal Area', 'Urban Centers', 'Suburban Areas', 'Township Areas', 'Rural Districts', 'City Center', 'Outlying Areas']
  },
  successMetrics: {
    primary: 'Increase citizen engagement by 40%',
    secondary: ['200+ community program participants', 'Achieve 25%+ email open rate', 'Improve service satisfaction ratings'],
    kpis: [
      { name: 'Community Guide Downloads', target: 200, unit: 'downloads' },
      { name: 'Community Meeting Attendance', target: 15, unit: 'people' },
      { name: 'Online Service Requests', target: 500, unit: 'requests' },
      { name: 'Social Media Engagement', target: 1000, unit: 'interactions' },
      { name: 'Email Open Rate', target: 25, unit: '%' },
      { name: 'Community Program Signups', target: 50, unit: 'participants' },
      { name: 'Service Satisfaction Rating', target: 85, unit: '%' },
      { name: 'Community Meeting Attendance Growth', target: 40, unit: '%' }
    ]
  }
};

// Additional templates for different industries
export const HEALTHCARE_COMPLIANCE_TEMPLATE: CampaignTemplate = {
  id: 'healthcare-compliance',
  name: 'Healthcare Data Protection Compliance',
  industry: 'Healthcare',
  description: 'POPIA compliance campaign for healthcare providers focusing on patient data protection.',
  difficulty: 'intermediate',
  duration: '4 weeks',
  estimatedResults: {
    leads: 30,
    consultations: 8,
    roi: '350% ROI',
    timeToResults: '3-5 weeks'
  },
  campaignData: {
    name: 'Healthcare POPIA Compliance Campaign',
    description: 'Educate healthcare providers on POPIA compliance requirements for patient data protection.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 3500,
    goals: 'Generate 30 qualified healthcare leads and book 8 consultations for POPIA compliance services.',
    status: 'draft' as const
  },
  contentAssets: [],
  emailSequences: [],
  socialPosts: [],
  targetAudience: {
    demographics: ['Healthcare Professionals', 'Practice Managers', 'Medical Directors'],
    industries: ['Healthcare', 'Medical Practice', 'Hospitals', 'Clinics'],
    jobTitles: ['Practice Manager', 'Medical Director', 'Healthcare Administrator', 'Clinic Owner'],
    locations: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria']
  },
  successMetrics: {
    primary: 'Generate 30+ healthcare leads',
    secondary: ['Book 8+ consultations', 'Achieve 18%+ email open rate'],
    kpis: [
      { name: 'Email Sign-ups', target: 30, unit: 'leads' },
      { name: 'Consultation Bookings', target: 8, unit: 'bookings' },
      { name: 'Email Open Rate', target: 18, unit: '%' }
    ]
  }
};

export const TECH_GDPR_TEMPLATE: CampaignTemplate = {
  id: 'tech-gdpr-compliance',
  name: 'Tech Startup GDPR & Data Privacy',
  industry: 'Technology',
  description: 'GDPR and data privacy compliance for tech startups and SaaS companies.',
  difficulty: 'advanced',
  duration: '8 weeks',
  estimatedResults: {
    leads: 75,
    consultations: 12,
    roi: '500% ROI',
    timeToResults: '4-6 weeks'
  },
  campaignData: {
    name: 'Tech GDPR Compliance Campaign',
    description: 'Comprehensive GDPR compliance education for tech companies handling EU customer data.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 8000,
    goals: 'Generate 75 tech industry leads and secure 12 GDPR compliance consultations.',
    status: 'draft' as const
  },
  contentAssets: [],
  emailSequences: [],
  socialPosts: [],
  targetAudience: {
    demographics: ['Tech Entrepreneurs', 'CTOs', 'Data Protection Officers', 'Legal Counsel'],
    industries: ['Technology', 'SaaS', 'E-commerce', 'Fintech', 'Software Development'],
    jobTitles: ['CTO', 'CEO', 'Data Protection Officer', 'Legal Counsel', 'Founder'],
    locations: ['Cape Town', 'Johannesburg', 'Stellenbosch', 'Durban']
  },
  successMetrics: {
    primary: 'Generate 75+ tech leads',
    secondary: ['Book 12+ consultations', 'Achieve 20%+ email open rate'],
    kpis: [
      { name: 'Email Sign-ups', target: 75, unit: 'leads' },
      { name: 'Consultation Bookings', target: 12, unit: 'bookings' },
      { name: 'Email Open Rate', target: 20, unit: '%' }
    ]
  }
};

// Export all templates
export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  DIRECTOR_LIABILITY_TEMPLATE,
  MUNICIPALITY_ENGAGEMENT_TEMPLATE,
  HEALTHCARE_COMPLIANCE_TEMPLATE,
  TECH_GDPR_TEMPLATE
];

// Template categories for organization
export const TEMPLATE_CATEGORIES = {
  LEGAL_COMPLIANCE: {
    name: 'Legal & Compliance',
    description: 'Templates for legal compliance and risk management',
    templates: ['director-liability-awareness']
  },
  PUBLIC_SECTOR: {
    name: 'Public Sector',
    description: 'Templates for municipalities and government organizations',
    templates: ['municipality-public-engagement']
  },
  HEALTHCARE: {
    name: 'Healthcare',
    description: 'Templates for healthcare industry compliance',
    templates: ['healthcare-compliance']
  },
  TECHNOLOGY: {
    name: 'Technology',
    description: 'Templates for tech companies and startups',
    templates: ['tech-gdpr-compliance']
  }
};