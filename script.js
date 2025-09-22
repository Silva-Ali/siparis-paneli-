// --- MANUEL GİRİŞ BÖLÜMÜ ---
const portfoy = [
    { sembol: "SMARTG", lot: 8501, maliyet: 40.75, anlikFiyat: 30.80 },
    { sembol: "ARDYZ",  lot: 3568, maliyet: 36.04, anlikFiyat: 28.10 },
    { sembol: "KCAER",  lot: 5601, maliyet: 14.77, anlikFiyat: 14.63 },
    { sembol: "SASA",   lot: 11290, maliyet: 3.32,  anlikFiyat: 4.20  }
];
const ozluSozler = [
    { soz: "Borsa, sabırsız olanın sabırlı olana para aktardığı bir mekanizmadır.", yazar: "Warren Buffett" },
    { soz: "Ne zaman satacağını bilmeyen, ne zaman alacağını da bilemez.", yazar: "André Kostolany" },
    { soz: "Piyasalar her zaman yanılabilir, ama sen ne kadar süre ayakta kalabilirsin?", yazar: "John Maynard Keynes" }
];
const sahtePiyasaVerileri = {
    yukselenler: [ { sembol: "TUPRS", degisim: "+5.67%" }, { sembol: "THYAO", degisim: "+4.12%" }, { sembol: "EREGL", degisim: "+3.80%" } ],
    dusenler: [ { sembol: "KRDMD", degisim: "-2.50%" }, { sembol: "HEKTS", degisim: "-2.88%" }, { sembol: "KOZAL", degisim: "-1.95%" } ],
    hacimliler: [ { sembol: "GARAN", hacim: "2.1 Milyar ₺" }, { sembol: "YKBNK", hacim: "1.8 Milyar ₺" }, { sembol: "ISCTR", hacim: "1.5 Milyar ₺" } ]
};
const sahteHaberler = [
    { baslik: "BIST 100 Günü Yükselişle Tamamladı", ozet: "Borsa İstanbul'da BIST 100 endeksi, günü %1,25 değer kazancıyla 9.150 puandan tamamladı. Bankacılık endeksi öncülüğünde...", tarih: "22 Eylül 2025" },
    { baslik: "Demir-Çelik Hisselerinde Hareketlilik Gözleniyor", ozet: "Global piyasalardaki talep artışıyla birlikte, EREGL ve KRDMD gibi demir-çelik sektörü hisselerinde hacim artışı dikkat çekiyor...", tarih: "22 Eylül 2025" },
    { baslik: "Teknoloji Sektörü İçin Yeni Teşvik Paketi Yolda", ozet: "Sanayi ve Teknoloji Bakanlığı'nın, yerli yazılım ve donanım üreticilerini destekleyecek yeni bir teşvik paketi üzerinde çalıştığı bildirildi...", tarih: "21 Eylül 2025" }
];
const araciKurumlar = ["İŞ YATIRIM", "BANK OF AMERICA", "GARANTİ BBVA", "YAPI KREDİ", "AK YATIRIM", "ÜNLÜ & CO", "TEB YATIRIM", "HALK YATIRIM", "ZİRAAT YATIRIM", "MERRILL LYNCH"];

// --- KODLAMA BÖLÜMÜ ---
let portfolioChart = null;
Chart.register(ChartDataLabels);

document.addEventListener("DOMContentLoaded", function() {
    portfoyuGuncelle();
    ozluSozGoster();
    sahtePiyasaVerileriniDoldur();
    populateTicker();
    populateNews();
    updateAnalysis();
    setInterval(updateAnalysis, 3000); 
});

