
import re
import os

file_path = '/Users/anzelikalasenko/Desktop/portfolioFigma/Portfolio/translations.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define missing keys for EN
new_en_keys = {
    "cases.nextproject.title": "Next Project",
    "cases.nextproject.year": "Future",
    "cases.nextproject.desc": "In Progress",
    "case.nav.back": "← Back to Cases",
    "case.visit.website": "Visit Live Website ↗",
    "case.concept.title": "Concept",
    "case.features.title": "Key Features",
    "case.challenge.title": "The Challenge",
    "case.visual.title": "Visual Direction",
    "case.interaction.title": "Interaction Design",
    
    "case.realface.next": "Next Project: Languages Of Love →",
    "case.realface.caption": "Interactive preview of the platform.",
    "case.realface.concept.desc": "RealFace is a SAAS platform designed to streamline facial recognition integration for businesses. The interface focuses on clarity and ease of use, with a modern, tech-forward aesthetic.",
    "case.realface.features.desc": "Real-time analytics, user management, and seamless API integration were the core requirements. The dashboard provides actionable insights at a glance.",
    
    "case.lovelang.next": "Next Project: Learning Hub →",
    "case.lovelang.caption": "Interactive Quiz — Select an option to proceed",
    "case.lovelang.challenge.desc": "Translating the intangible concept of \"love languages\" into a tangible, digital experience. The goal was to create a warm, inviting interface that feels personal and safe without being overly cloying.",
    "case.lovelang.visual.desc": "I chose a soft palette of pinks and warm whites, paired with rounded typography to evoke gentleness. The card-based interaction mimics the feeling of playing a game or drawing a tarot card.",
    
    "case.refillarena.next": "Next Project: Sunrise →",
    "case.refillarena.caption": "Interactive Store — Click to explore",
    "case.refillarena.concept.desc": "RefillArena aims to bridge the gap between traditional gaming top-ups and modern Web3 assets. The dark UI reduces eye strain for gamers, while the vibrant accent colors highlight call-to-actions.",
    "case.refillarena.ux.title": "UX Focus",
    "case.refillarena.ux.desc": "Speed is key. The checkout flow was optimized to require only 3 clicks from browsing to payment completion. Micro-interactions (like the glitch effect) add a layer of immersion.",
    
    "case.learninghub.next": "Next Project: RefillArena →",
    "case.learninghub.caption": "Interactive Dashboard — Click tabs to filter courses",
    "case.learninghub.overview.title": "Overview",
    "case.learninghub.overview.desc": "Learning Hub is an all-in-one platform for educational institutions. The main challenge was to design an interface that handles complex data (thousands of students and courses) without overwhelming the administrator.",
    "case.learninghub.design.title": "Design System",
    "case.learninghub.design.desc": "We used a clean, card-based layout with a purple accent color (#7C3AED) to evoke creativity and wisdom. The typography is set in Inter for maximum readability on data-heavy screens.",
    
    "case.sunrise.next": "Next Project: IT Real →",
    "case.sunrise.overlay": "Coming Soon...",
    "case.sunrise.caption": "Interactive Detective Interface — Click folders to explore evidence (Demo)",
    "case.sunrise.concept.desc": "\"Sunrise\" is an immersive interactive detective experience. The interface mimics a classified workstation, creating a sense of mystery and urgency for the user as they navigate through evidence.",
    "case.sunrise.interaction.desc": "The OS-like interface features draggable windows, a file system navigation structure, and status indicators that guide the user's progress through the investigation episodes.",
    
    # FAQ keys
    "faq.title": "FAQ",
    "faq.tag.questions": "#questions ❓",
    "faq.tag.answers": "#answers 💡",
    "faq.quote": "Answers to common<br>questions about<br>working together",
    "faq.tab.hr": "HR Questions",
    "faq.tab.tech": "Technical Questions",
    "faq.hr.about.title": "👋 Tell us about yourself and how you got into design",
    "faq.hr.about.start.title": "Start of the journey",
    "faq.hr.about.start.text": "In 2017, I found myself surrounded by developers, and this had a strong influence on me — I saw how directly design can impact a product and its users. By trying different roles, I quickly realized that design was what truly resonated with me: the ability to see results immediately, test hypotheses, and improve people’s experience in real time.",
    "faq.hr.about.growth.title": "Professional Growth",
    "faq.hr.about.growth.text": "Since then, I have fully dedicated myself to UI/UX, progressing from freelance and outsourcing work to an in-house product company. I have worked with:",
    "faq.hr.about.growth.list.1": "🔹 B2B SaaS platforms",
    "faq.hr.about.growth.list.2": "🔹 Mobile applications",
    "faq.hr.about.growth.list.3": "🔹 Admin panels",
    "faq.hr.about.growth.list.4": "🔹 Websites",
    "faq.hr.about.growth.text2": "I continuously learn new tools and technologies to bring maximum value to both the product and the team.",
    "faq.hr.workflow.title": "⚙️ Describe your workflow (design process)",
    "faq.hr.workflow.intro": "My process is flexible and always depends on the project: timeline, budget, client requirements, and the product stage. I start by aligning with stakeholders on constraints to choose the most appropriate approach.",
    "faq.hr.workflow.short.title": "Short projects / small budget",
    "faq.hr.workflow.short.meta": "(2–4 weeks)",
    "faq.hr.workflow.short.text": "Quick research (data analysis + 3–5 interviews) → sketches → mid-fidelity prototype → testing with the client/teammates → high-fidelity design in Figma → handoff in Dev Mode.",
    "faq.hr.workflow.standard.title": "Standard projects / product teams",
    "faq.hr.workflow.standard.meta": "(1–4 months)",
    "faq.hr.workflow.standard.text": "Full cycle: in-depth research (interviews, analytics, CJM, personas) → ideation (brainstorming, sketches) → mid-fidelity prototypes → high-fidelity UI with a UI kit → testing (usability, A/B) → data-driven iterations → detailed handoff + documentation.",
    "faq.hr.workflow.complex.title": "Complex projects",
    "faq.hr.workflow.complex.meta": "(B2B, fintech, enterprise)",
    "faq.hr.workflow.complex.text": "I additionally include accessibility checks, edge-case analysis, user roles modeling, and expert reviews.",
    "faq.hr.workflow.outro": "In all cases, I iterate based on feedback and data. The main goal is to deliver real value to the product in real-world conditions, not to rigidly follow a fixed framework.",
    "faq.hr.handoff.title": "📦 How do you hand off your projects to developers?",
    "faq.hr.handoff.text1": "I make the handoff as clear and developer-friendly as possible. In Figma, I use Dev Mode with well-structured components, variants, auto layout, and variables/tokens. I create a dedicated file or page with a UI kit (colors, typography, spacing, icons). I also add detailed specifications: sizes, spacing, states (hover, active, disabled), and motion guidelines.",
    "faq.hr.handoff.text2": "All flows and logic are documented in Notion or Zeroheight: flowcharts, user flows, and edge cases. When needed, I run walkthrough sessions with developers. This approach significantly reduces questions and speeds up development by 1.5–2x.",
    "faq.hr.challenge.title": "🔥 Tell us about your most challenging project",
    "faq.hr.challenge.intro": "The most challenging tasks usually come with new experiences, when there are no ready-made templates to rely on. For me, this was an admin panel project for a large e-commerce company — I had never worked with internal systems before.",
    "faq.hr.challenge.p1.title": "😰 The Challenge",
    "faq.hr.challenge.p1.text": "At first, I felt disoriented: large volumes of data, complex logic, and multiple user roles.",
    "faq.hr.challenge.p2.title": "🚀 The Solution",
    "faq.hr.challenge.p2.text": "I started by diving deep into the domain context to understand the specifics of warehouse logistics. My process included:",
    "faq.hr.challenge.p2.list.1": "Studied Material Design guidelines for enterprise products",
    "faq.hr.challenge.p2.list.2": "Conducted interviews with the product manager to clarify business logic",
    "faq.hr.challenge.p2.list.3": "Created a high-fidelity prototype in Figma to test navigation flows",
    "faq.hr.challenge.p3.title": "✅ The Result",
    "faq.hr.challenge.p3.text": "I built a clear information architecture, optimized navigation, and reduced the number of input errors. The project was successfully launched, and I gained invaluable experience with B2B interfaces, as well as confidence in my ability to quickly adapt to new domains.",
    "faq.hr.failure.title": "💡 Tell us about your failures (mistakes, setbacks) at work",
    "faq.hr.failure.intro": "One of the key responsibilities of a designer is the ability to justify decisions and advocate for users. In a mobile application project, we had already reached the high-fidelity design stage when the client suddenly requested a fully neon lime background — “very bright and trendy.”",
    "faq.hr.failure.p1.title": "⚠️ The Risk",
    "faq.hr.failure.p1.text": "I clearly understood the risks: poor text readability (contrast below 3:1 according to WCAG), eye strain, accessibility issues, and potentially high bounce rates.",
    "faq.hr.failure.p2.title": "🛡️ My Approach",
    "faq.hr.failure.p2.text": "I prepared structured arguments for the meeting:",
    "faq.hr.failure.p2.list.1": "📉 WCAG AA/AAA contrast standards",
    "faq.hr.failure.p2.list.2": "📉 Research from the Nielsen Norman Group on the impact of bright backgrounds on usability",
    "faq.hr.failure.p2.list.3": "📉 A/B tests from similar cases, where overly bright colors reduced conversion rates by 15–30%",
    "faq.hr.failure.p3.title": "🏁 The Outcome",
    "faq.hr.failure.p3.text": "However, the client insisted — it was a gift for his wife, and neon green was her favorite color. I proposed a compromise: to create two versions — his preferred one and a more user-friendly alternative. After reviewing both, he still chose his option.",
    "faq.hr.failure.p4.title": "🎓 Lesson Learned",
    "faq.hr.failure.p4.text": "I clearly documented all risks and ways to mitigate them. The app was released, and this case taught me an important lesson: <em>not all decisions are rational, but it is crucial to remain an honest advisor to the client and clearly communicate the potential consequences.</em>",
    "faq.hr.leading.title": "🧭 Have you had experience leading projects independently?",
    "faq.hr.leading.text": "Yes, both in teams and independently. In freelance and outsourcing projects, I led the full cycle from brief to release: research, design, handoff, and sometimes even light product management. In a product company, I also took ownership of features — from ideation to post-release analysis.",
    "faq.hr.deadlines.title": "⏳ Do you meet deadlines? How do you work in a multitasking environment?",
    "faq.hr.deadlines.text": "Yes, I consistently meet deadlines. I plan tasks in Notion or Trello, always leaving buffer time for iterations. In multitasking environments, I rely on prioritization frameworks (MoSCoW or Eisenhower), daily stand-ups, and focus blocks (Pomodoro). If a deadline is tight, I immediately inform the team and suggest trade-offs, such as scope reduction. Over the past few years, I have not missed any deadlines due to my fault.",
    "faq.hr.feedback.title": "👂 How do you react to negative feedback on your work?",
    "faq.hr.feedback.text1": "Calmly and constructively — negative feedback is always an opportunity to improve. First, I listen without becoming defensive and ask clarifying questions (“What exactly feels inconvenient?”, “Which user scenario causes the issue?”). Then I analyze the feedback: if it is well-founded, I acknowledge it and propose improvements. If it is subjective, I support my decision with arguments based on data, testing, and design guidelines. In any case, I thank the person for the feedback, as it helps me grow.",
    "faq.hr.feedback.text2": "For example, once a stakeholder wanted to remove a CTA button; after running a test, we brought it back and increased conversion by 12%.",
    "faq.hr.weaknesses.title": "🚧 What are your weaknesses?",
    "faq.hr.weaknesses.text": "I tend to be quite anxious — sometimes I worry too much about quality and deadlines and may overcheck my work. However, I have learned to manage this: I use clear checklists, apply time-boxing for reviews, and discuss risks with the team in advance. This helps me turn anxiety into attention to detail and reliability.",
    "faq.hr.trends.title": "📚 How do you stay up to date with design trends and new technologies?",
    "faq.hr.trends.text1": "I follow a range of newsletters and channels, including Nielsen Norman Group, UX Collective, Awwwards, Muz.li, The Verdict, the Figma Blog, and Designer News. I also follow designers who inspire me, such as Dasha — “Vsyo i tak yasno,” “Design Systems” by Vladislav Renk, and many others.",
    "faq.hr.trends.text2": "Whenever I come across a promising technology, I try to adopt it right away. For example, as soon as I learned about vibe coding and AI-assisted design, I tested it in a personal project and now actively use it to quickly generate and explore ideas.",
    "faq.hr.environment.title": "✨ Describe your ideal work environment",
    "faq.hr.environment.text": "I look for a friendly and supportive team that values its people and strives to build transparent, effective processes. An environment where one can grow both as a product and personally, experiment with approaches, improve team interaction, and create solutions that truly help users.",
    "faq.hr.newjob.title": "🔍 Why are you looking for a new job?",
    "faq.hr.newjob.text": "My current project has been successfully completed, and no new large-scale challenges are expected in the near future. I want to continue growing and working on products with a strong focus on the user. I am looking for a company with meaningful tasks, the ability to influence the product, and a team that actively experiments with new approaches.",
    "faq.hr.fiveyears.title": "🔮 Where do you see yourself in 5 years?",
    "faq.hr.fiveyears.text": "In five years, I see myself as a Senior or Lead UX Designer, or a Design Lead for a small team. I want to deeply develop expertise in product design, research, and strategic thinking — helping companies build products that solve real problems. I plan to mentor juniors, develop design systems, and influence product strategy. Ideally — growing within a strong team where design is on par with business and development.",
    "faq.tech.requirements.title": "🎯 How do you define feature requirements and priorities?",
    "faq.tech.requirements.text1": "I start by aligning with the product team and stakeholders on goals, user needs, and constraints (technical, budget, timeline). Then I conduct research: analyzing existing data, interviewing users, and reviewing competitors and current solutions.",
    "faq.tech.requirements.text2": "In practice, even with a small team (3–4 people), I use a simple prioritization approach: I list all features, evaluate them based on user and business impact, and estimate implementation complexity. For example, in a mobile app project for a B2B store, we identified the top three features that solved key user pain points — improving product search, quick access to orders, and status notifications. These features were implemented in the first iteration, while less critical ones were scheduled for the next sprint.",
    "faq.tech.figma.title": "🎨 Describe your workflow in Figma",
    "faq.tech.figma.text": "I start with research → create user flows in FigJam → low-fidelity wireframes → mid/high-fidelity designs using auto-layout. Everything is built with components and variants. I store colors, spacing, and typography in variables (with modes for light/dark). I hand off to Dev Mode and, if needed, provide a component specification.",
    "faq.tech.consistency.title": "🏗️ How do you maintain consistency when working on a large project?",
    "faq.tech.consistency.text": "I maintain consistency by creating and managing a design system: foundation (colors, typography, spacing, icons) and components with variants. I use variables and tokens so changes propagate automatically across the interface. All components are documented in Figma or Notion. Regular design reviews and team syncs ensure a unified style, while auto-layout and standardized naming minimize errors.",
    "faq.tech.designsystem.title": "📐 How do you organize a design system in Figma?",
    "faq.tech.designsystem.text": "I create a separate library file with the foundation (colors, typography, icons, spacing) and components (buttons, cards, forms). Everything is built with variants and properties. Naming follows a BEM-like or Atomic Design structure, e.g., foundation/color/primary, components/button/primary/large. I also include documentation within the file in a separate frame.",
    "faq.tech.variables.title": "🔢 How do you work with variables in Figma?",
    "faq.tech.variables.text": "I create collections for colors (primary, accent, neutral, semantic — success/error), spacing (base 4px → multiples), and typography (font family + scale: header, text, caption). I configure modes: light/dark theme, brand A/brand B, dense/normal. All variables are linked to components — when switching modes, the entire interface updates automatically.",
    "faq.tech.hierarchy.title": "👁️ What is visual hierarchy and how do you build it?",
    "faq.tech.hierarchy.text": "Visual hierarchy is how the user's eye instantly perceives the importance of elements. I create it using size, contrast, color, spacing, and placement. The most important elements are larger, brighter, higher, and to the left. I check in black-and-white mode — if everything is readable, the hierarchy works.",
    "faq.tech.typography.title": "🔠 How do you work with a typographic scale?",
    "faq.tech.typography.text": "I use a modular scale (usually Major Third or Perfect Fourth) to define font sizes. I establish a set of styles: H1-H6 for headers, Body (Large, Regular, Small) for text, and Caption/Overline for auxiliary details. I always check line height (usually 1.2 for headers, 1.5 for text) to ensure readability.",

    "faq.tech.responsive.title": "📱 How do you handle responsive/adaptive design?",
    "faq.tech.responsive.text": "I follow a mobile-first approach. I use auto-layout with min/max width, wrap, hug/fill. Breakpoints: 360–428px for mobile, 768px for tablet, 1024–1440px for desktop. I test in prototypes with different frame sizes.",
    "faq.tech.color.title": "🌗 How do you ensure color accessibility?",
    "faq.tech.color.text": "I check contrast according to WCAG 2.2: at least 4.5:1 for normal text, 3:1 for large text. I use Figma plugins like Stark or Contrast. Semantic colors are always verified for text-on-background and interactive states.",
    "faq.tech.inclusivity.title": "♿ How do you ensure inclusivity and accessibility?",
    "faq.tech.inclusivity.text": "I consider it from the first screen: contrast, keyboard navigation, alt texts, large touch targets (min 44×44px), and simple language. I test with tools like axe DevTools and, if possible, with people with different abilities.",
    "faq.tech.handoff.title": "📦 How do you hand off designs to developers?",
    "faq.tech.handoff.text": "Via Figma Dev Mode: developers can inspect and copy CSS / iOS / Android values. For large systems, I export tokens (JSON) using the Tokens Studio plugin and provide them to the codebase. I also create redlines for spacing and write a brief specification in Notion or Jira.",
    "faq.tech.abtesting.title": "🧪 Experience with A/B testing and making data-driven decisions",
    "faq.tech.abtesting.text": "I use A/B testing to validate hypotheses and assess the impact of changes on users. For example, I tested different CTA button variants — based on conversion data, we selected the version that increased conversion by 12%. I make data-driven decisions using metrics like engagement, conversion rates, heatmaps, and behavior analytics. If results are inconclusive, I conduct additional tests or user interviews to understand the reasons.",
    "faq.tech.ai.title": "🤖 What is your approach to AI in design?",
    "faq.tech.ai.text": "AI is useful at the ideation stage and for generating variants (Midjourney, Galileo, Figma AI for layout). However, I always refine the final design manually — AI doesn’t yet understand context, brand, or accessibility fully.",
    
    "cases.nextproject.tech.1": "...",
    
    "chat.title": "Chat with me",
    "chat.end_btn": "End Chat",
    "chat.placeholder": "Type a message...",
    "chat.confirm.title": "End Chat?",
    "chat.confirm.text": "Are you sure you want to end the chat and clear history?",
    "chat.confirm.cancel": "Cancel",
    "chat.confirm.end": "End Chat",
    "chat.bot.welcome": "Hello! 👋 How can I help you? Leave a message and I'll respond shortly.",
    "chat.bot.ended": "Chat ended. History cleared.",
    "chat.bot.sent": "Message sent! I will reply soon.",
    "chat.bot.error": "❌ Error: Make sure you started the bot in Telegram.",
}

