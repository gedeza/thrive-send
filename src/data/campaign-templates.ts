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

// Real Estate Lead Generation Template
export const REAL_ESTATE_TEMPLATE: CampaignTemplate = {
  id: 'real-estate-lead-generation',
  name: 'Real Estate Lead Generation Campaign',
  industry: 'Real Estate & Property',
  description: 'Proven campaign for South African property professionals to generate high-quality leads, showcase properties, and build trust with potential buyers and sellers.',
  difficulty: 'beginner',
  duration: '4 weeks',
  estimatedResults: {
    leads: 80,
    consultations: 12,
    roi: '500% ROI (Average property commission vs campaign cost)',
    timeToResults: '1-3 weeks'
  },
  campaignData: {
    name: 'Property Lead Generation Campaign',
    description: 'This campaign targets potential property buyers and sellers in your area. It focuses on establishing trust, showcasing market expertise, and providing valuable property insights to generate qualified leads for viewings and consultations.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 3000,
    goals: 'Generate 80+ qualified property leads, secure 12+ property consultations/viewings, establish market authority in target area, and build email list of 200+ potential clients.',
    status: 'draft' as const
  },
  contentAssets: [
    {
      id: 'blog-property-market-guide',
      type: 'blog',
      title: 'South African Property Market Guide 2024: What Buyers & Sellers Need to Know',
      content: `# South African Property Market Guide 2024: What Buyers & Sellers Need to Know

## Current Market Trends in South Africa

The South African property market is showing exciting opportunities for both buyers and sellers. Here's what you need to know to make informed decisions.

## For Property Buyers

### Key Trends:
- Interest rates stabilizing after recent adjustments
- Increased buyer activity in affordable housing sector
- Strong demand in security estates and complexes
- Growing interest in semigration destinations

### What This Means:
✅ More negotiating power in certain price brackets
✅ Better financing options becoming available
✅ Increased property selection in popular areas

## For Property Sellers

### Market Conditions:
- Properties priced correctly are selling within 60-90 days
- Well-presented homes achieving asking price or higher
- High demand for move-in ready properties
- Security features adding significant value

### Selling Tips:
✅ Professional photography is essential
✅ Declutter and stage your home
✅ Price competitively from the start
✅ Highlight security and lifestyle features

## Free Property Valuation

Wondering what your property is worth in today's market? Get our comprehensive property valuation report that includes:
- Current market value assessment
- Comparable sales analysis
- Market timing recommendations
- Selling strategy suggestions

[Download Free Property Valuation Report →]

## Need Expert Guidance?

Whether buying or selling, having the right agent makes all the difference. Book a free consultation to discuss your property goals.`,
      scheduledFor: 'week-1-day-1'
    },
    {
      id: 'landing-page-property-valuation',
      type: 'landing-page',
      title: 'Free Property Valuation Report',
      content: `# Get Your Free Property Valuation Report

## Know Your Property's True Market Value

### What You'll Receive:
✅ Comprehensive market analysis
✅ Recent comparable sales data
✅ Current market trends affecting your area
✅ Professional selling recommendations
✅ Market timing guidance

### Why Get a Valuation Now?
- Property values have shifted in 2024
- Market conditions are changing rapidly
- Knowing your value helps with financial planning
- Essential for refinancing or selling decisions

### Professional Analysis Includes:
- **Comparative Market Analysis (CMA)**
- **Property condition assessment**
- **Local market trends**
- **Optimal selling strategy**
- **Timeline recommendations**

### Get Your Free Report Now
[Property Address Input]
[Contact Details Form]
[Get My Free Valuation Button]

*Trusted by 500+ property owners. No obligation. Professional analysis.*

### What Our Clients Say:
"The valuation was spot-on and helped us price our home perfectly. Sold in 3 weeks!" - *Sarah M., Johannesburg*`,
      scheduledFor: 'week-1-day-1'
    }
  ],
  emailSequences: [
    {
      id: 'email-1-valuation-delivery',
      subject: '📊 Your Property Valuation Report is Ready (+ Market Insights)',
      content: `Hi {{firstName}},

Thank you for requesting your property valuation report for {{propertyAddress}}.

**Your personalized report is attached** and includes everything you need to understand your property's current market position.

**Key Highlights from Your Report:**
• Estimated market value: {{estimatedValue}}
• Market trend in your area: {{marketTrend}}
• Average days on market: {{averageDays}} days
• Recommended action: {{recommendation}}

**What's Happening in Your Area:**
The {{areaName}} market is showing {{marketCondition}}, which means {{marketInsight}}.

**Your Next Steps:**
1. Review your complete valuation report
2. Consider current market timing
3. If selling, prepare your property presentation
4. If buying, understand your budget position

**Questions About Your Valuation?**
I'm here to explain any part of your report. Simply reply to this email or call me directly at {{phoneNumber}}.

**Market Update:** Properties in your price range are {{marketActivity}}. This is {{goodOrBad}} news for {{buyersOrSellers}}.

Best regards,
{{agentName}}
{{agencyName}}

P.S. If you're considering selling, I'd love to show you our proven marketing strategy that's helping properties sell 40% faster than the area average.`,
      delayDays: 0,
      triggerEvent: 'valuation_download'
    },
    {
      id: 'email-2-market-insights',
      subject: '🏠 Market Alert: What This Means for Your Property',
      content: `Hi {{firstName}},

Hope you found your property valuation helpful! I wanted to share some important market developments that could affect your property decisions.

**This Week's Market News:**
• {{marketNews1}}
• {{marketNews2}}
• {{marketNews3}}

**How This Affects Your Property:**
Based on your {{areaName}} location and {{propertyType}} property type, these changes mean {{personalizedInsight}}.

**Success Story:**
Just this week, I helped the Johnson family in {{nearbyArea}} sell their home for R{{salePrice}} - that's {{percentageAbove}}% above the original asking price!

How? We:
✅ Staged the property professionally
✅ Used drone photography for aerial views
✅ Marketed to our qualified buyer database
✅ Negotiated strategically with multiple offers

**Thinking of Selling?**
If you're considering putting your property on the market, now might be the perfect time. I'd love to share our complete marketing strategy with you.

**Free Strategy Session Available:**
• No-obligation consultation
• Personalized marketing plan
• Timeline and pricing strategy
• Expected outcomes discussion

Ready to explore your options?

Best regards,
{{agentName}}

P.S. Even if you're not ready to sell now, understanding your options keeps you prepared for future opportunities.`,
      delayDays: 5,
      triggerEvent: 'valuation_download'
    },
    {
      id: 'email-3-consultation-offer',
      subject: '🎯 Final Invitation: Free Property Strategy Session',
      content: `Hi {{firstName}},

Over the past week, I've shared:
✅ Your personalized property valuation
✅ Current market insights for your area
✅ Success stories from recent sales

Now I'd like to invite you to a free, no-obligation strategy session.

**Why a Strategy Session?**
Whether you're buying, selling, or just want to understand your options, having a clear strategy saves time, money, and stress.

**What We'll Cover:**
• Your specific property goals
• Current market opportunities
• Timeline and process planning
• Financial implications and options
• Next steps (only if you're ready)

**Recent Client Success:**
The Patel family attended a strategy session in January. By March, they'd sold their townhouse and bought their dream family home - all because we planned the timing and strategy perfectly.

**Limited Availability:**
I only take on a certain number of new clients each month to ensure everyone gets the attention they deserve.

**Book Your Free Session:**
Choose a time that works for you: [Calendar Link]

**Or Call/WhatsApp:** {{phoneNumber}}

**No Pressure Promise:**
This session is about providing value and guidance. There's no pressure to work with me unless it feels like the right fit for both of us.

Looking forward to helping you achieve your property goals!

{{agentName}}
{{agencyName}}

P.S. Many clients tell me they wish they'd had this conversation sooner. Don't wait until you're ready to move - the best decisions are made with proper planning.`,
      delayDays: 12,
      triggerEvent: 'valuation_download'
    }
  ],
  socialPosts: [
    {
      id: 'linkedin-1',
      platform: 'linkedin',
      content: '🏠 PROPERTY MARKET UPDATE: South African real estate is showing strong activity in the R1.5M - R3M price bracket.\n\nKey trends I\'m seeing:\n✅ Properties priced correctly selling within 60 days\n✅ Security features adding 15-20% to property values\n✅ Move-in ready homes achieving premium prices\n\nThinking of buying or selling? Get your free property valuation and market analysis: [Link]\n\n#SouthAfricanProperty #RealEstate #PropertyInvestment #MarketUpdate',
      scheduledFor: 'week-1-day-2',
      hashtags: ['SouthAfricanProperty', 'RealEstate', 'PropertyInvestment', 'MarketUpdate']
    },
    {
      id: 'facebook-1',
      platform: 'facebook',
      content: '🏡 JUST SOLD: Beautiful 3-bedroom home in [Area Name]!\n\n✨ What made the difference:\n→ Professional staging\n→ Drone photography\n→ Strategic pricing\n→ Targeted marketing\n\nResult: SOLD in 3 weeks for asking price!\n\n🎯 Thinking of selling? Get your FREE property valuation to see what your home could be worth in today\'s market.\n\nClick here: [Link]\n\n#JustSold #PropertySuccess #RealEstateExpert',
      scheduledFor: 'week-1-day-3',
      hashtags: ['JustSold', 'PropertySuccess', 'RealEstateExpert']
    },
    {
      id: 'instagram-1',
      platform: 'instagram',
      content: '📍 PROPERTY SPOTLIGHT: Stunning family home with all the features buyers are looking for right now:\n\n✅ Security estate\n✅ Modern kitchen\n✅ Garden for kids\n✅ Double garage\n✅ Fiber ready\n\nProperties like this are in HIGH demand. Want to know what your property is worth?\n\nGet your free valuation report → Link in bio\n\n#PropertySpotlight #DreamHome #RealEstate #PropertyValuation',
      scheduledFor: 'week-2-day-1',
      hashtags: ['PropertySpotlight', 'DreamHome', 'RealEstate', 'PropertyValuation']
    },
    {
      id: 'linkedin-2',
      platform: 'linkedin',
      content: '💡 PROPERTY BUYING TIP: The best time to buy is when you\'re financially ready AND the market conditions align with your goals.\n\nRight now in SA:\n🔸 Interest rates showing signs of stability\n🔸 More inventory available = better selection\n🔸 Motivated sellers = negotiation opportunities\n\nBut every situation is unique. That\'s why I offer free buyer consultations to help you understand:\n• Your buying power\n• Best areas for your budget\n• Market timing for your situation\n\nReady to explore your options? [Link]\n\n#PropertyBuying #RealEstateTips #PropertyAdvice #FirstTimeBuyer',
      scheduledFor: 'week-2-day-3',
      hashtags: ['PropertyBuying', 'RealEstateTips', 'PropertyAdvice', 'FirstTimeBuyer']
    },
    {
      id: 'facebook-2',
      platform: 'facebook',
      content: '🎉 CLIENT SUCCESS STORY!\n\nMeet the Johnson family - they thought their home wasn\'t worth much in today\'s market.\n\nAfter our free valuation and marketing strategy:\n📈 Listed 15% higher than they expected\n⚡ Received 3 offers in the first week\n💰 Sold for R50,000 ABOVE asking price!\n\n"We couldn\'t believe how smooth the process was. [Agent Name] guided us every step of the way!" - Mrs. Johnson\n\nCurious about your property\'s value? Get your free report: [Link]\n\n#ClientSuccess #PropertySold #RealEstateResults #PropertyValuation',
      scheduledFor: 'week-3-day-2',
      hashtags: ['ClientSuccess', 'PropertySold', 'RealEstateResults', 'PropertyValuation']
    }
  ],
  targetAudience: {
    demographics: ['Age 25-55', 'Property Owners', 'First-time Buyers', 'Property Investors', 'Families', 'Young Professionals'],
    industries: ['Any Industry', 'Property Investment', 'Financial Services', 'Professional Services', 'Corporate Executives'],
    jobTitles: ['Property Owner', 'First-time Buyer', 'Property Investor', 'Professional', 'Executive', 'Business Owner'],
    locations: ['Major Cities', 'Suburban Areas', 'Security Estates', 'Popular Neighborhoods', 'Investment Areas', 'Family Communities']
  },
  successMetrics: {
    primary: 'Generate 80+ qualified property leads',
    secondary: ['12+ property consultations', 'Achieve 30%+ email open rate', 'Build database of 200+ prospects'],
    kpis: [
      { name: 'Property Valuation Downloads', target: 80, unit: 'downloads' },
      { name: 'Consultation Bookings', target: 12, unit: 'bookings' },
      { name: 'Email Open Rate', target: 30, unit: '%' },
      { name: 'Social Media Engagement', target: 500, unit: 'interactions' }
    ]
  }
};

