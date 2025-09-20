import { Metadata } from 'next';
import { TemplateExplorerPageClient } from './TemplateExplorerPageClient';

export const metadata: Metadata = {
  title: 'Campaign Templates | ThriveSend',
  description: 'Explore our collection of campaign templates designed for every industry and business type'
};

export default function TemplateExplorerPage() {
  return <TemplateExplorerPageClient />;
}
