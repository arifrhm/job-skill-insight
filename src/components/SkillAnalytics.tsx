
import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { JobPosition, SearchFilters } from '../pages/Index';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter } from 'lucide-react';

interface SkillAnalyticsProps {
  results: JobPosition[];
  currentSkills: string[];
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
    position.skills.forEach(skill => {
      const skillName = skill.skill_name;
      const isUserSkill = currentSkills.some(userSkill => 
        userSkill.toLowerCase() === skillName.toLowerCase()
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
      isUserSkill: data.isUserSkill
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate match distribution
  const matchDistribution = results.map(position => {
    const matchingSkills = position.skills.filter(skill => 
      currentSkills.some(userSkill => userSkill.toLowerCase() === skill.skill_name.toLowerCase())
    );
    const percentage = Math.round((matchingSkills.length / position.skills.length) * 100);
    
    if (percentage >= 80) return 'Excellent (80-100%)';
    if (percentage >= 60) return 'Good (60-79%)';
    if (percentage >= 40) return 'Fair (40-59%)';
    return 'Needs Work (0-39%)';
  });

  const distributionData = [
    { name: 'Excellent (80-100%)', value: matchDistribution.filter(d => d === 'Excellent (80-100%)').length, color: '#10B981' },
    { name: 'Good (60-79%)', value: matchDistribution.filter(d => d === 'Good (60-79%)').length, color: '#F59E0B' },
    { name: 'Fair (40-59%)', value: matchDistribution.filter(d => d === 'Fair (40-59%)').length, color: '#EF4444' },
    { name: 'Needs Work (0-39%)', value: matchDistribution.filter(d => d === 'Needs Work (0-39%)').length, color: '#6B7280' }
  ].filter(item => item.value > 0);

  const exportResults = () => {
    const csvContent = [
      ['Job Title', 'Match Percentage', 'Required Skills', 'Missing Skills'].join(','),
      ...results.map(position => {
        const matchingSkills = position.skills.filter(skill => 
          currentSkills.some(userSkill => userSkill.toLowerCase() === skill.skill_name.toLowerCase())
        );
        const missingSkills = position.skills.filter(skill => 
          !currentSkills.some(userSkill => userSkill.toLowerCase() === skill.skill_name.toLowerCase())
        );
        const matchPercentage = Math.round((matchingSkills.length / position.skills.length) * 100);
        
        return [
          `"${position.job_title}"`,
          matchPercentage,
          `"${position.skills.map(s => s.skill_name).join('; ')}"`,
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
      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters & Sort:</span>
            </div>
            
            <Select
              value={filters.sortBy}
              onValueChange={(value: SearchFilters['sortBy']) => 
                setFilters({ ...filters, sortBy: value })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="missingSkills">Missing Skills (Low to High)</SelectItem>
                <SelectItem value="matchPercentage">Match Percentage (High to Low)</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={filters.showOnlyMissing ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, showOnlyMissing: !filters.showOnlyMissing })}
            >
              {filters.showOnlyMissing ? '✓ Show Only Gaps' : 'Show Only Skill Gaps'}
            </Button>
          </div>

          <Button onClick={exportResults} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <Bar 
                dataKey="count" 
                fill={(entry) => entry.isUserSkill ? '#10B981' : '#6366F1'}
                name="Job Count"
              />
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

        {/* Match Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Skill Match Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{results.length}</div>
          <div className="text-sm text-gray-600">Job Matches</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{currentSkills.length}</div>
          <div className="text-sm text-gray-600">Your Skills</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Object.keys(skillFrequency).length - currentSkills.length}
          </div>
          <div className="text-sm text-gray-600">Skills to Learn</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(results.reduce((acc, position) => {
              const matchingSkills = position.skills.filter(skill => 
                currentSkills.some(userSkill => userSkill.toLowerCase() === skill.skill_name.toLowerCase())
              );
              return acc + (matchingSkills.length / position.skills.length) * 100;
            }, 0) / results.length)}%
          </div>
          <div className="text-sm text-gray-600">Avg Match</div>
        </Card>
      </div>
    </div>
  );
};
