import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Introduce una dirección válida." })
    .regex(/^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/, {
      message: "Introduce una dirección válida.",
    }),
  password: z.string().min(1, { message: "Ingresá tu contraseña." }),
});

export const authSchema = authCredentialsSchema
  .extend({
    password: z
      .string()
      .min(8, {
        message: "La contraseña debe tener al menos 8 caracteres.",
      })
      .refine(
        (password) => password === "" || /^[\x21-\x7E]+$/.test(password),
        {
          message:
            "La contraseña no puede contener espacios ni caracteres no latinos.",
        },
      ),
    name: z
      .string()
      .trim()
      .min(2, { message: "Introduce un nombre." })
      .regex(/^[\p{Script=Latin}\p{M}]+(?:[ '-][\p{Script=Latin}\p{M}]+)*$/u, {
        message: "Introduce un nombre.",
      }),
    "confirm-password": z.string().min(1, {
      message: "Confirma tu contraseña.",
    }),
  })
  .refine((data) => data.password === data["confirm-password"], {
    message: "Las contraseñas no coinciden.",
    path: ["confirm-password"],
  });

export type AuthSchema = z.infer<typeof authSchema>;
