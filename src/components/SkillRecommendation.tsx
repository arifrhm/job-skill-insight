import { useState } from 'react';
import { jobsApi } from '../lib/api';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import type { TopRecommendationResponse } from '../lib/api';

interface SkillRecommendationProps {
  onSkillSelect: (skillName: string) => void;
}

export default function SkillRecommendation({ onSkillSelect }: SkillRecommendationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<TopRecommendationResponse | null>(null);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await jobsApi.getTopRecommendation();
      setRecommendation(data);
    } catch (error: unknown) {
      const err = error as { response?: { status: number } };
      if (err.response?.status === 404) {
        toast({
          title: "No Skills Found",
          description: "Please add some skills to your profile first.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch skill recommendations. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGetRecommendations}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Finding Recommendations...
          </>
        ) : (
          'Find Skill Recommendations'
        )}
      </Button>

      {recommendation && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <h3 className="font-semibold mb-2">Recommended Skills for {recommendation.job.job_title}</h3>
            <div className="flex flex-wrap gap-2">
              {recommendation.job.skills.recommended.map((skill) => (
                <Button
                  key={skill.skill_id}
                  variant="outline"
                  size="sm"
                  onClick={() => onSkillSelect(skill.skill_name)}
                  className="bg-white hover:bg-blue-50"
                >
                  {skill.skill_name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Your Matching Skills</h3>
            <div className="flex flex-wrap gap-2">
              {recommendation.job.skills.matching.map((skill) => (
                <span
                  key={skill.skill_id}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {skill.skill_name}
                </span>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Match Score: {recommendation.job.log_likelihood.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
} 