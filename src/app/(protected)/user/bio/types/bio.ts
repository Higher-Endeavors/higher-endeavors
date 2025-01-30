import { z } from 'zod';

export const bioFormSchema = z.object({
  // Personal Information
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid date format'),

  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    required_error: 'Gender is required',
    invalid_type_error: 'Invalid gender selection',
  }),

  height: z.string()
    .min(1, 'Height is required')
    .max(50, 'Height must be less than 50 characters'),
  
  // Contact Information
  phoneNumber: z.string()
    .max(20, 'Phone number must be less than 20 characters')
    .refine((phone) => {
      if (!phone) return true; // Allow empty string
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
      return phoneRegex.test(phone);
    }, 'Invalid phone number format')
    .optional()
    .nullable(),
  
  // Address
  addressLine1: z.string()
    .max(255, 'Address must be less than 255 characters')
    .optional()
    .nullable(),

  addressLine2: z.string()
    .max(255, 'Address must be less than 255 characters')
    .optional()
    .nullable(),

  city: z.string()
    .max(255, 'City must be less than 255 characters')
    .optional()
    .nullable(),

  stateProvince: z.string()
    .max(255, 'State/Province must be less than 255 characters')
    .optional()
    .nullable(),

  postalCode: z.string()
    .max(50, 'Postal code must be less than 50 characters')
    .optional()
    .nullable(),

  country: z.object({
    value: z.string()
      .max(50, 'Country code must be less than 50 characters'),
    label: z.string(),
  }, {
    required_error: 'Country is required',
  })
    .optional()
    .nullable(),
});

export type BioFormData = z.infer<typeof bioFormSchema>;

export type CountryOption = {
  value: string;
  label: string;
}; 