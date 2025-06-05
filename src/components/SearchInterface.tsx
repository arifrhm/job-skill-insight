import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { X, Plus, Search, Loader2 } from 'lucide-react';

interface SearchInterfaceProps {
  jobTitle: string;
  setJobTitle: (title: string) => void;
  currentSkills: string[];
  setCurrentSkills: (skills: string[]) => void;
  onSearch: () => void;
  loading: boolean;
}

const popularSkills = [
  'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Java', 'AWS', 
  'Docker', 'Kubernetes', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Redux', 
  'Next.js', 'Vue.js', 'Angular', 'Django', 'Flask', 'Spring Boot', 'Git'
];

const jobSuggestions = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 
  'Software Engineer', 'DevOps Engineer', 'Data Scientist', 'Product Manager',
  'UI/UX Designer', 'Mobile Developer', 'Cloud Architect'
];

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  jobTitle,
  setJobTitle,
  currentSkills,
  setCurrentSkills,
  onSearch,
  loading
}) => {
  const [skillInput, setSkillInput] = useState('');
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !currentSkills.includes(trimmedSkill)) {
      setCurrentSkills([...currentSkills, trimmedSkill]);
      setSkillInput('');
      setShowSkillSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setCurrentSkills(currentSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const filteredJobSuggestions = jobSuggestions.filter(job =>
    job.toLowerCase().includes(jobTitle.toLowerCase())
  );

  const filteredSkillSuggestions = popularSkills.filter(skill =>
    skill.toLowerCase().includes(skillInput.toLowerCase()) &&
    !currentSkills.includes(skill)
  );

  return (
    <Card className="p-6 mb-8">
      <div className="space-y-6">
        {/* Job Title Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Title
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter job title..."
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onFocus={() => setShowJobSuggestions(true)}
              onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
              className="py-3"
            />
            
            {showJobSuggestions && filteredJobSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredJobSuggestions.map((job, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setJobTitle(job);
                      setShowJobSuggestions(false);
                    }}
                  >
                    {job}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Skills Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Current Skills
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Add a skill and press Enter..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleSkillInputKeyPress}
              onFocus={() => setShowSkillSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
              className="py-3 pr-12"
            />
            <Button
              type="button"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => addSkill(skillInput)}
              disabled={!skillInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {showSkillSuggestions && filteredSkillSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredSkillSuggestions.map((skill, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => addSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Skills Display */}
          <div className="flex flex-wrap gap-2 mt-3">
            {currentSkills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors px-3 py-1 text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Popular Skills */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Popular skills:</p>
            <div className="flex flex-wrap gap-2">
              {popularSkills.slice(0, 10).map((skill, index) => (
                <button
                  key={index}
                  onClick={() => addSkill(skill)}
                  disabled={currentSkills.includes(skill)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    currentSkills.includes(skill)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={onSearch}
          disabled={loading || !jobTitle.trim()}
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Skills...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Find Skill Recommendations
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
