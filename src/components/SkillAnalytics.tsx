import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SearchFilters } from '../pages/Index';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Filter, Check, X } from 'lucide-react';
import { JobPositionResponse, SkillResponse } from '@/lib/api';

interface SkillAnalyticsProps {
  results: JobPositionResponse[];
  currentSkills: SkillResponse[];
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
}

export const SkillAnalytics: React.FC<SkillAnalyticsProps> = ({
  results,
  currentSkills,
  filters,
  setFilters
}) => {
  // Calculate skill frequency
  const skillFrequency = results.reduce((acc, position) => {
    position.required_skills.forEach(skill => {
      const skillName = skill.skill_name;
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
    results.flatMap(position => position.required_skills.map(skill => skill.skill_name))
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
        const matchingSkills = position.required_skills.filter(skill => 
          currentSkills.some(userSkill => userSkill.skill_name.toLowerCase() === skill.skill_name.toLowerCase())
        );
        const missingSkills = position.required_skills.filter(skill => 
          !currentSkills.some(userSkill => userSkill.skill_name.toLowerCase() === skill.skill_name.toLowerCase())
        );
        const matchPercentage = Math.round((matchingSkills.length / position.required_skills.length) * 100);
        
        return [
          `"${position.job_title}"`,
          matchPercentage,
          `"${position.required_skills.map(s => s.skill_name).join('; ')}"`,
          `"${missingSkills.map(s => s.skill_name).join('; ')}"`,
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
    <div className="mb-8 space-y-6">
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Skill Frequency Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Most In-Demand Skills</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="skill" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Job Count">
                {skillData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Skills you have</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Skills to learn</span>
            </div>
          </div>
        </Card>

        {/* Skill Comparison */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Skill Comparison</h3>
          <div className="space-y-4">
            {sortedSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {skill.isUserSkill ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{skill.skill}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Required in {skill.count} {skill.count === 1 ? 'job' : 'jobs'}
                  </span>
                  <span className={`text-sm font-medium ${
                    skill.isUserSkill ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {skill.isUserSkill ? 'You have this skill' : 'Skill to learn'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
