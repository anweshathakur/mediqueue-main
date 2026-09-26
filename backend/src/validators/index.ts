import { z } from 'zod';

export const CreatePatientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  type: z.enum(['Online', 'Walk-in']).optional(),
  doctor_name: z.string().optional(),
  department: z.string().optional(),
  scheduled: z.string().optional(),
});
