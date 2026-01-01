import { Bungee } from 'next/font/google';

const bungee = Bungee({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo = ({ size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${bungee.className} uppercase tracking-wider leading-none`}
      style={{
        color: 'transparent',
        WebkitTextStroke: '1.5px #70B8FF',
        background: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 3px,
            rgba(0, 217, 255, 0.35) 3px,
            rgba(0, 217, 255, 0.35) 4px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 3px,
            rgba(0, 217, 255, 0.35) 3px,
            rgba(0, 217, 255, 0.35) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 6px,
            rgba(0, 217, 255, 0.35) 6px,
            rgba(0, 217, 255, 0.35) 7px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 6px,
            rgba(0, 217, 255, 0.35) 6px,
            rgba(0, 217, 255, 0.35) 7px
          )
        `,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }}
    >
      PINNACLE
    </div>
  );
};
