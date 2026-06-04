export default function Footer() {
  return (
    <footer className="bg-[#0a0a0e] py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/images/icon.png" alt="LatinGo" className="w-6 h-6 rounded-md" />
          <span className="font-bold text-primary-text">LatinGo</span>
        </div>

        <div className="border-t border-[#1C1C24] my-6" />

        <p className="text-secondary-text mb-2">Tu organises des soirées SBK ?</p>
        <a
          href="mailto:contact@latingo.fr?subject=Référencer mes événements"
          data-event="organizer_contact"
          className="text-coral font-medium hover:underline"
        >
          Référence tes événements gratuitement
        </a>

        <div className="border-t border-[#1C1C24] my-6" />

        <div className="text-secondary-text text-sm space-y-1">
          <p>© 2026 LatinGo. Tous droits réservés.</p>
          <p>contact@latingo.fr</p>
        </div>
      </div>
    </footer>
  )
}
