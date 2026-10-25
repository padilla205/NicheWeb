import { Link } from 'react-router'
import { LegalList, LegalPage, LegalSection } from './LegalPage'

// Terminos de uso. Se pueden leer sin cuenta (se enlazan desde el registro)
// ponytail: borrador hecho a partir de como funciona la app; que lo revise alguien que sepa de leyes
export function TermsPage() {
  return (
    <LegalPage title="Terminos de uso" updated="25 de octubre de 2026">
      <p>
        Bienvenido a Niche, una app para organizar tu closet, crear outfits, compartirlos y comprar o vender ropa
        entre personas. Al crear una cuenta o usar Niche aceptas estos terminos. Si no estas de acuerdo, no uses la
        app.
      </p>

      <LegalSection title="Quien puede usar Niche">
        <p>
          Debes ser mayor de edad o contar con permiso de tu madre, padre o tutor. Eres responsable de lo que pase
          con tu cuenta: usa una contrasena segura y no la compartas.
        </p>
      </LegalSection>

      <LegalSection title="Tu contenido">
        <p>
          Las fotos, publicaciones, comentarios y ventas que subes siguen siendo tuyos. Al subirlos nos das permiso
          de guardarlos y mostrarlos dentro de Niche a quien tu elijas, solo para que la app funcione. Puedes
          borrarlos cuando quieras, o borrar tu cuenta completa desde Perfil, Mas opciones.
        </p>
        <p>Solo sube fotos que sean tuyas o que tengas permiso de usar.</p>
      </LegalSection>

      <LegalSection title="Reglas de la comunidad">
        <p>En Niche no se permite:</p>
        <LegalList>
          <li>Acosar, amenazar, insultar o discriminar a otras personas.</li>
          <li>Publicar contenido sexual, violento o que muestre a personas sin su permiso.</li>
          <li>Vender articulos robados, ilegales, peligrosos o que no sean ropa, calzado o accesorios.</li>
          <li>Vender copias o imitaciones haciendolas pasar por originales.</li>
          <li>Enganar sobre el estado, la talla o el precio de una prenda.</li>
          <li>Hacer spam, crear cuentas falsas o hacerte pasar por alguien mas.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Marketplace: compras y ventas">
        <LegalList>
          <li>
            Niche solo pone en contacto a quien vende con quien compra. No es parte de la venta, no cobra comision y
            no procesa pagos.
          </li>
          <li>
            El trato se cierra en persona entre las dos partes. Cada quien es responsable de revisar la prenda, el
            precio y la forma de pago.
          </li>
          <li>
            Niche no garantiza la calidad, autenticidad o estado de las prendas, ni que la otra persona cumpla lo
            acordado.
          </li>
          <li>Te recomendamos verte en un lugar publico y pagar solo al recibir la prenda.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Reportes y cuentas">
        <p>
          Puedes reportar publicaciones, comentarios, ventas, perfiles y mensajes. Si algo rompe estas reglas
          podemos ocultarlo o borrarlo, y en casos graves suspender o borrar la cuenta. Cuando varias personas
          reportan algo, se oculta automaticamente mientras lo revisamos.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilidad">
        <p>
          Niche se ofrece tal como esta. Hacemos lo posible para que funcione bien y de forma segura, pero no podemos
          garantizar que nunca falle. No somos responsables de los tratos entre personas ni de lo que publiquen
          otros usuarios.
        </p>
      </LegalSection>

      <LegalSection title="Tus datos">
        <p>
          Como usamos tu informacion se explica en el{' '}
          <Link to="/privacidad" className="underline underline-offset-4">
            Aviso de privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Cambios a estos terminos">
        <p>
          Podemos actualizar estos terminos. Si el cambio es importante te avisaremos dentro de la app; si sigues
          usando Niche despues del aviso, aceptas los terminos nuevos. Estos terminos se rigen por las leyes de
          Mexico.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