// Financial Services Template
export const FINANCIAL_SERVICES_TEMPLATE: CampaignTemplate = {
  id: 'financial-planning-awareness',
  name: 'Financial Planning Awareness Campaign',
  industry: 'Financial Services',
  description: 'Comprehensive campaign targeting South African professionals aged 25-45 for retirement planning and investment advisory services.',
  difficulty: 'intermediate',
  duration: '8 weeks',
  estimatedResults: {
    leads: 120,
    consultations: 15,
    roi: '600% ROI (ZAR 8,000 → ZAR 48,000 value)',
    timeToResults: '3-5 weeks'
  },
  campaignData: {
    name: 'Retirement Reality Check Q4',
    description: 'This campaign targets South African professionals aged 25-45 to educate them on the retirement crisis and provide actionable financial planning guidance. Primary goal is to generate qualified leads by offering a free "South African Retirement Readiness Calculator & Guide" in exchange for contact information. Leads will be nurtured toward booking financial planning consultations.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 8000,
    goals: 'Generate 120+ qualified leads (email addresses) by promoting the free Retirement Readiness Calculator through targeted social media content and educational blog posts. Secondary goal: convert 15+ leads into paid financial planning consultations.',
    status: 'draft' as const
  },
  contentAssets: [
    {
      id: 'blog-retirement-crisis',
      type: 'blog',
      title: 'The South African Retirement Crisis: Why 94% of People Can\'t Afford to Retire',
      content: `# The South African Retirement Crisis: Why 94% of People Can't Afford to Retire

## The Shocking Reality

If you're a working professional in South Africa, there's a 94% chance you won't be able to maintain your current lifestyle in retirement. This isn't fear-mongering—it's the stark reality revealed by recent financial industry research.

## The Numbers Don't Lie

**Current State of SA Retirement:**
- Only 6% of South Africans can afford to retire comfortably
- Average retirement savings at age 65: R350,000
- Amount needed to retire comfortably: R2.5 million+
- Most people replace only 20% of pre-retirement income

## Why Traditional Retirement Planning Fails

### The "Just Save 10%" Myth
Financial advisors often recommend saving 10-15% of your income. But with inflation at 6%+ and market volatility, this approach leaves most people drastically short.

### The Tax Time Bomb
Many don't realize that retirement annuities and pension funds are taxed on withdrawal. Your R1 million could become R800,000 after tax.

### Medical Aid Nightmare
Medical aid contributions in retirement can consume 30-40% of your retirement income.

## The Real Cost of Retirement in SA

**Conservative Estimates (2024):**
- Basic retirement: R8,000/month (R2.3M lump sum needed)
- Comfortable retirement: R15,000/month (R4.3M lump sum needed)
- Luxury retirement: R25,000/month (R7.2M lump sum needed)

## Take Control: Your Retirement Readiness Scorecard

Don't guess about your retirement future. Get our comprehensive Retirement Readiness Calculator designed specifically for South African tax laws, inflation rates, and market conditions.

**What You'll Discover:**
✅ Your exact retirement shortfall (or surplus)
✅ Monthly savings needed to bridge the gap
✅ Tax-optimized investment strategies
✅ Step-by-step action plan for your age group

[Download Free Calculator & Guide]

## Your Next Steps

The earlier you start, the easier it becomes. Even if you're 40+ and behind, there are strategies to accelerate your retirement savings dramatically.

Book a free consultation to discuss your personalized retirement strategy.`,
      status: 'published',
      publishedAt: new Date().toISOString(),
      tags: ['retirement', 'financial-planning', 'south-africa', 'investment'],
      leadMagnet: {
        title: 'Free SA Retirement Readiness Calculator & Guide',
        description: 'Comprehensive calculator with personalized action plan'
      }
    }
  ],
  emailSequences: [
    {
      id: 'email-1-calculator-delivery',
      subject: '📊 Your SA Retirement Readiness Report + Action Plan',
      content: `Hi {{firstName}},

Thank you for downloading the SA Retirement Readiness Calculator! Your personalized report is attached.

**Your Retirement Reality Check:**
Based on your age ({{age}}) and current savings ({{currentSavings}}), here's what your report revealed:

🎯 **Monthly Income Needed in Retirement:** R{{monthlyNeed}}
💰 **Total Lump Sum Required:** R{{lumpSumNeed}}
⚠️ **Current Shortfall:** R{{shortfall}}

**The Good News:**
Even if there's a gap, you have {{yearsToRetirement}} years to bridge it. Here's your personalized action plan:

**Immediate Actions (Next 30 Days):**
1. Increase retirement contributions to {{recommendedContribution}}% of income
2. Review your current investment portfolio allocation
3. Consider tax-free savings account for additional growth
4. Evaluate offshore investment options (within SARS limits)

**Medium-Term Strategy (3-6 Months):**
• Optimize your asset allocation for your age
• Review life insurance and disability cover
• Consider property investment opportunities
• Explore business investment or side income

**Success Story:**
Last month, I helped Sarah (34, Marketing Manager) discover she was R800,000 short for retirement. Within 60 days, we:
- Restructured her RA contributions
- Set up a tax-free investment account
- Created a property investment plan
- Now she's on track to exceed her retirement goals!

**Your Free Strategy Session:**
I'd like to offer you a complimentary 45-minute strategy session to discuss your specific situation and create a concrete action plan.

**What we'll cover:**
• Detailed analysis of your report
• Tax-optimization strategies
• Investment vehicle recommendations
• Timeline and milestone planning

Book your session here: [Calendar Link]

Best regards,
{{advisorName}}
{{companyName}}

P.S. The clients who act within the first week of getting their report see the biggest improvements. Don't wait!`,
      delayDays: 0,
      triggerEvent: 'calculator_download'
    },
    {
      id: 'email-2-investment-strategies',
      subject: '💡 How Sarah Turned R800K Retirement Gap into R200K Surplus',
      content: `Hi {{firstName}},

Yesterday I mentioned Sarah's success story. Today I want to show you exactly how we turned her R800,000 retirement shortfall into a R200,000 surplus.

**Sarah's Starting Position (Age 34):**
• Salary: R35,000/month
• Current RA: R180,000
• Monthly RA contribution: R1,500 (4.3%)
• Retirement goal: R12,000/month income

**The Problem:**
At her current savings rate, Sarah would only have R890,000 at 65—leaving her R800,000 short of her R1.69M target.

**Our Strategy (The "Triple Acceleration Method"):**

**Step 1: Maximize Tax Benefits**
• Increased RA to R5,833/month (20% of income)
• Annual tax saving: R15,000
• Used tax refund to boost investments

**Step 2: Tax-Free Investment Account**
• Added R3,000/month to tax-free savings
• Expected growth: 12% annually (tax-free)
• 31-year projected value: R1.2M

**Step 3: Property Investment**
• Purchased rental property with R50,000 deposit
• Monthly rental income: R1,800 after expenses
• Reinvested rental income into growth investments

**The Results:**
After implementing this strategy:
• Projected retirement value: R1.89M (R200K surplus!)
• Monthly retirement income: R13,200
• Total monthly savings: R8,833 (25% of income)

**"But I Can't Afford R8,833/Month!"**

Here's how Sarah made it work:
1. Started with just R3,000/month increase
2. Used tax refunds to boost investments
3. Gradually increased contributions with salary growth
4. Property rental income covered additional investments after year 2

**Your Opportunity:**
Based on your calculator results, here are 3 strategies that could work for your situation:

Strategy A: {{strategyA}}
Strategy B: {{strategyB}}
Strategy C: {{strategyC}}

**Next Steps:**
Want to see how these strategies would work with your specific numbers?

Book your free strategy session: [Calendar Link]

During our call, I'll:
• Create your personalized "acceleration strategy"
• Show you exact investment vehicles to use
• Provide step-by-step implementation timeline
• Answer all your questions

Best regards,
{{advisorName}}

P.S. Sarah's biggest regret? "I wish I'd started this conversation 5 years earlier." Don't make the same mistake.`,
      delayDays: 3,
      triggerEvent: 'calculator_download'
    },
    {
      id: 'email-3-consultation-invite',
      subject: '⏰ Final Invitation: Free Retirement Strategy Session',
      content: `Hi {{firstName}},

Over the past week, I've shared:
✅ Your personalized retirement readiness report
✅ The "Triple Acceleration Method" case study
✅ Specific strategies for your situation

Now I'd like to invite you to put it all together in a free strategy session.

**Why This Session is Different:**
Unlike generic financial advice, this session is built around YOUR specific situation, goals, and timeline.

**What We'll Create Together:**
• Your personalized retirement action plan
• Exact monthly savings targets
• Investment vehicle recommendations
• Tax optimization strategies
• Implementation timeline with milestones

**Recent Client Wins:**
• David (42): Discovered he could retire 3 years earlier with strategic asset allocation
• Lisa (29): On track to retire with R20,000/month income (started from zero!)
• Mark (38): Reduced required savings by R2,000/month through tax optimization

**Session Details:**
• Duration: 45 minutes
• Format: In-person or video call
• Cost: Complimentary
• Commitment: None (unless you choose to work with us)

**Limited Availability:**
I only take on clients whose goals align with my expertise. This session helps us both determine if we're a good fit.

**Two Ways to Book:**

Option 1: Online calendar
[Book Your Session Here]

Option 2: Call/WhatsApp
{{phoneNumber}}

**My Promise:**
Whether we work together or not, you'll leave this session with a clear, actionable plan for your retirement future.

**The Cost of Waiting:**
Every month you delay costs you approximately {{monthlyCost}} in retirement income. That's {{annualCost}} per year in your golden years.

Ready to take control of your retirement future?

Best regards,
{{advisorName}}
{{companyName}}

P.S. Spaces are filling up for December. If retirement security is a priority, don't wait until January to start.`,
      delayDays: 7,
      triggerEvent: 'calculator_download'
    }
  ],
  socialPosts: [
    {
      id: 'linkedin-1',
      platform: 'linkedin',
      content: '🚨 RETIREMENT REALITY CHECK: 94% of South Africans cannot afford to retire.\n\nThe average SA retirement savings at 65? R350,000.\nAmount needed for comfortable retirement? R2.5M+\n\n💡 The problem isn\'t just "not saving enough"—it\'s:\n• Wrong investment vehicles\n• Poor tax planning\n• No inflation protection\n• Starting too late\n\n✅ Good news: Even if you\'re behind, there are strategies to catch up.\n\nGet your free SA Retirement Readiness Calculator: [Link]\n\n#RetirementPlanning #SouthAfrica #FinancialPlanning #Investment',
      scheduledFor: 'week-1-day-2',
      hashtags: ['RetirementPlanning', 'SouthAfrica', 'FinancialPlanning', 'Investment']
    },
    {
      id: 'facebook-1',
      platform: 'facebook',
      content: '😰 Are you one of the 94% of South Africans who can\'t afford to retire?\n\n🔍 Take this quick test:\n• Can you save 25% of your income for retirement?\n• Do you have R2.5M+ in retirement investments?\n• Are your investments beating inflation by 4%+?\n\nIf you answered "no" to any of these, you\'re at risk.\n\n💪 But here\'s the empowering truth: It\'s never too late to turn things around!\n\nI just helped a 42-year-old client discover he could actually retire 3 years EARLIER than planned—just by optimizing his strategy.\n\n🎯 Want to know where you stand? Get your personalized Retirement Readiness Report (free): [Link]\n\n#RetirementPlanning #FinancialFreedom #SouthAfrica',
      scheduledFor: 'week-1-day-4',
      hashtags: ['RetirementPlanning', 'FinancialFreedom', 'SouthAfrica']
    },
    {
      id: 'linkedin-2',
      platform: 'linkedin',
      content: '💡 CLIENT SUCCESS: How we turned an R800K retirement shortfall into a R200K surplus.\n\nMeet Sarah (34, Marketing Manager):\n\n❌ Before: Saving 4.3% of income, facing R800K shortfall\n✅ After: "Triple Acceleration Method" = R200K retirement surplus\n\nOur 3-step strategy:\n1️⃣ Maximized RA contributions for tax benefits\n2️⃣ Added tax-free savings account (R3K/month)\n3️⃣ Strategic property investment for passive income\n\nResult: Projected retirement income of R13,200/month vs. her R12,000 goal.\n\n🎯 The key? Starting early and using the right vehicles.\n\nCurious about your retirement readiness? [Link]\n\n#FinancialPlanning #RetirementSuccess #InvestmentStrategy #SouthAfrica',
      scheduledFor: 'week-2-day-1',
      hashtags: ['FinancialPlanning', 'RetirementSuccess', 'InvestmentStrategy', 'SouthAfrica']
    },
    {
      id: 'facebook-2',
      platform: 'facebook',
      content: '🎉 SUCCESS STORY FRIDAY!\n\nDavid thought he\'d have to work until 67 to retire comfortably.\n\nAfter our strategy session, he discovered he could retire at 64! 🎊\n\nHow?\n✅ Optimized his asset allocation\n✅ Maximized tax-deductible contributions\n✅ Added offshore exposure (within SARS limits)\n✅ Created passive income streams\n\n💰 The result: 3 extra years of retirement = R540,000 in additional retirement income!\n\n"I wish I\'d had this conversation years ago. The difference it made is incredible!" - David\n\nWondering what\'s possible for your retirement? Get your free analysis: [Link]\n\n#RetirementPlanning #FinancialAdvice #SouthAfrica #ClientSuccess',
      scheduledFor: 'week-3-day-5',
      hashtags: ['RetirementPlanning', 'FinancialAdvice', 'SouthAfrica', 'ClientSuccess']
    }
  ],
  targetAudience: {
    demographics: ['Age 25-45', 'Working Professionals', 'Middle to Upper-Middle Income', 'University Educated', 'Urban and Semi-Urban'],
    industries: ['Corporate Services', 'Healthcare', 'Education', 'Technology', 'Finance', 'Legal', 'Engineering', 'Management'],
    jobTitles: ['Manager', 'Senior Professional', 'Specialist', 'Director', 'Business Owner', 'Consultant', 'Team Leader'],
    locations: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Major Urban Centers']
  },
  successMetrics: {
    primary: 'Generate 120+ qualified leads for financial planning services',
    secondary: ['15+ consultation bookings', 'Achieve 35%+ email open rate', 'Build prospect database of 300+'],
    kpis: [
      { name: 'Calculator Downloads', target: 120, unit: 'downloads' },
      { name: 'Consultation Bookings', target: 15, unit: 'bookings' },
      { name: 'Email Open Rate', target: 35, unit: '%' },
      { name: 'Social Media Reach', target: 5000, unit: 'people' }
    ]
  }
};

