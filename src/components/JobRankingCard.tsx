import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobScore {
  job_id: number;
  title: string;
  skills: string[];
  lls_score?: number;
  cosine_score?: number;
  algorithm?: string;
}

interface JobRankingCardProps {
  jobScores: JobScore[];
}

const JobRankingCard: React.FC<JobRankingCardProps> = ({ jobScores }) => {
  if (jobScores.length === 0) return null;

  // Get the appropriate score field based on algorithm
  const getScore = (job: JobScore) => {
    if (job.algorithm === 'cosine_similarity' && job.cosine_score !== undefined) {
      return job.cosine_score;
    }
    return job.lls_score || 0;
  };

  // Cari score_max dan score_min
  const scores = jobScores.map(j => getScore(j));
  const score_max = Math.max(...scores);
  const score_min = Math.min(...scores);

  // Fungsi untuk hitung persentase
  const getPercentage = (score: number) => {
    if (score_max === score_min) return 100;
    return ((score - score_min) / (score_max - score_min)) * 100;
  };

  // Get score label based on algorithm
  const getScoreLabel = (job: JobScore) => {
    if (job.algorithm === 'cosine_similarity') {
      return 'Cosine Score';
    }
    return 'LLR Score';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Top 10 Job Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobScores.map((job, index) => {
            const score = getScore(job);
            const scoreLabel = getScoreLabel(job);
            
            return (
              <div
                key={job.job_id}
                className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-primary">
                      #{index + 1}
                    </span>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground flex flex-col items-end">
                    <span>{scoreLabel}: {score.toFixed(4)}</span>
                    <span>({getPercentage(score).toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobRankingCard; 