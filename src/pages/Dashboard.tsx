import { JobRecommendation } from '@/components/JobRecommendation';

export default function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <JobRecommendation />
    </div>
  );
} 