// Retail & E-commerce Template
export const RETAIL_ECOMMERCE_TEMPLATE: CampaignTemplate = {
  id: 'holiday-sales-boost',
  name: 'Holiday Sales Boost Campaign',
  industry: 'Retail & E-commerce',
  description: 'Proven campaign designed to maximize holiday sales through strategic email sequences, social media promotion, and customer retention tactics.',
  difficulty: 'beginner',
  duration: '4 weeks',
  estimatedResults: {
    leads: 200,
    consultations: 0,
    roi: '300% ROI (ZAR 3,000 → ZAR 12,000 revenue)',
    timeToResults: '1-2 weeks'
  },
  campaignData: {
    name: 'Holiday Sales Maximizer 2024',
    description: 'This campaign targets existing customers and new prospects during the holiday shopping season. Focus on driving urgency, showcasing bestsellers, and creating irresistible offers that convert browsers into buyers. Perfect for small to medium retail businesses and e-commerce stores.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 3000,
    goals: 'Increase holiday sales by 40% compared to previous year. Generate 200+ qualified leads, achieve 25%+ email open rate, and drive R12,000+ in direct sales revenue through the campaign.',
    status: 'draft' as const
  },
  contentAssets: [
    {
      id: 'blog-holiday-shopping-guide',
      type: 'blog',
      title: 'The Ultimate Holiday Shopping Guide: 10 Must-Have Gifts Under R500',
      content: `# The Ultimate Holiday Shopping Guide: 10 Must-Have Gifts Under R500

## Introduction

The holiday season is here, and finding the perfect gifts doesn't have to break the bank. We've curated a list of the most popular gifts that bring joy without the hefty price tag.

## Top 10 Holiday Gifts Under R500

### 1. Personalized Photo Frame Set - R299
Perfect for capturing holiday memories. Includes 3 frames in different sizes with custom engraving options.

### 2. Artisanal Coffee & Chocolate Gift Box - R399
Locally sourced coffee beans paired with handcrafted chocolates. Perfect for the coffee enthusiast in your life.

### 3. Bluetooth Wireless Earbuds - R449
High-quality sound with 8-hour battery life. Comes in multiple colors to match any style.

### 4. Skincare Essentials Set - R350
Complete skincare routine with cleanser, moisturizer, and serum. Suitable for all skin types.

### 5. Cozy Throw Blanket Collection - R299
Ultra-soft blankets perfect for South African winter evenings. Available in 6 colors.

### 6. Gourmet Spice Rack - R399
12 premium spices in beautiful glass jars. Perfect for the cooking enthusiast.

### 7. Desktop Plant Garden Kit - R250
Everything needed to grow herbs indoors. Includes seeds, soil, and ceramic pots.

### 8. Premium Notebook & Pen Set - R199
Leather-bound journal with premium writing tools. Perfect for planning the new year.

### 9. Essential Oil Diffuser - R399
Create a relaxing atmosphere with this stylish diffuser. Includes starter oil set.

### 10. Local Artisan Jewelry - R450
Handcrafted pieces by South African artists. Each piece is unique and meaningful.

## Special Holiday Offer

This week only: Buy any 2 items and get 15% off your entire order!

**Use code: HOLIDAY15**

[Shop Now Button]

## Free Gift Wrapping

All purchases over R300 include complimentary gift wrapping with a personalized note card.

Don't wait - holiday inventory is limited and these bestsellers sell out fast!`,
      status: 'published',
      publishedAt: new Date().toISOString(),
      tags: ['holiday-gifts', 'shopping-guide', 'retail', 'gifts-under-r500'],
      leadMagnet: {
        title: 'Free Holiday Gift Guide PDF + Exclusive Discount Codes',
        description: 'Downloadable guide with 50+ gift ideas and special discount codes'
      }
    }
  ],
  emailSequences: [
    {
      id: 'email-1-early-access',
      subject: '🎁 Your Early Access Holiday Sale Starts NOW (24 hours only)',
      content: `Hi {{firstName}},

The holiday season is officially here, and I wanted to give you first access to our biggest sale of the year!

**🎯 Early Bird Special (Next 24 Hours Only):**
• 25% off everything storewide
• Free shipping on orders over R300
• Bonus gift with purchases over R500

**⭐ This Week's Bestsellers:**
1. Personalized Photo Frames ({{quantityLeft}} left)
2. Artisanal Coffee Gift Boxes (Perfect for Secret Santa!)
3. Cozy Winter Blankets (Flying off the shelves!)

**Why Shop Early?**
✅ Best selection before items sell out
✅ Guaranteed delivery before holidays
✅ Avoid the last-minute rush
✅ Lock in the biggest discounts

**Your Exclusive Code: EARLY25**

[Shop Early Access Sale]

**🚚 Delivery Promise:**
Order by December 15th for guaranteed holiday delivery. All orders over R300 include FREE gift wrapping!

**Customer Favorite:**
"I ordered last year and everything arrived perfectly wrapped and on time. The quality was amazing!" - Sarah K.

This sale ends tomorrow at midnight - don't miss out!

Happy shopping,
{{storeName}} Team

P.S. Our gift wrapping service is already booking up fast. Secure yours today!`,
      delayDays: 0,
      triggerEvent: 'email_signup'
    },
    {
      id: 'email-2-social-proof',
      subject: '🔥 1,247 people shopped yesterday - here\'s what they bought',
      content: `Hi {{firstName}},

Our Early Access sale is creating quite the buzz! Here's what your fellow shoppers are loving:

**🏆 Yesterday's Top Sellers:**
1. **Bluetooth Earbuds** - 89 sold (R449)
   "Perfect sound quality for the price!" - Mike T.

2. **Skincare Gift Sets** - 67 sold (R350)
   "My sister loved this - perfect gift!" - Linda P.

3. **Artisanal Coffee Boxes** - 156 sold (R399)
   "Best coffee I've ever tasted!" - James R.

**⚡ Flash Update:**
• Cozy blankets - Only {{blanketStock}} left!
• Essential oil diffusers - {{diffuserStock}} remaining
• Jewelry collection - {{jewelryStock}} pieces left

**🎁 New This Week:**
We just added 3 new holiday bundles based on customer requests:
• **The Cozy Night Bundle** - R599 (save R150)
• **The Pamper Me Set** - R699 (save R200)
• **The Foodie Collection** - R799 (save R250)

**Still Available:**
✅ 25% off with code EARLY25 (expires in {{hoursLeft}} hours)
✅ Free shipping over R300
✅ Free gift wrapping

[Continue Shopping]

**⭐ Customer Spotlight:**
"I've been shopping with {{storeName}} for 3 years. The quality is consistently excellent and the customer service is amazing!" - Patricia M. (5-star review)

**Worried About Sizing?**
No problem! We offer free exchanges and a 30-day return policy.

Don't wait - these bestsellers won't last!

{{storeName}} Team`,
      delayDays: 1,
      triggerEvent: 'email_signup'
    },
    {
      id: 'email-3-urgency-final-hours',
      subject: '⏰ Final Hours: Your EARLY25 code expires at midnight',
      content: `Hi {{firstName}},

This is it - your last chance to save 25% on everything!

**⏰ Time Remaining: {{hoursLeft}} hours**

**🎯 Quick Reminder:**
• EARLY25 = 25% off everything
• Free shipping over R300
• Free gift wrapping included
• Guaranteed holiday delivery

**⚠️ Low Stock Alert:**
• Cozy Blankets: {{blanketStock}} left
• Bluetooth Earbuds: {{earbudStock}} left
• Skincare Sets: {{skincareStock}} left

**🛒 In Your Cart:** {{cartItems}}
Don't lose these items - complete your purchase now!

[Complete Purchase - 25% Off]

**After Midnight:**
Prices return to normal and some items may sell out. This is your final warning!

**1-Click Reorder:**
Loved something from last year? Here are your previous purchases ready to reorder:
{{previousPurchases}}

**Need Help?**
Call or WhatsApp: {{phoneNumber}}
Our team is standing by until midnight!

Last chance for the biggest savings!

{{storeName}} Team

P.S. Next sale won't be until Valentine's Day - make sure you don't miss this one!`,
      delayDays: 2,
      triggerEvent: 'email_signup'
    }
  ],
  socialPosts: [
    {
      id: 'instagram-1',
      platform: 'instagram',
      content: '🎁 EARLY ACCESS HOLIDAY SALE! \n\n25% off everything for the next 24 hours only! \n\n✨ What\'s everyone buying:\n• Bluetooth earbuds ✅\n• Cozy winter blankets ✅ \n• Artisanal coffee sets ✅\n• Skincare gift boxes ✅\n\n🚚 Free shipping over R300\n🎀 Free gift wrapping included\n\nCode: EARLY25\nLink in bio 👆\n\n#HolidaySale #GiftIdeas #ShopLocal #HolidayGifts #EarlyAccess',
      scheduledFor: 'week-1-day-1',
      hashtags: ['HolidaySale', 'GiftIdeas', 'ShopLocal', 'HolidayGifts', 'EarlyAccess']
    },
    {
      id: 'facebook-1',
      platform: 'facebook',
      content: '🔥 BREAKING: 1,247 people shopped our Early Access sale yesterday!\n\nHere\'s what they\'re loving:\n\n🏆 TOP SELLERS:\n• Bluetooth Earbuds (89 sold!) - "Amazing quality for the price!"\n• Coffee Gift Boxes (156 sold!) - "Perfect for coffee lovers!"\n• Skincare Sets (67 sold!) - "My mom absolutely loved it!"\n\n⚡ STOCK ALERT: Several items running low!\n\n✅ Still time to save 25% with code EARLY25\n✅ Free shipping over R300\n✅ Free gift wrapping on all orders\n\nSale ends in 12 hours! Don\'t miss out!\n\n#HolidaySale #CustomerFavorites #LastChance',
      scheduledFor: 'week-1-day-2',
      hashtags: ['HolidaySale', 'CustomerFavorites', 'LastChance']
    },
    {
      id: 'instagram-2',
      platform: 'instagram',
      content: '⚡ FLASH UPDATE: Stock flying off the shelves!\n\n🚨 Almost SOLD OUT:\n• Cozy blankets (12 left)\n• Essential oil diffusers (8 left) \n• Artisan jewelry (15 pieces left)\n\n⏰ Early Access ends TONIGHT at midnight\n\n25% off everything with EARLY25\n\nStory highlight for quick shopping! 👆\n\n#StockAlert #AlmostSoldOut #HolidayRush #LastChance #ShopNow',
      scheduledFor: 'week-1-day-2',
      hashtags: ['StockAlert', 'AlmostSoldOut', 'HolidayRush', 'LastChance', 'ShopNow']
    },
    {
      id: 'facebook-2',
      platform: 'facebook',
      content: '💝 CUSTOMER LOVE: "Best holiday shopping experience ever!"\n\n⭐⭐⭐⭐⭐ "I ordered 6 gifts and everything arrived perfectly wrapped and on time. The quality exceeded my expectations and my family loved everything!" - Sarah K.\n\n⭐⭐⭐⭐⭐ "Amazing customer service! When I wasn\'t sure about sizing, they helped me choose the perfect gifts. Will definitely shop here again!" - Michael R.\n\n⭐⭐⭐⭐⭐ "The personalized photo frames were a huge hit! Such beautiful quality and the engraving was perfect." - Lisa T.\n\n🎁 Ready to create your own success story?\n\nEARLY25 still active for a few more hours!\n\n#CustomerReviews #HappyCustomers #QualityGuaranteed #HolidaySuccess',
      scheduledFor: 'week-1-day-3',
      hashtags: ['CustomerReviews', 'HappyCustomers', 'QualityGuaranteed', 'HolidaySuccess']
    }
  ],
  targetAudience: {
    demographics: ['Age 25-55', 'Parents', 'Gift Buyers', 'Working Professionals', 'Local Shoppers', 'Online Shoppers'],
    industries: ['Any Industry', 'Retail Workers', 'Office Workers', 'Healthcare Workers', 'Teachers', 'Small Business Owners'],
    jobTitles: ['Professional', 'Parent', 'Gift Buyer', 'Shopper', 'Team Leader', 'Business Owner', 'Employee'],
    locations: ['Local Area', 'Major Cities', 'Suburban Areas', 'Shopping Centers', 'Office Districts', 'Residential Areas']
  },
  successMetrics: {
    primary: 'Generate R12,000+ in direct sales revenue during campaign period',
    secondary: ['200+ email subscribers', '40% increase in holiday sales', 'Achieve 25%+ email open rate'],
    kpis: [
      { name: 'Total Sales Revenue', target: 12000, unit: 'ZAR' },
      { name: 'Email Subscribers', target: 200, unit: 'subscribers' },
      { name: 'Email Open Rate', target: 25, unit: '%' },
      { name: 'Social Media Engagement', target: 800, unit: 'interactions' }
    ]
  }
};

