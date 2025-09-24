(function() {
    // ===================================================================================
    // KONTROL PANELİ VE MANUEL VERİ GİRİŞİ
    // ===================================================================================
    const config = { birYillikHedefArtisOrani: 0.40, geleceginYildiziArtisOrani: 0.60, gizliHazineDengelemeOrani: 0.20, takasAnaliziInterval: 3000, haberAkisiInterval: 10000 };
    const userPortfolio = {
        name: "Benim Portföyüm",
        data: [
            { sembol: "SMARTG", lot: 8501, maliyet: 40.75, anlikFiyat: 30.80 },
            { sembol: "ARDYZ",  lot: 3568, maliyet: 36.04, anlikFiyat: 28.10 },
            { sembol: "KCAER",  lot: 5601, maliyet: 14.77, anlikFiyat: 14.63 },
            { sembol: "SASA",   lot: 11290, maliyet: 3.32,  anlikFiyat: 4.20  }
        ]
    };
    const examplePortfolio = {
        name: "Örnek Portföy",
        data: [
            { sembol: "KCHOL", lot: 500, maliyet: 220.50, anlikFiyat: 255.80 },
            { sembol: "AKBNK", lot: 2000, maliyet: 48.20, anlikFiyat: 60.50 },
            { sembol: "BIMAS", lot: 300, maliyet: 410.00, anlikFiyat: 515.25 },
            { sembol: "ASELS", lot: 800, maliyet: 55.75, anlikFiyat: 65.10 },
            { sembol: "THYAO", lot: 1000, maliyet: 285.40, anlikFiyat: 305.50 }
        ]
    };
    const ozluSozler = [ { soz: "Borsa, sabırsız olanın sabırlı olana para aktardığı bir mekanizmadır.", yazar: "Warren Buffett" } ];
    const sahtePiyasaVerileri = {
        yukselenler: [ { sembol: "TCELL", degisim: "+3.85%" }, { sembol: "TUPRS", degisim: "+3.50%" } ],
        dusenler: [ { sembol: "KOZAL", degisim: "-2.15%" }, { sembol: "HEKTS", degisim: "-1.90%" } ],
        hacimliler: [ { sembol: "THYAO", hacim: "3.2 Milyar ₺" } ]
    };
    const sahteHaberler = [
        { baslik: "Yenilenebilir Enerji Raporu: Güneş Panelleri Yatırımları Zirvede", ozet: "Uluslararası Enerji Ajansı'nın yayınladığı son rapora göre, artan enerji talebi ve teşvikler sayesinde güneş enerjisi santrallerine (GES) yapılan yatırımların rekor seviyeye ulaştığı belirtildi.", tarih: "24 Eylül 2025" },
        { baslik: "BIST 100 Günü Yükselişle Tamamladı", ozet: "Borsa İstanbul'da BIST 100 endeksi, günü %0.85 değer kazancıyla 9.240 puandan tamamladı...", tarih: "24 Eylül 2025" },
        { baslik: "Teknoloji Sektörü İçin Yeni Teşvik Paketi Yolda", ozet: "Sanayi ve Teknoloji Bakanlığı'nın, yerli yazılım üreticilerini destekleyecek yeni bir teşvik paketi üzerinde çalıştığı bildirildi...", tarih: "23 Eylül 2025" }
    ];
    const araciKurumlar = ["İŞ YATIRIM", "BANK OF AMERICA", "GARANTİ BBVA", "YAPI KREDİ", "AK YATIRIM", "ÜNLÜ & CO", "TEB YATIRIM", "HALK YATIRIM", "ZİRAAT YATIRIM", "QNB FİNANS"];
    const sahteFinansVerileri = [
        { sembol: "GRAM ALTIN", fiyat: "2.485,50 ₺", degisim: "+0.45%", sinif: "positive" }, { sembol: "ONS ALTIN", fiyat: "2.315,80 $", degisim: "-0.22%", sinif: "negative" },
        { sembol: "USD/TRY", fiyat: "32.91 ₺", degisim: "+0.12%", sinif: "positive" }
    ];

    // --- UYGULAMA KODLARI ---
    let portfolioChart = null, newsInterval = null, analysisInterval = null, currentNewsIndex = 0;
    let activePortfolio = userPortfolio.data;

    Chart.register(ChartDataLabels);

    document.addEventListener("DOMContentLoaded", function() {
        setupEventListeners();
        runInitialFunctions();
        startIntervals();
        startParticles();
    });

    function setupEventListeners() {
        document.getElementById('user-portfolio-btn')?.addEventListener('click', () => switchPortfolio(userPortfolio.data, 'user-portfolio-btn'));
        document.getElementById('example-portfolio-btn')?.addEventListener('click', () => switchPortfolio(examplePortfolio.data, 'example-portfolio-btn'));
        const settingsBtn = document.getElementById('settings-btn'), modal = document.getElementById('settings-modal'), closeModalBtn = document.getElementById('close-modal-btn'), themeToggleBtn = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.className = savedTheme + '-theme';
        if (settingsBtn && modal && closeModalBtn && themeToggleBtn) {
            settingsBtn.addEventListener('click', () => { modal.style.display = 'flex'; document.body.classList.add('modal-open'); });
            closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; document.body.classList.remove('modal-open'); });
            modal.addEventListener('click', (event) => { if (event.target === modal) { modal.style.display = 'none'; document.body.classList.remove('modal-open'); } });
            themeToggleBtn.addEventListener('click', () => {
                const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
                document.body.className = newTheme + '-theme';
                localStorage.setItem('theme', newTheme);
                updateChartTheme();
            });
        }
        document.addEventListener('visibilitychange', () => { if (document.hidden) { stopIntervals(); } else { startIntervals(); } });
    }

    function runInitialFunctions() {
        portfoyuGuncelle();
        ozluSozGoster();
        sahtePiyasaVerileriniDoldur();
        populateTicker();
        populateNews();
        populateSecondaryTicker();
    }

    function startIntervals() {
        if (!analysisInterval) { updateAnalysis(); analysisInterval = setInterval(updateAnalysis, config.takasAnaliziInterval); }
        if (!newsInterval) { newsInterval = setInterval(rotateNews, config.haberAkisiInterval); }
    }

    function stopIntervals() {
        clearInterval(analysisInterval); clearInterval(newsInterval);
        analysisInterval = null; newsInterval = null;
    }

    function switchPortfolio(portfolioData, activeBtnId) {
        activePortfolio = portfolioData;
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeButton = document.getElementById(activeBtnId);
        if (activeButton) activeButton.classList.add('active');
        portfoyuGuncelle();
    }

    function calculatePortfolioMetrics(portfolioData) {
        const totalValue = portfolioData.reduce((sum, stock) => sum + (stock.lot * stock.anlikFiyat), 0);
        const totalCost = portfolioData.reduce((sum, stock) => sum + (stock.lot * stock.maliyet), 0);
        const returnPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
        return { totalValue, totalCost, returnPercent, stockCount: portfolioData.length };
    }

    function generateComparisonAnalysis() {
        const userMetrics = calculatePortfolioMetrics(userPortfolio.data);
        const exampleMetrics = calculatePortfolioMetrics(examplePortfolio.data);
        const container = document.getElementById('comparison-panel')?.querySelector('.comparison-container');
        if (!container) return;
        container.innerHTML = `<h4>Temel Metrikler</h4><p><strong>${userPortfolio.name}:</strong> Toplam Değer ${formatCurrency(userMetrics.totalValue)} | Getiri: <span class="${userMetrics.returnPercent >= 0 ? 'positive':'negative'}">${userMetrics.returnPercent.toFixed(2)}%</span><br><strong>${examplePortfolio.name}:</strong> Toplam Değer ${formatCurrency(exampleMetrics.totalValue)} | Getiri: <span class="${exampleMetrics.returnPercent >= 0 ? 'positive':'negative'}">${exampleMetrics.returnPercent.toFixed(2)}%</span></p><h4>Strateji Analizi</h4><p><strong>Sizin portföyünüz</strong>, ${userMetrics.stockCount} hisseden oluşarak daha odaklı bir yatırım stratejisi sergiliyor. <strong>Örnek portföy ise</strong>, ${exampleMetrics.stockCount} farklı hisseden oluşarak BIST 100'ün ana sektörlerine yayılan daha çeşitlendirilmiş bir yapıya sahiptir.</p>`;
    }

    function portfoyuGuncelle() {
        const hisseListesiBody = document.getElementById('hisse-listesi'), toplamDegerElem = document.getElementById('toplam-deger'), toplamKarZararElem = document.getElementById('toplam-kar-zarar'), birYillikHedefElem = document.getElementById('bir-yillik-hedef'), bestPerformerElem = document.getElementById('best-performer'), smallestPositionElem = document.getElementById('smallest-position');
        if (!hisseListesiBody || !toplamDegerElem) return;
        hisseListesiBody.innerHTML = ''; 
        let toplamPortfoyDegeri = activePortfolio.reduce((sum, hisse) => sum + (hisse.lot * hisse.anlikFiyat), 0);
        const chartLabels = [], chartData = [], performanceData = [];
        activePortfolio.forEach(hisse => {
            const toplamDeger = hisse.lot * hisse.anlikFiyat;
            const maliyetDegeri = hisse.lot * hisse.maliyet;
            const karZararYuzde = maliyetDegeri > 0 ? ((hisse.anlikFiyat - hisse.maliyet) / hisse.maliyet) * 100 : 0;
            const agirlik = toplamPortfoyDegeri > 0 ? (toplamDeger / toplamPortfoyDegeri) * 100 : 0;
            chartLabels.push(hisse.sembol); chartData.push(toplamDeger);
            performanceData.push({ sembol: hisse.sembol, yuzde: karZararYuzde, deger: toplamDeger, anlikFiyat: hisse.anlikFiyat });
            const newRow = document.createElement('tr');
            newRow.innerHTML = `<td>${hisse.sembol}</td><td><b>${agirlik.toFixed(2)}%</b></td><td>${hisse.lot.toLocaleString('tr-TR')}</td><td>${formatCurrency(hisse.maliyet)}</td><td>${formatCurrency(hisse.anlikFiyat)}</td><td>${formatCurrency(toplamDeger)}</td><td class="${(toplamDeger - maliyetDegeri) >= 0 ? 'positive' : 'negative'}">${formatCurrency(toplamDeger - maliyetDegeri)}</td><td class="${karZararYuzde >= 0 ? 'positive' : 'negative'}">${karZararYuzde.toFixed(2)}%</td>`;
            hisseListesiBody.appendChild(newRow);
        });
        const toplamMaliyet = activePortfolio.reduce((sum, hisse) => sum + (hisse.lot * hisse.maliyet), 0);
        const toplamKarZarar = toplamPortfoyDegeri - toplamMaliyet;
        toplamDegerElem.textContent = formatCurrency(toplamPortfoyDegeri);
        toplamKarZararElem.textContent = `${formatCurrency(toplamKarZarar)} (${(toplamMaliyet > 0 ? (toplamKarZarar/toplamMaliyet)*100 : 0).toFixed(2)}%)`;
        setElementColor(toplamKarZararElem, toplamKarZarar);
        birYillikHedefElem.textContent = formatCurrency(toplamPortfoyDegeri * (1 + config.birYillikHedefArtisOrani));
        if (performanceData.length > 0) {
            const best = performanceData.reduce((p, c) => (p.yuzde > c.yuzde) ? p : c);
            bestPerformerElem.innerHTML = `${best.sembol} <span class="hedef-deger">${formatCurrency(best.anlikFiyat * (1 + config.geleceginYildiziArtisOrani))}</span>`;
            const smallest = performanceData.reduce((p, c) => (p.deger < c.deger) ? p : c);
            smallestPositionElem.innerHTML = `${smallest.sembol} <span class="hedef-deger">${formatCurrency(toplamPortfoyDegeri * config.gizliHazineDengelemeOrani)}</span>`;
        } else { bestPerformerElem.textContent = '-'; smallestPositionElem.textContent = '-'; }
        document.getElementById('son-guncelleme').textContent = new Date().toLocaleTimeString('tr-TR');
        grafigiCiz(chartLabels, chartData, toplamPortfoyDegeri);
        interaktifVurgulamaEkle();
        generateComparisonAnalysis();
    }
    
    function updateChartTheme() {
        if (!portfolioChart) return;
        const isLightTheme = document.body.classList.contains('light-theme');
        portfolioChart.options.plugins.legend.labels.color = isLightTheme ? '#1C1E21' : '#E0E0E0';
        portfolioChart.options.plugins.datalabels.color = isLightTheme ? '#333' : '#fff';
        portfolioChart.update();
    }

    function grafigiCiz(labels, data, toplamDeger) {
        const ctx = document.getElementById('portfolioChart')?.getContext('2d');
        if (!ctx) return;
        if(portfolioChart) portfolioChart.destroy();
        const isLightTheme = document.body.classList.contains('light-theme');
        const legendColor = isLightTheme ? '#1C1E21' : '#E0E0E0';
        const datalabelsColor = isLightTheme ? '#333' : '#fff';
        portfolioChart = new Chart(ctx, { type: 'doughnut', data: { labels: labels, datasets: [{
            label: 'Portföy Değeri', data: data, backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'], borderWidth: 1
        }]}, options: { responsive: true, onHover: handleChartHover, plugins: { legend: { position: 'top', labels: { color: legendColor }},
        datalabels: { formatter: (value) => { if (toplamDeger === 0) return '0%'; return (value / toplamDeger * 100).toFixed(1) + '%'; }, color: datalabelsColor, font: { weight: 'bold', size: 14 } }}}});
    }

    function handleChartHover(event, elements) { document.querySelectorAll('#hisse-listesi tr').forEach(row => row.classList.remove('highlight')); if (elements.length > 0) { const index = elements[0].index; const row = document.querySelector(`#hisse-listesi tr:nth-child(${index + 1})`); if (row) row.classList.add('highlight'); } }
    function interaktifVurgulamaEkle() { const rows = document.querySelectorAll('#hisse-listesi tr'); rows.forEach((row, index) => { row.addEventListener('mouseover', () => { if(portfolioChart) {portfolioChart.setActiveElements([{ datasetIndex: 0, index: index }]); portfolioChart.update();} }); row.addEventListener('mouseout', () => { if(portfolioChart) {portfolioChart.setActiveElements([]); portfolioChart.update();} }); }); }
    function ozluSozGoster() { const el = document.getElementById('quote-text'); if(el) { const rastgeleSoz = ozluSozler[Math.floor(Math.random() * ozluSozler.length)]; el.textContent = `"${rastgeleSoz.soz}"`; document.getElementById('quote-author').textContent = `- ${rastgeleSoz.yazar}`; }}
    function sahtePiyasaVerileriniDoldur() {
        const lists = { yukselenler: 'top-gainers-list', dusenler: 'top-losers-list', hacimliler: 'top-volume-list' };
        Object.keys(lists).forEach(key => { const listElement = document.getElementById(lists[key]); if(listElement) { listElement.innerHTML = ''; sahtePiyasaVerileri[key].forEach(hisse => { const li = document.createElement('li'); let inner = `<span class="stock-name">${hisse.sembol}</span>`; if(hisse.degisim) inner += ` <span class="stock-change ${hisse.degisim.startsWith('+') ? 'positive' : 'negative'}">${hisse.degisim}</span>`; if(hisse.hacim) inner += ` <span class="stock-volume">${hisse.hacim}</span>`; li.innerHTML = inner; listElement.appendChild(li); }); } });
    }
    function populateNews() {
        const newsList = document.getElementById('news-list');
        if (!newsList) return;
        newsList.innerHTML = '';
        const displayCount = 3;
        currentNewsIndex = 0;
        for (let i = 0; i < displayCount && i < sahteHaberler.length; i++) {
            const haber = sahteHaberler[i];
            const li = document.createElement('li');
            li.innerHTML = `<h3>${haber.baslik}</h3><p>${haber.ozet}</p><span class="news-date">${haber.tarih}</span>`;
            newsList.appendChild(li);
            currentNewsIndex = i;
        }
    }
    function rotateNews() {
        const newsList = document.getElementById('news-list');
        if (!newsList || newsList.children.length === 0) return;
        const firstNewsItem = newsList.children[0];
        firstNewsItem.classList.add('fade-out');
        setTimeout(() => {
            if (firstNewsItem.parentElement === newsList) firstNewsItem.remove();
            currentNewsIndex++;
            if (currentNewsIndex >= sahteHaberler.length) { currentNewsIndex = 0; }
            const nextNews = sahteHaberler[currentNewsIndex];
            const newNewsItem = document.createElement('li');
            newNewsItem.innerHTML = `<h3>${nextNews.baslik}</h3><p>${nextNews.ozet}</p><span class="news-date">${nextNews.tarih}</span>`;
            newsList.appendChild(newNewsItem);
        }, 800);
    }
    function updateAnalysis() {
        const buyersList = document.getElementById('buyers-list'), sellersList = document.getElementById('sellers-list');
        if (!buyersList || !sellersList) return;
        buyersList.innerHTML = ''; sellersList.innerHTML = '';
        const shuffledBrokers = [...araciKurumlar].sort(() => 0.5 - Math.random());
        const buyers = shuffledBrokers.slice(0, 5);
        const sellers = shuffledBrokers.slice(5);
        buyers.forEach(broker => { const lot = Math.floor(Math.random() * 450001) + 50000; const li = document.createElement('li'); li.innerHTML = `<span class="broker-name">${broker}</span> <span class="broker-lot positive">${lot.toLocaleString()} Lot</span>`; buyersList.appendChild(li); li.classList.add('flash-green'); setTimeout(() => li.classList.remove('flash-green'), 800); });
        sellers.forEach(broker => { const lot = Math.floor(Math.random() * 450001) + 50000; const li = document.createElement('li'); li.innerHTML = `<span class="broker-name">${broker}</span> <span class="broker-lot negative">${lot.toLocaleString()} Lot</span>`; sellersList.appendChild(li); li.classList.add('flash-red'); setTimeout(() => li.classList.remove('flash-red'), 800); });
    }
    function populateTicker() { const tickerMove = document.getElementById('ticker-move'); if (!tickerMove) return; const allMarketData = [ ...sahtePiyasaVerileri.yukselenler, ...sahtePiyasaVerileri.dusenler, ...sahtePiyasaVerileri.hacimliler ]; let tickerHTML = ''; allMarketData.forEach(item => { let t = ''; if (item.degisim) { const s = item.degisim.startsWith('+') ? '▲' : '▼'; t = `<span class="${item.degisim.startsWith('+')?'positive':'negative'}">${s} ${item.degisim}</span>`; } else if (item.hacim) { t = `<span>Hacim: ${item.hacim}</span>`; } tickerHTML += `<div class="ticker-item"><span class="symbol">${item.sembol}</span> ${t}</div>`; }); tickerMove.innerHTML = tickerHTML + tickerHTML; }
    function populateSecondaryTicker() { const tickerMove = document.getElementById('secondary-ticker-move'); if (!tickerMove) return; let tickerHTML = ''; sahteFinansVerileri.forEach(item => { tickerHTML += `<div class="ticker-item"><span class="symbol">${item.sembol}</span> <span>${item.fiyat}</span> <span class="${item.sinif}">${item.degisim}</span></div>`; }); tickerMove.innerHTML = tickerHTML + tickerHTML; }
    function formatCurrency(value) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value); }
    function setElementColor(element, value) { if(element) { element.classList.remove('positive', 'negative'); if (value > 0) { element.classList.add('positive'); } else if (value < 0) { element.classList.add('negative'); } } }
    function startParticles() { if (typeof particlesJS !== 'undefined') { particlesJS("particles-js", { "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#888888" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": true }, "size": { "value": 3, "random": true }, "line_linked": { "enable": true, "distance": 150, "color": "#888888", "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false }, "resize": true }, "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } } } }, "retina_detect": true }); } }
})();
