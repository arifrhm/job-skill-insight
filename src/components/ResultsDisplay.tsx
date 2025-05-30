
import React from 'react';
import { JobCard } from './JobCard';
import { Card } from '../components/ui/card';
import { JobPosition, SearchFilters } from '../pages/Index';

interface ResultsDisplayProps {
  results: JobPosition[];
  currentSkills: string[];
  filters: SearchFilters;
  loading: boolean;
  favoritePositions: Set<number>;
  onToggleFavorite: (positionId: number) => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  currentSkills,
  filters,
  loading,
  favoritePositions,
  onToggleFavorite
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to discover opportunities?
          </h3>
          <p className="text-gray-600">
            Enter a job title and your current skills to get personalized recommendations
          </p>
        </div>
      </Card>
    );
  }

  const calculateMatchPercentage = (position: JobPosition) => {
    const requiredSkills = position.skills.map(s => s.skill_name.toLowerCase());
    const userSkills = currentSkills.map(s => s.toLowerCase());
    const matchingSkills = requiredSkills.filter(skill => userSkills.includes(skill));
    return Math.round((matchingSkills.length / requiredSkills.length) * 100);
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (filters.sortBy) {
      case 'missingSkills': {
        const aMissing = a.skills.length - a.skills.filter(skill => 
          currentSkills.some(userSkill => userSkill.toLowerCase() === skill.skill_name.toLowerCase())
        ).length;
        const bMissing = b.skills.length - b.skills.filter(skill => 
          currentSkills.some(userSkill => userSkill.toLowerCase() === skill.skill_name.toLowerCase())
        ).length;
        return aMissing - bMissing;
      }
      case 'alphabetical':
        return a.job_title.localeCompare(b.job_title);
      case 'matchPercentage':
        return calculateMatchPercentage(b) - calculateMatchPercentage(a);
      default:
        return 0;
    }
  });

  const filteredResults = filters.showOnlyMissing 
    ? sortedResults.filter(position => {
        const missingSkills = position.skills.filter(skill => 
          !currentSkills.some(userSkill => userSkill.toLowerCase() === skill.skill_name.toLowerCase())
        );
        return missingSkills.length > 0;
      })
    : sortedResults;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Job Recommendations ({filteredResults.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.map((position) => (
          <JobCard
            key={position.position_id}
            position={position}
            currentSkills={currentSkills}
            isFavorite={favoritePositions.has(position.position_id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
