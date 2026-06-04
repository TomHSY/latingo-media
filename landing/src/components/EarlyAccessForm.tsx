import { useState, FormEvent } from 'react'
import { useInView } from '../hooks/useInView'

// Formspree form endpoint
const FORMSPREE_ID = 'xbdellkv'

export default function EarlyAccessForm() {
  const { ref, inView } = useInView(0.1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [device, setDevice] = useState<'Android' | 'iPhone' | ''>('')
  const [ville, setVille] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!prenom.trim()) newErrors.prenom = 'Ton prénom est requis.'
    if (!email.trim()) newErrors.email = 'Ton email est requis.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email invalide.'
    if (!device) newErrors.device = 'Choisis ton appareil.'
    return newErrors
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          prenom,
          email,
          appareil: device,
          ville: ville || 'Non renseignée',
        }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        setSubmitError('Une erreur est survenue. Réessaie dans un instant.')
      }
    } catch {
      setSubmitError('Pas de connexion. Vérifie ton réseau et réessaie.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="inscription" className="bg-background pt-6 pb-14 md:pt-8 md:pb-20">
      <div
        ref={ref}
        className={`max-w-[480px] mx-auto px-4 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-surface rounded-2xl p-8 md:p-10">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-2">Demande envoyée !</h3>
              <p className="text-secondary-text">
                On te recontacte très vite avec ton lien de téléchargement.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                Rejoins l'accès anticipé.
              </h2>
              <p className="text-secondary-text text-center mb-3">
                L'app est prête. On ouvre l'accès par vagues aux danseurs de la région.
              </p>
              <p className="text-secondary-text text-center text-sm mb-8">
                🎯 Places limitées — les premiers inscrits accèdent en priorité et participent à façonner l'app.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Prénom</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    onFocus={() => {
                      const el = document.querySelector('[data-event="form_focus"]')
                      if (!el) document.querySelector('form')?.setAttribute('data-event', 'form_focus')
                    }}
                    data-event="form_focus"
                    placeholder="Ton prénom"
                    className="w-full bg-background border border-[#2a2a35] rounded-lg px-4 py-3 text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
                  />
                  {errors.prenom && <p className="text-coral text-sm mt-1">{errors.prenom}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton.prenom@gmail.com"
                    className="w-full bg-background border border-[#2a2a35] rounded-lg px-4 py-3 text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
                  />
                  {errors.email && <p className="text-coral text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Ton téléphone</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      data-event="device_android"
                      onClick={() => setDevice('Android')}
                      className={`py-3 rounded-lg font-medium transition-colors ${
                        device === 'Android'
                          ? 'bg-coral text-white font-bold'
                          : 'bg-[#2a2a35] text-secondary-text hover:text-primary-text'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      type="button"
                      data-event="device_iphone"
                      onClick={() => setDevice('iPhone')}
                      className={`py-3 rounded-lg font-medium transition-colors ${
                        device === 'iPhone'
                          ? 'bg-coral text-white font-bold'
                          : 'bg-[#2a2a35] text-secondary-text hover:text-primary-text'
                      }`}
                    >
                      iPhone
                    </button>
                  </div>
                  {errors.device && <p className="text-coral text-sm mt-1">{errors.device}</p>}
                  {device === 'Android' && (
                    <p className="text-secondary-text text-sm mt-2">
                      💡 Utilise ton adresse <span className="text-primary-text font-medium">Gmail</span> pour recevoir l'accès directement sur le Play Store.
                    </p>
                  )}
                  {device === 'iPhone' && (
                    <p className="text-secondary-text text-sm mt-2">
                      📱 L'accès anticipé est disponible sur Android. La version iPhone arrive très bientôt — inscris-toi pour être dans les <span className="text-primary-text font-medium">premiers informés</span> dès le lancement iOS.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Ville</label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder="Bayonne, Pau, Dax..."
                    className="w-full bg-background border border-[#2a2a35] rounded-lg px-4 py-3 text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  data-event="form_submit"
                  disabled={submitting}
                  className="w-full bg-coral text-white font-bold py-4 rounded-lg hover:bg-coral/90 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Envoi en cours...' : 'Je veux mon accès →'}
                </button>

                {submitError && (
                  <p className="text-coral text-sm text-center">{submitError}</p>
                )}

                <p className="text-secondary-text text-sm text-center">
                  Pas de spam. Juste un lien de téléchargement quand c'est ton tour.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
