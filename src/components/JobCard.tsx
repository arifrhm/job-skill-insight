
import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { JobPosition } from '../pages/Index';
import { ExternalLink, Heart, Copy, Share } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface JobCardProps {
  position: JobPosition;
  currentSkills: string[];
  isFavorite: boolean;
  onToggleFavorite: (positionId: number) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  position,
  currentSkills,
  isFavorite,
  onToggleFavorite
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const userSkillsLower = currentSkills.map(skill => skill.toLowerCase());
  const matchingSkills = position.skills.filter(skill => 
    userSkillsLower.includes(skill.skill_name.toLowerCase())
  );
  const missingSkills = position.skills.filter(skill => 
    !userSkillsLower.includes(skill.skill_name.toLowerCase())
  );
  
  const matchPercentage = Math.round((matchingSkills.length / position.skills.length) * 100);

  const copySkill = (skillName: string) => {
    navigator.clipboard.writeText(skillName);
    toast({
      title: "Copied!",
      description: `"${skillName}" copied to clipboard`,
    });
  };

  const sharePosition = () => {
    const shareData = {
      title: position.job_title,
      text: `Check out this ${position.job_title} position!`,
      url: position.job_detail_link
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(position.job_detail_link);
      toast({
        title: "Link copied!",
        description: "Job link copied to clipboard",
      });
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 bg-white/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex-1 mr-2">
          {position.job_title}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(position.position_id)}
            className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={sharePosition}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Match Percentage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Skill Match</span>
          <span className={`text-sm font-bold ${
            matchPercentage >= 80 ? 'text-green-600' : 
            matchPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {matchPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              matchPercentage >= 80 ? 'bg-green-500' : 
              matchPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${matchPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Skills Summary */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>✅ You have: {matchingSkills.length}</span>
          <span>📚 To learn: {missingSkills.length}</span>
        </div>
      </div>

      {/* Skills Display */}
      <div className="space-y-3">
        {/* Matching Skills */}
        {matchingSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2">Your Skills</h4>
            <div className="flex flex-wrap gap-1">
              {(isExpanded ? matchingSkills : matchingSkills.slice(0, 3)).map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors text-xs"
                  onClick={() => copySkill(skill.skill_name)}
                >
                  {skill.skill_name}
                  <Copy className="ml-1 h-2 w-2" />
                </Badge>
              ))}
              {!isExpanded && matchingSkills.length > 3 && (
                <span className="text-xs text-gray-500">+{matchingSkills.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-700 mb-2">Skills to Learn</h4>
            <div className="flex flex-wrap gap-1">
              {(isExpanded ? missingSkills : missingSkills.slice(0, 3)).map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 cursor-pointer transition-colors text-xs"
                  onClick={() => copySkill(skill.skill_name)}
                >
                  {skill.skill_name}
                  <Copy className="ml-1 h-2 w-2" />
                </Badge>
              ))}
              {!isExpanded && missingSkills.length > 3 && (
                <span className="text-xs text-gray-500">+{missingSkills.length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1"
        >
          {isExpanded ? 'Show Less' : 'Show All Skills'}
        </Button>
        <Button
          size="sm"
          asChild
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <a 
            href={position.job_detail_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            View Job
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>
    </Card>
  );
};
