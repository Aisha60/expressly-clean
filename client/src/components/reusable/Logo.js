const Logo = () => {
    return (
        <svg viewBox="0 0 240 70" className="w-48">
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <path d="M25,15 C15,15 10,20 10,30 C10,40 15,45 25,45 L28,45 L28,52 L35,45 L45,45 C55,45 60,40 60,30 C60,20 55,15 45,15 Z" fill="#4f46e5" opacity="0.9" filter="url(#glow)" />
            <path d="M65,25 C55,25 50,30 50,40 C50,50 55,55 65,55 L75,55 L82,62 L82,55 L85,55 C95,55 100,50 100,40 C100,30 95,25 85,25 Z" fill="url(#logoGradient)" filter="url(#glow)" />
            <path d="M38,30 L45,35 L38,40" stroke="#ffffff" strokeWidth="2" fill="none" />
            <path d="M72,35 L65,40 L72,45" stroke="#ffffff" strokeWidth="2" fill="none" />
            <text x="110" y="38" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="#4f46e5">Expressly</text>
            <text x="110" y="55" fontFamily="Arial" fontSize="12" fill="#6b7280">Better communication, simplified</text>
        </svg>
    );
};

export default Logo;