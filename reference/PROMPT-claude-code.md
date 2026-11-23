# Prompt para Claude Code · Landing de Geecko Craft

> **Cómo usarlo**
> 1. Crea una carpeta vacía para el proyecto y ábrela en la terminal.
> 2. Copia ahí estos archivos (están en los archivos del proyecto):
>    - `reference/prototype.html` ← es el `index.html` de la propuesta aprobada (textos y estructura).
>    - `reference/brand/` ← todo el contenido de `geecko-craft/brand/` (SVGs, `tokens.css`, `tokens.json`).
> 3. Corre `claude` y pega todo lo que está debajo de la línea.
> 4. Si en 21st.dev hay un componente puntual que te encante, abre ese componente, usa su botón **Copy prompt** y pégaselo a Claude Code después, diciendo en qué sección va.

---

## Rol y objetivo

Eres un desarrollador frontend senior con mucho oficio en animación web. Vas a construir la landing de **Geecko Craft**, un estudio creativo de Ecuador que craftea webs, apps y sistemas para cualquiera que quiera construir algo. La propuesta visual y los textos ya están aprobados en `reference/prototype.html`: es la fuente de verdad para el copy, el orden de secciones y la marca. Tu trabajo es llevarla a producción con un nivel de animación parecido al de sitios como 21st.dev (fondos con shader, entradas suaves por palabra, demos que se "escriben" solas, marquesinas, botones con brillo), **sin que se vea como plantilla ni como diseño hecho por IA**.

En el copy visible nunca uses "desarrollo" ni "estudio de desarrollo": mezcla "crafteamos", "creamos", "creación" y frases como "te ayudamos a construirla y crearla", sin apoyarte solo en "crafteamos". Todo el contenido visible va en **español** (tuteo, neutro con guiños ecuatorianos como "floro").

## Stack (no lo cambies sin preguntarme)

- **Next.js 15** (App Router) + **TypeScript** estricto, `pnpm`.
- **Tailwind CSS v4** con los tokens de marca como variables CSS (`@theme`).
- **Motion** (`motion/react`, el sucesor de Framer Motion) para entradas, stagger, `whileInView`, layout y el número que cuenta.
- **Lenis** para scroll suave (desactivado con `prefers-reduced-motion`).
- **WebGL con `ogl`** (liviano) para el fondo del hero. Nada de Three.js salvo que lo justifiques.
- **View Transitions API** (con fallback) para el cambio de "piel" de toda la página.
- Formulario: **Server Action** + **Resend** para correo, con validación **Zod**.
- Fuentes con `next/font/google`: **Anybody** (eje `wdth` 50–150, pesos 300–900), **Hanken Grotesk**, **Martian Mono** (eje `wdth`). Prohibido: Inter, Space Grotesk, Unbounded, JetBrains Mono.
- Deploy pensado para **Vercel**. Sin cookies de rastreo ni píxeles de publicidad (la landing lo promete en el pie). Si quieres analítica, solo Vercel Analytics.

Arranque sugerido:
```bash
pnpm create next-app@latest geecko-landing --ts --tailwind --app --src-dir --eslint --use-pnpm
cd geecko-landing
pnpm add motion lenis ogl zod resend
```

## Marca (copia de `reference/brand/tokens.css`)

```css
--tinta:#151514;  --tinta-2:#1C1C1A; --grafito:#3A3A36; --linea:#2E2E2B;
--niebla:#8F8D83; --papel:#EEECE6;  --blanco:#FBFAF7;
--acido:#C2F04A;  --chicle:#FF4FA3; --electrico:#2E4BFF; --naranja:#FF7A1A;
--degradado: linear-gradient(160deg,#C2F04A 0%,#52EA75 14%,#00DEA4 28%,#00C8CF 42%,#00A8F1 57%,#007EFF 71%,#2E4BFF 85%,#2A2FD9 100%);
--piel: (variable activa; por defecto = degradado)
radius: 0 en todo. Filetes de 1px. Nada de tarjetas redondeadas con sombra.
```

