import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{ backgroundColor: '#1E3A24', borderTopColor: '#8A9A5B' }} className="border-t mt-maerose-section-desktop md:mt-maerose-section-mobile">
      <div className="max-w-maerose-container mx-auto py-8 px-maerose-gutter-desktop md:px-maerose-gutter-mobile">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-heading-3 text-ivory-white uppercase tracking-wide mb-4">
              MAEROSE
            </h3>
            <p className="text-body-regular text-soft-mist-grey leading-relaxed">
              Where heritage meets innovation in aesthetic medicine excellence.
            </p>
          </div>
          
          {/* Navigation Links */}
          <div>
            <h4 className="text-body-large text-champagne-gold font-semibold uppercase tracking-wide mb-4">
              NAVIGATION
            </h4>
            <ul className="space-y-2">
              <li><a href="/clinic" className="text-body-regular text-soft-mist-grey hover:text-champagne-gold transition-colors duration-interaction maerose-ease maerose-focus">CLINIC SERVICES</a></li>
              <li><a href="/academy" className="text-body-regular text-soft-mist-grey hover:text-champagne-gold transition-colors duration-interaction maerose-ease maerose-focus">ACADEMY</a></li>
              <li><a href="/demo-booking" className="text-body-regular text-soft-mist-grey hover:text-champagne-gold transition-colors duration-interaction maerose-ease maerose-focus">BOOK APPOINTMENT</a></li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h4 className="text-body-large text-champagne-gold font-semibold uppercase tracking-wide mb-4">
              CONTACT
            </h4>
            <div className="space-y-2 text-body-regular text-soft-mist-grey">
              <p>Exclusive by Appointment</p>
              <p>London, United Kingdom</p>
              <p className="text-champagne-gold hover:text-champagne-highlight transition-colors duration-interaction maerose-ease cursor-pointer maerose-focus">
                hello@maerose.co.uk
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-6 border-t border-estate-border-grey text-center">
          <p className="text-body-small text-soft-mist-grey">
            &copy; {currentYear} MAEROSE AESTHETICS. ALL RIGHTS RESERVED.
            <span className="mx-4 text-champagne-gold">•</span>
            CRAFTED WITH PRECISION
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
