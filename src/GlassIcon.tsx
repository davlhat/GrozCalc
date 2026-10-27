import React from 'react';
type Name='logo'|'milk'|'grain'|'meat'|'drink'|'food'|'plus'|'spark'|'heart';
export function GlassIcon({name,size=46}:{name:Name;size?:number}){const common={fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};const paths:Record<Name,React.ReactNode>={
logo:<><path d="M8 8h6l3 5 3-5h6l-4 8-5 7-5-7z"/><path d="M8 8 17 23 26 8M12 16h10"/><circle cx="17" cy="6" r="2"/></>,
milk:<><path d="M12 5h10v5l3 5v14H9V15l3-5z"/><path d="M12 10h10M12 17h10M14 23c2-4 4-4 6 0"/></>,
grain:<><path d="M17 29V7M17 12c-5 0-7-3-7-6 5 0 7 3 7 6zm0 6c-5 0-8-3-8-6 5 0 8 3 8 6zm0 6c-5 0-8-3-8-6 5 0 8 3 8 6zm0-12c5 0 7-3 7-6-5 0-7 3-7 6zm0 6c5 0 8-3 8-6-5 0-8 3-8 6zm0 6c5 0 8-3 8-6-5 0-8 3-8 6z"/></>,
meat:<><path d="M9 11c-5 3-4 12 1 15s11 0 13-4c3-6 7-8 4-13-3-5-11-3-14 1"/><path d="M12 15c4-5 11-4 11 2s-6 8-10 5"/></>,
drink:<><path d="M9 9h16l-2 20H11zM7 9h20M15 9l3-5h7"/><path d="M13 18h8"/></>,
food:<><path d="M6 17a11 11 0 0 1 22 0M5 17h24M17 6V4"/><path d="M9 23h16M12 27h10"/></>,
plus:<><path d="M17 7v20M7 17h20"/></>,
spark:<><path d="m17 3 3 11 11 3-11 3-3 11-3-11-11-3 11-3z"/></>,
heart:<><path d="M17 29 6 18C-1 9 10 2 17 10c7-8 18-1 11 8z"/></>
};return <span className={'glass-icon glass-icon-'+name} style={{width:size,height:size}}><svg width="67%" height="67%" viewBox="0 0 34 34" {...common}>{paths[name]}</svg></span>}
