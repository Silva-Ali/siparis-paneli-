// Kodun tamamını, daha temiz ve global değişkenlerden arındırılmış bir yapıya soktum.
(function() {
    // --- MANUEL VERİ GİRİŞ BÖLÜMÜ ---
    const portfoy = [
        { sembol: "SMARTG", lot: 8501, maliyet: 40.75, anlikFiyat: 30.80 },
        { sembol: "ARDYZ",  lot: 3568, maliyet: 36.04, anlikFiyat: 28.10 },
        { sembol: "KCAER",  lot: 5601, maliyet: 14.77, anlikFiyat: 14.63 },
        { sembol: "SASA",   lot: 11290, maliyet: 3.32,  anlikFiyat: 4.20  }
    ];
    const ozluSozler = [
        { soz: "Borsa, sabırsız olanın sabırlı olana para aktardığı bir mekanizmadır.", yazar: "Warren Buffett" },
        { soz: "Ne zaman satacağını bilmeyen, ne zaman alacağını da bilemez.", yazar: "André Kostolany" }
    ];
    const sahtePiyasaVerileri = {
        yukselenler: [ { sembol: "TUPRS", degisim: "+5.67%" }, { sembol: "THYAO", degisim: "+4.12%" } ],
        dusenler: [ { sembol: "KRDMD", degisim: "-2.50%" }, { sembol: "HEKTS", degisim: "-2.88%" } ],
        hacimliler: [ { sembol: "GARAN", hacim: "2.1 Milyar ₺" } ]
    };
    const sahteHaberler = [
        { baslik: "Yenilenebilir Enerji Raporu: Güneş Panelleri Yatırımları Zirvede", ozet: "Uluslararası Enerji Ajansı'nın yayınladığı son rapora göre, artan enerji talebi ve teşvikler sayesinde güneş enerjisi santrallerine (GES) yapılan yatırımların rekor seviyeye ulaştığı belirtildi.", tarih: "22 Eylül 2025" },
        { baslik: "BIST 100 Günü Yükselişle Tamamladı", ozet: "Borsa İstanbul'da BIST 100 endeksi, günü %1,25 değer kazancıyla 9.150 puandan tamamladı...", tarih: "22 Eylül 2025" },
        { baslik: "Teknoloji Sektörü İçin Yeni Teşvik Paketi Yolda", ozet: "Sanayi ve Teknoloji Bakanlığı'nın, yerli yazılım üreticilerini destekleyecek yeni bir teşvik paketi üzerinde çalıştığı bildirildi...", tarih: "21 Eylül 2025" }
    ];
    const araciKurumlar = ["İŞ YATIRIM", "BANK OF AMERICA", "GARANTİ BBVA", "YAPI KREDİ", "AK YATIRIM", "ÜNLÜ & CO", "TEB YATIRIM", "HALK YATIRIM"];
    const sahteFinansVerileri = [
        { sembol: "GRAM ALTIN", fiyat: "2.450,78 ₺", degisim: "+0.25%", sinif: "positive" },
        { sembol: "ONS ALTIN", fiyat: "2.330,45 $", degisim: "-0.15%", sinif: "negative" },
        { sembol: "USD/TRY", fiyat: "32,85 ₺", degisim: "+0.05%", sinif: "positive" }
    ];

    // --- UYGULAMA KODLARI ---
    let portfolioChart = null;
    let newsInterval = null;
    let analysisInterval = null;
    let currentNewsIndex = 0;

    Chart.register(ChartDataLabels);

    document.addEventListener("DOMContentLoaded", function() {
        setupEventListeners();
        runInitialFunctions();
        startIntervals();
        startParticles();
    });

    function setupEventListeners() {
        const settingsBtn = document.getElementById('settings-btn');
        const modal = document.getElementById('settings-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const themeToggleBtn = document.getElementById('theme-toggle');
        
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.className = savedTheme + '-theme';

        settingsBtn.addEventListener('click', () => modal.style.display = 'flex');
        closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (event) => { if (event.target === modal) { modal.style.display = 'none'; } });
        
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
            document.body.className = newTheme + '-theme';
            localStorage.setItem('theme', newTheme);
            updateChartTheme();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { stopIntervals(); } else { startIntervals(); }
        });
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
        if (!analysisInterval) {
            updateAnalysis();
            analysisInterval = setInterval(updateAnalysis, 3000); 
        }
        if (!newsInterval) {
            newsInterval = setInterval(rotateNews, 10000);
        }
    }

    function stopIntervals() {
        clearInterval(analysisInterval);
        clearInterval(newsInterval);
        analysisInterval = null;
        newsInterval = null;
    }

    function portfoyuGuncelle() {
        const hisseListesiBody = document.getElementById('hisse-listesi');
        const toplamDegerElem = document.getElementById('toplam-deger');
        const toplamKarZararElem = document.getElementById('toplam-kar-zarar');
        const birYillikHedefElem = document.getElementById('bir-yillik-hedef');
        const bestPerformerElem = document.getElementById('best-performer');
        const smallestPositionElem = document.getElementById('smallest-position');
        hisseListesiBody.innerHTML = ''; 
        let toplamPortfoyDegeri = 0;
        const chartLabels = [], chartData = [], performanceData = [];
        portfoy.forEach(hisse => { toplamPortfoyDegeri += hisse.lot * hisse.anlikFiyat; });
        portfoy.forEach(hisse => {
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
        const toplamMaliyet = portfoy.reduce((sum, hisse) => sum + (hisse.lot * hisse.maliyet), 0);
        const toplamKarZarar = toplamPortfoyDegeri - toplamMaliyet;
        toplamDegerElem.textContent = formatCurrency(toplamPortfoyDegeri);
        toplamKarZararElem.textContent = `${formatCurrency(toplamKarZarar)} (${(toplamMaliyet > 0 ? (toplamKarZarar/toplamMaliyet)*100 : 0).toFixed(2)}%)`;
        setElementColor(toplamKarZararElem, toplamKarZarar);
        birYillikHedefElem.textContent = formatCurrency(toplamPortfoyDegeri * 1.40);
        if (performanceData.length > 0) {
            const best = performanceData.reduce((p, c) => (p.yuzde > c.yuzde) ? p : c);
            bestPerformerElem.innerHTML = `${best.sembol} <span class="hedef-deger">${formatCurrency(best.anlikFiyat * 1.60)}</span>`;
            const smallest = performanceData.reduce((p, c) => (p.deger < c.deger) ? p : c);
            smallestPositionElem.innerHTML = `${smallest.sembol} <span class="hedef-deger">${formatCurrency(toplamPortfoyDegeri * 0.20)}</span>`;
        }
        document.getElementById('son-guncelleme').textContent = new Date().toLocaleTimeString('tr-TR');
        grafigiCiz(chartLabels, chartData, toplamPortfoyDegeri);
        interaktifVurgulamaEkle();
    }
    
    function updateChartTheme() {
        if (!portfolioChart) return;
        const isLightTheme = document.body.classList.contains('light-theme');
        const legendColor = isLightTheme ? '#1C1E21' : '#E0E0E0';
        const datalabelsColor = isLightTheme ? '#333' : '#fff';
        portfolioChart.options.plugins.legend.labels.color = legendColor;
        portfolioChart.options.plugins.datalabels.color = datalabelsColor;
        portfolioChart.update();
    }

    function grafigiCiz(labels, data, toplamDeger) {
        const ctx = document.getElementById('portfolioChart').getContext('2d');
        if(portfolioChart) portfolioChart.destroy();
        const isLightTheme = document.body.classList.contains('light-theme');
        const legendColor = isLightTheme ? '#1C1E21' : '#E0E0E0';
        const datalabelsColor = isLightTheme ? '#333' : '#fff';
        portfolioChart = new Chart(ctx, { type: 'doughnut', data: { labels: labels, datasets: [{
            label: 'Portföy Değeri', data: data, backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'], borderWidth: 1
        }]}, options: { responsive: true, onHover: handleChartHover, plugins: { legend: { position: 'top', labels: { color: legendColor }},
        datalabels: { formatter: (value, ctx) => (value / toplamDeger * 100).toFixed(1) + '%', color: datalabelsColor, font: { weight: 'bold', size: 14 } }}}});
    }

    function handleChartHover(event, elements) { document.querySelectorAll('#hisse-listesi tr').forEach(row => row.classList.remove('highlight')); if (elements.length > 0) { const index = elements[0].index; const row = document.querySelector(`#hisse-listesi tr:nth-child(${index + 1})`); if (row) row.classList.add('highlight'); } }
    
    function interaktifVurgulamaEkle() { const rows = document.querySelectorAll('#hisse-listesi tr'); rows.forEach((row, index) => { row.addEventListener('mouseover', () => { portfolioChart.setActiveElements([{ datasetIndex: 0, index: index }]); portfolioChart.update(); }); row.addEventListener('mouseout', () => { portfolioChart.setActiveElements([]); portfolioChart.update(); }); }); }

    function populateTicker() {
        const tickerMove = document.getElementById('ticker-move');
        const allMarketData = [ ...sahtePiyasaVerileri.yukselenler, ...sahtePiyasaVerileri.dusenler, ...sahtePiyasaVerileri.hacimliler ];
        let tickerHTML = '';
        allMarketData.forEach(item => { let changeText = ''; if (item.degisim) { const symbol = item.degisim.startsWith('+') ? '▲' : '▼'; changeText = `<span class="${item.degisim.startsWith('+')?'positive':'negative'}">${symbol} ${item.degisim}</span>`; } else if (item.hacim) { changeText = `<span>Hacim: ${item.hacim}</span>`; } tickerHTML += `<div class="ticker-item"><span class="symbol">${item.sembol}</span> ${changeText}</div>`; });
        tickerMove.innerHTML = tickerHTML + tickerHTML;
    }

    function populateSecondaryTicker() {
        const tickerMove = document.getElementById('secondary-ticker-move');
        let tickerHTML = '';
        sahteFinansVerileri.forEach(item => { tickerHTML += `<div class="ticker-item"><span class="symbol">${item.sembol}</span> <span>${item.fiyat}</span> <span class="${item.sinif}">${item.degisim}</span></div>`; });
        tickerMove.innerHTML = tickerHTML + tickerHTML;
    }

    function ozluSozGoster() { const rastgeleSoz = ozluSozler[Math.floor(Math.random() * ozluSozler.length)]; document.getElementById('quote-text').textContent = `"${rastgeleSoz.soz}"`; document.getElementById('quote-author').textContent = `- ${rastgeleSoz.yazar}`; }
    
    function sahtePiyasaVerileriniDoldur() {
        const lists = { yukselenler: 'top-gainers-list', dusenler: 'top-losers-list', hacimliler: 'top-volume-list' };
        Object.keys(lists).forEach(key => { const listElement = document.getElementById(lists[key]); listElement.innerHTML = ''; sahtePiyasaVerileri[key].forEach(hisse => { const li = document.createElement('li'); let inner = `<span class="stock-name">${hisse.sembol}</span>`; if(hisse.degisim) inner += ` <span class="stock-change ${hisse.degisim.startsWith('+') ? 'positive' : 'negative'}">${hisse.degisim}</span>`; if(hisse.hacim) inner += ` <span class="stock-volume">${hisse.hacim}</span>`; li.innerHTML = inner; listElement.appendChild(li); }); });
    }

    function populateNews() {
        const newsList = document.getElementById('news-list');
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
            firstNewsItem.remove();
            currentNewsIndex++;
            if (currentNewsIndex >= sahteHaberler.length) { currentNewsIndex = 0; }
            const nextNews = sahteHaberler[currentNewsIndex];
            const newNewsItem = document.createElement('li');
            newNewsItem.innerHTML = `<h3>${nextNews.baslik}</h3><p>${nextNews.ozet}</p><span class="news-date">${nextNews.tarih}</span>`;
            newsList.appendChild(newNewsItem);
        }, 800);
    }

    function updateAnalysis() {
        const buyersList = document.getElementById('buyers-list'); const sellersList = document.getElementById('sellers-list');
        buyersList.innerHTML = ''; sellersList.innerHTML = '';
        const shuffledBrokers = [...araciKurumlar].sort(() => 0.5 - Math.random());
        const buyers = shuffledBrokers.slice(0, 5);
        const sellers = shuffledBrokers.slice(5, 10);
        buyers.forEach(broker => { const lot = Math.floor(Math.random() * 450001) + 50000; const li = document.createElement('li'); li.innerHTML = `<span class="broker-name">${broker}</span> <span class="broker-lot positive">${lot.toLocaleString()} Lot</span>`; buyersList.appendChild(li); li.classList.add('flash-green'); setTimeout(() => li.classList.remove('flash-green'), 800); });
        sellers.forEach(broker => { const lot = Math.floor(Math.random() * 450001) + 50000; const li = document.createElement('li'); li.innerHTML = `<span class="broker-name">${broker}</span> <span class="broker-lot negative">${lot.toLocaleString()} Lot</span>`; sellersList.appendChild(li); li.classList.add('flash-red'); setTimeout(() => li.classList.remove('flash-red'), 800); });
    }

    function formatCurrency(value, currency = 'TRY') { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(value); }
    function setElementColor(element, value) { element.classList.remove('positive', 'negative'); if (value > 0) { element.classList.add('positive'); } else if (value < 0) { element.classList.add('negative'); } }

    function startParticles() {
        particlesJS("particles-js", {
            "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#888888" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": true }, "size": { "value": 3, "random": true }, "line_linked": { "enable": true, "distance": 150, "color": "#888888", "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false } },
            "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false }, "resize": true }, "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } } } },
            "retina_detect": true
        });
    }
})(); // Kodun tamamını sarmalayan ve global scope'u kirletmeyen yapı
