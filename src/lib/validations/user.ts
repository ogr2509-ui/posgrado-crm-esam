import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  email: z.string().email('Ingresa un correo electrónico válido.'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  roleName: z.enum(['ADMIN', 'ASESOR'], {
    required_error: 'Selecciona un rol.',
  }),
  active: z.boolean().default(true),
});

export type UserFormData = z.infer<typeof userSchema>;
