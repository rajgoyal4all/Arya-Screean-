/**
 * High-fidelity SVG Sample Previews & Artwork Generators for ARYA 2 / ARYA SCREEN
 * Generates realistic print-shop proof mockups for banners, visiting cards, wedding cards, bill books, etc.
 */

// Helper to encode SVG into safe data URL
export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const SAMPLE_ARTWORKS = {
  flexBanner: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="40%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#311042" />
        </linearGradient>
        <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="50%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <filter id="bannerShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.3" />
        </filter>
        <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
        </pattern>
      </defs>
      
      <!-- Flex Fabric Texture Background -->
      <rect x="10" y="10" width="780" height="300" rx="8" fill="url(#bgGrad)" filter="url(#bannerShadow)" stroke="#4338ca" stroke-width="3" />
      <rect x="10" y="10" width="780" height="300" fill="url(#gridPattern)" />
      
      <!-- Reinforcement Border Stitching -->
      <rect x="22" y="22" width="756" height="276" rx="4" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6" />

      <!-- Brass Eyelets (Grommets) in 4 corners & midpoints -->
      <circle cx="28" cy="28" r="7" fill="#78350f" stroke="#fef08a" stroke-width="2" />
      <circle cx="400" cy="28" r="7" fill="#78350f" stroke="#fef08a" stroke-width="2" />
      <circle cx="772" cy="28" r="7" fill="#78350f" stroke="#fef08a" stroke-width="2" />
      <circle cx="28" cy="292" r="7" fill="#78350f" stroke="#fef08a" stroke-width="2" />
      <circle cx="400" cy="292" r="7" fill="#78350f" stroke="#fef08a" stroke-width="2" />
      <circle cx="772" cy="292" r="7" fill="#78350f" stroke="#fef08a" stroke-width="2" />

      <!-- Top Ribbon / Sub-headline -->
      <rect x="240" y="38" width="320" height="28" rx="14" fill="#dc2626" />
      <text x="400" y="56" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">
        ★ GRAND OPENING CELEBRATION ★
      </text>

      <!-- Main Shop Brand Name -->
      <text x="400" y="125" font-family="'Plus Jakarta Sans', sans-serif" font-size="44" font-weight="900" fill="url(#goldText)" text-anchor="middle" letter-spacing="1">
        SHRI RADHEY SWEETS
      </text>
      
      <!-- Hindi / Regional Tagline -->
      <text x="400" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600" fill="#e2e8f0" text-anchor="middle" letter-spacing="1">
        शुद्ध देशी घी की मिठाइयाँ • काजू कतली • रसमलाई • नमकीन
      </text>

      <!-- Features Pill Highlights -->
      <g transform="translate(140, 195)">
        <rect x="0" y="0" width="160" height="34" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
        <text x="80" y="22" font-family="sans-serif" font-size="12" font-weight="bold" fill="#38bdf8" text-anchor="middle">100% PURE DESI GHEE</text>
        
        <rect x="180" y="0" width="160" height="34" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
        <text x="260" y="22" font-family="sans-serif" font-size="12" font-weight="bold" fill="#34d399" text-anchor="middle">PARTY BULK ORDERS</text>
        
        <rect x="360" y="0" width="160" height="34" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
        <text x="440" y="22" font-family="sans-serif" font-size="12" font-weight="bold" fill="#f43f5e" text-anchor="middle">AC FAMILY HALL</text>
      </g>

      <!-- Bottom Address & Contact Banner -->
      <rect x="25" y="250" width="750" height="40" rx="4" fill="#020617" opacity="0.9" />
      <text x="50" y="275" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fbbf24">📍 Station Road, Opp. Bus Stand, Chhata (Mathura)</text>
      <text x="750" y="275" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="end">📞 Mob: 98370-12345, 94120-67890</text>
      
      <!-- Proof Badge Stamp -->
      <rect x="660" y="32" width="105" height="22" rx="4" fill="#047857" />
      <text x="712" y="47" font-family="monospace" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">STAR FLEX 12x4'</text>
    </svg>
  `),

  visitingCard: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="100%" height="100%">
      <defs>
        <linearGradient id="cardDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a0a0c" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d97706" />
          <stop offset="35%" stop-color="#fef08a" />
          <stop offset="70%" stop-color="#b45309" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <filter id="emboss" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.8" />
        </filter>
      </defs>

      <!-- Velvet Matte Card Body -->
      <rect x="15" y="15" width="570" height="320" rx="12" fill="url(#cardDark)" stroke="#27272a" stroke-width="2" filter="url(#emboss)" />

      <!-- Minimal Gold Geometric Accent -->
      <polygon points="585,15 480,15 585,120" fill="url(#goldGradient)" opacity="0.8" />
      <line x1="450" y1="15" x2="585" y2="150" stroke="#fef08a" stroke-width="1.5" opacity="0.5" />
      
      <!-- Emblem / Logo Icon -->
      <g transform="translate(60, 60)">
        <polygon points="30,0 60,52 0,52" fill="none" stroke="url(#goldGradient)" stroke-width="3" />
        <circle cx="30" cy="32" r="10" fill="url(#goldGradient)" />
      </g>

      <!-- Name & Title -->
      <text x="140" y="85" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="900" fill="url(#goldGradient)" letter-spacing="1">
        V. K. GUPTA
      </text>
      <text x="140" y="108" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#a1a1aa" letter-spacing="2">
        ADVOCATE &amp; LEGAL CONSULTANT
      </text>
      <text x="140" y="125" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="500" fill="#71717a">
        High Court &amp; Civil Court Practice • Mathura Bar Association
      </text>

      <line x1="60" y1="160" x2="540" y2="160" stroke="#27272a" stroke-width="1" />

      <!-- Contact Details 2-Column Grid -->
      <g transform="translate(60, 190)" font-family="sans-serif" font-size="11" fill="#e4e4e7">
        <text x="0" y="0" font-weight="bold" fill="url(#goldGradient)">⚖ SPECIALIZATION:</text>
        <text x="0" y="20" fill="#a1a1aa">Civil, Criminal, Revenue &amp; Cyber Law</text>
        <text x="0" y="42" fill="#a1a1aa">Property Registration &amp; Documentation</text>

        <text x="300" y="0" font-weight="bold" fill="url(#goldGradient)">📞 CONTACT &amp; CHAMBER:</text>
        <text x="300" y="20" fill="#ffffff">+91 94120-98760 / 98370-00000</text>
        <text x="300" y="42" fill="#a1a1aa">Chamber 14, Civil Court, Mathura</text>
        <text x="300" y="64" fill="#a1a1aa">adv.vkgupta@gmail.com</text>
      </g>

      <!-- Finish Label -->
      <rect x="420" y="295" width="145" height="24" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1" />
      <text x="492" y="311" font-family="monospace" font-size="9" font-weight="bold" fill="#fef08a" text-anchor="middle">
        350 GSM VELVET FOIL
      </text>
    </svg>
  `),

  weddingCard: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 650" width="100%" height="100%">
      <defs>
        <linearGradient id="redSilk" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7f1d1d" />
          <stop offset="50%" stop-color="#991b1b" />
          <stop offset="100%" stop-color="#450a0a" />
        </linearGradient>
        <linearGradient id="royalGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="50%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>

      <!-- Card Background -->
      <rect x="15" y="15" width="470" height="620" rx="16" fill="url(#redSilk)" stroke="#fbbf24" stroke-width="3" />
      
      <!-- Traditional Royal Filigree Borders -->
      <rect x="28" y="28" width="444" height="594" rx="12" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.7"/>
      <rect x="36" y="36" width="428" height="578" rx="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.4"/>

      <!-- Shree Ganeshay Namah Invocation -->
      <text x="250" y="80" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="900" fill="url(#royalGold)" text-anchor="middle" letter-spacing="3">
        ॥ श्री गणेशाय नमः ॥
      </text>

      <!-- Ganesha Motif Silhouette (Stylized) -->
      <circle cx="250" cy="130" r="32" fill="#7f1d1d" stroke="url(#royalGold)" stroke-width="2" />
      <path d="M 235 130 Q 250 110 265 130 Q 250 155 242 140 Q 248 135 250 120" fill="none" stroke="url(#royalGold)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="250" cy="116" r="3" fill="#fef08a" />

      <!-- Subtitle -->
      <text x="250" y="195" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="4">
        SHUBH VIVAH INVITATION
      </text>

      <text x="250" y="240" font-family="serif" font-size="14" font-style="italic" fill="#fecaca" text-anchor="middle">
        Together with their families
      </text>

      <!-- Bride & Groom Names -->
      <text x="250" y="295" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="900" fill="url(#royalGold)" text-anchor="middle">
        AARAV
      </text>
      <text x="250" y="330" font-family="serif" font-size="20" font-style="italic" fill="#fef08a" text-anchor="middle">
        — weds —
      </text>
      <text x="250" y="380" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="900" fill="url(#royalGold)" text-anchor="middle">
        ANANYA
      </text>

      <!-- Date & Venue -->
      <line x1="100" y1="420" x2="400" y2="420" stroke="url(#royalGold)" stroke-width="1.5" />
      
      <text x="250" y="455" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">
        Sunday, 15 November 2026
      </text>
      <text x="250" y="480" font-family="sans-serif" font-size="13" font-weight="600" fill="#fde047" text-anchor="middle">
        Baraat: 7:00 PM • Varmala &amp; Dinner to follow
      </text>
      <text x="250" y="520" font-family="sans-serif" font-size="13" fill="#fecaca" text-anchor="middle">
        HOTEL BRIJ PALACE
      </text>
      <text x="250" y="540" font-family="sans-serif" font-size="11" fill="#cbd5e1" text-anchor="middle">
        NH-19, Near Highway Plaza, Mathura (U.P.)
      </text>

      <!-- Bottom Blessings -->
      <text x="250" y="590" font-family="serif" font-size="11" font-weight="bold" fill="url(#royalGold)" text-anchor="middle">
        R.S.V.P.: Sharma &amp; Agarwal Family • Mob: 98370-11221
      </text>
    </svg>
  `),

  billBook: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 480" width="100%" height="100%">
      <defs>
        <filter id="paperShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.15" />
        </filter>
      </defs>

      <!-- Carbonless Paper Texture -->
      <rect x="20" y="15" width="560" height="450" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#paperShadow)" />

      <!-- Left Perforation Line (Binding Margin) -->
      <line x1="55" y1="15" x2="55" y2="465" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />

      <!-- Shop Header -->
      <g transform="translate(70, 35)">
        <text x="0" y="0" font-family="monospace" font-size="10" font-weight="bold" fill="#047857">GSTIN: 09AAWPA1234B1Z2</text>
        <text x="470" y="0" font-family="sans-serif" font-size="12" font-weight="900" fill="#dc2626" text-anchor="end">TAX INVOICE</text>
        
        <text x="235" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="900" fill="#0f172a" text-anchor="middle">
          ARYA 2 PRINTING PRESS
        </text>
        <text x="235" y="50" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">
          All Kinds of Flex, DTP, Offset, Screen Printing &amp; Stationery
        </text>
        <text x="235" y="66" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="middle">
          Main Market Road, Chhata (Mathura) • Mob: 98370-12345
        </text>
      </g>

      <!-- Invoice Meta Grid -->
      <rect x="70" y="115" width="490" height="50" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      <text x="80" y="134" font-family="sans-serif" font-size="10" font-weight="bold" fill="#334155">Bill To: <tspan font-weight="normal">Shri Radhey Sweets, Chhata</tspan></text>
      <text x="80" y="152" font-family="sans-serif" font-size="10" font-weight="bold" fill="#334155">Mobile: <tspan font-weight="normal">98371-23450</tspan></text>
      
      <text x="360" y="134" font-family="sans-serif" font-size="10" font-weight="bold" fill="#334155">Invoice No: <tspan font-family="monospace" font-weight="bold" fill="#dc2626">ARYA/2026/0421</tspan></text>
      <text x="360" y="152" font-family="sans-serif" font-size="10" font-weight="bold" fill="#334155">Date: <tspan font-family="monospace">24-09-2026</tspan></text>

      <!-- Table Header -->
      <rect x="70" y="175" width="490" height="24" fill="#0f172a" />
      <text x="85" y="191" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff">S.N.</text>
      <text x="120" y="191" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff">Description of Goods / Job</text>
      <text x="360" y="191" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff">Qty / Size</text>
      <text x="440" y="191" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff">Rate (₹)</text>
      <text x="520" y="191" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="end">Amount (₹)</text>

      <!-- Table Rows -->
      <g transform="translate(70, 205)" font-family="sans-serif" font-size="10" fill="#1e293b">
        <line x1="0" y1="26" x2="490" y2="26" stroke="#f1f5f9" />
        <text x="15" y="17">1</text>
        <text x="50" y="17" font-weight="bold">Star Backlit Flex Glow Sign</text>
        <text x="290" y="17">1 (12x4 ft)</text>
        <text x="370" y="17">₹50/sq.ft</text>
        <text x="450" y="17" font-family="monospace" font-weight="bold" text-anchor="end">₹2,400.00</text>

        <line x1="0" y1="56" x2="490" y2="56" stroke="#f1f5f9" />
        <text x="15" y="47">2</text>
        <text x="50" y="47" font-weight="bold">Velvet Matte Visiting Cards</text>
        <text x="290" y="47">1,000 Pcs</text>
        <text x="370" y="47">₹650/1k</text>
        <text x="450" y="47" font-family="monospace" font-weight="bold" text-anchor="end">₹650.00</text>

        <line x1="0" y1="86" x2="490" y2="86" stroke="#f1f5f9" />
        <text x="15" y="77">3</text>
        <text x="50" y="77" font-weight="bold">Pre-Inked Stamp (Shiny R-538)</text>
        <text x="290" y="77">1 Pc</text>
        <text x="370" y="77">₹350</text>
        <text x="450" y="77" font-family="monospace" font-weight="bold" text-anchor="end">₹350.00</text>
      </g>

      <!-- Total & Footer -->
      <rect x="70" y="325" width="490" height="32" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
      <text x="80" y="345" font-family="sans-serif" font-size="10" font-weight="bold" fill="#047857">Rupees: Three Thousand Four Hundred Only</text>
      <text x="430" y="345" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">TOTAL: <tspan font-family="monospace" font-size="13" font-weight="900" fill="#dc2626">₹3,400.00</tspan></text>

      <!-- Signature Blocks -->
      <g transform="translate(70, 395)" font-family="sans-serif" font-size="10" fill="#64748b">
        <text x="20" y="25">Customer Signature</text>
        <line x1="10" y1="10" x2="140" y2="10" stroke="#cbd5e1" />

        <text x="340" y="25">For ARYA 2 (Authorized Signatory)</text>
        <line x1="330" y1="10" x2="480" y2="10" stroke="#cbd5e1" />
      </g>
    </svg>
  `),

  glowSign: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 340" width="100%" height="100%">
      <defs>
        <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="50%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#c084fc" />
        </linearGradient>
        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Dark Brick Wall Storefront -->
      <rect width="700" height="340" fill="#090d16" />
      
      <!-- Frame Border -->
      <rect x="30" y="40" width="640" height="260" rx="14" fill="#0f172a" stroke="#334155" stroke-width="6" />
      <rect x="38" y="48" width="624" height="244" rx="10" fill="#020617" stroke="#1e293b" stroke-width="2" />

      <!-- Glowing Neon Letters -->
      <g filter="url(#glowEffect)">
        <text x="350" y="145" font-family="'Plus Jakarta Sans', sans-serif" font-size="46" font-weight="900" fill="#38bdf8" text-anchor="middle" letter-spacing="4">
          ARYA 2 PRINT
        </text>
        <text x="350" y="195" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" fill="#f43f5e" text-anchor="middle" letter-spacing="6">
          3D ACRYLIC &amp; LED GLOW SIGN
        </text>
      </g>

      <line x1="120" y1="225" x2="580" y2="225" stroke="#818cf8" stroke-width="2" filter="url(#glowEffect)" />

      <text x="350" y="255" font-family="sans-serif" font-size="13" font-weight="bold" fill="#f8fafc" text-anchor="middle" letter-spacing="1">
        HIGH IMPACT 24/7 NIGHT VISIBILITY • SAMSUNG LED MODULES
      </text>

      <rect x="520" y="270" width="130" height="20" rx="4" fill="#065f46" />
      <text x="585" y="284" font-family="monospace" font-size="9" font-weight="bold" fill="#34d399" text-anchor="middle">
        SPEC: 3MM ACRYLIC
      </text>
    </svg>
  `),

  rubberStamp: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 320" width="100%" height="100%">
      <rect width="450" height="320" fill="#f8fafc" rx="8" />

      <!-- Stamp Impression in Deep Royal Violet / Blue Ink -->
      <g transform="translate(225, 160)" stroke="#1d4ed8" fill="none">
        <!-- Outer Double Rings -->
        <circle cx="0" cy="0" r="115" stroke-width="3.5" stroke-dasharray="300" opacity="0.9" />
        <circle cx="0" cy="0" r="106" stroke-width="1.5" opacity="0.8" />
        <circle cx="0" cy="0" r="70" stroke-width="1.5" opacity="0.8" />

        <!-- Circular Arc Text (Top and Bottom) -->
        <text font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="900" fill="#1d4ed8" stroke="none" text-anchor="middle">
          <textPath href="#circlePathTop" startOffset="50%">★ ARYA 2 SCREEN &amp; PRINTING PRESS ★</textPath>
        </text>

        <!-- Center Stamp Text -->
        <text x="0" y="-12" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="900" fill="#1d4ed8" stroke="none" text-anchor="middle">
          AUTHORIZED SIGNATORY
        </text>
        <line x1="-55" y1="-5" x2="55" y2="-5" stroke="#1d4ed8" stroke-width="1.5" />
        <text x="0" y="14" font-family="monospace" font-size="11" font-weight="bold" fill="#1d4ed8" stroke="none" text-anchor="middle">
          CHHATA (MATHURA)
        </text>
        <text x="0" y="32" font-family="monospace" font-size="9" font-weight="bold" fill="#1e40af" stroke="none" text-anchor="middle">
          DATE: 24-SEP-2026
        </text>
      </g>

      <defs>
        <path id="circlePathTop" d="M -88,0 A 88,88 0 1,1 88,0" />
      </defs>
    </svg>
  `),
};

