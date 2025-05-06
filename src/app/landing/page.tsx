"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BarChart2, 
  Calendar, 
  Share2, 
  Coins, 
  Rocket, 
  Check, 
  Send,
  Twitter,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
        <header className="bg-white border-b border-border sticky top-0 z-50 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                <Send className="w-6 h-6 mr-2 text-primary" />
                <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
                  ThriveSend
                </span>
              </div>
              
              <nav className="flex flex-wrap justify-center gap-8">
                <a href="#features" className="nav-item relative">Features</a>
                <a href="#testimonials" className="nav-item relative">Testimonials</a>
                <a href="#pricing" className="nav-item relative">Pricing</a>
                <a href="#about" className="nav-item relative">About</a>
              </nav>
              
              <div className="flex gap-4">
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Link href="/calendar">
                  <Button>Calendar</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        <section className="hero py-24 relative overflow-hidden">
          <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-primary/5 -z-10"></div>
          <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-green-500/5 -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-gray-800 to-primary text-transparent bg-clip-text">
                Amplify Your Social Media Presence
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl">
                Our all-in-one platform helps enterprises, businesses, and content creators drive engagement, build stronger communities, and monetize their expertise across global markets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link href="/calendar">
                  <Button size="lg" className="min-w-[200px]">
                    Start 14-Day Free Trial
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="min-w-[200px]">
                    Schedule a Demo
                  </Button>
                </Link>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  No credit card required
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-16">
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-10 animate-float">
                <div className="stat text-center">
                  <div className="text-2xl font-bold text-primary">250+</div>
                  <div className="text-sm text-muted-foreground">New Subscribers</div>
                </div>
                <div className="stat text-center">
                  <div className="text-2xl font-bold text-primary">410%</div>
                  <div className="text-sm text-muted-foreground">Growth Rate</div>
                </div>
                <div className="stat text-center">
                  <div className="text-2xl font-bold text-primary">40+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary to-green-500 text-transparent bg-clip-text inline-block">
                Powerful Features for Everyone
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Whether you're managing social media for enterprises, businesses, or creating content, ThriveSend has the tools you need to succeed globally.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Users className="w-6 h-6" />}
                title="Community Engagement"
                description="Connect with audiences across all platforms, track response times, and identify trending community concerns for your clients."
              />
              
              <FeatureCard 
                icon={<BarChart2 className="w-6 h-6" />}
                title="Advanced Analytics"
                description="Measure the impact of your communications with comprehensive metrics that demonstrate real value to stakeholders."
              />
              
              <FeatureCard 
                icon={<Calendar className="w-6 h-6" />}
                title="Content Calendar"
                description="Plan and schedule content across all social channels from one central, intuitive dashboard for multiple clients."
              />
              
              <FeatureCard 
                icon={<Share2 className="w-6 h-6" />}
                title="Recommendation Network"
                description="Grow your audience through passive network effects, gaining 200-300 new subscribers weekly for your clients."
              />
              
              <FeatureCard 
                icon={<Coins className="w-6 h-6" />}
                title="Multiple Revenue Streams"
                description="Monetize expertise through sponsored content, premium subscriptions, and classified ads for businesses of all sizes."
              />
              
              <FeatureCard 
                icon={<Rocket className="w-6 h-6" />}
                title="Boost Marketplace"
                description="Participate in our two-sided marketplace where you can both promote content and earn by promoting others."
              />
            </div>
          </div>
        </section>
        
        <section id="testimonials" className="py-24 bg-background relative">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary to-green-500 text-transparent bg-clip-text inline-block">
                What Our Users Say
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Join thousands of satisfied users who have transformed their social media management capabilities with ThriveSend.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard 
                content="ThriveSend has revolutionized how we deliver social media services to municipalities. Our response time to citizen inquiries has decreased by 65%, and community engagement has more than doubled."
                authorName="James Mitchell"
                authorRole="Director, Social Media Management Agency"
                avatarText="JM"
              />
              
              <TestimonialCard 
                content="I manage social media for three different enterprises, and ThriveSend has cut my workload in half while increasing my revenue by 40%. The recommendation network alone brings in 250+ new subscribers weekly."
                authorName="Sarah Nkosi"
                authorRole="Content Creator & Digital Consultant"
                avatarText="SN"
              />
              
              <TestimonialCard 
                content="Our clients have noticed the difference in our communication quality. We're now able to quickly address concerns, announce events, and share important updates across multiple platforms from one dashboard."
                authorName="Robert Mabunda"
                authorRole="CEO, Digital Marketing Agency"
                avatarText="RM"
              />
            </div>
          </div>
        </section>
        
        <section id="pricing" className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary to-green-500 text-transparent bg-clip-text inline-block">
                Transparent Pricing for All Needs
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Choose the plan that works best for your business, with no hidden fees or long-term contracts.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard 
                title="Starter"
                price="$29"
                description="Perfect for individuals and small businesses just getting started with social media management."
                features={[
                  "Up to 5 social accounts",
                  "Basic analytics",
                  "Content calendar",
                  "Community management",
                  "Email support"
                ]}
                ctaText="Start Free Trial"
                popular={false}
              />
              
              <PricingCard 
                title="Professional"
                price="$79"
                description="Ideal for growing businesses managing multiple accounts and seeking advanced features."
                features={[
                  "Up to 15 social accounts",
                  "Advanced analytics & reporting",
                  "Content creation assistant",
                  "Recommendation network",
                  "Revenue stream tools",
                  "Priority support"
                ]}
                ctaText="Start Free Trial"
                popular={true}
              />
              
              <PricingCard 
                title="Enterprise"
                price="$199"
                description="Comprehensive solution for agencies and large businesses managing many clients."
                features={[
                  "Unlimited social accounts",
                  "Custom analytics dashboard",
                  "White-label reports",
                  "API access",
                  "Dedicated account manager",
                  "24/7 priority support"
                ]}
                ctaText="Contact Sales"
                popular={false}
              />
            </div>
          </div>
        </section>
        
        <section id="about" className="py-24 bg-background relative">
          <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-primary to-green-500 text-transparent bg-clip-text inline-block">
                  About ThriveSend
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Founded in 2023, ThriveSend was born from a simple observation: social media management was too complex, time-consuming, and difficult to monetize effectively.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Our team of experienced marketers, developers, and entrepreneurs set out to create a platform that simplifies social media management while maximizing revenue potential for businesses of all sizes.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Today, ThriveSend serves thousands of users in over 40 countries, from solo entrepreneurs to marketing agencies and enterprise teams.
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="font-semibold">10k+ Users</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="font-semibold">Since 2023</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <div className="font-semibold">Backed by YC</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground mb-6">
                  To empower businesses and content creators to build thriving communities and maximize their social media potential with intuitive, powerful tools.
                </p>
                <h3 className="text-xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground mb-6">
                  A world where every business, regardless of size, can effectively leverage social media to grow their audience, build community, and generate revenue.
                </p>
                <h3 className="text-xl font-bold mb-4">Our Values</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">User-centric design in everything we create</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Constant innovation to stay ahead of social trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Transparency in our pricing and practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Commitment to our users' growth and success</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-24 bg-gradient-to-r from-primary to-primary-dark text-white text-center relative overflow-hidden">
          <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-white/10 -z-10"></div>
          <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-white/10 -z-10"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              Ready to transform your social media management?
            </h2>
            <p className="text-lg opacity-90 max-w-3xl mx-auto mb-10">
              Join thousands of enterprises, businesses, and content creators who are enhancing their social media services and monetizing their expertise with ThriveSend.
            </p>
            <Link href="/calendar">
              <Button size="lg" variant="default" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto">
                Start Your 14-Day Free Trial
              </Button>
            </Link>
          </div>
        </section>
        
        <footer className="bg-gray-900 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
              <div>
                <div className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-primary-light to-purple-300 text-transparent bg-clip-text inline-block">
                  ThriveSend
                </div>
                <p className="text-gray-400 mb-6">
                  Amplifying social media presence for enterprises, businesses, and content creators worldwide.
                </p>
                <div className="flex gap-4">
                  <SocialLink icon={<Twitter className="w-5 h-5" />} name="Twitter" />
                  <SocialLink icon={<Facebook className="w-5 h-5" />} name="Facebook" />
                  <SocialLink icon={<Instagram className="w-5 h-5" />} name="Instagram" />
                  <SocialLink icon={<Linkedin className="w-5 h-5" />} name="LinkedIn" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-6">Product</h3>
                <div className="flex flex-col gap-3">
                  <FooterLink href="#features" label="Features" />
                  <FooterLink href="#pricing" label="Pricing" />
                  <FooterLink href="/dashboard" label="Case Studies" />
                  <FooterLink href="/dashboard" label="Documentation" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-6">Company</h3>
                <div className="flex flex-col gap-3">
                  <FooterLink href="#about" label="About Us" />
                  <FooterLink href="/dashboard" label="Careers" />
                  <FooterLink href="/dashboard" label="Blog" />
                  <FooterLink href="/dashboard" label="Press Kit" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-6">Legal</h3>
                <div className="flex flex-col gap-3">
                  <FooterLink href="/dashboard" label="Terms of Service" />
                  <FooterLink href="/dashboard" label="Privacy Policy" />
                  <FooterLink href="/dashboard" label="Cookie Policy" />
                  <FooterLink href="/dashboard" label="GDPR Compliance" />
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800">
              &copy; {new Date().getFullYear()} ThriveSend. All rights reserved.
            </div>
          </div>
        </footer>
        
        <style jsx>{`
          .nav-item {
            font-weight: 500;
            transition: color 0.2s;
          }
          
          .nav-item:hover {
            color: var(--color-primary);
          }
          
          .nav-item::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -4px;
            left: 0;
            background-color: var(--color-primary);
            transition: width 0.3s;
          }
          
          .nav-item:hover::after {
            width: 100%;
          }
          
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite alternate-reverse;
          }
          
          .bg-grid-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
        `}</style>
      </div>
  );
}