- Logo: gecko dibujado **solo con curvas de nivel, SIN ojos**, sin objetos ni etiquetas de código (ya NO se usa `</>` ni martillo). Dos versiones: **vertical** (gecko y abajo la palabra "CRAFT", Anybody 600, wdth 125, espaciado amplio) y **horizontal** (gecko y al lado "GEECKO" en Anybody 900 + "CRAFT" en Anybody 300 ancho). En la barra va el gecko + "Geecko Craft" en texto; en el pie, la versión vertical.
- Convierte el gecko en un componente `<Gecko stroke="..."/>` que reciba el color por prop/CSS, para poder pintarlo con el degradado o con cualquier piel.
- Títulos: Anybody 800, mayúsculas, interlineado 0.86–0.9, ancho angosto (`wdth` 58–70). Etiquetas y notas: Martian Mono 12px, `wdth` 80.

## Secciones (orden y copy exactos del prototipo)

1. **Barra**: logo + nav en mono (`proyectos`, `servicios`, `diferencias`, `cómo trabajamos`, `bitácora`, `construir algo`) + interruptor **notas**.
2. **Hero**: "Creaciones digitales nuevas y adaptables." ("nuevas" y "adaptables." con el color de la piel). La bajada abre con "Como un geecko: lo nuevo, que se pega a tu negocio y se adapta a donde vaya." Nunca usar "software" ni "luces prendidas", y nada de hablar de código. La bajada pone el foco en **velocidad y agilidad**. Sobre IA, el ángulo es: "hoy todo es IA; te ayudamos a enfocarla y aterrizarla en tu idea para que le saques el jugo de verdad". Nunca "IA incluida" ni "usamos IA para todo". Estados en mono ("Primera versión en semanas, no meses"…), CTAs, logo grande y selector "Cámbiale la piel".
3. **Proyectos** ("Lo que ya creamos."): 4 casos con el encabezado `Caso 0X · Cliente`, nombre grande, rubro, descripción, chips de lo que hicimos, enlace y una imagen sobre un fondo teñido con el color del cliente y el gecko pintado de ese color. Soluara Med (#3A6BE0, marca + producto), starvO coffee (#F2B33D, @starvocoffee, aterriza pronto), Piwu Market (#8AB84A, piwumarket.com), NonDecants (#C9A45C, nondecants.com). Cierra con una tarjeta punteada "¿El tuyo?" que lleva al formulario. Las imágenes están en `reference/portafolio/` (copia ahí la carpeta `instagram/portafolio/` del proyecto); datos en `src/content/proyectos.ts`.
3b. **Servicios** → "Servicios y precios, a la vista." Tabla de servicios con **precios DESDE** (etiqueta mono pequeña + monto grande): Landing desde $480, Sitio web completo desde $1.200, Tienda en línea desde $2.400, Sistema o app web desde $4.500, App móvil desde $7.000, Automatización desde $350, en `src/content/precios.ts`. Junto a los precios, la línea **"¿Muy caro? Lo hablamos. Nos adaptamos a tu etapa…"**. Debajo de la tabla, un bloque punteado `<Otro />` **"¿Una idea rara que no ves aquí? Te la construimos."** que se rellena con la piel al pasar el mouse y lleva al formulario. Después, "¿A dónde va tu dinero?": barra apilada 60 / 17 / 12 / 11 (creación, diseño, pruebas, gestión). **Nunca mostrar el margen del estudio.**
4. **"Así trabajamos distinto."** Cinco tarjetas a todo color que se apilan: Velocidad y agilidad (Degradado Geecko), Transparencia (ácido), Comunicación directa (chicle), Flexibilidad (eléctrico, texto claro) y Lo construido es tuyo (naranja). Cada una con una frase y una caja "En la práctica". Nada de ultimátums ni compensaciones. Copia los textos del prototipo.
5. **"Tres pasos. Ninguno es una demo."** Nos adaptamos / Construimos / Nos quedamos.
6. **Bitácora** (etiqueta "Lo que va pasando"): 6 entradas con fecha, tipo (web, proyecto, marca) y texto, la primera cuenta que probamos un martillito y el gecko se quedó solo, con Craft como apellido, incluyendo NonDecants y Piwu Market. Nunca decir "cero clientes" ni sonar a estudio sin experiencia. Desde `src/content/bitacora.ts`.
7. **"¿Buscas construir algo?"**: el formulario para escribir o hablar (ver abajo).
8. **Pie**: "Nos adaptamos. Construimos. Nos quedamos." con tres anchos distintos de Anybody, y la línea de "sin cookies de rastreo".

**Comentarios al margen**: cada sección tiene notas cortas en una columna derecha (en móvil van debajo del contenido). El interruptor las muestra u oculta, recuerda la elección en `localStorage` y por defecto están visibles.

## Animaciones (el nivel 21st.dev, pero con identidad propia)

> **Referencia viva:** `reference/prototype.html` ya trae todas estas animaciones funcionando en JavaScript sin librerías (busca el bloque `/* movimiento */` al final). Úsalo como especificación exacta de tiempos, curvas y comportamiento, y pórtalo a componentes React con Motion. El shader GLSL del terreno se puede copiar tal cual.

**Un gesto distinto por sección (para que no sea monótono)**
- Hero: el gecko se dibuja línea por línea, el titular se angosta palabra por palabra, el fondo WebGL de curvas de nivel sigue al cursor y hay parallax suave al bajar.
- Precios: el título se angosta palabra por palabra, las filas se barren de izquierda a derecha con `clip-path` y los montos cuentan desde $0. La barra del dinero crece segmento por segmento.
- Diferencias: el título sube por renglones enmascarados. Las tarjetas son `position: sticky` y se apilan: cuando llega la siguiente, la de atrás se encoge (scale 0.94) y se oscurece, todo atado al scroll.
- Cómo trabajamos: un riel arriba de los tres pasos se llena con el scroll y va encendiendo cada paso (los no alcanzados quedan al 28% de opacidad).
- Bitácora: el título se tipea letra por letra con cursor, las entradas entran desde la izquierda.
- ¿Buscas construir algo?: la palabra "algo?" se rellena con el color de la piel, los campos suben en cascada y la ficha gira en 3D desde el costado.
- Pie: el lema cambia de ancho mientras entra en pantalla.
- Global: barra de progreso de 3 px y etiquetas/notas que solo aparecen (fade), sin moverse.

**Al cambiar de piel**
- View Transition con un círculo que se expande desde el botón tocado y repinta toda la página. Fallback: una capa del color nuevo que se expande y se desvanece.
- Después del cambio, el gecko del hero y el de la ficha se vuelven a dibujar línea por línea, y "nuevas" y "adaptables" hacen un pulso de ancho.
- El shader del fondo funde sus colores hacia la piel nueva en lugar de cambiar de golpe.


Regla general: **una animación protagonista por sección**, curvas `cubic-bezier(.2,.8,.2,1)`, duraciones de 0.4 a 1.2 s. Todo el contenido existe en el HTML desde el servidor (SEO): las animaciones parten de un estado visible o casi visible, nunca dejan texto en `opacity:0` si el JS falla. Con `prefers-reduced-motion: reduce` se desactiva todo menos los cambios de color.

1. **Fondo WebGL de curvas de nivel en toda la página** (canvas `position: fixed` detrás de todo; brilla más en hero, proyectos, servicios, formulario y pie, y baja a ~40% en el resto; las curvas se desplazan con el scroll y tienen un halo de luz donde está el cursor). En el teléfono el halo sigue al dedo (`touchstart`/`touchmove`) y, si nadie toca, pasea solo y reacciona a la velocidad del scroll. Intensidad menor en móvil para que el texto se lea. Base: Un shader de fragmento que dibuja curvas de nivel (isolíneas de un ruido simplex 2D que se mueve lento) con el Degradado Geecko sobre tinta. Es la misma idea del logo, llevada al fondo. Líneas finas, opacidad baja (≈0.25) para que el texto mande. El cursor deforma suavemente el campo (como un dedo en el agua). Si cambia la piel, las líneas pasan al color de la piel. Pausa el render cuando el hero sale de pantalla y limita a 30 fps en móvil. Fallback: un SVG estático de curvas.
2. **Titular que "se adapta".** Cada palabra entra con un stagger de 60 ms: sube 24 px, pasa de `blur(8px)` a nítida y anima el eje `wdth` de 150 a 60. Al pasar el mouse por una palabra, se ensancha a 128.
3. **Gecko que se dibuja.** Divide el path del gecko en sus subpaths (cada `M`) y anima `stroke-dashoffset` de cada curva con un pequeño desfase, de afuera hacia adentro, en ~1.6 s.
4. **Selector de piel.** Al elegir un color, usa `document.startViewTransition` con un `clip-path: circle()` que se expande desde el botón tocado y repinta toda la página con la nueva piel. Fallback: transición de color de 400 ms.
5. **Marquesina** entre el hero y precios: una cinta infinita en mono con lo que construimos ("landing pages · tiendas en línea · apps móviles · sistemas a medida · automatizaciones · integraciones con WhatsApp · paneles administrativos"). Se frena al pasar el mouse. Hecha con CSS (`@keyframes` + contenido duplicado), sin librería.
6. **Precios.** Las filas entran con stagger al hacer scroll. Cada monto cuenta desde 0 hasta su valor en 0.9 s con `useSpring` de Motion y `tabular-nums`. La etiqueta `DESDE` aparece primero.
7. **Barra del dinero.** Los segmentos crecen de izquierda a derecha uno tras otro, con un pequeño rebote.
8. **Proyectos en carril horizontal.** En escritorio (≥ 900 px) el carril se fija centrado en pantalla (`position: sticky`, alto = alto de las tarjetas, sin espacio de más arriba ni abajo) y el scroll vertical mueve las tarjetas de lado hasta llegar a "¿El tuyo?". El título se "pinta" de gris a hueso de izquierda a derecha. En el teléfono, carril con `scroll-snap` para deslizar con el dedo.
9. **Bitácora.** Las entradas aparecen una por una (de abajo hacia arriba, la más vieja primero). La fecha parpadea una vez al aparecer.
10. **Botón "Mudar de piel".** Fondo con la piel activa, un anillo de brillo que gira despacio en el borde (estilo *shimmer button*) y al hover el texto se ensancha (`wdth` 100 → 130). Al enviar con éxito: el sello RECIBIDO cae sobre la ficha con un rebote, la página entera se pinta con la piel del visitante (misma transición del punto 4) y aparece "Qué pasa ahora".
11. **Scroll suave** con Lenis y anclas del nav que se desplazan con easing.

## Contacto sin ser invasivo

- **Hero**: botón principal "Cuéntanos qué quieres construir ↓" (lleva a la sección del formulario) y dos botones secundarios con borde: WhatsApp y @geecko_craft.
- **Dock flotante** abajo a la derecha: un botón pequeño "¿Hablamos?" con un punto que late y el gecko mini. Aparece solo después del hero y se esconde mientras el formulario o el pie están en pantalla. Al tocarlo se abre un menú con WhatsApp, correo (toca para copiar), Instagram @geecko_craft y "Escribir mi idea". Se cierra con Escape.
- **Pie**: tres bloques grandes con WhatsApp, correo e Instagram.
- Datos en `src/content/contacto.ts`: `WHATSAPP` (falta el número real; en el prototipo está 593000000000), `EMAIL = "contacto@geeckocraft.com"`, `INSTAGRAM = "https://instagram.com/geecko_craft"`.

## Sección "¿Buscas construir algo?" (la conversión: tiene que funcionar de verdad)

1. **Tu idea, como te salga**: pestañas *Escribir* / *Hablar*.
   - Escribir: textarea (máx. 400 caracteres) con ejemplos que rotan en el placeholder.
   - Hablar: botón grande de micrófono, onda en vivo (canvas + `AnalyserNode`), contador y límite de 2 minutos. Graba con `MediaRecorder` (webm/opus; en Safari, mp4). Se puede volver a grabar.
2. **¿Por dónde te mandamos la propuesta?**: chips WhatsApp / Correo. El input cambia de placeholder y de validación según el canal (teléfono con código de país, o correo válido).
3. **Presupuesto** (opcional): chips.
4. **Color de tu marca** (opcional): pieles + selector de color; el gecko de la ficha se pinta en vivo.
- Botón **"Enviar mi idea"**. Al enviar con éxito: transición circular de piel, sello RECIBIDO, "Qué pasa ahora" y un enlace "¿No quieres esperar? Ábrelo ya en WhatsApp" con el resumen prellenado (`wa.me/<numero>?text=...`).
- Debajo: "¿Prefieres escribirnos directo?" con WhatsApp, correo e Instagram.

**Backend del envío** (Server Action o Route Handler `POST /api/propuesta`):
- Validación con Zod en cliente y servidor. Honeypot + límite por IP.
- El audio se sube como `FormData` (máx. 10 MB). Guárdalo en Vercel Blob y manda el enlace.
- **Correo** con Resend a `LEAD_TO_EMAIL`: asunto `Nueva propuesta #NNNN · {canal} · {presupuesto}`, con la idea, el audio adjunto o enlazado, el color y el contacto.
- **WhatsApp al estudio** con WhatsApp Cloud API (plantilla aprobada) a `STUDIO_WHATSAPP`, con el resumen y el enlace al audio. Si todavía no hay Cloud API, deja la función preparada y usa solo el correo.
- Variables en `.env.example`: `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `STUDIO_WHATSAPP`, `NEXT_PUBLIC_WHATSAPP`.
- Pregúntame antes de añadir una base de datos para la numeración.

## Calidad (criterios para dar por terminado)

- Lighthouse en móvil: Performance ≥ 90, Accesibilidad ≥ 95, SEO 100. El shader no puede bajar el LCP: el titular es el LCP.
- Sin scroll horizontal a 360 px. Probado a 360, 768, 1280 y 1440 px.
- Foco visible en todo, navegación con teclado completa, `aria-pressed` en pieles y chips, `aria-live` en la ficha.
- Contraste: si la piel elegida es muy oscura, aclárala automáticamente para textos sobre tinta, y elige texto claro u oscuro en el botón según la luminancia.
- Metadatos: title, description, Open Graph con una imagen generada (`opengraph-image.tsx`) del logo sobre tinta, favicon del gecko.
- Componentes chicos y legibles en `src/components/` (`Hero`, `ShaderTerreno`, `Gecko`, `Precios`, `Diferencias`, `Pasos`, `Bitacora`, `ConstruirAlgo`, `GrabadorVoz`, `DockContacto`, `Notas`, `Marquesina`), contenido en `src/content/`, piel global en un contexto `PielProvider`.

## Forma de trabajar

1. Antes de escribir código, muéstrame un plan corto: estructura de carpetas, componentes y cómo vas a hacer el shader. Espera mi OK.
2. Construye sección por sección, en el orden de arriba, y corre `pnpm dev` para revisar cada una.
3. Haz commits pequeños con mensajes en español.
4. Al final dame: cómo correrlo, qué variables configurar, y una lista de lo que quedó con valores de ejemplo (precios, correo, desglose).


## Mensaje (actualizado 21 nov 2026)

- Somos **creaciones digitales nuevas y adaptables, como un geecko**. Nunca "software", nunca "luces prendidas", nunca "desarrollo" ni "estudio de desarrollo". Usa "creamos", "crafteamos", "creación".
- Nada de hablar de código en textos visibles: ni `</>`, ni `git log`, ni `.json`, ni `// comentarios`, ni "el código es tuyo" (di "todo queda a tu nombre").
- Logo: gecko de curvas de nivel solo (archivos `simbolo-*.svg`, `logo-vertical-*.svg` con CRAFT abajo, `logo-horizontal-*.svg` con GEECKO CRAFT al lado).