/**
 * Dynamically generates a beautiful SVG sample preview for custom user work types
 */
export function generateDynamicSampleSvg(
  workTitle: string,
  category: string,
  dimensions?: string,
  material?: string,
  clientName?: string
): string {
  const colors: Record<string, { bg1: string; bg2: string; accent: string }> = {
    'Outdoor Signage': { bg1: '#0f172a', bg2: '#1e1b4b', accent: '#f59e0b' },
    'Cards & Stationery': { bg1: '#18181b', bg2: '#27272a', accent: '#38bdf8' },
    'Wedding & Invitations': { bg1: '#7f1d1d', bg2: '#450a0a', accent: '#fde047' },
    'DTP & Office Stationery': { bg1: '#064e3b', bg2: '#022c22', accent: '#34d399' },
    'Stickers & Decals': { bg1: '#701a75', bg2: '#4a044e', accent: '#f472b6' },
    'Promotional': { bg1: '#c2410c', bg2: '#7c2d12', accent: '#fed7aa' },
    'Other': { bg1: '#1e293b', bg2: '#0f172a', accent: '#60a5fa' },
  };

  const scheme = colors[category] || colors['Other'];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400" width="100%" height="100%">
      <defs>
        <linearGradient id="dynGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${scheme.bg1}" />
          <stop offset="100%" stop-color="${scheme.bg2}" />
        </linearGradient>
      </defs>

      <!-- Card Canvas -->
      <rect x="10" y="10" width="680" height="380" rx="14" fill="url(#dynGrad)" stroke="${scheme.accent}" stroke-width="2" />
      
      <!-- Border Margin -->
      <rect x="25" y="25" width="650" height="350" rx="8" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="6,4" />

      <!-- Top Category Kicker -->
      <text x="350" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="${scheme.accent}" text-anchor="middle" letter-spacing="3">
        ★ ARYA 2 SAMPLE PROOF • ${category.toUpperCase()} ★
      </text>

      <!-- Main Work Type Title -->
      <text x="350" y="130" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
        ${workTitle}
      </text>

      <!-- Client / Project Name -->
      <text x="350" y="175" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600" fill="#cbd5e1" text-anchor="middle">
        ${clientName ? `Project: ${clientName}` : 'Custom Designed & Printed at ARYA 2'}
      </text>

      <!-- Specification Badges -->
      <g transform="translate(150, 220)">
        <rect x="0" y="0" width="180" height="46" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="90" y="20" font-family="sans-serif" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">DIMENSIONS</text>
        <text x="90" y="38" font-family="monospace" font-size="13" font-weight="bold" fill="${scheme.accent}" text-anchor="middle">${dimensions || 'Standard Size'}</text>

        <rect x="220" y="0" width="180" height="46" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="310" y="20" font-family="sans-serif" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">MEDIA / MATERIAL</text>
        <text x="310" y="38" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${material || 'Premium Quality'}</text>
      </g>

      <!-- Bottom Signature -->
      <line x1="100" y1="310" x2="600" y2="310" stroke="rgba(255,255,255,0.1)" />
      <text x="350" y="340" font-family="sans-serif" font-size="12" font-weight="bold" fill="#f8fafc" text-anchor="middle">
        ARYA 2 PRINTING &amp; DESIGN STUDIO • CHHATA (MATHURA)
      </text>
    </svg>
  `;

  return svgToDataUrl(svg);
}
