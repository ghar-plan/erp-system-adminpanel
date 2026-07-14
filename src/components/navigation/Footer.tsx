import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-card border-t border-border-main py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground select-none mt-auto">
      <div>
        <span>&copy; {currentYear} </span>
        <span className="font-bold text-foreground">Ghar Plans</span>
        <span>. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
