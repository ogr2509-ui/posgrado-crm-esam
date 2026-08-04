import { z } from 'zod';

export const registrationSchema = z.object({
  firstName: z.string().min(2, 'Ingresa tus nombres completos.'),
  lastName: z.string().min(2, 'Ingresa tus apellidos completos.'),
  fullName: z.string().optional(),
  ci: z
    .string()
    .min(4, 'El CI / Documento de Identidad es obligatorio.')
    .max(20, 'CI no válido.'),
  ciExpedition: z.string().min(1, 'Selecciona el lugar de expedición del CI.'),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Ingresa una fecha de nacimiento válida.',
  }),
  age: z
    .number({ invalid_type_error: 'La edad debe ser un número.' })
    .min(18, 'Debes ser mayor de 18 años para inscribirte a un programa de posgrado.')
    .max(100, 'Edad no válida.'),
  gender: z.string().min(1, 'Selecciona el sexo.'),
  civilStatus: z.string().min(1, 'Selecciona el estado civil.'),
  ciAnversoUrl: z.string().optional().nullable(),
  ciReversoUrl: z.string().optional().nullable(),

  academicDegree: z.string().min(2, 'Selecciona tu grado académico.'),
  profession: z.string().min(2, 'La profesión u ocupación es obligatoria.'),
  university: z.string().min(2, 'La universidad de egreso es obligatoria.'),

  email: z
    .string()
    .email('Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).'),
  phone: z
    .string()
    .regex(/^[0-9+\s\-]{7,15}$/, 'El celular debe contener únicamente números (mínimo 7 dígitos).'),
  whatsapp: z
    .string()
    .regex(/^[0-9+\s\-]{7,15}$/, 'El celular debe contener únicamente números (mínimo 7 dígitos).')
    .optional(),
  address: z.string().min(3, 'La dirección de domicilio es obligatoria.'),
  city: z.string().min(2, 'La ciudad es obligatoria.'),
  state: z.string().min(2, 'El departamento / provincia es obligatorio.').optional(),
  country: z.string().min(2, 'El país es obligatorio.').optional(),

  company: z.string().optional(),
  position: z.string().optional(),
  experienceYears: z.number().optional(),
  modality: z.enum(['PRESENCIAL', 'VIRTUAL', 'SEMIPRESENCIAL']).optional().default('VIRTUAL'),
  channel: z.string().optional().default('Formulario Web'),
  notes: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y condiciones para continuar.' }),
  }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
