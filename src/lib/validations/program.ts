import { z } from 'zod';

export const programSchema = z.object({
  name: z.string().min(3, 'El nombre del programa es obligatorio.'),
  code: z.string().min(2, 'El código identificador (ej. MED-2026) es obligatorio.'),
  type: z.enum(['CURSO', 'DIPLOMADO', 'MAESTRIA', 'ESPECIALIDAD', 'DOCTORADO'], {
    required_error: 'Selecciona el tipo de programa.',
  }),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type ProgramFormData = z.infer<typeof programSchema>;

