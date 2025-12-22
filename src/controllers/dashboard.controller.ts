import type { Request, Response } from 'express';

import { logger } from '../config/logger.config';
import userService from '../services/user-service/user.service';

/**
 * @route GET /api/dashboard
 * @desc Get all user data in one request (profile, experiences, education, skills, projects, certifications, languages)
 * @access Private (requires authentication)
 */
export async function getDashboardData(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch all data in parallel for better performance
    const [profile, experiences, education, skills, projects, certifications, languages] =
      await Promise.all([
        userService.getUserProfile(userId),
        userService.getExperiences(userId),
        userService.getEducation(userId),
        userService.getSkills(userId),
        userService.getProjects(userId),
        userService.getCertifications(userId),
        userService.getLanguages(userId),
      ]);

    if (!profile) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      profile,
      experiences,
      education,
      skills,
      projects,
      certifications,
      languages,
      // Include counts for quick reference
      counts: {
        experiences: experiences.length,
        education: education.length,
        skills: skills.length,
        projects: projects.length,
        certifications: certifications.length,
        languages: languages.length,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching dashboard data');
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

/**
 * @route GET /api/dashboard/stats
 * @desc Get user statistics (counts only, lightweight)
 * @access Private (requires authentication)
 */
export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch all data in parallel
    const [experiences, education, skills, projects, certifications, languages] = await Promise.all(
      [
        userService.getExperiences(userId),
        userService.getEducation(userId),
        userService.getSkills(userId),
        userService.getProjects(userId),
        userService.getCertifications(userId),
        userService.getLanguages(userId),
      ],
    );

    res.json({
      experiences: experiences.length,
      education: education.length,
      skills: skills.length,
      skillItems: skills.reduce((acc, skill) => acc + skill.items.length, 0),
      projects: projects.length,
      certifications: certifications.length,
      languages: languages.length,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching dashboard stats');
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

/**
 * @route GET /api/dashboard/profile-completion
 * @desc Get profile completion percentage and missing fields
 * @access Private (requires authentication)
 */
export async function getProfileCompletion(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await userService.getUserProfile(userId);

    if (!profile) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Define fields and their weights for completion calculation
    const profileFields = [
      { key: 'name', label: 'Name', weight: 15, value: profile.name },
      { key: 'email', label: 'Email', weight: 15, value: profile.email },
      { key: 'phone', label: 'Phone', weight: 10, value: profile.phone },
      { key: 'location', label: 'Location', weight: 10, value: profile.location },
      { key: 'title', label: 'Professional Title', weight: 10, value: profile.title },
      { key: 'bio', label: 'Bio', weight: 10, value: profile.bio },
      { key: 'summary', label: 'Summary', weight: 10, value: profile.summary },
      { key: 'linkedin', label: 'LinkedIn', weight: 5, value: profile.linkedin },
      { key: 'github', label: 'GitHub', weight: 5, value: profile.github },
      { key: 'website', label: 'Website', weight: 5, value: profile.website },
      { key: 'picture', label: 'Profile Picture', weight: 5, value: profile.picture },
    ];

    const completedFields: string[] = [];
    const missingFields: string[] = [];
    let completedWeight = 0;
    let totalWeight = 0;

    for (const field of profileFields) {
      totalWeight += field.weight;
      if (field.value && field.value.trim() !== '') {
        completedWeight += field.weight;
        completedFields.push(field.label);
      } else {
        missingFields.push(field.label);
      }
    }

    const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

    res.json({
      completionPercentage,
      completedFields,
      missingFields,
      recommendations:
        missingFields.length > 0
          ? `Complete your ${missingFields.slice(0, 3).join(', ')} to improve your profile.`
          : 'Your profile is complete!',
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching profile completion');
    res.status(500).json({ error: 'Failed to fetch profile completion' });
  }
}
