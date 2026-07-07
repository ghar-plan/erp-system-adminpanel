import { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const AuthLayout: FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#050505] relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {/* Abstract Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]"></div>
        
        {/* Animated Glow Orbs */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/50 dark:bg-blue-900/40 blur-[120px] animate-pulse duration-[8s]"></div>
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-200/50 dark:bg-purple-900/40 blur-[100px] animate-pulse duration-[12s]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-200/50 dark:bg-indigo-900/40 blur-[130px] animate-pulse duration-[10s]"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md z-10 relative group">
        {/* Card Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/60 to-purple-200/60 dark:from-blue-900/50 dark:to-purple-900/50 rounded-[2rem] blur-xl opacity-60 dark:opacity-40 group-hover:opacity-100 dark:group-hover:opacity-60 transition duration-700"></div>
        
        {/* Glassmorphic Card */}
        <div className="relative bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 p-8 sm:p-10 transition-all duration-300">
          {/* Subtle inner highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"></div>
          
          <div className="relative z-10 animate-slide-up">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
