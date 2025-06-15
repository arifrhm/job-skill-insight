import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobScore {
  job_id: number;
  title: string;
  skills: string[];
  lls_score: number;
}

interface JobRankingCardProps {
  jobScores: JobScore[];
}

const JobRankingCard: React.FC<JobRankingCardProps> = ({ jobScores }) => {
  if (jobScores.length === 0) return null;

  // Cari lls_max dan lls_min
  const lls_max = Math.max(...jobScores.map(j => j.lls_score));
  const lls_min = Math.min(...jobScores.map(j => j.lls_score));

  // Fungsi untuk hitung persentase
  const getPercentage = (score: number) => {
    if (lls_max === lls_min) return 100;
    return ((score - lls_min) / (lls_max - lls_min)) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Top 10 Job Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobScores.map((job, index) => (
            <div
              key={job.job_id}
              className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-primary">
                    #{index + 1}
                  </span>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                </div>
                <div className="text-sm font-medium text-muted-foreground flex flex-col items-end">
                  <span>Matching Score: {job.lls_score.toFixed(2)}</span>
                  <span>({getPercentage(job.lls_score).toFixed(2)}%)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobRankingCard; 