// Helper Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-background border border-border rounded-xl p-6 transition-all hover:transform hover:-translate-y-2 hover:shadow-lg group">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary transition-all group-hover:scale-110 group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      <div className="h-1 w-0 bg-gradient-to-r from-primary to-green-500 rounded mt-6 transition-all group-hover:w-full"></div>
    </div>
  );
}

function TestimonialCard({ content, authorName, authorRole, avatarText }: { 
  content: string, 
  authorName: string, 
  authorRole: string,
  avatarText: string 
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:transform hover:-translate-y-2 hover:shadow-lg transition-all">
      <p className="relative pl-6 mb-6 text-foreground leading-relaxed">
        <span className="absolute left-0 top-0 text-5xl text-primary-light font-serif leading-none">"</span>
        {content}
      </p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold mr-4">
          {avatarText}
        </div>
        <div>
          <div className="font-semibold">{authorName}</div>
          <div className="text-sm text-muted-foreground">{authorRole}</div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ title, price, description, features, ctaText, popular }: { 
  title: string, 
  price: string, 
  description: string,
  features: string[],
  ctaText: string,
  popular: boolean 
}) {
  return (
    <div className={`bg-card border ${popular ? 'border-primary' : 'border-border'} rounded-xl p-8 flex flex-col relative ${popular ? 'shadow-lg shadow-primary/10 scale-105' : ''}`}>
      {popular && (
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={popular ? "/calendar" : ctaText === "Contact Sales" ? "/dashboard" : "/calendar"}>
        <Button 
          className={`w-full ${popular ? 'bg-primary hover:bg-primary-dark text-white' : ''}`}
          variant={popular ? "default" : "outline"}
        >
          {ctaText}
        </Button>
      </Link>
    </div>
  );
}

function SocialLink({ icon, name }: { icon: React.ReactNode, name: string }) {
  return (
    <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary hover:transform hover:-translate-y-1 transition-all">
      <span className="sr-only">{name}</span>
      {icon}
    </a>
  );
}

function FooterLink({ href, label }: { href: string, label: string }) {
  return (
    <a 
      href={href} 
      className="text-gray-400 hover:text-white hover:transform hover:translate-x-1 transition-all flex items-center gap-2"
    >
      <span className="text-xs">›</span>
      {label}
    </a>
  );
}
