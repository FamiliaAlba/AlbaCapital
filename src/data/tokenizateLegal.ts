import { TK_LEGAL_VERSION } from "./tokenizate";

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}
export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Textos legales de la sección Tokenizate. Redactados a partir de la normativa oficial consultada
 * (Ley 25.326; Normas CNV Título XXII y Título XX; CCCN) y deben ser revisados por el asesor legal de
 * Alba Capital antes de su uso definitivo. Cualquier cambio de fondo exige subir TK_LEGAL_VERSION
 * (también en la Edge Function) para que se vuelva a registrar la aceptación.
 */
export const LEGAL_REVIEWED_ON = "16 de octubre de 2026";

export const BASES_Y_CONDICIONES: LegalDoc = {
  title: "Bases y Condiciones de Tokenizate | Alba Capital",
  intro: `Versión ${TK_LEGAL_VERSION}. Estas Bases y Condiciones regulan el uso de la sección Tokenizate, el registro de interés de potenciales inversores y la postulación de activos o proyectos por parte de sus propietarios o desarrolladores.`,
  sections: [
    {
      title: "1. Qué es esta sección y qué no es",
      paragraphs: [
        "Tokenizate es un espacio de información, captación de interesados y recepción privada de postulaciones. No constituye una oferta pública ni privada de valores negociables, una invitación a invertir, una recomendación de inversión ni una solicitud de dinero.",
        "A través de este sitio no se compran tokens, no se reciben fondos, no se conectan billeteras, no se custodian activos ni se negocian participaciones. Esas funciones no están habilitadas. Si en el futuro se habilitara alguna oferta concreta, lo hará mediante documentación específica, con los participantes, el encuadre jurídico y las autorizaciones que correspondan.",
      ],
    },
    {
      title: "2. Registro de interés de inversores",
      items: [
        "Completar el formulario “Quiero recibir información” es una solicitud de información. No es una orden de inversión, una suscripción ni la aceptación de una oferta, y no genera obligación para ninguna de las partes.",
        "El rango de capital que se indique es orientativo y opcional. No determina elegibilidad, perfil de inversor ni condiciones de participación.",
        "Cada eventual inversión tendrá sus propias condiciones, costos y riesgos. La rentabilidad y la posibilidad de vender anticipadamente la participación no están garantizadas.",
      ],
    },
    {
      title: "3. La postulación de un activo no obliga a Alba Capital",
      paragraphs: [
        "Presentar un bien de capital o proyecto en esta sección es únicamente una solicitud para que Alba Capital lo evalúe. Postular un activo no lo convierte en tokenizable, no genera derecho alguno a favor del postulante y no obliga a Alba Capital a analizarlo en un plazo determinado, aceptarlo, estructurarlo, posicionarlo, ofrecerlo, financiarlo ni comercializarlo, con estas u otras condiciones.",
        "Alba Capital puede aceptar, rechazar, condicionar o suspender el análisis de cualquier postulación, en cualquier momento y a su exclusivo criterio, sin que ello genere derecho a compensación alguna.",
        "Los estados que se muestren durante el proceso (por ejemplo “Recibido”, “Revisión preliminar” o “Viable con condiciones”) son referencias internas de gestión. Ninguno equivale a aprobación, aceptación de una propuesta, compromiso de financiación ni autorización para ofrecer el activo a terceros.",
      ],
    },
    {
      title: "4. Cómo sigue el proceso",
      items: [
        "Primero, análisis y aprobación previa por parte de Alba Capital: revisión preliminar, documentación, y evaluación técnica, económica y jurídica del activo, del negocio y de su titularidad.",
        "Si la evaluación es favorable, Alba Capital podrá proponer una estructura y generar las herramientas jurídicas que correspondan a ese caso, verificando el encuadre normativo aplicable, los participantes necesarios y las autorizaciones requeridas.",
        "Solo si las partes llegan a un acuerdo definitivo, se formalizará mediante un contrato escrito entre Alba Capital y el propietario o desarrollador del proyecto. Hasta que ese contrato sea firmado por ambas partes, no existe obligación recíproca de estructurar, ofrecer ni financiar el activo.",
        "Las conversaciones, correos, reuniones o informes intermedios no sustituyen ese contrato ni crean obligaciones por sí mismos.",
      ],
    },
    {
      title: "5. Tokenizar exige algo más que un activo",
      paragraphs: [
        "Un token puede representar digitalmente derechos definidos en un instrumento jurídico vinculado a un activo o proyecto. Por sí mismo, un activo no es “tokenizable”: se requiere un derecho jurídico subyacente válido, un instrumento adecuado, participantes habilitados y el cumplimiento de la normativa aplicable.",
        "En la Argentina, las Normas de la Comisión Nacional de Valores regulan la representación digital de valores negociables (Título XXII) —que presupone un valor negociable existente y participantes registrados— y la oferta privada (Título XX) —que limita destinatarios, medios de difusión y reventa—. Una zona con contraseña no convierte por sí sola una oferta en privada. Alba Capital analizará en cada caso qué encuadre corresponde, y no presenta la sola existencia de esta sección como autorización para realizar actividades reguladas.",
        "Adquirir un token no implica recibir una escritura ni ser propietario directo de una parte física del bien.",
      ],
    },
    {
      title: "6. Declaraciones de quien postula",
      items: [
        "Que la información y documentación presentadas son veraces, completas y actuales, y que se compromete a actualizarlas si cambian.",
        "Que es titular del activo o cuenta con facultades suficientes para presentarlo (en caso de representación, que puede acreditarla con la autorización correspondiente).",
        "Que informó las deudas, gravámenes, embargos o cargas que conoce sobre el activo, y que los fondos y bienes involucrados tienen origen lícito.",
        "Que cuenta con las autorizaciones de terceros necesarias para compartir la información (socios, cónyuges, titulares, operadores, locatarios).",
        "Que presentar el proyecto no garantiza aprobación, financiación, emisión de tokens ni ningún resultado.",
      ],
    },
    {
      title: "7. Documentación y confidencialidad",
      items: [
        "La documentación se usa exclusivamente para evaluar la postulación y, en su caso, para el proceso posterior que las partes acuerden. Se almacena en un espacio privado, al que accede el postulante a su expediente y el equipo autorizado de Alba Capital.",
        "Alba Capital no comparte la documentación con terceros ajenos al proceso sin autorización del postulante o requerimiento legal, y no la envía a servicios de inteligencia artificial externos sin información y decisión específicas sobre ese tratamiento.",
        "Se aceptan archivos PDF, JPG/JPEG y PNG, dentro de los límites de cantidad y peso que informe el formulario. Los archivos que no pasen las verificaciones de seguridad serán rechazados.",
        "El postulante puede eliminar sus archivos mientras el expediente esté abierto. Los plazos de conservación se detallan en la Política de Privacidad.",
      ],
    },
    {
      title: "8. Clave de acceso al expediente",
      paragraphs: [
        "Al iniciar una postulación se genera un número de expediente y una clave de acceso personal, que se muestra una única vez. Quien la tenga puede ver y completar el expediente: guardala en un lugar seguro y no la compartas. Alba Capital solo conserva una versión cifrada de la clave y no puede recuperarla; si se pierde, deberá comunicarse con Alba Capital para acreditar su identidad antes de recibir una alternativa.",
      ],
    },
    {
      title: "9. Costos",
      paragraphs: [
        "Enviar la postulación o registrar interés a través de esta sección no genera costo ni obligación de pago. Cualquier honorario, gasto o costo de evaluación, estructuración o seguimiento será informado y acordado por escrito antes de devengarse, y formará parte del contrato definitivo si las partes llegaran a firmarlo.",
      ],
    },
    {
      title: "10. Sin promesas de resultado",
      paragraphs: [
        "Alba Capital no promete rentabilidad fija, capital protegido, liquidez inmediata ni aprobaciones regulatorias. Los contenidos educativos de Tokenizate son generales y no reemplazan el asesoramiento profesional independiente. Las referencias a prácticas de otras plataformas del mundo son ilustrativas y no implican que sus estructuras o contratos sean aplicables en la Argentina.",
      ],
    },
    {
      title: "11. Prevención del lavado de activos",
      paragraphs: [
        "Cuando corresponda según la participación de cada sujeto, podrán requerirse datos y documentación de identificación, origen de fondos y beneficiarios finales conforme a la normativa vigente. La falta de entrega puede impedir la continuidad del proceso.",
      ],
    },
    {
      title: "12. Uso adecuado del sitio",
      paragraphs: [
        "Está prohibido enviar información falsa, suplantar identidades, cargar archivos maliciosos o intentar acceder a expedientes ajenos. Alba Capital puede limitar la frecuencia de solicitudes, rechazar archivos y bloquear accesos para proteger el servicio y los datos.",
      ],
    },
    {
      title: "13. Propiedad intelectual",
      paragraphs: [
        "Los textos, diseños y marcas de este sitio pertenecen a Alba Capital o a sus titulares. La documentación enviada por el postulante sigue siendo de su titularidad; el postulante otorga a Alba Capital el derecho limitado a usarla para evaluar la postulación.",
      ],
    },
    {
      title: "14. Responsabilidad",
      paragraphs: [
        "Alba Capital procura que la información del sitio sea clara y actual, pero no garantiza su ausencia de errores ni la disponibilidad ininterrumpida del servicio. Su responsabilidad se limita a lo que establezca la ley y, en su caso, el contrato definitivo.",
      ],
    },
    {
      title: "15. Cambios y versión",
      paragraphs: [
        `Estas Bases y Condiciones pueden actualizarse. Se registra la versión que cada persona aceptó (vigente: ${TK_LEGAL_VERSION}). Si cambian de manera sustancial, se pedirá una nueva aceptación para continuar.`,
      ],
    },
    {
      title: "16. Ley aplicable y consultas",
      paragraphs: [
        "Se rigen por las leyes de la República Argentina. Para consultas escribí a hola@albacapital.com.",
      ],
    },
  ],
};

