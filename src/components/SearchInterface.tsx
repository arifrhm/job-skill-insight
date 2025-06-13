import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { X, Plus, Search, Loader2 } from 'lucide-react';
import { skillsApi, jobsApi, SkillResponse as Skill, JobPositionResponse as JobPosition } from '../lib/api';

interface SearchInterfaceProps {
  jobTitle: string;
  setJobTitle: (title: string) => void;
  currentSkills: Skill[];
  setCurrentSkills: (skills: Skill[]) => void;
  onSearch: () => void;
  loading: boolean;
}

const jobSuggestions = [
  'Backend Engineer/Developer',
  'Frontend Engineer/Developer',
  'Fullstack Engineer/Developer',
  'DevOps Engineer',
  'Quality Assurance (QA) Engineer',
  'Cloud Engineer',
  'Business Analyst'
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
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [filteredSkillSuggestions, setFilteredSkillSuggestions] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const response = await skillsApi.getSkills(1, 100); // Get first 100 skills
        setAvailableSkills(response.items);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  const addSkill = async (skill: Skill) => {
    try {
      await skillsApi.addUserSkill(skill.skill_id);
      setCurrentSkills([...currentSkills, skill]);
      setSkillInput('');
      setShowSkillSuggestions(false);
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const removeSkill = async (skillToRemove: Skill) => {
    try {
      await skillsApi.removeUserSkill(skillToRemove.skill_id);
      setCurrentSkills(currentSkills.filter(skill => skill.skill_id !== skillToRemove.skill_id));
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const matchingSkill = availableSkills.find(
        skill => skill.skill_name.toLowerCase() === skillInput.toLowerCase()
      );
      if (matchingSkill) {
        addSkill(matchingSkill);
      }
    }
  };

  const filteredJobSuggestions = jobSuggestions.filter(job =>
    job.toLowerCase().includes(jobTitle.toLowerCase())
  );

  useEffect(() => {
    const filtered = availableSkills.filter(skill =>
      skill.skill_name.toLowerCase().includes(skillInput.toLowerCase()) &&
      !currentSkills.some(currentSkill => currentSkill.skill_id === skill.skill_id)
  );
    setFilteredSkillSuggestions(filtered);
  }, [skillInput, availableSkills, currentSkills]);

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
              disabled={isLoadingSkills}
            />
            <Button
              type="button"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => {
                const matchingSkill = availableSkills.find(
                  skill => skill.skill_name.toLowerCase() === skillInput.toLowerCase()
                );
                if (matchingSkill) {
                  addSkill(matchingSkill);
                }
              }}
              disabled={!skillInput.trim() || isLoadingSkills}
            >
              {isLoadingSkills ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
              <Plus className="h-4 w-4" />
              )}
            </Button>
            
            {showSkillSuggestions && filteredSkillSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredSkillSuggestions.map((skill) => (
                  <button
                    key={skill.skill_id}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => addSkill(skill)}
                  >
                    {skill.skill_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Skills Display */}
          <div className="flex flex-wrap gap-2 mt-3">
            {currentSkills.map((skill) => (
              <Badge
                key={skill.skill_id}
                variant="secondary"
                className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors px-3 py-1 text-sm"
              >
                {skill.skill_name}
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
              {availableSkills.slice(0, 10).map((skill) => (
                <button
                  key={skill.skill_id}
                  onClick={() => addSkill(skill)}
                  disabled={currentSkills.some(s => s.skill_id === skill.skill_id)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    currentSkills.some(s => s.skill_id === skill.skill_id)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                  }`}
                >
                  {skill.skill_name}
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
