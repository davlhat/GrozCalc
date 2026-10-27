import React from 'react';
type Name='logo'|'milk'|'grain'|'meat'|'drink'|'food'|'plus'|'spark'|'heart';
export function GlassIcon({name,size=46}:{name:Name;size?:number}){const common={fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};const paths:Record<Name,React.ReactNode>={
logo:<>
{/* Friendly shopping cart character, calculator, and single drumstick; hand-drawn SVG only */}
<path d="M4 11h4l3 13h16l3-11H10" strokeWidth="2.2"/>
<path d="M11 24h16" strokeWidth="2"/>
<circle cx="14" cy="28" r="1.7" fill="currentColor" stroke="none"/>
<circle cx="25" cy="28" r="1.7" fill="currentColor" stroke="none"/>
<circle cx="16" cy="7" r="4.2" fill="#fff7e7" stroke="#257d68" strokeWidth="1.5"/>
<circle cx="14.6" cy="6.5" r=".6" fill="#257d68" stroke="none"/>
<circle cx="17.3" cy="6.5" r=".6" fill="#257d68" stroke="none"/>
<path d="M14.8 8.5q1.2 1.2 2.4 0" stroke="#257d68" strokeWidth=".8"/>
<path d="M16 11v7m0-3-3.8 2.5m3.8-2.5 3.2 2.5m-3.2.5-3 4m3-4 3.5 3.5" stroke="#257d68" strokeWidth="1.6"/>
<rect x="20" y="14" width="7.5" height="9" rx="1.3" fill="#e9fffa" stroke="#257d68" strokeWidth="1.3"/>
<rect x="21.3" y="15.3" width="4.8" height="2" rx=".3" fill="#b2e7d4" stroke="none"/>
<path d="M22 19.4h.7m2 0h.7m-3.4 1.9h.7m2 0h.7" stroke="#257d68" strokeWidth="1.2"/>
<path d="M11 19h4" stroke="#257d68" strokeWidth="1.4"/>
<path d="M18.5 17c-1.3-2.2-.1-4.6 2.3-4.6 2.7 0 3.9 3.2 1.9 5.3-1.4 1.4-3.1 1.3-4.2-.7" fill="#f5b56d" stroke="#b77436" strokeWidth="1"/>
<path d="m22.6 13.1 2.3-2.3m-.1.1 1.5-.1m-1.5.1.1-1.5" stroke="#fff3dd" strokeWidth="2.1"/>
</>,
milk:<><path d="M12 5h10v5l3 5v14H9V15l3-5z"/><path d="M12 10h10M12 17h10M14 23c2-4 4-4 6 0"/></>,
grain:<><path d="M17 29V7M17 12c-5 0-7-3-7-6 5 0 7 3 7 6zm0 6c-5 0-8-3-8-6 5 0 8 3 8 6zm0 6c-5 0-8-3-8-6 5 0 8 3 8 6zm0-12c5 0 7-3 7-6-5 0-7 3-7 6zm0 6c5 0 8-3 8-6-5 0-8 3-8 6zm0 6c5 0 8-3 8-6-5 0-8 3-8 6z"/></>,
meat:<><path d="M9 11c-5 3-4 12 1 15s11 0 13-4c3-6 7-8 4-13-3-5-11-3-14 1"/><path d="M12 15c4-5 11-4 11 2s-6 8-10 5"/></>,
drink:<><path d="M9 9h16l-2 20H11zM7 9h20M15 9l3-5h7"/><path d="M13 18h8"/></>,
food:<><path d="M6 17a11 11 0 0 1 22 0M5 17h24M17 6V4"/><path d="M9 23h16M12 27h10"/></>,
plus:<><path d="M17 7v20M7 17h20"/></>,
spark:<><path d="m17 3 3 11 11 3-11 3-3 11-3-11-11-3 11-3z"/></>,
heart:<><path d="M17 29 6 18C-1 9 10 2 17 10c7-8 18-1 11 8z"/></>
};return <span className={'glass-icon glass-icon-'+name} style={{width:size,height:size}}><svg width="67%" height="67%" viewBox="0 0 34 34" {...common}>{paths[name]}</svg></span>}
