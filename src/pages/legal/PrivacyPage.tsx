import { ContactLink, LegalList, LegalPage, LegalSection } from './LegalPage'

// Aviso de privacidad. Se puede leer sin cuenta (se enlaza desde el registro)
// ponytail: borrador hecho a partir de como funciona la app; que lo revise alguien que sepa de leyes
export function PrivacyPage() {
  return (
    <LegalPage title="Aviso de privacidad" updated="25 de octubre de 2026">
      <p>
        En Niche cuidamos tus datos. Aqui te explicamos que informacion guardamos, para que la usamos, con quien
        la compartimos y como puedes verla, corregirla o borrarla.
      </p>

      <LegalSection title="Que datos guardamos">
        <LegalList>
          <li>
            <strong>Tu cuenta:</strong> correo, usuario y contrasena (guardada cifrada; nadie puede leerla).
          </li>
          <li>
            <strong>Tu perfil:</strong> nombre, foto de perfil, portada, descripcion y redes que tu agregues.
          </li>
          <li>
            <strong>Lo que subes:</strong> fotos y datos de tus prendas, outfits, publicaciones, comentarios, likes,
            ventas y los mensajes de tus chats.
          </li>
          <li>
            <strong>Ubicacion:</strong> el pais y la ciudad que elijas para ver ventas cercanas y el clima (se
            guardan en tu navegador). Tu ubicacion exacta solo se usa si tocas "Usar mi ubicacion" al marcar el
            lugar de entrega de una venta, y ese punto se muestra en la venta.
          </li>
          <li>
            <strong>Actividad:</strong> a quien sigues, que ventas guardas, que ventas abriste (solo para contar
            vistas; nadie ve quien fue) y los reportes que hagas.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Para que los usamos">
        <LegalList>
          <li>Crear y mantener tu cuenta y dejarte entrar.</li>
          <li>Mostrar tu closet, tus publicaciones y tus ventas a quien tu decidas.</li>
          <li>Que compradores y vendedores puedan escribirse por el chat.</li>
          <li>Enviarte avisos dentro de la app (likes, comentarios, seguidores, rebajas).</li>
          <li>Revisar reportes y mantener la comunidad segura.</li>
        </LegalList>
        <p>No vendemos tus datos ni los usamos para publicidad.</p>
      </LegalSection>

      <LegalSection title="Lo que ven otras personas">
        <p>
          Tu usuario, nombre, foto, descripcion, publicaciones, comentarios y ventas son publicos dentro de Niche.
          Tu closet solo se ve si lo haces publico, y cada prenda puede ser privada. Tus mensajes solo los ven las
          personas del chat; si alguien reporta un mensaje, el equipo de Niche puede leer ese mensaje para revisarlo.
        </p>
      </LegalSection>

      <LegalSection title="Con quien compartimos datos">
        <p>Usamos servicios de terceros para que la app funcione:</p>
        <LegalList>
          <li>
            <strong>Supabase:</strong> guarda la base de datos, las fotos y las cuentas.
          </li>
          <li>
            <strong>Vercel:</strong> aloja la pagina de Niche y cuenta las visitas de forma anonima (que paginas
            se abren, desde que pais y tipo de dispositivo), sin cookies y sin saber quien eres.
          </li>
          <li>
            <strong>Open-Meteo:</strong> recibe la ubicacion aproximada de tu ciudad para mostrar el clima.
          </li>
          <li>
            <strong>Hugging Face:</strong> si usas "Quitar fondo" en una foto, tu navegador descarga de ahi la
            herramienta que lo hace (una sola vez). Tu foto no se envia: el fondo se quita en tu dispositivo.
          </li>
          <li>
            <strong>OpenStreetMap:</strong> muestra los mapas de los lugares de entrega y ubica las ciudades.
          </li>
        </LegalList>
        <p>Fuera de estos servicios, solo compartiriamos datos si una autoridad lo pide conforme a la ley.</p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>Puedes ejercer en cualquier momento tus derechos de acceso, rectificacion, cancelacion y oposicion:</p>
        <LegalList>
          <li>
            <strong>Ver y corregir:</strong> todo lo que guardamos de ti esta en tu perfil, tu closet y tus ventas, y
            lo puedes editar ahi mismo.
          </li>
          <li>
            <strong>Borrar:</strong> en Perfil, Mas opciones, Borrar mi cuenta. Se borra para siempre tu cuenta con
            todo su contenido y sus fotos.
          </li>
          <li>
            <strong>Cualquier otra solicitud</strong> (por ejemplo, si ya no puedes entrar a tu cuenta o te opones a
            algun uso de tus datos): escribenos a <ContactLink /> y te respondemos en un maximo de 20 dias habiles.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Cambios a este aviso">
        <p>
          Si cambiamos este aviso, actualizaremos la fecha de arriba y te avisaremos dentro de la app cuando el
          cambio sea importante.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
