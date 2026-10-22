import fs from 'fs';
import { SUPERVISOR_FIELD_CARDS } from '../src/data/supervisorFieldCards.ts';

const cardsJson = JSON.stringify(SUPERVISOR_FIELD_CARDS);

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>دليل الإشراف التربوي الميداني - 20 بطاقة معالجة</title>
    <link rel="icon" type="image/svg+xml" href="/supervisor-icon.svg">
    <style>
        :root {
            --primary: #1e3a8a;
            --primary-dark: #0f172a;
            --primary-light: #3b82f6;
            --secondary: #0d9488;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-sub: #475569;
            --border: #e2e8f0;
            --danger: #dc2626;
            --success: #16a34a;
            --warning: #d97706;
            --gold: #f59e0b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Cairo', Helvetica, Arial, sans-serif;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            background-color: var(--bg);
            color: var(--text-main);
            padding: 12px;
            padding-bottom: 50px;
            max-width: 720px;
            margin: 0 auto;
        }

        header {
            position: sticky;
            top: 0;
            background: rgba(248, 250, 252, 0.96);
            backdrop-filter: blur(10px);
            padding-bottom: 10px;
            z-index: 20;
            border-bottom: 1px solid var(--border);
            margin-bottom: 12px;
        }

        .top-nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 0;
            margin-bottom: 6px;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #e2e8f0;
            color: var(--primary);
            text-decoration: none;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 800;
        }

        .school-badge {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-sub);
            background: #fff;
            padding: 4px 10px;
            border-radius: 12px;
            border: 1px solid var(--border);
        }

        .header-title {
            text-align: center;
            font-size: 1.25rem;
            font-weight: 900;
            color: var(--primary);
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .header-sub {
            text-align: center;
            font-size: 0.82rem;
            color: var(--text-sub);
            margin-bottom: 10px;
            line-height: 1.4;
        }

        .badge-counter {
            background: var(--gold);
            color: #000;
            font-weight: 900;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
        }

        .search-box-wrap {
            position: relative;
        }

        .search-box {
            width: 100%;
            padding: 11px 16px;
            border-radius: 12px;
            border: 1.5px solid var(--border);
            font-size: 0.9rem;
            background: #fff;
            outline: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
            transition: border-color 0.2s;
        }

        .search-box:focus {
            border-color: var(--primary-light);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .filter-tags {
            display: flex;
            gap: 6px;
            margin-top: 8px;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none;
        }

        .filter-tags::-webkit-scrollbar {
            display: none;
        }

        .tag-btn {
            background: #ffffff;
            color: var(--text-sub);
            border: 1px solid var(--border);
            padding: 6px 13px;
            border-radius: 20px;
            font-size: 0.76rem;
            font-weight: 700;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .tag-btn.active {
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
            box-shadow: 0 2px 6px rgba(30, 58, 138, 0.25);
        }

        .count-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.78rem;
            color: var(--text-sub);
            padding: 4px 6px;
            margin-top: 4px;
        }

        .grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 10px;
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.03);
            cursor: pointer;
            transition: transform 0.1s ease, border-color 0.2s ease, box-shadow 0.2s ease;
            position: relative;
        }

        .card:hover {
            border-color: var(--primary-light);
            box-shadow: 0 4px 12px rgba(30, 58, 138, 0.08);
        }

        .card:active {
            transform: scale(0.985);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            gap: 8px;
        }

        .card-num {
            background: var(--primary);
            color: var(--gold);
            font-size: 0.72rem;
            font-weight: 900;
            padding: 3px 8px;
            border-radius: 6px;
            letter-spacing: 0.5px;
        }

        .badge {
            font-size: 0.7rem;
            font-weight: 800;
            padding: 3px 9px;
            border-radius: 6px;
        }

        .badge-admin { background: #fee2e2; color: var(--danger); border: 1px solid #fecaca; }
        .badge-pedagogy { background: #e0f2fe; color: var(--primary-light); border: 1px solid #bae6fd; }
        .badge-discipline { background: #fef3c7; color: var(--warning); border: 1px solid #fde68a; }
        .badge-emergency { background: #ffe4e6; color: #e11d48; border: 1px solid #fecdd3; }
        .badge-community { background: #dcfce7; color: var(--success); border: 1px solid #bbf7d0; }

        .card-title {
            font-size: 0.98rem;
            font-weight: 800;
            color: var(--text-main);
            margin-bottom: 6px;
            line-height: 1.4;
        }

        .card-preview {
            font-size: 0.82rem;
            color: var(--text-sub);
            line-height: 1.5;
            margin-bottom: 8px;
        }

        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--primary-light);
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            z-index: 100;
            align-items: flex-end;
            justify-content: center;
        }

        .modal.active {
            display: flex;
        }

        .modal-sheet {
            background: #fff;
            width: 100%;
            max-width: 600px;
            max-height: 88vh;
            border-top-left-radius: 24px;
            border-top-right-radius: 24px;
            padding: 22px 18px;
            overflow-y: auto;
            animation: slideUp 0.25s ease-out;
            box-shadow: 0 -10px 25px rgba(0,0,0,0.15);
        }

        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }

        .modal-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .modal-title {
            font-size: 1.15rem;
            font-weight: 900;
            color: var(--primary);
            margin-bottom: 12px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--border);
            line-height: 1.4;
        }

        .section-box {
            margin-bottom: 14px;
            background: #f8fafc;
            border-radius: 10px;
            padding: 12px 14px;
            border-right: 4px solid var(--primary-light);
        }

        .section-box.action { border-right-color: var(--primary); background: #f0f7ff; }
        .section-box.danger { border-right-color: var(--danger); background: #fef2f2; }
        .section-box.success { border-right-color: var(--success); background: #f0fdf4; }
        .section-box.warning { border-right-color: var(--warning); background: #fffbeb; }

        .section-title {
            font-size: 0.82rem;
            font-weight: 800;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .section-box.action .section-title { color: var(--primary); }
        .section-box.danger .section-title { color: var(--danger); }
        .section-box.success .section-title { color: var(--success); }
        .section-box.warning .section-title { color: var(--warning); }

        .section-content {
            font-size: 0.85rem;
            line-height: 1.6;
            color: var(--text-main);
        }

        .section-content ol, .section-content ul {
            padding-right: 18px;
        }

        .section-content li {
            margin-bottom: 4px;
        }

        .template-box {
            background: #ffffff;
            border: 1px dashed #94a3b8;
            border-radius: 8px;
            padding: 12px;
            font-family: monospace, system-ui;
            font-size: 0.82rem;
            white-space: pre-wrap;
            line-height: 1.5;
            color: #334155;
            margin-top: 8px;
        }

        .btn-row {
            display: flex;
            gap: 8px;
            margin-top: 14px;
        }

        .btn {
            flex: 1;
            padding: 12px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 0.88rem;
            cursor: pointer;
            border: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: opacity 0.15s;
        }

        .btn:hover {
            opacity: 0.9;
        }

        .btn-primary {
            background: var(--primary);
            color: #fff;
        }

        .btn-secondary {
            background: #e2e8f0;
            color: var(--text-main);
        }

        .btn-copy {
            background: #0284c7;
            color: #fff;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.76rem;
            color: #64748b;
            border-top: 1px solid var(--border);
            padding-top: 16px;
            line-height: 1.6;
        }

        .copyright-tag {
            font-weight: 800;
            color: var(--primary);
            margin-top: 4px;
        }
    </style>
</head>
<body>

    <header>
        <div class="top-nav">
            <a href="/" class="back-link">⬅ العودة للنظام الداخلي</a>
            <span class="school-badge">ثانوية ابن الهيثم التقنية</span>
        </div>
        <div class="header-title">
            <span>🛡️ المساعد الذكي للإشراف التربوي الميداني</span>
            <span class="badge-counter">20 بطاقة</span>
        </div>
        <div class="header-sub">
            بطاقات التدخل السريع والمعالجة الميدانية لمعضلات الحياة المدرسية اليومية • سندات قانونية ونماذج إدارية موثقة
        </div>
        <div class="search-box-wrap">
            <input type="text" id="searchInput" class="search-box" placeholder="ابحث عن معضلة، قانون، أو حل ميداني من بين الـ 20 بطاقة..." oninput="handleSearch()">
        </div>
        <div class="filter-tags">
            <button class="tag-btn active" onclick="filterCards('all', this)">الكل (20)</button>
            <button class="tag-btn" onclick="filterCards('إداري وقانوني', this)">إداري وقانوني (6)</button>
            <button class="tag-btn" onclick="filterCards('حالات طارئة وأمنية', this)">حالات طارئة وأمنية (6)</button>
            <button class="tag-btn" onclick="filterCards('انضباطي وسلوكي', this)">انضباطي وسلوكي (4)</button>
            <button class="tag-btn" onclick="filterCards('بيداغوجي وتربوي', this)">بيداغوجي وتربوي (3)</button>
            <button class="tag-btn" onclick="filterCards('علاقات وأولياء الأمور', this)">علاقات وأولياء الأمور (1)</button>
        </div>
        <div class="count-bar">
            <span id="resultCount">عرض 20 من أصل 20 بطاقة معالجة ميدانية موثقة</span>
            <span>البطاقات من 01 إلى 20</span>
        </div>
    </header>

    <div class="grid" id="cardsGrid">
        <!-- Cards dynamically injected -->
    </div>

    <!-- Details Sheet Modal -->
    <div class="modal" id="cardModal" onclick="closeModalOnBackdrop(event)">
        <div class="modal-sheet" id="modalSheet">
            <div class="modal-top">
                <span class="card-num" id="modalCardNumber">بطاقة 01 / 20</span>
                <span class="badge" id="modalCardBadge">إداري وقانوني</span>
            </div>
            <div class="modal-title" id="modalCardTitle">عنوان البطاقة</div>

            <div class="section-box action">
                <div class="section-title">⚡ الإجراء الميداني الفوري للمشرف التربوي:</div>
                <div class="section-content" id="modalCardAction"></div>
            </div>

            <div class="section-box warning">
                <div class="section-title">⚖️ السند القانوني والمواد المرجعية:</div>
                <div class="section-content" id="modalCardLegal"></div>
            </div>

            <div class="section-box danger">
                <div class="section-title">⛔ المحظورات والتصرفات الممنوع ارتكابها:</div>
                <div class="section-content" id="modalCardForbidden"></div>
            </div>

            <div class="section-box success">
                <div class="section-title">🌱 المعالجة والحل البيداغوجي التربوي:</div>
                <div class="section-content" id="modalCardPedagogy"></div>
            </div>

            <div class="section-box" id="modalDocSection" style="display:none;">
                <div class="section-title" id="modalDocTitle">📄 النموذج الإداري الميداني:</div>
                <div class="template-box" id="modalDocContent"></div>
                <button class="btn btn-copy" style="width: 100%; margin-top: 6px;" onclick="copyDocContent()">
                    📋 نسخ النموذج الإداري
                </button>
            </div>

            <div class="btn-row">
                <button class="btn btn-primary" onclick="copyCardPlan()">
                    📋 نسخ خطة البطاقة
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    إغلاق
                </button>
            </div>
        </div>
    </div>

    <footer class="footer">
        <div>دليل الإشراف التربوي الميداني • ثانوية ابن الهيثم التقنية (محمد بلوزداد) - الجزائر</div>
        <div>السنة الدراسية: 2026 / 2027 • مصلحة الاستشارة التربوية</div>
        <div class="copyright-tag">جميع الحقوق محفوظة © للمشرف التربوي ش. رشيد</div>
    </footer>

    <script>
        const CARDS = ${cardsJson};

        let currentCategory = 'all';
        let currentSearch = '';
        let activeCard = null;

        function getBadgeClass(badgeType) {
            switch(badgeType) {
                case 'admin': return 'badge-admin';
                case 'pedagogy': return 'badge-pedagogy';
                case 'discipline': return 'badge-discipline';
                case 'emergency': return 'badge-emergency';
                case 'community': return 'badge-community';
                default: return 'badge-admin';
            }
        }

        function renderCards() {
            const grid = document.getElementById('cardsGrid');
            grid.innerHTML = '';

            const filtered = CARDS.filter((card) => {
                const matchCat = currentCategory === 'all' || card.category === currentCategory;
                const q = currentSearch.trim().toLowerCase();
                if (!q) return matchCat;
                const matchSearch =
                    card.title.toLowerCase().includes(q) ||
                    card.preview.toLowerCase().includes(q) ||
                    card.legalBasis.articles.toLowerCase().includes(q) ||
                    card.pedagogicalSolution.toLowerCase().includes(q);
                return matchCat && matchSearch;
            });

            document.getElementById('resultCount').textContent = 
                'عرض ' + filtered.length + ' من أصل ' + CARDS.length + ' بطاقة معالجة ميدانية موثقة';

            if (filtered.length === 0) {
                grid.innerHTML = '<div style="background:#fff; padding:30px; text-align:center; border-radius:14px; color:#64748b; font-weight:700;">لا توجد بطاقة تطابق بحثك. جرب كلمات أخرى كـ (هاتف، طرد، شجار، غياب)</div>';
                return;
            }

            filtered.forEach((card) => {
                const globalIndex = CARDS.findIndex(c => c.id === card.id) + 1;
                const cardEl = document.createElement('div');
                cardEl.className = 'card';
                cardEl.onclick = () => openCard(card, globalIndex);

                cardEl.innerHTML = \`
                    <div class="card-header">
                        <span class="card-num">بطاقة \${String(globalIndex).padStart(2, '0')} / 20</span>
                        <span class="badge \${getBadgeClass(card.badgeType)}">\${card.badgeLabel}</span>
                    </div>
                    <div class="card-title">\${card.title}</div>
                    <div class="card-preview">\${card.preview}</div>
                    <div class="card-footer">
                        <span>⚡ \${card.immediateAction.length} خطوات تدخل فوري</span>
                        <span>عرض التفاصيل والسند القانوني ⬅</span>
                    </div>
                \`;
                grid.appendChild(cardEl);
            });
        }

        function filterCards(category, btn) {
            currentCategory = category;
            document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
            renderCards();
        }

        function handleSearch() {
            currentSearch = document.getElementById('searchInput').value;
            renderCards();
        }

        function openCard(card, globalIndex) {
            activeCard = card;
            document.getElementById('modalCardNumber').textContent = 'بطاقة ' + String(globalIndex).padStart(2, '0') + ' / 20';
            
            const badgeEl = document.getElementById('modalCardBadge');
            badgeEl.textContent = card.badgeLabel;
            badgeEl.className = 'badge ' + getBadgeClass(card.badgeType);

            document.getElementById('modalCardTitle').textContent = card.title;

            // Immediate actions
            document.getElementById('modalCardAction').innerHTML = 
                '<ol>' + card.immediateAction.map(s => '<li>' + s + '</li>').join('') + '</ol>';

            // Legal
            document.getElementById('modalCardLegal').innerHTML = 
                '<div><strong>المواد المعتمدة:</strong> ' + card.legalBasis.articles + '</div>' +
                '<div style="margin-top:4px; font-size:0.8rem; color:#475569;">' + card.legalBasis.description + '</div>';

            // Forbidden
            document.getElementById('modalCardForbidden').innerHTML = 
                '<ul>' + card.forbiddenActions.map(f => '<li>' + f + '</li>').join('') + '</ul>';

            // Pedagogy
            document.getElementById('modalCardPedagogy').innerHTML = 
                '<div>' + card.pedagogicalSolution + '</div>';

            // Document Template
            const docSec = document.getElementById('modalDocSection');
            if (card.documentTemplate) {
                docSec.style.display = 'block';
                document.getElementById('modalDocTitle').textContent = '📄 النموذج الإداري الميداني: ' + card.documentTemplate.name;
                document.getElementById('modalDocContent').textContent = card.documentTemplate.content;
            } else {
                docSec.style.display = 'none';
            }

            document.getElementById('cardModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            document.getElementById('cardModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        function closeModalOnBackdrop(e) {
            if (e.target.id === 'cardModal') {
                closeModal();
            }
        }

        function copyDocContent() {
            if (!activeCard || !activeCard.documentTemplate) return;
            navigator.clipboard.writeText(activeCard.documentTemplate.content).then(() => {
                alert('تم نسخ النموذج الإداري بنجاح!');
            });
        }

        function copyCardPlan() {
            if (!activeCard) return;
            const globalIndex = CARDS.findIndex(c => c.id === activeCard.id) + 1;
            const text = '📋 بطاقة التدخل الميداني رقم [' + globalIndex + ' / 20]: ' + activeCard.title + '\\n' +
                'التصنيف: ' + activeCard.category + '\\n' +
                'السند القانوني: ' + activeCard.legalBasis.articles + '\\n\\n' +
                '⚡ الإجراء الفوري:\\n' + activeCard.immediateAction.map((s, i) => (i+1) + '. ' + s).join('\\n') + '\\n\\n' +
                '⛔ المحظورات:\\n' + activeCard.forbiddenActions.map(f => '• ' + f).join('\\n') + '\\n\\n' +
                '🌱 المعالجة التربوية:\\n' + activeCard.pedagogicalSolution + '\\n\\n' +
                'المصدر: المساعد الذكي للإشراف التربوي - ثانوية ابن الهيثم التقنية 2026/2027 • جميع الحقوق محفوظة © للمشرف التربوي ش. رشيد';
            
            navigator.clipboard.writeText(text).then(() => {
                alert('تم نسخ خطة البطاقة رقم ' + globalIndex + ' بنجاح!');
            });
        }

        // Initialize on load
        renderCards();
    </script>
</body>
</html>`;

fs.writeFileSync('public/supervisor.html', html, 'utf8');
console.log('Successfully generated public/supervisor.html with 20 cards!');
