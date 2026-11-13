# language: es
Característica: Registro de dueño (US-01.1)
  Como dueño no registrado
  Quiero crear una cuenta en HostFlow
  Para poder acceder a la plataforma

  Antecedentes:
    Dado un dueño sin cuenta en la página de registro

  @positivo
  Escenario: Registro exitoso con datos válidos
    Cuando se registra con datos válidos
    Entonces el sistema crea su cuenta y lo lleva al dashboard

  @validaciones
  Esquema del escenario: Validaciones de campos inválidos y límites
    Cuando intenta registrarse con nombre "<nombre>", correo "<correo>", contraseña "<password>" y confirmación "<confirm_password>"
    Entonces el formulario no avanza y muestra el mensaje "<mensaje_esperado>" en el campo "<campo>"

    @nombre
    Ejemplos: EL-NOMBRE-TC-105 Validaciones de nombre
      | nombre | correo          | password  | confirm_password | campo  | mensaje_esperado    |
      |        | valido@mail.com | Pass1234! | Pass1234!        | nombre | Introduce un nombre |
      | K@mil* | valido@mail.com | Pass1234! | Pass1234!        | nombre | Introduce un nombre |
      | K4m114 | valido@mail.com | Pass1234! | Pass1234!        | nombre | Introduce un nombre |
      | T      | valido@mail.com | Pass1234! | Pass1234!        | nombre | Introduce un nombre |

    @correo
    Ejemplos: EL-EMAIL-TC-004 Validaciones de correo
      | nombre | correo         | password  | confirm_password | campo  | mensaje_esperado               |
      | Juan   |                | Pass1234! | Pass1234!        | correo | Introduce una dirección válida |
      | Juan   | anagmail.com   | Pass1234! | Pass1234!        | correo | Introduce una dirección válida |
      | Juan   | ana@           | Pass1234! | Pass1234!        | correo | Introduce una dirección válida |
      | Juan   | ana@@gmail.com | Pass1234! | Pass1234!        | correo | Introduce una dirección válida |

    @password
    Ejemplos: EL-PWD-TC-002 Validaciones de contraseña
      | nombre | correo          | password | confirm_password | campo    | mensaje_esperado                               |
      | Juan   | valido@mail.com |          |                  | password | La contraseña debe tener al menos 8 caracteres |
      | Juan   | valido@mail.com | m1cl4v3  | m1cl4v3          | password | La contraseña debe tener al menos 8 caracteres |