# Define missing keys for UA (only case studies, assuming FAQ is there)
new_ua_keys = {
    "cases.nextproject.title": "Наступний проект",
    "cases.nextproject.year": "Майбутнє",
    "cases.nextproject.desc": "В процесі",
    "case.nav.back": "← Назад до кейсів",
    "case.visit.website": "Відвідати сайт ↗",
    "case.concept.title": "Концепція",
    "case.features.title": "Ключові особливості",
    "case.challenge.title": "Виклик",
    "case.visual.title": "Візуальний напрямок",
    "case.interaction.title": "Дизайн взаємодії",
    
    "case.realface.next": "Наступний проект: Languages Of Love →",
    "case.realface.caption": "Інтерактивний перегляд платформи.",
    "case.realface.concept.desc": "RealFace — це SAAS платформа для інтеграції розпізнавання облич у бізнес. Інтерфейс сфокусований на ясності та простоті використання, з сучасною технологічною естетикою.",
    "case.realface.features.desc": "Аналітика в реальному часі, керування користувачами та безшовна API інтеграція були основними вимогами. Дашборд надає корисні інсайти з першого погляду.",
    
    "case.lovelang.next": "Наступний проект: Learning Hub →",
    "case.lovelang.caption": "Інтерактивний квіз — Оберіть варіант, щоб продовжити",
    "case.lovelang.challenge.desc": "Перетворення нематеріальної концепції «мов кохання» на відчутний цифровий досвід. Метою було створити теплий, привабливий інтерфейс, який відчувається особистим і безпечним.",
    "case.lovelang.visual.desc": "Я обрала м'яку палітру рожевих і теплих білих кольорів у поєднанні з заокругленою типографікою для ніжності. Карткова взаємодія імітує гру або ворожіння на таро.",
    
    "case.refillarena.next": "Наступний проект: Sunrise →",
    "case.refillarena.caption": "Інтерактивний магазин — Клікніть, щоб дослідити",
    "case.refillarena.concept.desc": "RefillArena поєднує традиційні ігрові поповнення з сучасними Web3 активами. Темний UI зменшує навантаження на очі геймерів, а яскраві акцентні кольори виділяють заклики до дії.",
    "case.refillarena.ux.title": "UX Фокус",
    "case.refillarena.ux.desc": "Швидкість — це ключ. Процес покупки оптимізовано до 3 кліків від перегляду до оплати. Мікро-взаємодії (як глітч-ефект) додають занурення.",
    
    "case.learninghub.next": "Наступний проект: RefillArena →",
    "case.learninghub.caption": "Інтерактивний дашборд — Клікніть вкладки для фільтрації курсів",
    "case.learninghub.overview.title": "Огляд",
    "case.learninghub.overview.desc": "Learning Hub — це універсальна платформа для навчальних закладів. Головним викликом було розробити інтерфейс, що обробляє складні дані (тисячі студентів і курсів), не перевантажуючи адміністратора.",
    "case.learninghub.design.title": "Дизайн-система",
    "case.learninghub.design.desc": "Ми використали чистий картковий макет з фіолетовим акцентом (#7C3AED) для творчості та мудрості. Типографіка Inter забезпечує максимальну читабельність на насичених даними екранах.",
    
    "case.sunrise.next": "Наступний проект: IT Real →",
    "case.sunrise.overlay": "Незабаром...",
    "case.sunrise.caption": "Інтерактивний детективний інтерфейс — Клікніть папки для дослідження доказів (Демо)",
    "case.sunrise.concept.desc": "\"Sunrise\" — це імерсивний інтерактивний детективний досвід. Інтерфейс імітує секретну робочу станцію, створюючи відчуття таємниці та терміновості.",
    "case.sunrise.interaction.desc": "Інтерфейс у стилі ОС має перетягувані вікна, файлову систему навігації та індикатори статусу, що направляють прогрес розслідування.",
    
    "cases.nextproject.tech.1": "...",
}

