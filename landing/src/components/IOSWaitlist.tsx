import { useState, FormEvent } from 'react'
import { useInView } from '../hooks/useInView'
import { FORMSPREE_IOS_ID } from '../constants'

export default function IOSWaitlist() {
  const { ref, inView } = useInView(0.1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [ville, setVille] = useState('')
  const [commentaires, setCommentaires] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!prenom.trim()) newErrors.prenom = 'Ton prénom est requis.'
    if (!email.trim()) newErrors.email = 'Ton email est requis.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email invalide.'
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
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_IOS_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          prenom,
          email,
          appareil: 'iPhone',
          ville: ville || 'Non renseignée',
          commentaires: commentaires || '—',
          source: 'landing-ios-waitlist',
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
    <section id="ios" className="bg-surface pt-6 pb-14 md:pt-8 md:pb-20">
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
              <h3 className="text-xl font-bold mb-2">C'est noté !</h3>
              <p className="text-secondary-text">
                On te prévient dès que LatinGo sort sur iPhone.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                iOS arrive bientôt
              </h2>
              <p className="text-secondary-text text-center mb-8">
                L'app est disponible sur Android. Inscris-toi pour être informé en
                premier du lancement iPhone.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Prénom</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
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
                    placeholder="ton.prenom@icloud.com"
                    className="w-full bg-background border border-[#2a2a35] rounded-lg px-4 py-3 text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
                  />
                  {errors.email && <p className="text-coral text-sm mt-1">{errors.email}</p>}
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

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Commentaires <span className="text-secondary-text font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    value={commentaires}
                    onChange={(e) => setCommentaires(e.target.value)}
                    placeholder="Une question, une suggestion..."
                    rows={3}
                    className="w-full bg-background border border-[#2a2a35] rounded-lg px-4 py-3 text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  data-event="ios_waitlist_submit"
                  disabled={submitting}
                  className="w-full bg-coral text-white font-bold py-4 rounded-lg hover:bg-coral/90 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Envoi en cours...' : 'Me prévenir pour iOS →'}
                </button>

                {submitError && (
                  <p className="text-coral text-sm text-center">{submitError}</p>
                )}

                <p className="text-secondary-text text-sm text-center">
                  Pas de spam. Juste une notification au lancement iOS.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
