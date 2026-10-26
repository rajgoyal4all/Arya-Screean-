import React from 'react';

export type LogoStyleId =
  | 'arya2_3d'
  | 'squeegee'
  | 'cmyk_matrix'
  | 'hex_shield'
  | 'monogram'
  | 'cylinders'
  | 'royal_crest';

export type AccentColorId = 'emerald' | 'blue' | 'purple' | 'red' | 'amber' | 'slate';

export interface AryaLogoProps {
  customLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  logoStyle?: string;
  accentColor?: string;
  shopName?: string;
  tagline?: string;
  className?: string;
}

interface ColorConfig {
  gradient: string;
  accentText: string;
  accentHex: string;
  subColor: string;
  borderHex: string;
}

const COLOR_MAP: Record<string, ColorConfig> = {
  emerald: {
    gradient: 'from-emerald-600 via-teal-700 to-slate-950',
    accentText: 'text-emerald-600',
    accentHex: '#059669',
    subColor: '#34D399',
    borderHex: '#10B981',
  },
  blue: {
    gradient: 'from-blue-600 via-indigo-700 to-slate-950',
    accentText: 'text-blue-600',
    accentHex: '#2563EB',
    subColor: '#60A5FA',
    borderHex: '#3B82F6',
  },
  purple: {
    gradient: 'from-purple-600 via-violet-800 to-slate-950',
    accentText: 'text-purple-600',
    accentHex: '#9333EA',
    subColor: '#C084FC',
    borderHex: '#A855F7',
  },
  red: {
    gradient: 'from-rose-600 via-red-800 to-slate-950',
    accentText: 'text-rose-600',
    accentHex: '#E11D48',
    subColor: '#FB7185',
    borderHex: '#F43F5E',
  },
  amber: {
    gradient: 'from-amber-500 via-orange-700 to-slate-950',
    accentText: 'text-amber-600',
    accentHex: '#D97706',
    subColor: '#FBBF24',
    borderHex: '#F59E0B',
  },
  slate: {
    gradient: 'from-slate-700 via-zinc-800 to-black',
    accentText: 'text-slate-800',
    accentHex: '#334155',
    subColor: '#94A3B8',
    borderHex: '#64748B',
  },
};