# Helper to format dict to JS lines
def format_js_lines(keys_dict, indent="    "):
    lines = []
    for k, v in keys_dict.items():
        escaped_v = v.replace('"', '\\"').replace('\n', '\\n')
        lines.append(f'{indent}"{k}": "{escaped_v}",')
    return "\n".join(lines)

# Find insertion point for EN (before "ua": {)
ua_start_match = re.search(r'ua["\']?\s*:\s*\{', content)
if ua_start_match:
    en_end_index = ua_start_match.start()
    # Find the last closing brace or comma before "ua": { to be safe, but usually it's just before.
    # Actually, we want to insert before the closing brace of 'en' object.
    # But wait, 'en' ends right before 'ua' starts?
    # Usually: en: { ... }, ua: { ... }
    # So we should look for the closing brace '}' of 'en' before 'ua:'.
    # Let's search backwards from ua_start_match.start()
    
    pre_ua = content[:en_end_index]
    last_brace = pre_ua.rfind('}')
    if last_brace != -1:
        # Check if there is a comma after it
        insertion_point_en = last_brace
        
        # Insert EN keys
        new_en_content = "\n" + format_js_lines(new_en_keys) + "\n"
        content = content[:insertion_point_en] + new_en_content + content[insertion_point_en:]

# Now re-find UA end because content length changed
# Find the last '}' before '};' at the end of file
# The file ends with '};' usually for 'const translations = { ... };'
last_semicolon = content.rfind('};')
if last_semicolon != -1:
    pre_end = content[:last_semicolon]
    last_brace_ua = pre_end.rfind('}')
    if last_brace_ua != -1:
        insertion_point_ua = last_brace_ua
        
        # Insert UA keys
        new_ua_content = "\n" + format_js_lines(new_ua_keys) + "\n"
        content = content[:insertion_point_ua] + new_ua_content + content[insertion_point_ua:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated translations.js with missing keys.")