// Export all templates
export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  DIRECTOR_LIABILITY_TEMPLATE,
  REAL_ESTATE_TEMPLATE,
  MUNICIPALITY_ENGAGEMENT_TEMPLATE,
  FINANCIAL_SERVICES_TEMPLATE,
  RETAIL_ECOMMERCE_TEMPLATE
];

// Template categories for organization
export const TEMPLATE_CATEGORIES = {
  LEGAL_COMPLIANCE: {
    name: 'Legal & Compliance',
    description: 'Templates for legal compliance and risk management',
    templates: ['director-liability-awareness']
  },
  FINANCIAL_SERVICES: {
    name: 'Financial Services',
    description: 'Templates for financial advisors, planners, and investment professionals',
    templates: ['financial-planning-awareness']
  },
  REAL_ESTATE: {
    name: 'Real Estate & Property',
    description: 'Templates for property professionals and real estate agencies',
    templates: ['real-estate-lead-generation']
  },
  RETAIL_ECOMMERCE: {
    name: 'Retail & E-commerce',
    description: 'Templates for retail stores, online shops, and e-commerce businesses',
    templates: ['holiday-sales-boost']
  },
  PUBLIC_SECTOR: {
    name: 'Public Sector',
    description: 'Templates for municipalities and government organizations',
    templates: ['municipality-public-engagement']
  }
};