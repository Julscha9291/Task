import React from 'react';
import './Impressum.css';

const Impressum = () => {
  return (
    <div className="impressum-container">
      <h1 className='h1-impressum'> Impressum</h1>
      <h2 className='h2-impressum'> Angaben gemäß § 5 TMG</h2>
      <p>
        Julian Schäpermeier <br />
        Von-den-Berken Straße 3c <br />
        44141 Dortmund
      </p>
      
     <h2 className='h2-impressum'> Kontakt</h2>
      <p>
        Telefon: 0176/43836260 <br />
        E-Mail: info@julian-schaepermeier.de
      </p>
      
    </div>
  );
};

export default Impressum;
