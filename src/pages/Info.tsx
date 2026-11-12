import { Link, useLocation } from '../router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';

type ContentBlock = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type PageContent = {
  title: string;
  subtitle: string;
  updated?: string;
  blocks: ContentBlock[];
};

const CONTENT: Record<string, PageContent> = {
  '/about': {
    title: 'Sobre Movienatic',
    subtitle: 'Una comunidad para descubrir, valorar y compartir cine.',
    blocks: [
      {
        heading: 'Qué es Movienatic',
        paragraphs: [
          'Movienatic es una plataforma web para consultar información de películas, descubrir títulos por género, año o valoración y compartir opiniones con otros usuarios.',
          'El catálogo combina datos de películas con valoraciones, reseñas y listas creadas por la comunidad. Nuestro objetivo es que encontrar tu próxima película sea tan fácil como disfrutarla.',
        ],
      },
      {
        heading: 'Qué puedes hacer',
        bullets: [
          'Explorar películas y filtrarlas por título, género, año o valoración mínima.',
          'Guardar películas en tus favoritos o en tu lista de pendientes.',
          'Escribir reseñas, puntuar películas y valorar las opiniones de otros usuarios.',
          'Crear listas temáticas y compartirlas con la comunidad.',
          'Seguir a otros cinéfilos y descubrir sus recomendaciones.',
        ],
      },
      {
        heading: 'Nuestro compromiso',
        paragraphs: [
          'Creemos en una comunidad respetuosa, transparente y segura. Por eso moderamos el contenido inapropiado, protegemos tus datos personales y te explicamos con claridad qué información tratamos y para qué.',
          'Movienatic no aloja ni reproduce películas. Solo ofrece información, opiniones y herramientas sociales para organizar lo que quieres ver.',
        ],
      },
      {
        heading: 'Contacto',
        paragraphs: [
          'Si tienes cualquier duda, sugerencia o propuesta de colaboración, escríbenos desde la página de contacto o a hola@movienatic.com.',
        ],
      },
    ],
  },

  '/contact': {
    title: 'Contacto',
    subtitle: '¿Tienes una duda, sugerencia o problema? Escríbenos.',
    blocks: [
      {
        heading: 'Soporte técnico',
        paragraphs: [
          'Problemas con tu cuenta, errores en la web o dudas sobre el funcionamiento de la plataforma: soporte@movienatic.com.',
          'Intentamos responder en un plazo máximo de 48 horas laborables.',
        ],
      },
      {
        heading: 'Sugerencias y colaboraciones',
        paragraphs: [
          '¿Quieres proponer una mejora, colaborar con Movienatic o hablar de prensa? Escríbenos a hola@movienatic.com.',
        ],
      },
      {
        heading: 'Privacidad y datos personales',
        paragraphs: [
          'Para ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación o portabilidad, escribe a privacidad@movienatic.com indicando el asunto «Derechos RGPD».',
        ],
      },
      {
        heading: 'Reportar contenido',
        paragraphs: [
          'Si encuentras una reseña, lista o perfil que incumple nuestras normas, envíanos el enlace a moderacion@movienatic.com y lo revisaremos.',
        ],
      },
      {
        heading: 'Atención por correo',
        paragraphs: [
          'Por el momento, toda la atención se realiza por correo electrónico. No atendemos solicitudes por teléfono ni por mensajería instantánea.',
        ],
      },
    ],
  },

  '/help': {
    title: 'Centro de ayuda',
    subtitle: 'Respuestas rápidas a las preguntas más habituales.',
    blocks: [
      {
        heading: '¿Necesito una cuenta para usar Movienatic?',
        paragraphs: [
          'Puedes explorar el catálogo, ver fichas y consultar listas sin registrarte. Para puntuar, reseñar, guardar favoritos, crear listas o seguir a otros usuarios necesitas una cuenta.',
        ],
      },
      {
        heading: '¿Cómo busco una película?',
        paragraphs: [
          'Usa el buscador del navbar y pulsa Enter, o entra en Películas y utiliza los filtros de título, género, año y valoración mínima.',
        ],
      },
      {
        heading: '¿Cómo valoro o reseño una película?',
        paragraphs: [
          'Abre la ficha de la película y utiliza la sección de reseñas. Puedes puntuar del 1 al 5 y escribir tu opinión. Las reseñas pueden recibir likes y dislikes de otros usuarios.',
        ],
      },
      {
        heading: '¿Cómo guardo películas en favoritos o pendientes?',
        paragraphs: [
          'Desde la ficha de cada película puedes añadirla a favoritos o a pendientes. Ambas listas se guardan en tu cuenta y puedes consultarlas cuando quieras.',
        ],
      },
      {
        heading: '¿Cómo creo una lista?',
        paragraphs: [
          'Desde tu perfil puedes crear listas con un nombre, una descripción y las películas que elijas. Las listas públicas aparecen en la sección Social y pueden recibir likes.',
        ],
      },
      {
        heading: '¿Cómo elimino mi cuenta o mis datos?',
        paragraphs: [
          'Escríbenos a privacidad@movienatic.com y solicitaremos la eliminación de tu cuenta y de los datos asociados. Consulta la página de Protección de Datos para más información.',
        ],
      },
      {
        heading: '¿Movienatic aloja o reproduce películas?',
        paragraphs: [
          'No. Movienatic es una plataforma de información y comunidad. No aloja, distribuye ni reproduce contenido audiovisual.',
        ],
      },
      {
        heading: '¿Cómo reporto una reseña o lista inapropiada?',
        paragraphs: [
          'Envía el enlace del contenido a moderacion@movienatic.com. Revisaremos el caso y, si incumple las normas, lo retiraremos.',
        ],
      },
    ],
  },

  '/privacy': {
    title: 'Política de Privacidad',
    subtitle: 'Cómo tratamos y protegemos tus datos personales.',
    updated: 'Última actualización: 7 de noviembre de 2026',
    blocks: [
      {
        heading: '1. Responsable del tratamiento',
        paragraphs: [
          'El responsable del tratamiento de los datos personales recogidos en Movienatic es Movienatic, como titular de este sitio web. Para cualquier cuestión relacionada con privacidad puedes escribir a privacidad@movienatic.com.',
        ],
      },
      {
        heading: '2. Datos que recogemos',
        bullets: [
          'Datos de registro: nombre de usuario, dirección de correo electrónico y contraseña. La contraseña se almacena de forma cifrada y no es accesible en texto plano.',
          'Actividad en la plataforma: películas favoritas y pendientes, reseñas, valoraciones, listas, seguidores, seguidos, likes y dislikes.',
          'Datos técnicos: dirección IP, tipo de navegador, dispositivo, sistema operativo, fecha y hora de acceso y páginas visitadas.',
          'Comunicaciones: mensajes que nos envíes a través de los canales de contacto.',
        ],
      },
      {
        heading: '3. Finalidades y bases legales',
        bullets: [
          'Prestar el servicio y gestionar tu cuenta (ejecución de un contrato).',
          'Permitir las funciones sociales: reseñas, listas, favoritos y seguimiento (ejecución de un contrato).',
          'Moderar contenido y prevenir abusos (interés legítimo en mantener una comunidad segura).',
          'Garantizar la seguridad de la plataforma y solucionar errores técnicos (interés legítimo).',
          'Enviarte comunicaciones sobre novedades o cambios relevantes, solo si has dado tu consentimiento.',
          'Cumplir obligaciones legales aplicables.',
        ],
      },
      {
        heading: '4. Conservación de los datos',
        paragraphs: [
          'Conservamos tus datos mientras tu cuenta permanezca activa y durante los plazos legalmente exigibles. Si solicitas la eliminación de tu cuenta, borraremos o anonimizaremos tus datos personales, salvo aquellos que debamos conservar por obligaciones legales.',
        ],
      },
      {
        heading: '5. Destinatarios',
        paragraphs: [
          'No vendemos ni alquilamos tus datos personales. Podemos compartirlos con proveedores de hosting, correo electrónico o soporte técnico que actúan como encargados del tratamiento bajo contrato, y con autoridades cuando exista una obligación legal.',
        ],
      },
      {
        heading: '6. Transferencias internacionales',
        paragraphs: [
          'Si algún proveedor se encuentra fuera del Espacio Económico Europeo, adoptaremos las garantías adecuadas previstas en la normativa, como las cláusulas contractuales tipo aprobadas por la Comisión Europea.',
        ],
      },
      {
        heading: '7. Tus derechos',
        bullets: [
          'Acceso: saber qué datos tratamos sobre ti.',
          'Rectificación: corregir datos inexactos o incompletos.',
          'Supresión: solicitar la eliminación de tus datos cuando ya no sean necesarios.',
          'Oposición y limitación: oponerte a determinados tratamientos o solicitar su limitación.',
          'Portabilidad: recibir tus datos en un formato estructurado y de uso común.',
          'Retirar el consentimiento en cualquier momento, sin afectar a la licitud del tratamiento previo.',
        ],
      },
      {
        heading: '8. Seguridad',
        paragraphs: [
          'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos frente a accesos no autorizados, pérdida, alteración o divulgación. Ningún sistema es completamente infalible, pero revisamos periódicamente nuestras prácticas de seguridad.',
        ],
      },
      {
        heading: '9. Menores de edad',
        paragraphs: [
          'Movienatic no está dirigida a menores de 14 años. Si detectamos una cuenta creada por un menor de esa edad sin autorización, procederemos a su eliminación.',
        ],
      },
      {
        heading: '10. Cambios en esta política',
        paragraphs: [
          'Podemos actualizar esta política para reflejar cambios legales o de funcionamiento. Publicaremos la versión vigente en esta página e indicaremos la fecha de la última actualización.',
        ],
      },
      {
        heading: '11. Reclamaciones',
        paragraphs: [
          'Si consideras que no hemos atendido correctamente tus derechos, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).',
        ],
      },
    ],
  },

  '/terms': {
    title: 'Términos y Condiciones',
    subtitle: 'Las normas básicas para usar Movienatic.',
    updated: 'Última actualización: 7 de noviembre de 2026',
    blocks: [
      {
        heading: '1. Aceptación',
        paragraphs: [
          'Al acceder o utilizar Movienatic aceptas estos términos y condiciones. Si no estás de acuerdo con ellos, no utilices la plataforma.',
        ],
      },
      {
        heading: '2. Descripción del servicio',
        paragraphs: [
          'Movienatic ofrece información sobre películas, herramientas para valorarlas y reseñarlas, listas de películas y funciones sociales. El servicio se presta «tal cual» y puede cambiar o interrumpirse por mantenimiento o mejoras.',
        ],
      },
      {
        heading: '3. Registro y seguridad de la cuenta',
        bullets: [
          'Debes proporcionar información veraz y mantenerla actualizada.',
          'Eres responsable de mantener la confidencialidad de tu contraseña.',
          'Debes notificarnos cualquier uso no autorizado de tu cuenta.',
          'No está permitido crear cuentas suplantando a otras personas.',
          'Debes tener al menos 14 años para registrarte.',
        ],
      },
      {
        heading: '4. Uso aceptable',
        bullets: [
          'No publicar contenido ilícito, ofensivo, discriminatorio, violento o que vulnere derechos de terceros.',
          'No enviar spam ni utilizar la plataforma para publicidad no autorizada.',
          'No suplantar la identidad de otras personas o entidades.',
          'No intentar acceder a cuentas ajenas ni vulnerar la seguridad del sistema.',
          'No extraer datos de forma automatizada sin autorización expresa.',
        ],
      },
      {
        heading: '5. Contenido generado por usuarios',
        paragraphs: [
          'Conservas la titularidad de las reseñas, listas y demás contenido que publiques. Al publicarlo, nos concedes una licencia no exclusiva para alojarlo, mostrarlo y distribuirlo dentro de Movienatic con el fin de prestar el servicio.',
          'Eres responsable del contenido que publicas. Podemos moderar o retirar contenido que incumpla estas normas.',
        ],
      },
      {
        heading: '6. Propiedad intelectual',
        paragraphs: [
          'La marca, el diseño, el código y los textos propios de Movienatic están protegidos por la normativa de propiedad intelectual e industrial. Los títulos, carteles, sinopsis y demás información de películas pertenecen a sus respectivos titulares y se muestran con fines informativos y de identificación.',
        ],
      },
      {
        heading: '7. Disponibilidad y cambios',
        paragraphs: [
          'No garantizamos la disponibilidad ininterrumpida del servicio. Podemos suspenderlo temporalmente por mantenimiento, actualizaciones o causas de fuerza mayor, y modificar sus funcionalidades.',
        ],
      },
      {
        heading: '8. Limitación de responsabilidad',
        paragraphs: [
          'En la medida permitida por la ley, Movienatic no se responsabiliza de los daños derivados del uso del servicio, de la exactitud de la información de terceros ni del contenido publicado por los usuarios. Nada en estos términos limita los derechos que la ley reconoce a los consumidores.',
        ],
      },
      {
        heading: '9. Enlaces a terceros',
        paragraphs: [
          'La plataforma puede incluir enlaces a sitios de terceros. No controlamos ni somos responsables de sus contenidos, políticas o prácticas.',
        ],
      },
      {
        heading: '10. Suspensión y cancelación',
        paragraphs: [
          'Podemos suspender o cancelar cuentas que incumplan estos términos. Tú puedes solicitar la eliminación de tu cuenta en cualquier momento escribiendo a privacidad@movienatic.com.',
        ],
      },
      {
        heading: '11. Modificaciones',
        paragraphs: [
          'Podemos actualizar estos términos. La versión vigente estará siempre publicada en esta página con su fecha de actualización.',
        ],
      },
      {
        heading: '12. Legislación y jurisdicción',
        paragraphs: [
          'Estos términos se rigen por la legislación española. Para cualquier controversia, se aplicarán las normas de competencia judicial que correspondan, respetando los derechos de los consumidores.',
        ],
      },
    ],
  },

  '/cookies': {
    title: 'Política de Cookies',
    subtitle: 'Qué almacenamos en tu navegador y para qué.',
    updated: 'Última actualización: 7 de noviembre de 2026',
    blocks: [
      {
        heading: '1. Qué son las cookies y tecnologías similares',
        paragraphs: [
          'Las cookies son pequeños archivos que se almacenan en tu dispositivo. Junto a ellas, Movienatic utiliza el almacenamiento local del navegador (localStorage) para recordar tu sesión y tus preferencias.',
        ],
      },
      {
        heading: '2. Qué utilizamos actualmente',
        bullets: [
          'Almacenamiento técnico de sesión: guardamos el token de autenticación en la clave movienatic_token para mantener tu sesión iniciada.',
          'Preferencias de cuenta: guardamos datos básicos del usuario en la clave movienatic_user para mostrar tu nombre en la interfaz.',
          'Preferencias de uso: recordamos opciones como «Recuérdame» mientras tu sesión esté activa.',
          'No utilizamos cookies publicitarias ni de perfilado.',
        ],
      },
      {
        heading: '3. Cookies de terceros',
        paragraphs: [
          'Actualmente no incorporamos cookies publicitarias de terceros. Si en el futuro se añaden reproductores, analítica o servicios externos que las utilicen, actualizaremos esta política y solicitaremos el consentimiento cuando sea necesario.',
        ],
      },
      {
        heading: '4. Cómo gestionarlas',
        paragraphs: [
          'Puedes eliminar o bloquear el almacenamiento local desde la configuración de tu navegador. Ten en cuenta que las cookies y el almacenamiento técnico son necesarios para iniciar sesión y mantener la cuenta activa; si los eliminas, tendrás que volver a autenticarte.',
        ],
      },
      {
        heading: '5. Actualizaciones',
        paragraphs: [
          'Podemos modificar esta política si cambiamos las tecnologías que utilizamos. Publicaremos la versión vigente en esta página.',
        ],
      },
      {
        heading: '6. Contacto',
        paragraphs: [
          'Si tienes dudas sobre el uso de cookies o almacenamiento local, escríbenos a privacidad@movienatic.com.',
        ],
      },
    ],
  },

  '/legal': {
    title: 'Aviso Legal',
    subtitle: 'Información sobre el titular y el uso del sitio.',
    updated: 'Última actualización: 7 de noviembre de 2026',
    blocks: [
      {
        heading: '1. Titular del sitio',
        paragraphs: [
          'Movienatic es un proyecto digital accesible a través de este sitio web. Para cualquier comunicación relacionada con el mismo puedes escribir a legal@movienatic.com.',
        ],
      },
      {
        heading: '2. Objeto',
        paragraphs: [
          'Este aviso legal regula el acceso y uso del sitio web de Movienatic, cuya finalidad es ofrecer información sobre películas y herramientas sociales para la comunidad de usuarios.',
        ],
      },
      {
        heading: '3. Propiedad intelectual e industrial',
        paragraphs: [
          'El diseño, el código, la marca y los contenidos propios de Movienatic están protegidos por la normativa aplicable. No se permite su reproducción, distribución o transformación sin autorización.',
          'Los títulos, carteles, sinopsis y demás materiales de películas pertenecen a sus respectivos titulares y se utilizan con fines informativos y de identificación.',
        ],
      },
      {
        heading: '4. Responsabilidad',
        paragraphs: [
          'Movienatic no garantiza la disponibilidad continua del sitio ni la exactitud de la información proporcionada por terceros. No se responsabiliza del contenido publicado por los usuarios ni del uso que estos hagan de la plataforma.',
        ],
      },
      {
        heading: '5. Enlaces a terceros',
        paragraphs: [
          'El sitio puede contener enlaces a páginas de terceros. Movienatic no controla dichos sitios ni asume responsabilidad por sus contenidos o políticas.',
        ],
      },
      {
        heading: '6. Protección de datos',
        paragraphs: [
          'El tratamiento de datos personales se rige por nuestra Política de Privacidad y por la página de Protección de Datos.',
        ],
      },
      {
        heading: '7. Legislación aplicable',
        paragraphs: [
          'Este aviso legal se rige por la legislación española. Cualquier controversia se someterá a los juzgados y tribunales competentes conforme a la normativa aplicable.',
        ],
      },
    ],
  },

  '/data': {
    title: 'Protección de Datos',
    subtitle: 'Tus derechos sobre la información que guardamos.',
    updated: 'Última actualización: 7 de noviembre de 2026',
    blocks: [
      {
        heading: '1. Nuestro compromiso',
        paragraphs: [
          'En Movienatic tratamos los datos personales conforme al Reglamento General de Protección de Datos (RGPD) y a la normativa española de protección de datos. Solo recogemos la información necesaria para prestar el servicio.',
        ],
      },
      {
        heading: '2. Qué datos tratamos y para qué',
        bullets: [
          'Cuenta: nombre de usuario, correo electrónico y contraseña cifrada, para identificarte y proteger tu acceso.',
          'Actividad: favoritos, pendientes, reseñas, valoraciones, listas, seguidores y likes, para ofrecer las funciones sociales.',
          'Datos técnicos: IP, navegador y registros de acceso, para seguridad y resolución de incidencias.',
          'Comunicaciones: mensajes de soporte, para atender tus solicitudes.',
        ],
      },
      {
        heading: '3. Base jurídica',
        paragraphs: [
          'Tratamos tus datos porque son necesarios para ejecutar el contrato de servicio que aceptas al crear una cuenta, porque tenemos un interés legítimo en mantener la plataforma segura y, en su caso, porque nos has dado tu consentimiento para comunicaciones concretas.',
        ],
      },
      {
        heading: '4. Tus derechos',
        bullets: [
          'Acceso: conocer qué datos tenemos sobre ti.',
          'Rectificación: corregir datos inexactos o incompletos.',
          'Supresión: solicitar que eliminemos tus datos («derecho al olvido»).',
          'Limitación: pedir que dejemos de tratar tus datos temporalmente.',
          'Oposición: oponerte a determinados tratamientos.',
          'Portabilidad: recibir tus datos en un formato estructurado.',
          'Retirada del consentimiento: revocar tu consentimiento cuando el tratamiento se base en él.',
        ],
      },
      {
        heading: '5. Cómo ejercer tus derechos',
        paragraphs: [
          'Envía un correo a privacidad@movienatic.com con el asunto «Derechos RGPD» e indica qué derecho deseas ejercer. Si es necesario para verificar tu identidad, podremos solicitarte información adicional. Responderemos en el plazo máximo de un mes.',
        ],
      },
      {
        heading: '6. Eliminar tu cuenta',
        paragraphs: [
          'Puedes solicitar la eliminación de tu cuenta y de los datos asociados escribiendo a privacidad@movienatic.com. Eliminaremos la información personal que no debamos conservar por obligaciones legales.',
        ],
      },
      {
        heading: '7. Seguridad',
        paragraphs: [
          'Aplicamos medidas técnicas y organizativas para proteger tus datos, como el cifrado de contraseñas, controles de acceso y revisiones periódicas de seguridad.',
        ],
      },
      {
        heading: '8. Reclamaciones',
        paragraphs: [
          'Si consideras que tus derechos no han sido atendidos correctamente, puedes reclamar ante la Agencia Española de Protección de Datos en www.aepd.es.',
        ],
      },
      {
        heading: '9. Contacto',
        paragraphs: [
          'Para cualquier duda sobre protección de datos, escríbenos a privacidad@movienatic.com.',
        ],
      },
    ],
  },
};

