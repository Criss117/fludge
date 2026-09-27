<!--
  INSTRUCCIONES PARA LA IA QUE GENERA ESTE ARCHIVO (borrar este bloque en el archivo final)

  Estás generando `portfolio/case-study.md` para un proyecto que será consumido
  automáticamente por un portfolio en Astro. Reglas estrictas:

  1. NO inventes datos que no te hayan dado o que no puedas inferir del código
     del repo (stack, fechas, urls). Si falta un dato obligatorio, dejalo como
     TODO: y avisá al usuario en tu respuesta, no lo completes con relleno.
  2. NO inventes ni asumas imágenes que no existen. Vos generás el markdown y
     el frontmatter, pero las imágenes las sube el humano manualmente. Tu única
     responsabilidad respecto a imágenes es:
       a) completar el `alt` y `caption` de las que el usuario te confirme que
          van a existir,
       b) dejar marcado como pendiente ("- [ ] falta subir") cualquier imagen
          obligatoria que el frontmatter requiera pero el usuario no haya
          confirmado.
  3. Los nombres de archivo de imagen son fijos y no descriptivos a propósito
     (pensados para ser leídos por código, no por humanos). No los cambies ni
     los "mejores": `hero.<ext>`, `description.<ext>` (obligatorias) y
     `1.<ext>`, `2.<ext>`, `3.<ext>`... (opcionales, orden secuencial sin
     saltos: si existe `2` debe existir `1`).
  4. La extensión (`<ext>`) se declara en el frontmatter, nunca se asume. Usá
     una de: png, jpg, jpeg, webp, avif. Debe coincidir exactamente con el
     archivo real que el humano va a subir a `portfolio/images/`.
  5. Mantené el `summary` en 1-2 frases: es lo único que se muestra en la
     tarjeta del home, no es un lugar para explayarte.
  6. El cuerpo (secciones después del frontmatter) sí puede ser más largo y
     detallado: es la "deep dive" que se lee en la página del proyecto.
  7. No borres ni renombres claves del frontmatter aunque estén vacías/TODO;
     el build depende de un schema fijo (Zod) y una clave faltante rompe el
     build de ese proyecto puntual.
  8. VOCABULARIO DE DISEÑO: en el cuerpo tenés libertad de estructura y
     redacción, PERO solo podés usar estas 4 directivas para bloques
     especiales. Nunca HTML crudo, nunca sintaxis inventada, nunca MDX/JSX.
     Cualquier otra cosa se trata como texto plano o rompe el build.

       :::callout{type="info|warning|success|danger"}
       Texto breve de énfasis. Usar con moderación (0-3 por case study).
       :::

       :::decision{title="Título corto de la decisión"}
       El rationale de una decisión de diseño puntual. Va bien en la
       sección "Decisiones de diseño", una por decisión relevante.
       :::

       :::diagram{caption="Texto opcional debajo de la imagen"}
       ![alt ya declarado en frontmatter](images/description.png)
       :::

       :::compare
       | Opción | Pro | Contra |
       |--------|-----|--------|
       | ...    | ... | ...    |
       :::

     Reglas de uso:
     - `diagram` solo puede envolver una imagen que ya esté declarada en
       `images` (frontmatter). No inventar imágenes nuevas ni usar URLs
       externas dentro de ninguna directiva ni en markdown plano.
     - El body siempre arranca en `##` (h2). Nunca usar `#` (h1): el título
       ya lo renderiza el layout desde `title` del frontmatter.
     - Si una sección no aplica al proyecto, se omite. No rellenar con
       directivas solo para "usarlas".
-->

---

# ── Identidad básica ─────────────────────────────────────────

title: "TODO: Nombre del proyecto"
slug: "TODO: kebab-case, ej. mi-proyecto" # si se omite, se usa el nombre del repo
summary: "TODO: 1-2 frases. Esto es lo único visible en la tarjeta del home."
date: "YYYY-MM-DD" # fecha de publicación/última actualización relevante
status: "completed" # completed | in-progress | archived
featured: false # true si querés destacarlo en el home

# ── Links y stack ────────────────────────────────────────────

repoUrl: "https://github.com/usuario/proyecto"
demoUrl: "" # opcional, dejar "" si no hay demo pública
stack:

- "TODO: ej. Astro"
- "TODO: ej. TypeScript"
- "TODO: ej. PostgreSQL"

# ── Imágenes ─────────────────────────────────────────────────

# Regla de existencia:

# - hero: OBLIGATORIA. Es la imagen de portada (tarjeta + header del case study).

# - description: OBLIGATORIA. Imagen secundaria de apoyo (ej. screenshot principal,

# diagrama de arquitectura, flujo clave). Va dentro del cuerpo del case study.

# - 1, 2, 3...: OPCIONALES. Galería adicional, orden secuencial sin saltos.

# Si no vas a tener ninguna, borrá la clave "gallery" completa (no dejarla vacía en [])

#

# El validador de build revisa que exista un archivo en portfolio/images/

# con el nombre + ext exactos declarados acá. No valida contenido, solo existencia.

images:
hero:
ext: "png" # png | jpg | jpeg | webp | avif
alt: "TODO: alt descriptivo para accesibilidad, no vacío"
description:
ext: "png"
alt: "TODO: alt descriptivo"
gallery: - name: "1"
ext: "png"
alt: "TODO"
caption: "TODO: opcional, texto que se muestra debajo en el case study" - name: "2"
ext: "png"
alt: "TODO"
caption: ""

---

<!--
  A partir de acá es el CUERPO del case study. Usalo para explicar decisiones,
  no para repetir el summary. Las secciones son una guía, no una camisa de
  fuerza: si alguna no aplica al proyecto (ej. no hubo "desafíos" relevantes),
  se puede omitir. No agregues secciones nuevas salvo que el usuario lo pida.
-->

## Contexto y problema

TODO: ¿Qué problema resuelve este proyecto? ¿Para quién? ¿Por qué existía
la necesidad? 2-4 párrafos, sin marketing, directo.

## Decisiones de diseño

TODO: Las decisiones que no son obvias mirando el código. Priorizá el
"por qué" sobre el "qué". Usar `:::decision{title="..."}` para las 1-3
decisiones más relevantes; el resto en texto corrido. Preguntas guía:

- ¿Por qué esta arquitectura y no otra?
- ¿Qué trade-off se aceptó conscientemente?
- ¿Qué se descartó y por qué?

## Stack y justificación técnica

TODO: No listar tecnologías (eso ya está en el frontmatter `stack`), sino
justificar 2-3 elecciones clave. `:::compare` es útil acá si hubo opciones
evaluadas entre sí (ej. Redis vs SQLite).

## Arquitectura / infraestructura

TODO: Cómo está desplegado, cómo se comunican los componentes. Si hay un
diagrama o screenshot de arquitectura, usar `:::diagram{caption="..."}`
envolviendo la imagen `description` (nunca una imagen no declarada en
frontmatter).

## Desafíos y aprendizajes

TODO: Opcional. Problemas reales encontrados y cómo se resolvieron.
Evitar generalidades tipo "aprendí mucho"; ser específico.

## Resultado

TODO: Estado actual, métricas si las hay, o próximos pasos si sigue
en desarrollo.
