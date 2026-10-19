import { getPlatform, getSocialLabel, getSocialUrl, type SocialLink } from '@/lib/profile'

// Botones de las redes del usuario; cada uno abre su perfil en otra pestana
export function SocialLinks({ links }: { links: SocialLink[] }) {
  const valid = links.flatMap((link) => {
    const url = getSocialUrl(link)
    return url ? [{ ...link, url }] : []
  })
  if (valid.length === 0) return null

  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {valid.map((link) => {
        const Icon = getPlatform(link.platform).icon
        return (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-medium transition duration-150 outline-none hover:bg-muted active:scale-[0.96] focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Icon className="size-4" />
              {getSocialLabel(link)}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
