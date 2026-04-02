(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,60860,e=>{"use strict";var t=e.i(43476),a=e.i(71645);let i="anime manga illustration, Japanese teenage girl Riku, long flowing crimson red hair sharp golden amber eyes, curvy athletic figure, dark navy sailor school uniform seifuku fitted short skirt slightly unbuttoned collar white collar red ribbon, silver katana with red tassel, Demon Slayer art style, ultra detailed, vibrant colors, professional manga panel",o=[{id:"script_system",title:"Script Generation — System Prompt",category:"script",model:"claude-sonnet-4-6 (Claude Code)",note:"This is the full prompt sent to Claude to write all 80 pages of Book 1. Research on manga structure was gathered first, then applied here.",content:`You are writing the complete manga script for BOOK 1 of "RIKU" — an original anime-style action manga series.

## MANGA WRITING RESEARCH (apply all of these)

### Kishotenketsu Structure (Japanese 4-part story framework)
- Ki (起) — Introduction: Introduce world and character
- Sho (承) — Development: Expand tension, build complications
- Ten (転) — Twist: Unexpected turn that recontextualizes everything
- Ketsu (結) — Conclusion: Resolution that feels earned

### Shonen Jump Chapter Rhythm (every chapter must have this)
- START: Emotional hook or shock moment
- MIDDLE: Conflict or character focus
- END: Cliffhanger or major revelation

### Panel Pacing Rules
- Larger panels = more time, more emphasis, slower pace
- Splash/full-page = maximum dramatic impact (use sparingly)
- 5-6 panel pages = fast action sequences
- 2-3 panel pages = emotional beats, quiet moments
- Borderless panels = timeless, dreamlike feeling
- Panel layouts: A=2 panels, B=3 panels, C=4 panels, D=5 panels, E=Splash

### Writing Rules
- Each page must END in a way that forces the reader to turn to the next
- Dialogue: SHORT. 1-3 lines per panel max. Punchy.
- Action speaks louder than words — show don't tell
- Vary emotional tempo: action → quiet → tension → action
- The reader must care about Riku before the first big fight
- Every chapter must end on a cliffhanger

## CHARACTER: RIKU
- Age: 17
- Appearance: Long flowing crimson red hair, sharp golden/amber eyes, curvy athletic figure, dark navy sailor school uniform (seifuku), fitted short skirt, slightly unbuttoned collar, silver katana with red tassel
- Personality: Confident, sarcastic, experienced beyond her years. Cracks jokes mid-fight. Hides deep pain.
- Power: Can sense "Rift energy". Her katana "Akagiri" (Red Mist) absorbs defeated monster energy and grows stronger.
- Backstory (reveal slowly): Her mother opened the Rift 3 months ago — an accident during a ritual. Mother disappeared. Riku blames herself.

## WORLD
- Setting: Modern Tokyo, 2 AM every night. Rifts open at 2 AM like clockwork.
- The Rift: A dimensional tear in reality. Monsters pour through.
- SHINKEN: Secret organization watching Riku. She doesn't know they exist yet.
- Monsters: Crawlers → Hulks → Shades → The Hollow King (Book 1 boss)

## BOOK 1 STRUCTURE (80 pages)
ACT 1 — Ki (pp 1–20): Riku's world, nightly routine, SHINKEN watching
ACT 2 — Sho (pp 21–50): SHINKEN contact, Shades appear, Kai introduced, Rift stays open
ACT 3 — Ten (pp 51–70): Hollow King emerges, knows Riku's name, Akagiri awakens
ACT 4 — Ketsu (pp 71–80): Final battle, Sable's offer, TWIST — photo of mother with Hollow King, smiling

## OUTPUT FORMAT (every page)
PAGE [number]
LAYOUT: [A/B/C/D/E]
SCENE: [location/time]
PANEL N:
  SHOT: [camera angle]
  ACTION: [visual description]
  CAPTION: [narrator text or NONE]
  DIALOGUE: [Character: "line" or NONE]
  SFX: [sound effect or NONE]
PAGE TURN HOOK: [why must reader turn the page?]

Write all 80 pages. Demon Slayer meets Bleach — serious with personality.`},{id:"char_anchor",title:"Character Anchor Prompt",category:"character",model:"gemini-3.1-flash-image-preview",note:"This anchor is appended to every image generation prompt to maintain visual consistency for Riku across all panels.",content:i},{id:"img_p1_splash",title:"Page 1 — Splash: Tokyo 2AM",category:"image",model:"gemini-3.1-flash-image-preview",note:"Full-page splash. Layout E. The first thing the reader sees.",content:`Bird's eye view cinematic establishing shot, sweeping wide angle, Tokyo Shibuya skyline at 2AM, neon signs reflecting off wet streets far below, electric city lights, a single tiny silhouette of a girl sitting on the very edge of a massive skyscraper rooftop, long crimson red hair whipping in the night wind, legs dangling over the void, ${i}, epic anime splash page, dark sky, atmospheric fog`},{id:"img_p2_panel1",title:"Page 2 — Panel 1: Phone 1:59 AM",category:"image",model:"gemini-3.1-flash-image-preview",note:"Close-up shot. Sets the time. First panel of the book after the splash.",content:"extreme close-up manga panel, glowing phone screen showing time 1:59 AM, a hand holding it from below, chipped black nail polish on fingers, dark school uniform sleeve visible, shallow depth of field, the rest of the scene dark and blurry, dramatic contrast, anime style"},{id:"img_p2_panel2",title:"Page 2 — Panel 2: Riku on ledge from behind",category:"image",model:"gemini-3.1-flash-image-preview",note:"Medium shot from behind. Establishes Riku's silhouette and the scale of Tokyo below.",content:`medium shot from directly behind, ${i}, sitting on the edge of a skyscraper rooftop ledge, silver katana laid across lap the red tassel hanging, unwrapping a convenience store rice ball with one hand, vast Tokyo city at night stretching below in all directions, moody atmospheric blue-purple lighting, cinematic anime`},{id:"img_p2_panel3",title:"Page 2 — Panel 3: Riku profile smirk",category:"image",model:"gemini-3.1-flash-image-preview",note:"First face reveal. The smirk tells us everything about her personality.",content:`close-up portrait side profile manga panel, ${i}, golden amber eyes sharp and intelligent, a slight smirk pulling at lips, mid-bite on rice ball, atmospheric blue-purple backlighting from the city below, a distant clock tower faintly visible, dramatic manga close-up, stylized`},{id:"img_p3_splash",title:"Page 3 — Splash: The Rift Opens",category:"image",model:"gemini-3.1-flash-image-preview",note:"Second full-page splash. The inciting visual of the entire series.",content:`dramatic low-angle shot looking up at the sky, the night sky CRACKS open with a jagged tearing line of burning violet and purple light, a dimensional rift splitting the darkness above Shibuya, energy bleeding downward like liquid light dripping from a wound, ${i} standing on rooftop edge silhouetted against the violet rift glow, katana drawn and raised, long crimson hair streaming upward from the energy pressure, epic anime splash page, KRRRRACK lightning effect`},{id:"sys_compositor",title:"Page Compositor — Python Logic",category:"system",model:"Python / Pillow",note:"How raw panels are assembled into manga pages with captions, speech bubbles, and SFX text overlaid.",content:`Page compositor flow:
1. Load panels as PIL images (JPEG)
2. Create 1200\xd71800px black canvas
3. Place panels using layout rules:
   - Layout E (Splash): single panel fills entire page
   - Layout B (3 panels): top 33% / mid 35% / bottom 32% with 10px gutters
   - Layout C (4 panels): top 35% full-width + 2-column middle + bottom full-width
4. Each panel is center-cropped to fit its cell (no letterboxing)
5. Overlays applied in order:
   - Caption boxes: rounded rect rgba(0,0,0,210) + white text
   - Speech bubbles: white ellipse + tail polygon
   - SFX text: bold outline text, color-coded (yellow=slash, purple=rift, red=impact)
6. Final export: JPEG quality=90, 1200\xd71800px
7. Pages pushed to gh-pages /pages/ folder as page_NN.jpg`},{id:"sys_research",title:"Manga Research — Sources Used",category:"system",model:"web_fetch (Brave + direct)",note:"Research gathered before writing the script to ensure professional manga structure.",content:`Sources researched before script generation:

1. goteenwriters.com — "The Manga Toolbelt for Fiction Writers"
   Key takeaway: Kishotenketsu 4-part structure (Ki/Sho/Ten/Ketsu)
   Character mastery prioritized over rigid formula
   "Don't just throw events at the reader — make them feel it"

2. clipstudio.net — Panel layout, gutters, thumbnailing, page flow
   Key takeaway: Every panel must lead the reader's eye
   Page has defined start/end point with clear progression
   Larger panels = more emotional weight

3. Shonen Jump chapter rhythm analysis:
   Start: emotional hook or shock
   Middle: conflict or character focus  
   End: cliffhanger or major revelation

4. Arc structure research:
   Escalating opponents, power unlocks, downtime for character dev
   Intersperse action arcs with quiet relationship moments`}],r={script:"#e63946",image:"#8b5cf6",character:"#f59e0b",system:"#10b981"},s={script:"Script",image:"Image Gen",character:"Character",system:"System"},n=["all","script","image","character","system"];function l({p:e}){let[i,o]=(0,a.useState)(!1),[n,c]=(0,a.useState)(!1),h=async t=>{t.stopPropagation(),await navigator.clipboard.writeText(e.content),c(!0),setTimeout(()=>c(!1),2e3)};return(0,t.jsxs)("div",{className:"bg-[#12121e] rounded-xl border border-white/[0.06] overflow-hidden",children:[(0,t.jsxs)("button",{className:"w-full text-left p-4 flex items-start justify-between gap-3",onClick:()=>o(!i),children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 mb-1 flex-wrap",children:[(0,t.jsx)("span",{className:"text-[10px] font-bold px-2 py-0.5 rounded shrink-0",style:{background:r[e.category]+"22",color:r[e.category]},children:s[e.category]}),(0,t.jsx)("span",{className:"text-[10px] text-white/25 font-mono truncate",children:e.model})]}),(0,t.jsx)("p",{className:"font-bold text-sm text-white leading-tight",children:e.title}),e.note&&(0,t.jsx)("p",{className:"text-xs text-white/40 mt-1 leading-relaxed",children:e.note})]}),(0,t.jsx)("span",{className:"text-white/30 text-sm shrink-0 mt-0.5",children:i?"▲":"▼"})]}),i&&(0,t.jsx)("div",{className:"border-t border-white/[0.06]",children:(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)("pre",{className:"p-4 text-xs text-white/70 leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono bg-[#0b0b16]",style:{maxHeight:400,overflowY:"auto"},children:e.content}),(0,t.jsx)("button",{onClick:h,className:"absolute top-3 right-3 text-xs px-3 py-1.5 rounded-lg transition-all",style:{background:n?"#10b981":"rgba(255,255,255,0.08)",color:n?"white":"rgba(255,255,255,0.5)"},children:n?"Copied!":"Copy"})]})})]})}e.s(["default",0,function(){let[e,i]=(0,a.useState)("all"),r="all"===e?o:o.filter(t=>t.category===e);return(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"mb-4",children:[(0,t.jsx)("p",{className:"text-xs font-bold tracking-widest text-[#e63946] uppercase mb-1",children:"Behind the scenes"}),(0,t.jsx)("h1",{className:"text-2xl font-extrabold tracking-tight",children:"Prompts"}),(0,t.jsx)("p",{className:"text-sm text-white/40 mt-1",children:"Every AI instruction used to build this comic"})]}),(0,t.jsx)("div",{className:"flex gap-2 mb-5 overflow-x-auto pb-1",children:n.map(a=>(0,t.jsx)("button",{onClick:()=>i(a),className:`shrink-0 px-3 py-2 rounded-full text-xs font-bold transition-all capitalize ${e===a?"bg-[#e63946] text-white":"bg-[#12121e] text-white/40 border border-white/[0.06]"}`,children:"all"===a?`All (${o.length})`:s[a]??a},a))}),(0,t.jsx)("div",{className:"flex flex-col gap-3",children:r.map(e=>(0,t.jsx)(l,{p:e},e.id))}),(0,t.jsx)("div",{className:"mt-6 bg-[#0b0b16] rounded-xl p-4 border border-white/[0.04]",children:(0,t.jsx)("p",{className:"text-xs text-white/30 leading-relaxed",children:"All prompts are static snapshots. As new pages are generated, this list updates with each deployment. Tap any card to expand the full prompt. Use Copy to grab any prompt for your own experiments."})})]})}])}]);