function getPathname(location: string): string {
  try {
    return new URL(location).pathname;
  } catch {
    return location.split('?')[0];
  }
}

export function InfoPage() {
  const auth = useAuthFlow();
  const location = useLocation();
  const pathname = getPathname(location);
  const content = CONTENT[pathname] || CONTENT['/about'];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        onLogin={auth.openLogin}
        onRegister={auth.openRegister}
      />

      <main className="page-container max-w-4xl flex-1 py-12 sm:py-16">
        <BackLink to="/" className="mb-9">
          Volver al inicio
        </BackLink>

        <header className="mb-12 border-b border-line/10 pb-8">
          <span className="eyebrow mb-4">Movienatic</span>
          <h1 className="display-title">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-pretty">
            {content.subtitle}
          </p>
          {content.updated && (
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
              {content.updated}
            </p>
          )}
        </header>

        <div className="space-y-10">
          {content.blocks.map((block) => (
            <section key={block.heading}>
              <h2 className="mb-3 font-heading text-xl font-bold tracking-tight text-ink">
                {block.heading}
              </h2>
              {block.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mb-3 text-[15px] leading-relaxed text-muted text-pretty"
                >
                  {paragraph}
                </p>
              ))}
              {block.bullets && (
                <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-muted">
                  {block.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="surface mt-14 flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">
              ¿Necesitas ayuda?
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Escríbenos y te responderemos lo antes posible.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Contactar
            </Link>
            <Link
              to="/help"
              className="rounded-full border border-line/10 bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Centro de ayuda
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      {auth.modals}
    </div>
  );
}

export default InfoPage;
