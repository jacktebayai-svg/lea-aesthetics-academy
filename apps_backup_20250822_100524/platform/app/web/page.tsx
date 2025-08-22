import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1E3A24' }}>
      {/* Hero Section */}
      <main className="max-w-maerose-container mx-auto px-maerose-gutter-desktop md:px-maerose-gutter-mobile py-maerose-section-desktop md:py-maerose-section-mobile">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading - Maerose Typography */}
          <h1 className="text-heading-1 md:text-[72px] font-bold mb-8 tracking-tight" style={{ color: '#F9F4E5' }}>
            MAEROSE
            <br />
            <span style={{ color: '#7C283C' }}>AESTHETICS</span>
          </h1>
          
          {/* Tagline - Maerose Body Large */}
          <p className="text-body-large md:text-[22px] text-soft-mist-grey mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Where heritage meets innovation. Elevating aesthetic medicine 
            through exclusive training and refined clinical excellence.
          </p>

          {/* Action Buttons - Maerose Button System */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-maerose-component-gap-desktop md:mb-maerose-component-gap-mobile">
            <Link 
              href="/demo-booking"
              className="maerose-button-primary px-10 py-4 text-body-regular font-semibold uppercase tracking-wide maerose-focus"
            >
              EXPERIENCE DEMO BOOKING
            </Link>
            <Link 
              href="/academy"
              className="maerose-button-secondary px-10 py-4 text-body-regular font-semibold uppercase tracking-wide maerose-focus"
            >
              EXPLORE ACADEMY
            </Link>
            <Link 
              href="/clinic"
              className="bg-transparent text-ivory-white px-10 py-4 rounded-maerose font-semibold border-2 border-estate-border-grey hover:border-champagne-gold hover:text-champagne-gold transition-all duration-interaction maerose-ease text-body-regular uppercase tracking-wide maerose-focus"
            >
              CLINIC SERVICES
            </Link>
          </div>

          {/* Features Grid - Maerose Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-maerose-component-gap-desktop md:mt-maerose-component-gap-mobile">
            <div className="maerose-card">
              <div className="text-5xl mb-6 text-champagne-gold">💎</div>
              <h3 className="text-heading-3 text-ivory-white mb-4 uppercase tracking-wide">
                EXCLUSIVE TRAINING
              </h3>
              <p className="text-body-regular text-soft-mist-grey leading-relaxed">
                Master advanced techniques through our comprehensive curriculum 
                designed for discerning practitioners.
              </p>
            </div>
            
            <div className="maerose-card">
              <div className="text-5xl mb-6 text-champagne-gold">🏛️</div>
              <h3 className="text-heading-3 text-ivory-white mb-4 uppercase tracking-wide">
                CLINICAL EXCELLENCE
              </h3>
              <p className="text-body-regular text-soft-mist-grey leading-relaxed">
                Experience unparalleled clinical services in our state-of-the-art 
                facilities with renowned practitioners.
              </p>
            </div>
            
            <div className="maerose-card">
              <div className="text-5xl mb-6 text-champagne-gold">👑</div>
              <h3 className="text-heading-3 text-ivory-white mb-4 uppercase tracking-wide">
                HERITAGE LUXURY
              </h3>
              <p className="text-body-regular text-soft-mist-grey leading-relaxed">
                Join an exclusive community where tradition meets innovation 
                in the pursuit of aesthetic perfection.
              </p>
            </div>
          </div>

          {/* Status Badge - Maerose Subtle */}
          <div className="mt-16 inline-flex items-center gap-3 bg-deep-charcoal/50 px-6 py-3 rounded-maerose border border-estate-border-grey">
            <div className="w-3 h-3 bg-champagne-gold rounded-full animate-pulse opacity-80"></div>
            <span className="text-body-small text-soft-mist-grey font-medium tracking-wide uppercase">PLATFORM STATUS: ACTIVE DEVELOPMENT</span>
          </div>
        </div>
      </main>
    </div>
  );
}
