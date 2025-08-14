import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-platinum border-t border-smoke mt-16">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-mist">
        <p>&copy; {new Date().getFullYear()} Lea's Aesthetics Clinical Academy. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