export const AryaLogo: React.FC<AryaLogoProps> = ({
  customLogoUrl,
  size = 'md',
  showSubtitle = true,
  logoStyle = 'squeegee',
  accentColor = 'emerald',
  shopName = 'ARYA SCREEN',
  tagline = 'Flex • DTP • Printing • Designing',
  className = '',
}) => {
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [customLogoUrl]);

  const color = COLOR_MAP[accentColor] || COLOR_MAP.emerald;

  // Split shop name for stylized 2-word rendering if applicable
  const nameWords = shopName.trim().split(' ');
  const firstWord = nameWords[0] || 'ARYA';
  const remainingWords = nameWords.slice(1).join(' ') || (nameWords.length === 1 ? '' : 'SCREEN');

  if (customLogoUrl && !imageFailed) {
    const imgSizeClass =
      size === 'sm'
        ? 'h-9 w-9'
        : size === 'md'
        ? 'h-11 w-11'
        : size === 'lg'
        ? 'h-16 w-16'
        : 'h-24 w-24';
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={customLogoUrl}
          alt={shopName}
          onError={() => setImageFailed(true)}
          className={`${imgSizeClass} object-cover rounded-xl shadow-md border border-slate-200/80 shrink-0 bg-white`}
        />
        {showSubtitle && (
          <div className="min-w-0">
            <div className="font-black tracking-tight text-slate-900 text-lg leading-none flex items-center gap-1.5 flex-wrap">
              <span>{firstWord}</span>
              {remainingWords && <span className={color.accentText}>{remainingWords}</span>}
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-1 truncate">
              {tagline}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Crisp high-resolution SVG artwork
  const iconSize = size === 'sm' ? 32 : size === 'md' ? 44 : size === 'lg' ? 60 : 76;
  const textSize =
    size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-2xl' : 'text-3xl';
  const subTextSize =
    size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[11px]' : size === 'lg' ? 'text-xs' : 'text-sm';

  const renderVectorGlyph = () => {
    switch (logoStyle) {
      case 'arya2_3d':
        return (
          <svg viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1">
            {/* CMYK Splatters */}
            <circle cx="10" cy="12" r="3.5" fill="#00E5FF" opacity="0.9" />
            <circle cx="44" cy="10" r="4.5" fill="#FF007F" opacity="0.9" />
            <circle cx="8" cy="42" r="3" fill="#FFD700" opacity="0.95" />
            <circle cx="46" cy="42" r="3.5" fill="#00E5FF" opacity="0.85" />
            {/* 3D Bold Typography Arya2 */}
            <text x="27" y="38" textAnchor="middle" fontSize="23" fontWeight="900" fontFamily="sans-serif" fill="#0F172A" stroke="#0F172A" strokeWidth="7" strokeLinejoin="round">Arya2</text>
            <text x="27" y="38" textAnchor="middle" fontSize="23" fontWeight="900" fontFamily="sans-serif" fill="#E11D48" stroke="#E11D48" strokeWidth="4" strokeLinejoin="round">Arya2</text>
            <text x="27" y="36" textAnchor="middle" fontSize="23" fontWeight="900" fontFamily="sans-serif" fill="#FACC15">Arya2</text>
            <text x="27" y="35" textAnchor="middle" fontSize="23" fontWeight="900" fontFamily="sans-serif" fill="#FEF08A">Arya2</text>
          </svg>
        );

      case 'cmyk_matrix':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
            {/* CMYK overlapping translucent printing dots */}
            <circle cx="20" cy="18" r="9" fill="#00E5FF" fillOpacity="0.75" />
            <circle cx="28" cy="18" r="9" fill="#FF007F" fillOpacity="0.75" />
            <circle cx="24" cy="26" r="9" fill="#FFD700" fillOpacity="0.75" />
            <circle cx="24" cy="22" r="5" fill="#0F172A" />
            {/* Squeegee Stroke across */}
            <path d="M12 36L36 36" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M16 33L32 33" stroke={color.subColor} strokeWidth="1.5" strokeLinecap="round" />
            {/* Registration Crosshair */}
            <line x1="24" y1="4" x2="24" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="38" y1="24" x2="44" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'hex_shield':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
            {/* Hexagonal Industrial Printing Shield */}
            <path
              d="M24 6L39 15V33L24 42L9 33V15L24 6Z"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="white"
              fillOpacity="0.08"
            />
            {/* Inner Bold Letter A */}
            <path d="M18 32L24 16L30 32" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 27H28" stroke={color.subColor} strokeWidth="3" strokeLinecap="round" />
            {/* Roller circles */}
            <circle cx="24" cy="11" r="2" fill="#06B6D4" />
            <circle cx="33" cy="27" r="2" fill="#EC4899" />
            <circle cx="15" cy="27" r="2" fill="#FACC15" />
          </svg>
        );

      case 'monogram':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
            {/* Architectural Diamond Frame */}
            <rect x="7" y="7" width="34" height="34" rx="10" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
            {/* Precision 'A' Monogram with Screen Raster Lines */}
            <path d="M15 35L24 13L33 35" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 28H29" stroke={color.subColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="24" cy="20" r="2.5" fill="white" />
            {/* Ink drop */}
            <path d="M24 38C22 38 21 36.5 24 33C27 36.5 26 38 24 38Z" fill="#38BDF8" />
          </svg>
        );

      case 'cylinders':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
            {/* Heavy Offset & Roll-to-Roll Flex Cylinders */}
            <circle cx="24" cy="18" r="8" stroke="white" strokeWidth="2.5" />
            <circle cx="24" cy="18" r="3" fill="white" />
            <circle cx="24" cy="34" r="6" stroke={color.subColor} strokeWidth="2" />
            {/* Paper / Vinyl Web feeding through */}
            <path d="M8 26C14 26 18 20 24 20C30 20 34 26 40 26" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
            <path d="M8 30C14 30 18 24 24 24C30 24 34 30 40 30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        );

      case 'royal_crest':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
            {/* Prestige Seal for Cards & Stationery */}
            <circle cx="24" cy="24" r="18" stroke="white" strokeWidth="2" strokeDasharray="2 3" />
            <circle cx="24" cy="24" r="14" stroke={color.subColor} strokeWidth="1.5" />
            <path d="M18 29L24 16L30 29" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 25H28" stroke={color.subColor} strokeWidth="2.5" />
            {/* Crown peaks on top */}
            <path d="M19 12L24 8L29 12" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'squeegee':
      default:
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
            {/* Screen Printing Frame */}
            <rect
              x="6"
              y="6"
              width="36"
              height="36"
              rx="9"
              stroke="white"
              strokeWidth="2"
              strokeOpacity="0.4"
            />
            {/* Screen Silk Mesh Grid pattern */}
            <path d="M14 12V36M22 12V36M30 12V36" stroke="white" strokeWidth="1" strokeOpacity="0.15" />
            <path d="M10 18H38M10 26H38M10 34H38" stroke="white" strokeWidth="1" strokeOpacity="0.15" />

            {/* Bold Letter A with high-contrast bevel */}
            <path
              d="M16 35L24 13L32 35"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dynamic Squeegee Crossbar with vibrant ink sweep */}
            <path d="M18 27H30" stroke={color.subColor} strokeWidth="4" strokeLinecap="round" />

            {/* Precision CMYK Registration Dots */}
            <circle cx="10" cy="10" r="2.2" fill="#06B6D4" />
            <circle cx="38" cy="10" r="2.2" fill="#EC4899" />
            <circle cx="10" cy="38" r="2.2" fill="#FACC15" />
            <circle cx="38" cy="38" r="2.2" fill={color.borderHex} />
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Emblem */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br ${color.gradient} text-white shadow-md shadow-slate-950/25 shrink-0 transition-transform duration-200`}
        style={{ width: iconSize, height: iconSize }}
      >
        {renderVectorGlyph()}
      </div>

      {showSubtitle && (
        <div className="min-w-0">
          <div
            className={`font-black tracking-tight text-slate-900 ${textSize} leading-none flex items-center gap-1.5 flex-wrap`}
          >
            <span>{firstWord}</span>
            {remainingWords ? (
              <span className={`${color.accentText} font-extrabold`}>{remainingWords}</span>
            ) : null}
          </div>
          <div
            className={`${subTextSize} font-bold tracking-wider text-slate-500 uppercase mt-1 flex items-center gap-1.5 flex-wrap truncate`}
          >
            <span>{tagline}</span>
          </div>
        </div>
      )}
    </div>
  );
};
