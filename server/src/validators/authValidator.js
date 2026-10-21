import { z } from 'zod';
import { BadRequestError } from '../utils/errors.js';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  confirmPassword: z
    .string({ required_error: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

/**
 * Middleware factory: validates request body with a Zod schema
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse(req.body);
    req.validatedBody = result;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => e.message).join('. ');
      throw new BadRequestError(message);
    }
    throw error;
  }
};
