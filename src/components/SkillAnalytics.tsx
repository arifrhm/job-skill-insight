import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SearchFilters } from '../pages/Index';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Filter, Check, X } from 'lucide-react';
import { SkillResponse, TopRecommendationResponse } from '@/lib/api';

interface JobScore {
  job_id: number;
  title: string;
  skills: string[];
  lls_score: number;
}

interface SkillAnalyticsProps {
  results: JobScore[];
  currentSkills: SkillResponse[];
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  topRecommendation?: TopRecommendationResponse;
}

export const SkillAnalytics: React.FC<SkillAnalyticsProps> = ({
  results,
  currentSkills,
  filters,
  setFilters,
  topRecommendation
}) => {
  // Calculate skill frequency
  const skillFrequency = results.reduce((acc, position) => {
    position.skills.forEach(skill => {
      const skillName = skill;
      const isUserSkill = currentSkills.some(userSkill => 
        userSkill.skill_name.toLowerCase() === skillName.toLowerCase()
      );
      
      if (!acc[skillName]) {
        acc[skillName] = { count: 0, isUserSkill };
      }
      acc[skillName].count++;
    });
    return acc;
  }, {} as Record<string, { count: number; isUserSkill: boolean }>);

  const skillData = Object.entries(skillFrequency)
    .map(([skill, data]) => ({
      skill,
      count: data.count,
      isUserSkill: data.isUserSkill,
      fill: data.isUserSkill ? '#10B981' : '#6366F1'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get all unique skills from results
  const allRequiredSkills = Array.from(new Set(
    results.flatMap(position => position.skills)
  ));

  // Calculate skill match percentages
  const skillMatches = allRequiredSkills.map(skill => ({
    skill,
    isUserSkill: currentSkills.some(userSkill => 
      userSkill.skill_name.toLowerCase() === skill.toLowerCase()
    ),
    count: skillFrequency[skill]?.count || 0
  }));

  // Sort skills by frequency
  const sortedSkills = skillMatches.sort((a, b) => b.count - a.count);

  const exportResults = () => {
    const csvContent = [
      ['Job Title', 'Match Percentage', 'Required Skills', 'Missing Skills'].join(','),
      ...results.map(position => {
        const matchingSkills = position.skills.filter(skill => 
          currentSkills.some(userSkill => userSkill.skill_name.toLowerCase() === skill.toLowerCase())
        );
        const missingSkills = position.skills.filter(skill => 
          !currentSkills.some(userSkill => userSkill.skill_name.toLowerCase() === skill.toLowerCase())
        );
        const matchPercentage = Math.round((matchingSkills.length / position.skills.length) * 100);
        
        return [
          `"${position.title}"`,
          matchPercentage,
          `"${position.skills.join('; ')}"`,
          `"${missingSkills.join('; ')}"`,
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill-analysis.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Recommendation Card */}
      {topRecommendation && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Best Match: {topRecommendation.job.job_title}</h2>
              <div className="text-lg text-blue-600 font-semibold">
                Match Score: {topRecommendation.job.log_likelihood.toFixed(2)}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Recommended Skills to Learn</h3>
              <div className="flex flex-wrap gap-2">
                {topRecommendation.job.skills.recommended.map((skill) => (
                  <span
                    key={skill.skill_id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div>

            {/* <div>
              <h3 className="text-lg font-semibold mb-3">Your Matching Skills</h3>
              <div className="flex flex-wrap gap-2">
                {topRecommendation.job.skills.matching.map((skill) => (
                  <span
                    key={skill.skill_id}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div> */}
          </div>
        </Card>
      )}

    </div>
  );
};
