import { Metadata } from 'next';
import { NewCampaignPageClient } from './NewCampaignPageClient';

export const metadata: Metadata = {
  title: 'Create New Campaign | ThriveSend',
  description: 'Create a new email marketing campaign with ThriveSend'
};

export default function NewCampaignPage() {
  return <NewCampaignPageClient />;
}
