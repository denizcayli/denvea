import { z } from 'zod';

export function buildDynamicZodSchema(sections) {
  const schemaFields = {};

  sections.forEach((section) => {
    if (!section.fields) return;

    section.fields.forEach((field) => {
      let validator;

      switch (field.type) {
        case 'text':
        case 'number':
        case 'date':
        case 'select-linked':
          validator = z.string();
          if (field.required) {
            validator = validator.min(1, `${field.label || 'Bu alan'} zorunludur`);
          } else {
            validator = validator.optional().or(z.literal(''));
          }
          break;

        case 'email':
          validator = z.string();
          if (field.required) {
            validator = validator
              .min(1, `${field.label || 'Bu alan'} zorunludur`)
              .email('Geçersiz e-posta adresi');
          } else {
            validator = validator
              .optional()
              .or(z.literal(''))
              .refine((val) => val === '' || z.string().email().safeParse(val).success, {
                message: 'Geçersiz e-posta adresi',
              });
          }
          break;

        case 'phone':
          validator = z.string();
          if (field.required) {
            validator = validator
              .min(1, `${field.label || 'Bu alan'} zorunludur`)
              .refine(
                (val) => {
                  const digits = val.replace(/\D/g, '');
                  return digits.length === 11 || digits.length === 10;
                },
                { message: 'Geçersiz telefon numarası formatı' }
              );
          } else {
            validator = validator
              .optional()
              .or(z.literal(''))
              .refine(
                (val) => {
                  if (!val || val === '') return true;
                  const digits = val.replace(/\D/g, '');
                  return digits.length === 11 || digits.length === 10;
                },
                { message: 'Geçersiz telefon numarası formatı' }
              );
          }
          break;

        case 'radio':
          validator = z.string();
          if (field.required) {
            validator = validator.min(1, 'Lütfen bir seçenek seçin');
          } else {
            validator = validator.optional().or(z.literal(''));
          }
          break;

        case 'checkbox-group':
          if (field.required) {
            validator = z
              .array(z.string())
              .min(1, 'En az bir seçenek işaretlemelisiniz');
          } else {
            validator = z.array(z.string()).optional().default([]);
          }
          break;

        case 'checkbox':
          if (field.required) {
            validator = z
              .boolean()
              .refine((val) => val === true, 'Kabul etmeniz gerekmektedir');
          } else {
            validator = z.boolean().optional().default(false);
          }
          break;

        case 'file':
          validator = z.any().refine(
            (files) => {
              if (field.required) {
                if (!files) return false;
                if (files instanceof FileList) {
                  return files.length > 0;
                }
                if (Array.isArray(files)) {
                  return files.length > 0;
                }
                return !!files;
              }
              return true;
            },
            { message: 'Dosya yüklemek zorunludur' }
          );
          break;

        case 'info-text':
          break;

        default:
          break;
      }

      if (validator) {
        schemaFields[field.id] = validator;
      }
    });
  });

  return z.object(schemaFields);
}
