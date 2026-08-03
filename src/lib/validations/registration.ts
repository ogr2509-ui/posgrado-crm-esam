import { z } from 'zod';

export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(3, 'El nombre completo debe tener al menos 3 caracteres.')
    .max(120, 'Nombre demasiado largo.'),
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
  profession: z.string().min(2, 'La profesión u ocupación es obligatoria.'),
  university: z.string().min(2, 'La universidad de procedencia es obligatoria.'),
  email: z
    .string()
    .email('Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).'),
  phone: z
    .string()
    .regex(/^[0-9+\s\-]{7,15}$/, 'El celular debe contener únicamente números (mínimo 7 dígitos).'),
  whatsapp: z
    .string()
    .regex(/^[0-9+\s\-]{7,15}$/, 'El WhatsApp debe contener únicamente números (mínimo 7 dígitos).'),
  address: z.string().min(3, 'La dirección de domicilio es obligatoria.'),
  city: z.string().min(2, 'La ciudad es obligatoria.'),
  state: z.string().min(2, 'El departamento / estado es obligatorio.'),
  country: z.string().min(2, 'El país es obligatorio.'),
  company: z.string().min(2, 'La empresa u organización donde trabaja es obligatoria.'),
  position: z.string().min(2, 'El cargo o puesto actual es obligatorio.'),
  experienceYears: z
    .number({ invalid_type_error: 'Los años de experiencia deben ser un número.' })
    .min(0, 'Los años de experiencia no pueden ser negativos.'),
  modality: z.enum(['PRESENCIAL', 'VIRTUAL', 'SEMIPRESENCIAL'], {
    required_error: 'Selecciona una modalidad.',
  }),
  channel: z.string().min(2, 'Indica cómo conoció el programa.'),
  notes: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y condiciones para continuar.' }),
  }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
