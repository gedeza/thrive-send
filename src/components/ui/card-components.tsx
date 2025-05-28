import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

// Standardized Feature Card component that can be used across the application
export function FeatureCard({ 
  icon, 
  title, 
  description,
  className = ""
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  className?: string
}) {
  return (
    <div className={`bg-white border border-border rounded-xl p-6 transition-all hover:-translate-y-2 hover:shadow-lg group ${className}`}>
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary transition-all group-hover:scale-110 group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      <div className="h-1 w-0 bg-gradient-to-r from-primary to-green-500 rounded mt-6 transition-all group-hover:w-full"></div>
    </div>
  );
}

// Standardized Testimonial Card component
export function TestimonialCard({ 
  content, 
  authorName, 
  authorRole, 
  avatarText,
  className = ""
}: { 
  content: string, 
  authorName: string, 
  authorRole: string,
  avatarText: string,
  className?: string
}) {
  return (
    <div className={`bg-white border border-border rounded-xl p-6 hover:-translate-y-2 hover:shadow-lg transition-all ${className}`}>
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

// Standardized Pricing Card component
export function PricingCard({ 
  title, 
  price, 
  description, 
  features, 
  ctaText, 
  ctaLink = "/content/calendar",
  popular = false,
  className = "" 
}: { 
  title: string, 
  price: string, 
  description: string,
  features: string[],
  ctaText: string,
  ctaLink?: string,
  popular?: boolean,
  className?: string
}) {
  return (
    <div className={`bg-white border ${popular ? 'border-primary' : 'border-border'} rounded-xl p-8 flex flex-col relative ${popular ? 'shadow-lg shadow-primary/10 scale-105' : 'shadow-sm'} ${className}`}>
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
      <Link href={ctaLink}>
        <Button 
          className={`w-full rounded-lg ${popular ? 'bg-primary hover:bg-primary-dark text-white' : ''}`}
          variant={popular ? "default" : "outline"}
        >
          {ctaText}
        </Button>
      </Link>
    </div>
  );
}

// Standardized Stats Card component
export function StatsCard({
  stats,
  className = ""
}: {
  stats: Array<{value: string, label: string}>,
  className?: string
}) {
  return (
    <div className={`bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col md:flex-row gap-10 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="stat text-center">
          <div className="text-2xl font-bold text-primary">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Standardized Section Header component
export function SectionHeader({
  title,
  description,
  className = ""
}: {
  title: string,
  description: string,
  className?: string
}) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary to-green-500 text-transparent bg-clip-text inline-block">
        {title}
      </h2>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
        {description}
      </p>
    </div>
  );
}