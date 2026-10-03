export const splashHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>ArecaCare-AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#fff;--leaf:#0B5D3B;--vein:#fff;--nut:#62C24B;--ring:#12A5A8;--sweep:#14B8BC;--wm:#0B5D3B;--tag:#2F4F43;--glow:rgba(18,165,168,.10);
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#06130E;--leaf:#1F9A62;--vein:#06130E;--nut:#8EDB6B;--ring:#2CC8CC;--sweep:#6CF0F0;--wm:#EAF7F0;--tag:#A9C7B8;--glow:rgba(44,200,204,.14)}}
:root[data-theme="dark"]{--bg:#06130E;--leaf:#1F9A62;--vein:#06130E;--nut:#8EDB6B;--ring:#2CC8CC;--sweep:#6CF0F0;--wm:#EAF7F0;--tag:#A9C7B8;--glow:rgba(44,200,204,.14)}
html,body{height:100%;margin:0}
body{background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:Sora,"Segoe UI",Helvetica,Arial,sans-serif;overflow-x:hidden}
.logo{display:flex;align-items:center;gap:clamp(8px,3vw,40px);padding:24px;max-width:100%;flex-wrap:wrap;justify-content:center}
.mark{width:clamp(230px,36vw,400px);aspect-ratio:1;border-radius:50%;background:radial-gradient(closest-side,var(--glow),transparent 72%)}
svg{width:100%;height:100%;overflow:visible;display:block}
.words{text-align:left;max-width:100%}
h1{margin:0;font-weight:800;font-size:clamp(42px,7.4vw,92px);letter-spacing:-.035em;line-height:1;color:var(--wm);animation:rise 1s 1.6s cubic-bezier(.2,.7,.2,1) both}
h1 span{color:var(--ring)}
p{margin:.9em 0 0;font-weight:500;font-size:clamp(12px,1.75vw,21px);letter-spacing:.005em;color:var(--tag);animation:rise 1s 1.9s cubic-bezier(.2,.7,.2,1) both}
.bar{display:block;width:64px;height:5px;border-radius:3px;background:var(--nut);margin-top:1em;transform-origin:left;animation:grow .8s 1.8s ease-out both}
@media(max-width:760px){.words{text-align:center}.bar{margin-inline:auto}}
/* icon colours */
.leaf{fill:var(--leaf)}.vein{stroke:var(--vein);fill:none;stroke-linecap:round;stroke-linejoin:round}
.dot{fill:var(--vein)}.ring{stroke:var(--ring);fill:none;stroke-linecap:round}.rdot{fill:var(--ring)}
.nut{fill:var(--nut)}.hl{stroke:var(--vein);fill:none;stroke-linecap:round}
.sweep{fill:var(--sweep)}.edge{stroke:var(--sweep)}
/* motion */
.o{transform-origin:120px 120px}
.spin{animation:spin 24s linear infinite}
.spinr{animation:spin 16s linear infinite reverse}
.sw{animation:spin 5s linear infinite}
.ret{transform-origin:180px 168px;animation:spin 9s linear infinite reverse}
.fade{animation:fadein 1s .2s both}
.leafin{transform-origin:62px 176px;animation:leafin 1.1s .3s cubic-bezier(.2,.8,.2,1) both}
.draw{stroke-dasharray:220;animation:draw 1.3s .9s ease-out both}
.nd{transform-box:fill-box;transform-origin:center;animation:pop .5s both,pulse 3.2s ease-in-out infinite}
.nutin{transform-origin:180px 168px;animation:pop2 .8s 1.2s cubic-bezier(.3,1.6,.5,1) both,breathe 4s 2s ease-in-out infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadein{from{opacity:0}}
@keyframes leafin{from{opacity:0;transform:scale(.55) rotate(-14deg)}}
@keyframes draw{from{stroke-dashoffset:220}to{stroke-dashoffset:0}}
@keyframes pop{from{opacity:0;transform:scale(0)}}
@keyframes pop2{from{opacity:0;transform:scale(0)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.55)}}
@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@keyframes rise{from{opacity:0;transform:translateY(14px)}}
@keyframes grow{from{transform:scaleX(0)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
</head>
<body>
<main class="logo" aria-label="ArecaCare-AI logo">
<div class="mark">
<svg viewBox="0 0 240 240" role="img" aria-label="Arecanut palm leaf with neural-network veins, scan ring and detection reticle">
<defs><clipPath id="lc"><path d="M62 176C60 110 110 60 176 56C180 120 130 176 62 176Z"/></clipPath></defs>

<g class="o spin fade">
 <g class="ring" stroke-width="6">
  <path d="M19.6 93.1A104 104 0 0 1 93.1 19.5"/><path d="M146.9 19.5A104 104 0 0 1 210.1 68"/><path d="M93.1 220.5A104 104 0 0 1 19.6 146.9"/>
 </g>
 <circle class="rdot" cx="210.1" cy="68" r="6"/><circle class="rdot" cx="19.6" cy="146.9" r="6"/><circle class="rdot" cx="93.1" cy="19.5" r="3.5"/>
</g>
<g class="o spinr fade"><circle class="ring" cx="120" cy="120" r="113" stroke-width="1.6" stroke-dasharray="2 9" opacity=".7"/></g>

<g class="leafin"><path class="leaf" d="M62 176C60 110 110 60 176 56C180 120 130 176 62 176Z"/></g>

<g clip-path="url(#lc)"><g class="o sw">
 <path class="sweep" opacity=".5" d="M120 120L230 120A110 110 0 0 0 189.4 35.7Z"/>
 <line class="edge" x1="120" y1="120" x2="230" y2="120" stroke-width="2" opacity=".9"/>
</g></g>
<g class="o sw"><path class="sweep" opacity=".07" d="M120 120L230 120A110 110 0 0 0 189.4 35.7Z"/></g>

<g class="vein">
 <path class="draw" stroke-width="4.5" d="M66 172C100 130 135 95 172 60"/>
 <g stroke-width="3.2" class="draw" style="animation-delay:1.4s">
  <path d="M92 142L82 128M118 113L104 92M145 86L134 76"/><path d="M92 142L104 156M118 113L132 130M145 86L155 100"/>
 </g>
 <g stroke-width="1.8" opacity=".7" class="draw" style="animation-delay:1.7s"><path d="M82 128L104 92L134 76"/><path d="M104 156L132 130L155 100"/></g>
</g>
<g class="dot">
 <circle class="nd" style="animation-delay:1.7s,2.4s,0s" cx="82" cy="128" r="4"/>
 <circle class="nd" style="animation-delay:1.8s,2.9s,0s" cx="104" cy="92" r="4"/>
 <circle class="nd" style="animation-delay:1.9s,3.4s,0s" cx="134" cy="76" r="4"/>
 <circle class="nd" style="animation-delay:2s,2.6s,0s" cx="155" cy="100" r="4"/>
 <circle class="nd" style="animation-delay:2.1s,3.1s,0s" cx="132" cy="130" r="4"/>
 <circle class="nd" style="animation-delay:2.2s,3.6s,0s" cx="104" cy="156" r="4"/>
 <circle cx="92" cy="142" r="3"/><circle cx="118" cy="113" r="3"/><circle cx="145" cy="86" r="3"/>
</g>

<circle class="ring ret" cx="180" cy="168" r="27" stroke-width="3.5" stroke-dasharray="30 12"/>
<g class="nutin">
 <ellipse class="nut" cx="180" cy="168" rx="16" ry="19" transform="rotate(-20 180 168)"/>
 <path class="hl" stroke-width="3" d="M170 164C172 156 178 152 185 152"/>
 <path class="hl" stroke-width="2.4" opacity=".8" d="M172 176Q180 184 190 176"/>
</g>
</svg>
</div>
<div class="words">
<h1>ArecaCare<span>-AI</span></h1>
<i class="bar"></i>
<p>Intelligent Arecanut Disease Detection &amp; Crop Advisory</p>
</div>
</main>
</body>
</html>
`;
