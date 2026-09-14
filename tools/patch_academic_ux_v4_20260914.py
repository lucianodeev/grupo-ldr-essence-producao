from pathlib import Path

ROOT = Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.tsx')
FEED = Path('apps/painel-ldr/src/components/academic-social-v3-feed.tsx')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f'anchor not found: {label}')
    return text.replace(old, new, 1)

# Root route: import scoped responsive stylesheet and add semantic classes.
s = ROOT.read_text(encoding='utf-8')
s = replace_once(
    s,
    'import { useI18n } from "@/lib/i18n";\n',
    'import { useI18n } from "@/lib/i18n";\nimport "@/styles/academic-network-v4.css";\n',
    'v4 css import',
)
s = replace_once(
    s,
    'return <div className="academic-social mx-auto max-w-6xl space-y-5 px-3 pb-32 pt-4 sm:px-6 sm:pb-24 sm:pt-6">',
    'return <div className="academic-social academic-social-v4 mx-auto max-w-6xl space-y-4 px-3 pb-32 pt-4 sm:space-y-5 sm:px-6 sm:pb-24 sm:pt-6">',
    'root shell',
)
s = replace_once(
    s,
    '<header className="relative overflow-hidden rounded-[30px] border border-[#d7c596]/50 bg-gradient-to-br from-[#061426] via-[#0b2a4b] to-[#154b7a] p-5 text-white shadow-[0_18px_50px_rgba(7,20,38,.18)] sm:p-8">',
    '<header className="relative overflow-hidden rounded-[24px] border border-[#d7c596]/50 bg-gradient-to-br from-[#061426] via-[#0b2a4b] to-[#154b7a] p-4 text-white shadow-[0_14px_38px_rgba(7,20,38,.14)] sm:rounded-[28px] sm:p-7">',
    'compact hero',
)
s = replace_once(
    s,
    'className="fixed inset-x-0 bottom-0 z-[100] grid grid-cols-5 gap-1 border-t bg-background/95 px-1 pt-1 shadow-[0_-8px_30px_rgba(7,20,38,.12)] backdrop-blur sm:hidden"',
    'className="academic-v4-mobile-nav fixed inset-x-0 bottom-0 z-[100] grid grid-cols-5 gap-1 border-t bg-background/95 px-1.5 pt-1.5 shadow-[0_-8px_30px_rgba(7,20,38,.12)] backdrop-blur sm:hidden"',
    'mobile nav class',
)
s = s.replace('text-[7px] font-black leading-none tracking-[-.03em]', 'text-[9px] font-black leading-none tracking-[-.02em]')
s = s.replace('text-[8px] font-black leading-none text-[#071426]', 'text-[9px] font-black leading-none text-[#071426]')
s = s.replace('min-h-[54px]', 'min-h-[58px]')
s = s.replace('className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base"', 'className="mt-3 max-w-2xl text-[15px] leading-6 text-slate-200 sm:mt-4 sm:text-base"')
ROOT.write_text(s, encoding='utf-8')

# Feed component: add semantic hooks and remove the cramped mobile patterns.
f = FEED.read_text(encoding='utf-8')
f = replace_once(
    f,
    'return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><main className="min-w-0 space-y-4">{!savedOnly&&<>',
    'return <div className="academic-v4-feed grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><main className="min-w-0 space-y-4">{!savedOnly&&<>',
    'feed shell',
)
f = replace_once(
    f,
    'return <section className="rounded-2xl border bg-card p-3 shadow-sm"><Link to="/cliente/rede-academica/criar" className="flex min-h-12 items-center gap-3 rounded-2xl bg-muted/45 px-3">',
    'return <section className="academic-v4-composer rounded-2xl border bg-card p-3 shadow-sm"><Link to="/cliente/rede-academica/criar" className="academic-v4-composer-main flex min-h-12 items-center gap-3 rounded-2xl bg-muted/45 px-3">',
    'composer',
)
f = replace_once(
    f,
    '<div className="mt-2 grid grid-cols-4 gap-1">',
    '<div className="academic-v4-quick-grid mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">',
    'composer quick grid',
)
f = f.replace('className="flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-black hover:bg-muted"', 'className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2 text-[11px] font-black hover:bg-muted"')
f = replace_once(
    f,
    'return <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]"><div className="flex w-max gap-2">',
    'return <div className="academic-v4-tabs -mx-1 overflow-x-auto px-1 [scrollbar-width:none]"><div className="flex w-max gap-2">',
    'filter bar',
)
f = f.replace('className={`min-h-10 rounded-full border px-4 text-[10px] font-black ${mode===k?', 'className={`min-h-10 rounded-full border px-4 text-[11px] font-black ${mode===k?')
f = replace_once(
    f,
    'return <div className="flex items-center gap-2 overflow-x-auto rounded-xl border bg-card px-3 py-2 [scrollbar-width:none]">',
    'return <div className="academic-v4-world flex items-center gap-2 overflow-x-auto rounded-xl border bg-card px-3 py-2 [scrollbar-width:none]">',
    'international bar',
)
f = f.replace('className="whitespace-nowrap text-[9px] tracking-[.12em]"', 'className="whitespace-nowrap text-[10px] tracking-[.1em]"')
f = f.replace('className={`min-h-8 whitespace-nowrap rounded-full px-3 text-[9px] font-black ${country===v?', 'className={`min-h-9 whitespace-nowrap rounded-full px-3 text-[10px] font-black ${country===v?')
f = replace_once(
    f,
    '<div className="flex gap-2"><div className="relative min-w-0 flex-1">',
    '<div className="academic-v4-search flex gap-2"><div className="relative min-w-0 flex-1">',
    'search row',
)
f = f.replace('className="min-h-12 w-full rounded-2xl border bg-background pl-11 pr-4 text-sm shadow-sm"', 'className="min-h-12 w-full rounded-2xl border bg-background pl-11 pr-4 text-base shadow-sm"')

