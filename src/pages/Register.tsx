import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authApi, skillsApi, SkillResponse } from '@/lib/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    job_title: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<SkillResponse[]>([]);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [skillOptions, setSkillOptions] = useState<SkillResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced skill search
  useEffect(() => {
    if (skillInput.length < 3) {
      setSkillOptions([]);
      setShowDropdown(false);
      return;
    }
    let active = true;
    setIsLoadingSuggestion(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await skillsApi.getSkills(1, 10, skillInput.trim());
        if (active) {
          setSkillOptions(res.items.filter(s => !selectedSkills.some(sel => sel.skill_id === s.skill_id)));
          setShowDropdown(true);
        }
      } catch (e) {
        if (active) setSkillOptions([]);
      } finally {
        if (active) setIsLoadingSuggestion(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [skillInput, selectedSkills]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
    setShowDropdown(true);
  };

  const handleAddSkill = async (skill: SkillResponse) => {
    setSelectedSkills([...selectedSkills, skill]);
    setSkillInput('');
    setShowDropdown(false);
  };

  const handleCreateSkill = async () => {
    if (!skillInput.trim()) return;
    setIsLoadingSuggestion(true);
    try {
      const created = await skillsApi.createSkill(skillInput.trim());
      setSelectedSkills([...selectedSkills, created]);
      setSkillInput('');
      setShowDropdown(false);
    } catch (e) {
      toast({
        title: "Error",
        description: `Failed to create skill: ${skillInput}`,
        variant: "destructive"
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleSkillInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If input matches a suggestion, add it; else create new
      const match = skillOptions.find(s => s.skill_name.toLowerCase() === skillInput.trim().toLowerCase());
      if (match) {
        handleAddSkill(match);
      } else {
        await handleCreateSkill();
      }
    }
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills(selectedSkills.filter(skill => skill.skill_id !== skillId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.job_title) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    // If any new skills (skill_id === 0), create them first
    let finalSkills = [...selectedSkills];
    for (const skill of selectedSkills) {
      if (skill.skill_id === 0) {
        try {
          const created = await skillsApi.createSkill(skill.skill_name);
          finalSkills = finalSkills.map(s =>
            s.skill_name === skill.skill_name ? created : s
          );
        } catch (e) {
          toast({
            title: "Error",
            description: `Failed to create skill: ${skill.skill_name}`,
            variant: "destructive"
          });
          return;
        }
      }
    }
    const skill_ids = finalSkills.map(s => s.skill_id);
    // Register
    registerMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      job_title: formData.job_title,
      skill_ids
    });
  };

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Account created successfully! Please login."
      });
      navigate('/login');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                name="job_title"
                type="text"
                placeholder="Enter your job title"
                value={formData.job_title}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                name="skills"
                type="text"
                placeholder="Type a skill (min 3 chars)"
                value={skillInput}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillInputKeyDown}
                autoComplete="off"
              />
              {/* Dropdown */}
              {showDropdown && skillInput.length >= 3 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {isLoadingSuggestion ? (
                    <div className="px-4 py-2 text-gray-500">Searching...</div>
                  ) : skillOptions.length > 0 ? (
                    skillOptions.map(skill => (
                      <div
                        key={skill.skill_id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleAddSkill(skill)}
                      >
                        {skill.skill_name}
                      </div>
                    ))
                  ) : (
                    <div
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-blue-700"
                      onClick={handleCreateSkill}
                    >
                      Add "{skillInput}" as a new skill
                    </div>
                  )}
                </div>
              )}
              {/* Selected skills as chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSkills.map(skill => (
                  <span key={skill.skill_id + skill.skill_name} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                    {skill.skill_name}
                    <button type="button" className="ml-2" onClick={() => handleRemoveSkill(skill.skill_id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
            
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
