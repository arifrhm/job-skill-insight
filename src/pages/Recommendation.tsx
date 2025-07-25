import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import type { TopRecommendationResponse } from '../lib/api';
import JobRankingCard from '../components/JobRankingCard';

export default function Recommendation() {
  const [recommendation, setRecommendation] = useState<TopRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const data = await jobsApi.getTopRecommendation();
        setRecommendation(data);
      } catch (error: unknown) {
        const err = error as { response?: { status: number } };
        if (err.response?.status === 404) {
          toast({
            title: "No Skills Found",
            description: "Please add skills to your profile to get job recommendations.",
            variant: "destructive"
          });
          navigate('/profile');
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch job recommendations. Please try again.",
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendation();
  }, [toast, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!recommendation) {
    return null;
  }

  const { job, all_job_scores } = recommendation;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Your Job Recommendations</h1>

      {/* Top Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle>Best Match: {job.job_title}</CardTitle>
          <CardDescription>
            Match Score: {job.log_likelihood.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Recommended Skills */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Skills to Learn</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.recommended.map((skill) => (
                  <span
                    key={skill.skill_id}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Job Recommendations */}
      <JobRankingCard jobScores={all_job_scores} />

      <div className="flex justify-center mt-8">
        <Button onClick={() => navigate('/profile')}>
          Update Your Skills
        </Button>
      </div>
    </div>
  );
} 