export const POLITICA_PRIVACIDAD: LegalDoc = {
  title: "Política de Privacidad de Tokenizate | Alba Capital",
  intro: `Versión ${TK_LEGAL_VERSION}. Explica qué datos personales tratamos en la sección Tokenizate, para qué, cuánto tiempo y qué derechos tenés, conforme a la Ley 25.326 de Protección de los Datos Personales y su normativa complementaria.`,
  sections: [
    {
      title: "1. Quién es responsable",
      paragraphs: ["El responsable del tratamiento es Alba Capital. Podés contactarnos en hola@albacapital.com."],
    },
    {
      title: "2. Qué datos tratamos",
      items: [
        "Si registrás interés como inversor: nombre, correo electrónico, teléfono (opcional), país de residencia, tipo de activo de interés y rango de capital orientativo (opcional, con la opción “Prefiero no indicarlo”).",
        "Si postulás un activo: nombre o razón social, correo, teléfono, país y provincia, relación con el activo, CUIT o identificación equivalente (cuando se solicite), datos del proyecto, valores, deudas o gravámenes declarados y la documentación que adjuntes.",
        "Datos técnicos mínimos: dirección IP protegida mediante una huella irreversible, solo para limitar abusos; y el origen de la visita (parámetros UTM) si llegaste desde una campaña.",
        "Te pedimos no enviar datos sensibles (salud, origen étnico, ideas políticas o religiosas, afiliación sindical, vida sexual) ni documentación que no sea necesaria para evaluar el activo.",
      ],
    },
    {
      title: "3. Para qué los usamos",
      items: [
        "Responder tu solicitud de información y enviarte novedades sobre Tokenizate si lo autorizás.",
        "Evaluar tu postulación, comunicarnos con vos, pedirte documentación adicional y gestionar el expediente.",
        "Cumplir obligaciones legales aplicables (por ejemplo, de identificación y prevención del lavado de activos cuando correspondan).",
        "Proteger el servicio (prevención de spam y accesos indebidos) y dejar un registro de cambios y accesos al expediente.",
        "El consentimiento para recibir comunicaciones comerciales es separado y opcional; podés retirarlo cuando quieras sin que ello afecte la evaluación de tu postulación.",
      ],
    },
    {
      title: "4. Tu consentimiento",
      paragraphs: [
        "Tratamos tus datos con tu consentimiento libre, expreso e informado (art. 5 de la Ley 25.326), que otorgás al aceptar esta política y las Bases y Condiciones. Registramos la fecha y la versión que aceptaste. Las respuestas a los campos marcados como obligatorios son necesarias para poder atender tu solicitud; si no las proporcionás, no podremos procesarla.",
      ],
    },
    {
      title: "5. Con quién compartimos los datos",
      items: [
        "No vendemos tus datos ni los cedemos a terceros sin tu consentimiento o una obligación legal (art. 11).",
        "Usamos proveedores de infraestructura para alojar el sitio, la base de datos y el almacenamiento privado de documentos. Pueden operar servidores fuera de la Argentina; adoptamos medidas para que ese tratamiento sea seguro y proporcionado (art. 12).",
        "El equipo de Alba Capital accede según su rol. Las notificaciones internas enlazan al expediente autenticado y no adjuntan documentos.",
        "Para enviarte confirmaciones y avisos usamos el servicio de correo de Google (Gmail), desde una casilla de Alba Capital. Los correos no incluyen tu clave de acceso ni documentos.",
        "No enviamos tu documentación a servicios de inteligencia artificial externos. Si algún día lo hiciéramos, te informaríamos y pediríamos una decisión específica.",
      ],
    },
    {
      title: "6. Cuánto tiempo los conservamos",
      paragraphs: [
        "Conservamos los datos de interesados mientras mantengas el interés o hasta que pidas su supresión. Los expedientes de postulación se conservan mientras estén abiertos y, una vez cerrados o declarados no elegibles, por el plazo de conservación configurado (24 meses por defecto, ajustable por Alba Capital y siempre informado). Vencido el plazo se eliminan los documentos adjuntos, salvo que una obligación legal exija conservarlos.",
      ],
    },
    {
      title: "7. Cómo protegemos tus datos",
      items: [
        "Almacenamiento privado de documentos: no tienen direcciones públicas y se entregan solo mediante enlaces temporales a quien está autorizado.",
        "Cada expediente se accede con una clave personal que solo vos conocés; guardamos únicamente su versión cifrada.",
        "Verificación del tipo y tamaño real de los archivos, límites de solicitudes y registro de cambios y accesos relevantes.",
        "Comunicaciones cifradas (HTTPS). Ningún sistema es infalible; ante un incidente que te afecte, actuaremos conforme a la normativa vigente.",
      ],
    },
    {
      title: "8. Tus derechos",
      paragraphs: [
        "Podés solicitar acceso, rectificación, actualización o supresión de tus datos escribiendo a hola@albacapital.com, indicando tu número de expediente si corresponde. Respondemos el pedido de acceso dentro de los diez días corridos y los de rectificación o supresión dentro de los cinco días hábiles de recibidos (arts. 14 y 16 de la Ley 25.326). Podemos pedirte acreditar tu identidad.",
        "El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326.",
        "La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
      ],
    },
    {
      title: "9. Cookies y analítica",
      paragraphs: [
        "Esta sección no instala cookies publicitarias ni de seguimiento. Para funcionar guarda en tu navegador, solo durante la sesión, el origen de la visita (UTM) y, si lo pedís, la clave de acceso a tu expediente mientras lo tenés abierto. No enviamos información personal ni documental a herramientas de analítica.",
      ],
    },
    {
      title: "10. Menores de edad",
      paragraphs: ["Tokenizate está dirigido a personas mayores de 18 años. No recopilamos intencionalmente datos de menores."],
    },
    {
      title: "11. Cambios",
      paragraphs: [`Podemos actualizar esta política. Registramos la versión que aceptaste (vigente: ${TK_LEGAL_VERSION}) y te pediremos una nueva aceptación ante cambios sustanciales.`],
    },
  ],
};
