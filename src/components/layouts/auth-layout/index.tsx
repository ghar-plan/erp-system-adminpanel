import { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const AuthLayout: FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Decorative Blur Blobs */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-tertiary/10 blur-[130px] pointer-events-none animate-pulse duration-[8s]"></div>
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-primary/10 blur-[130px] pointer-events-none animate-pulse duration-[10s]"></div>

      {/* Main Card */}
      <div className="w-full max-w-md z-10 animate-slide-up">
        <div className="bg-card rounded-2xl shadow-xl border border-border-main p-8 sm:p-10 transition-colors duration-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
