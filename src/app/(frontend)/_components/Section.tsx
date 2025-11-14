import React, { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
}

const Section: React.FC<SectionProps> = ({ children }) => {
  return <div className="layout-container py-8 lg:py-16">{children}</div>;
};

export default Section;