function populateTicker() {
    const tickerMove = document.getElementById('ticker-move');
    const allMarketData = [ ...sahtePiyasaVerileri.yukselenler, ...sahtePiyasaVerileri.dusenler, ...sahtePiyasaVerileri.hacimliler ];
    let tickerHTML = '';
    allMarketData.forEach(item => {
        let changeText = '';
        if (item.degisim) {
            const symbol = item.degisim.startsWith('+') ? '▲' : '▼';
            changeText = `<span class="${item.degisim.startsWith('+')?'positive':'negative'}">${symbol} ${item.degisim}</span>`;
        } else if (item.hacim) {
            changeText = `<span>Hacim: ${item.hacim}</span>`;
        }
        tickerHTML += `<div class="ticker-item"><span class="symbol">${item.sembol}</span> ${changeText}</div>`;
    });
    tickerMove.innerHTML = tickerHTML + tickerHTML;
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
    const chartLabels = [];
    const chartData = [];
    const performanceData = [];

    portfoy.forEach(hisse => { toplamPortfoyDegeri += hisse.lot * hisse.anlikFiyat; });

    portfoy.forEach(hisse => {
        const toplamDeger = hisse.lot * hisse.anlikFiyat;
        const maliyetDegeri = hisse.lot * hisse.maliyet;
        const karZararYuzde = maliyetDegeri > 0 ? ((hisse.anlikFiyat - hisse.maliyet) / hisse.maliyet) * 100 : 0;
        const agirlik = toplamPortfoyDegeri > 0 ? (toplamDeger / toplamPortfoyDegeri) * 100 : 0;
        chartLabels.push(hisse.sembol);
        chartData.push(toplamDeger);
        performanceData.push({ sembol: hisse.sembol, yuzde: karZararYuzde, deger: toplamDeger, anlikFiyat: hisse.anlikFiyat });
        const newRow = document.createElement('tr');
        newRow.innerHTML = `<td>${hisse.sembol}</td><td><b>${agirlik.toFixed(2)}%</b></td><td>${hisse.lot.toLocaleString('tr-TR')}</td><td>${formatCurrency(hisse.maliyet)}</td><td>${formatCurrency(hisse.anlikFiyat)}</td><td>${formatCurrency(toplamDeger)}</td><td class="${(toplamDeger - maliyetDegeri) >= 0 ? 'positive' : 'negative'}">${formatCurrency(toplamDeger - maliyetDegeri)}</td><td class="${karZararYuzde >= 0 ? 'positive' : 'negative'}">${karZararYuzde.toFixed(2)}%</td>`;
        hisseListesiBody.appendChild(newRow);
    });

    const toplamMaliyet = portfoy.reduce((sum, hisse) => sum + (hisse.lot * hisse.maliyet), 0);
    const toplamKarZarar = toplamPortfoyDegeri - toplamMaliyet;
    const toplamKarZararYuzde = toplamMaliyet > 0 ? (toplamKarZarar / toplamMaliyet) * 100 : 0;
    
    toplamDegerElem.textContent = formatCurrency(toplamPortfoyDegeri);
    toplamKarZararElem.textContent = `${formatCurrency(toplamKarZarar)} (${toplamKarZararYuzde.toFixed(2)}%)`;
    setElementColor(toplamKarZararElem, toplamKarZarar);
    birYillikHedefElem.textContent = formatCurrency(toplamPortfoyDegeri * 1.40);
    if (performanceData.length > 0) {
        const best = performanceData.reduce((p, c) => (p.yuzde > c.yuzde) ? p : c);
        const yildizHedefFiyat = best.anlikFiyat * 1.60;
        bestPerformerElem.innerHTML = `${best.sembol} <span class="hedef-deger">${formatCurrency(yildizHedefFiyat)}</span>`;
        const smallest = performanceData.reduce((p, c) => (p.deger < c.deger) ? p : c);
        const dengelemeHedefi = toplamPortfoyDegeri * 0.20;
        smallestPositionElem.innerHTML = `${smallest.sembol} <span class="hedef-deger">${formatCurrency(dengelemeHedefi)}</span>`;
    }
    document.getElementById('son-guncelleme').textContent = new Date().toLocaleTimeString('tr-TR');
    grafigiCiz(chartLabels, chartData, toplamPortfoyDegeri);
    interaktifVurgulamaEkle();
}

function grafigiCiz(labels, data, toplamDeger) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if(portfolioChart) portfolioChart.destroy();
    portfolioChart = new Chart(ctx, { type: 'doughnut', data: { labels: labels, datasets: [{
        label: 'Portföy Değeri', data: data, backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'], borderWidth: 1
    }]}, options: { responsive: true, onHover: handleChartHover, plugins: { legend: { position: 'top', labels: { color: '#E0E0E0' }},
    datalabels: { formatter: (value, ctx) => (value / toplamDeger * 100).toFixed(1) + '%', color: '#fff', font: { weight: 'bold', size: 14 } }}}});
}

