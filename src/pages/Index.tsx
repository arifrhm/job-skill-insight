
import React, { useState } from 'react';
import { SearchInterface } from '../components/SearchInterface';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { SkillAnalytics } from '../components/SkillAnalytics';
import { useToast } from '../hooks/use-toast';

export interface Skill {
  skill_id: number;
  skill_name: string;
}

export interface JobPosition {
  position_id: number;
  job_title: string;
  job_detail_link: string;
  skills: Skill[];
}

export interface SearchFilters {
  sortBy: 'missingSkills' | 'alphabetical' | 'matchPercentage';
  showOnlyMissing: boolean;
}

const Index = () => {
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [results, setResults] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'missingSkills',
    showOnlyMissing: false
  });
  const [favoritePositions, setFavoritePositions] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!jobTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job title",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call - replace with actual endpoint
      const response = await fetch('/api/v1/recommend-skills/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: jobTitle,
          current_skills: currentSkills
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setResults(data);
      
      toast({
        title: "Success",
        description: `Found ${data.length} job recommendations`,
      });
    } catch (err) {
      // For demo purposes, we'll use mock data
      const mockData: JobPosition[] = [
        {
          position_id: 1,
          job_title: "Senior Frontend Developer",
          job_detail_link: "https://example.com/job/1",
          skills: [
            { skill_id: 1, skill_name: "React" },
            { skill_id: 2, skill_name: "TypeScript" },
            { skill_id: 3, skill_name: "Node.js" },
            { skill_id: 4, skill_name: "GraphQL" },
            { skill_id: 5, skill_name: "AWS" }
          ]
        },
        {
          position_id: 2,
          job_title: "Full Stack Engineer",
          job_detail_link: "https://example.com/job/2",
          skills: [
            { skill_id: 1, skill_name: "React" },
            { skill_id: 6, skill_name: "Python" },
            { skill_id: 7, skill_name: "Django" },
            { skill_id: 8, skill_name: "PostgreSQL" },
            { skill_id: 9, skill_name: "Docker" }
          ]
        },
        {
          position_id: 3,
          job_title: "Frontend Architect",
          job_detail_link: "https://example.com/job/3",
          skills: [
            { skill_id: 1, skill_name: "React" },
            { skill_id: 2, skill_name: "TypeScript" },
            { skill_id: 10, skill_name: "Webpack" },
            { skill_id: 11, skill_name: "Micro-frontends" },
            { skill_id: 12, skill_name: "Performance Optimization" }
          ]
        }
      ];
      setResults(mockData);
      setError("Using demo data - API endpoint not available");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (positionId: number) => {
    const newFavorites = new Set(favoritePositions);
    if (newFavorites.has(positionId)) {
      newFavorites.delete(positionId);
      toast({
        title: "Removed from favorites",
        description: "Position removed from your favorites"
      });
    } else {
      newFavorites.add(positionId);
      toast({
        title: "Added to favorites",
        description: "Position saved to your favorites"
      });
    }
    setFavoritePositions(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Skill Gap Analysis & Career Recommendations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your skill gaps, find matching job opportunities, and accelerate your career growth
          </p>
        </div>

        {/* Search Interface */}
        <SearchInterface
          jobTitle={jobTitle}
          setJobTitle={setJobTitle}
          currentSkills={currentSkills}
          setCurrentSkills={setCurrentSkills}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800">
            <p className="font-medium">Demo Mode Active</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Analytics Dashboard */}
        {results.length > 0 && (
          <SkillAnalytics
            results={results}
            currentSkills={currentSkills}
            filters={filters}
            setFilters={setFilters}
          />
        )}

        {/* Results Display */}
        <ResultsDisplay
          results={results}
          currentSkills={currentSkills}
          filters={filters}
          loading={loading}
          favoritePositions={favoritePositions}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </div>
  );
};

export default Index;