# Real post card hooks.
f = replace_once(
    f,
    '<article className="rounded-[22px] border bg-card p-4 shadow-[0_5px_18px_rgba(7,20,38,.05)]">',
    '<article className="academic-v4-post rounded-[22px] border bg-card p-4 shadow-[0_5px_18px_rgba(7,20,38,.05)]">',
    'real post',
)
f = replace_once(
    f,
    '<p className="mt-4 whitespace-pre-wrap text-[14px] leading-6">{p.body}</p>',
    '<p className="academic-v4-post-body mt-4 whitespace-pre-wrap text-[15px] leading-6">{p.body}</p>',
    'real post body',
)
f = replace_once(
    f,
    '<div className="mt-3 grid grid-cols-4 border-t pt-2"><Mini onClick={()=>support.mutate(p.id)}',
    '<div className="academic-v4-post-actions mt-3 grid grid-cols-2 border-t pt-2 sm:grid-cols-4"><Mini onClick={()=>support.mutate(p.id)}',
    'real post actions',
)
f = replace_once(
    f,
    'premium&&<div className="mt-3 flex gap-2"><input autoFocus',
    'premium&&<div className="academic-v4-comment-row mt-3 flex gap-2"><input autoFocus',
    'real comment row',
)
f = f.replace('className="min-h-10 flex-1 rounded-xl border bg-background px-3 text-xs"', 'className="academic-v4-comment-input min-h-11 flex-1 rounded-xl border bg-background px-3 text-base"', 1)

# Editorial post card hooks.
f = replace_once(
    f,
    '<article className="rounded-[22px] border border-[#d8b65b]/45 bg-card p-4 shadow-[0_5px_18px_rgba(7,20,38,.05)]">',
    '<article className="academic-v4-post rounded-[22px] border border-[#d8b65b]/45 bg-card p-4 shadow-[0_5px_18px_rgba(7,20,38,.05)]">',
    'editorial post',
)
f = replace_once(
    f,
    '<p className="mt-4 whitespace-pre-wrap text-[14px] leading-6">{p.body}</p>',
    '<p className="academic-v4-post-body mt-4 whitespace-pre-wrap text-[15px] leading-6">{p.body}</p>',
    'editorial post body',
)
f = replace_once(
    f,
    '<div className="mt-3 grid grid-cols-4 border-t pt-2"><Mini disabled={!premium}',
    '<div className="academic-v4-post-actions mt-3 grid grid-cols-2 border-t pt-2 sm:grid-cols-4"><Mini disabled={!premium}',
    'editorial post actions',
)
f = replace_once(
    f,
    'premium&&<div className="mt-3 flex gap-2"><input value={reply[p.id]}',
    'premium&&<div className="academic-v4-comment-row mt-3 flex gap-2"><input value={reply[p.id]}',
    'editorial comment row',
)
f = f.replace('className="min-h-10 flex-1 rounded-xl border bg-background px-3 text-xs"', 'className="academic-v4-comment-input min-h-11 flex-1 rounded-xl border bg-background px-3 text-base"', 1)

# Action buttons become readable instead of tiny/truncated on phones.
f = replace_once(
    f,
    'className="flex min-h-10 min-w-0 items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-bold hover:bg-muted disabled:opacity-40"',
    'className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2 text-[11px] font-bold hover:bg-muted disabled:opacity-40"',
    'mini action',
)

# Tablet: keep the right rail for wide desktop only.
f = f.replace('lg:grid-cols-[minmax(0,1fr)_300px]', 'xl:grid-cols-[minmax(0,1fr)_320px]')
FEED.write_text(f, encoding='utf-8')

print('academic UX V4 patch applied')
