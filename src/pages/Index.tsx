import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchInterface } from '../components/SearchInterface';
import { SkillAnalytics } from '../components/SkillAnalytics';
import { useToast } from '../hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { skillsApi, jobsApi, SkillResponse, JobPositionResponse } from '@/lib/api';
import { authApi } from '@/lib/api';

export interface SearchFilters {
  sortBy: 'missingSkills' | 'alphabetical' | 'matchPercentage';
  showOnlyMissing: boolean;
}

interface User {
  user_id: number;
  username: string;
  email: string;
  job_title: string;
  skills: SkillResponse[];
}

const Index = () => {
  const [currentSkills, setCurrentSkills] = useState<SkillResponse[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'missingSkills',
    showOnlyMissing: false
  });
  const [user, setUser] = useState<User | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');

      if (accessToken && !storedUser) {
        try {
          // If we have a token but no user data, fetch it
          const userData = await authApi.getCurrentUser();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Pre-populate skills if user is logged in
          if (userData.skills) {
            setCurrentSkills(userData.skills);
          }
          if (userData.job_title) {
            setJobTitle(userData.job_title);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Clear invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      } else if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && typeof userData === 'object') {
            setUser(userData);
            // Pre-populate skills if user is logged in
            if (Array.isArray(userData.skills)) {
              setCurrentSkills(userData.skills);
            }
            if (typeof userData.job_title === 'string') {
              setJobTitle(userData.job_title);
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid user data
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    };

    initializeUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentSkills([]);
    setJobTitle('');
    setShouldFetch(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
  };

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['jobRecommendations', jobTitle, currentSkills],
    queryFn: () => {
      if (!jobTitle.trim()) {
        throw new Error('Please enter a job title');
      }
      return jobsApi.getJobRecommendations();
    },
    enabled: shouldFetch && !!jobTitle.trim(),
  });

  const handleSearch = () => {
    if (!jobTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job title",
        variant: "destructive"
      });
      return;
    }
    setShouldFetch(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Skill Recommender</h1>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Welcome, {user.username}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Skill Gap Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your skill gaps and accelerate your career growth
          </p>
        </div>

        {/* Search Interface */}
        <SearchInterface
          jobTitle={jobTitle}
          setJobTitle={setJobTitle}
          currentSkills={currentSkills}
          setCurrentSkills={setCurrentSkills}
          onSearch={handleSearch}
          loading={isLoading}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-800">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Analytics Dashboard */}
        {results && results.length > 0 && (
          <SkillAnalytics
            results={results}
            currentSkills={currentSkills}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
