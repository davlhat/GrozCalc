import React from 'react';
type Name='logo'|'milk'|'grain'|'meat'|'drink'|'food'|'plus'|'spark'|'heart';
export function GlassIcon({name,size=46}:{name:Name;size?:number}){const common={fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};const paths:Record<Name,React.ReactNode>={
logo:<>
{/* Cart-man: the cart itself has a face, arms, and feet; no person riding inside. */}
<path d="M3 8h4l4 16h17l3-13H9" stroke="#267d67" strokeWidth="2.3"/>
<path d="M11 13h18l-2.3 10H13z" fill="#b8e9d4" stroke="#267d67" strokeWidth="1.5"/>
<circle cx="17" cy="16.5" r="1" fill="#225e4c" stroke="none"/>
<circle cx="23" cy="16.5" r="1" fill="#225e4c" stroke="none"/>
<path d="M17 19.5q3 3 6 0" stroke="#225e4c" strokeWidth="1.2"/>
<path d="M12 15 7 12m21 3 3-3" stroke="#267d67" strokeWidth="1.8"/>
<path d="M16 24v3m8-3v3" stroke="#267d67" strokeWidth="1.6"/>
<circle cx="16" cy="29" r="2" fill="#267d67" stroke="none"/>
<circle cx="24" cy="29" r="2" fill="#267d67" stroke="none"/>
<rect x="28" y="5" width="5" height="7" rx="1" fill="#fffdf3" stroke="#267d67" strokeWidth="1.2"/>
<path d="M29 7h3m-2.7 2h.6m1.1 0h.6" stroke="#267d67" strokeWidth=".7"/>
<path d="M15 11c-1.5-1.8-.6-4.1 1.5-4.2 2.4 0 3.2 2.5 1.7 4.1-1 1.2-2.7 1.2-3.7-.3" fill="#edaa62" stroke="#aa713f" strokeWidth="1"/>
<path d="m18 7.5 1.8-1.8m-.2 0 1.4-.1m-1.4.1.1-1.4" stroke="#fff3df" strokeWidth="1.8"/>
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
