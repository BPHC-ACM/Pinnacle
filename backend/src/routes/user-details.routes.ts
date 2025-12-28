import express, { type RequestHandler } from 'express';

import { authenticateToken, sensitiveEndpointRateLimiter, isAdmin } from '../auth/middleware';
import * as userDetailsController from '../controllers/user-details.controller';
import { validateBody } from '../middleware/validate.middleware';
import {
  updateUserProfileSchema,
  createExperienceSchema,
  updateExperienceSchema,
  createEducationSchema,
  updateEducationSchema,
  createSkillSchema,
  updateSkillSchema,
  createProjectSchema,
  updateProjectSchema,
  createCertificationSchema,
  updateCertificationSchema,
  createLanguageSchema,
  updateLanguageSchema,
} from '../types/user-details.types';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// USER PROFILE ROUTES

// GET /api/user-details/profile - Get user profile
router.get('/profile', userDetailsController.getUserProfile);

// PATCH /api/user-details/profile - Update user profile (with rate limiting)
router.patch(
  '/profile',
  sensitiveEndpointRateLimiter as RequestHandler,
  validateBody(updateUserProfileSchema),
  userDetailsController.updateUserProfile,
);

// PATCH /api/user-details/profile/verify - Verify user profile (Admin only)
router.patch('/profile/verify', isAdmin, userDetailsController.verifyUserProfile);

// EXPERIENCE ROUTES

// GET /api/user-details/experiences - Get all experiences
router.get('/experiences', userDetailsController.getExperiences);

// POST /api/user-details/experiences - Create experience
router.post(
  '/experiences',
  validateBody(createExperienceSchema),
  userDetailsController.createExperience,
);

// PATCH /api/user-details/experiences/:id - Update experience
router.patch(
  '/experiences/:id',
  validateBody(updateExperienceSchema),
  userDetailsController.updateExperience,
);

// DELETE /api/user-details/experiences/:id - Soft delete experience
router.delete('/experiences/:id', userDetailsController.deleteExperience);

// EDUCATION ROUTES

// GET /api/user-details/education - Get all education
router.get('/education', userDetailsController.getEducation);

// POST /api/user-details/education - Create education
router.post(
  '/education',
  validateBody(createEducationSchema),
  userDetailsController.createEducation,
);

// PATCH /api/user-details/education/:id - Update education
router.patch(
  '/education/:id',
  validateBody(updateEducationSchema),
  userDetailsController.updateEducation,
);

// DELETE /api/user-details/education/:id - Soft delete education
router.delete('/education/:id', userDetailsController.deleteEducation);

// SKILLS ROUTES

// GET /api/user-details/skills - Get all skills
router.get('/skills', userDetailsController.getSkills);

// POST /api/user-details/skills - Create skill
router.post('/skills', validateBody(createSkillSchema), userDetailsController.createSkill);

// PATCH /api/user-details/skills/:id - Update skill
router.patch('/skills/:id', validateBody(updateSkillSchema), userDetailsController.updateSkill);

// DELETE /api/user-details/skills/:id - Soft delete skill
router.delete('/skills/:id', userDetailsController.deleteSkill);

// PROJECTS ROUTES

// GET /api/user-details/projects - Get all projects
router.get('/projects', userDetailsController.getProjects);

// POST /api/user-details/projects - Create project
router.post('/projects', validateBody(createProjectSchema), userDetailsController.createProject);

// PATCH /api/user-details/projects/:id - Update project
router.patch(
  '/projects/:id',
  validateBody(updateProjectSchema),
  userDetailsController.updateProject,
);

// DELETE /api/user-details/projects/:id - Soft delete project
router.delete('/projects/:id', userDetailsController.deleteProject);

// CERTIFICATIONS ROUTES

// GET /api/user-details/certifications - Get all certifications
router.get('/certifications', userDetailsController.getCertifications);

// POST /api/user-details/certifications - Create certification
router.post(
  '/certifications',
  validateBody(createCertificationSchema),
  userDetailsController.createCertification,
);

// PATCH /api/user-details/certifications/:id - Update certification
router.patch(
  '/certifications/:id',
  validateBody(updateCertificationSchema),
  userDetailsController.updateCertification,
);

// DELETE /api/user-details/certifications/:id - Soft delete certification
router.delete('/certifications/:id', userDetailsController.deleteCertification);

// LANGUAGES ROUTES

// GET /api/user-details/languages - Get all languages
router.get('/languages', userDetailsController.getLanguages);

// POST /api/user-details/languages - Create language
router.post('/languages', validateBody(createLanguageSchema), userDetailsController.createLanguage);

// PATCH /api/user-details/languages/:id - Update language
router.patch(
  '/languages/:id',
  validateBody(updateLanguageSchema),
  userDetailsController.updateLanguage,
);

// DELETE /api/user-details/languages/:id - Soft delete language
router.delete('/languages/:id', userDetailsController.deleteLanguage);

export default router;