function handleChartHover(event, elements) {
    document.querySelectorAll('#hisse-listesi tr').forEach(row => row.classList.remove('highlight'));
    if (elements.length > 0) {
        const index = elements[0].index;
        const row = document.querySelector(`#hisse-listesi tr:nth-child(${index + 1})`);
        if (row) row.classList.add('highlight');
    }
}

function interaktifVurgulamaEkle() {
    const rows = document.querySelectorAll('#hisse-listesi tr');
    rows.forEach((row, index) => {
        row.addEventListener('mouseover', () => { portfolioChart.setActiveElements([{ datasetIndex: 0, index: index }]); portfolioChart.update(); });
        row.addEventListener('mouseout', () => { portfolioChart.setActiveElements([]); portfolioChart.update(); });
    });
}

function ozluSozGoster() { const rastgeleSoz = ozluSozler[Math.floor(Math.random() * ozluSozler.length)]; document.getElementById('quote-text').textContent = `"${rastgeleSoz.soz}"`; document.getElementById('quote-author').textContent = `- ${rastgeleSoz.yazar}`; }

function sahtePiyasaVerileriniDoldur() {
    const yukselenlerListesi = document.getElementById('top-gainers-list');
    const dusenlerListesi = document.getElementById('top-losers-list');
    const hacimlilerListesi = document.getElementById('top-volume-list');
    yukselenlerListesi.innerHTML = ''; dusenlerListesi.innerHTML = ''; hacimlilerListesi.innerHTML = '';
    sahtePiyasaVerileri.yukselenler.forEach(hisse => { const li = document.createElement('li'); li.innerHTML = `<span class="stock-name">${hisse.sembol}</span> <span class="stock-change positive">${hisse.degisim}</span>`; yukselenlerListesi.appendChild(li); });
    sahtePiyasaVerileri.dusenler.forEach(hisse => { const li = document.createElement('li'); li.innerHTML = `<span class="stock-name">${hisse.sembol}</span> <span class="stock-change negative">${hisse.degisim}</span>`; dusenlerListesi.appendChild(li); });
    sahtePiyasaVerileri.hacimliler.forEach(hisse => { const li = document.createElement('li'); li.innerHTML = `<span class="stock-name">${hisse.sembol}</span> <span class="stock-volume">${hisse.hacim}</span>`; hacimlilerListesi.appendChild(li); });
}

function populateNews() {
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = '';
    sahteHaberler.forEach(haber => {
        const li = document.createElement('li');
        li.innerHTML = `<h3>${haber.baslik}</h3><p>${haber.ozet}</p><span class="news-date">${haber.tarih}</span>`;
        newsList.appendChild(li);
    });
}

function updateAnalysis() {
    const buyersList = document.getElementById('buyers-list');
    const sellersList = document.getElementById('sellers-list');
    buyersList.innerHTML = '';
    sellersList.innerHTML = '';
    const shuffledBrokers = [...araciKurumlar].sort(() => 0.5 - Math.random());
    const buyers = shuffledBrokers.slice(0, 5);
    const sellers = shuffledBrokers.slice(5, 10);
    buyers.forEach(broker => {
        const lot = Math.floor(Math.random() * 450001) + 50000;
        const li = document.createElement('li');
        li.innerHTML = `<span class="broker-name">${broker}</span> <span class="broker-lot positive">${lot.toLocaleString()} Lot</span>`;
        buyersList.appendChild(li);
        li.classList.add('flash-green');
        setTimeout(() => li.classList.remove('flash-green'), 800);
    });
    sellers.forEach(broker => {
        const lot = Math.floor(Math.random() * 450001) + 50000;
        const li = document.createElement('li');
        li.innerHTML = `<span class="broker-name">${broker}</span> <span class="broker-lot negative">${lot.toLocaleString()} Lot</span>`;
        sellersList.appendChild(li);
        li.classList.add('flash-red');
        setTimeout(() => li.classList.remove('flash-red'), 800);
    });
}

function formatCurrency(value, currency = 'TRY') { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(value); }
function setElementColor(element, value) { element.classList.remove('positive', 'negative'); if (value > 0) { element.classList.add('positive'); } else if (value < 0) { element.classList.add('negative'); } }
