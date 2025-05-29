declare module '@/components/clients/ClientHeader' {
  export interface ClientHeaderProps {
    client: {
      id: string;
      name: string;
      industry?: string | null;
      website?: string | null;
      email?: string | null;
      phone?: string | null;
    };
  }
  
  export function ClientHeaderSkeleton(): JSX.Element;
  export default function ClientHeader(props: ClientHeaderProps): JSX.Element;
}

declare module '@/components/clients/FeedbackSection' {
  export interface FeedbackSectionProps {
    clientId: string;
    limit?: number;
  }
  export default function FeedbackSection(props: FeedbackSectionProps): JSX.Element;
}

declare module '@/components/clients/GoalsSection' {
  export interface GoalsSectionProps {
    clientId: string;
    limit?: number;
  }
  export default function GoalsSection(props: GoalsSectionProps): JSX.Element;
} 