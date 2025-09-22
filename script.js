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

// 'En Çok Düşenler' listesi güncellendi.
const sahtePiyasaVerileri = {
    yukselenler: [
        { sembol: "TUPRS", degisim: "+5.67%" },
        { sembol: "THYAO", degisim: "+4.12%" },
        { sembol: "EREGL", degisim: "+3.80%" },
        { sembol: "ASELS", degisim: "+2.55%" },
    ],
    dusenler: [
        { sembol: "KRDMD", degisim: "-2.50%" }, // SASA yerine KARDEMİR (KRDMD) eklendi
        { sembol: "HEKTS", degisim: "-2.88%" },
        { sembol: "KOZAL", degisim: "-1.95%" },
        { sembol: "PETKM", degisim: "-1.15%" },
    ],
    hacimliler: [
        { sembol: "GARAN", hacim: "2.1 Milyar ₺" },
        { sembol: "YKBNK", hacim: "1.8 Milyar ₺" },
        { sembol: "ISCTR", hacim: "1.5 Milyar ₺" },
        { sembol: "AKBNK", hacim: "1.3 Milyar ₺" },
    ]
};


// --- KODLAMA BÖLÜMÜ ---

let portfolioChart = null;

document.addEventListener("DOMContentLoaded", function() {
    portfoyuGuncelle();
    ozluSozGoster();
    sahtePiyasaVerileriniDoldur();
});

function portfoyuGuncelle() {
    const hisseListesiBody = document.getElementById('hisse-listesi');
    const toplamDegerElem = document.getElementById('toplam-deger');
    const toplamKarZararElem = document.getElementById('toplam-kar-zarar');
    const birYillikHedefElem = document.getElementById('bir-yillik-hedef');
    
    hisseListesiBody.innerHTML = ''; 
    let toplamPortfoyDegeri = 0;
    let toplamMaliyet = 0;
    
    const chartLabels = [];
    const chartData = [];

    portfoy.forEach(hisse => {
        const toplamDeger = hisse.lot * hisse.anlikFiyat;
        const maliyetDegeri = hisse.lot * hisse.maliyet;
        const karZarar = toplamDeger - maliyetDegeri;
        const karZararYuzde = maliyetDegeri > 0 ? ((hisse.anlikFiyat - hisse.maliyet) / hisse.maliyet) * 100 : 0;
        toplamPortfoyDegeri += toplamDeger;
        toplamMaliyet += maliyetDegeri;

        chartLabels.push(hisse.sembol);
        chartData.push(toplamDeger);

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${hisse.sembol}</td>
            <td>${hisse.lot.toLocaleString('tr-TR')}</td>
            <td>${formatCurrency(hisse.maliyet)}</td>
            <td>${formatCurrency(hisse.anlikFiyat)}</td>
            <td>${formatCurrency(toplamDeger)}</td>
            <td class="${karZarar >= 0 ? 'positive' : 'negative'}">${formatCurrency(karZarar)}</td>
            <td class="${karZarar >= 0 ? 'positive' : 'negative'}">${karZararYuzde.toFixed(2)}%</td>
        `;
        hisseListesiBody.appendChild(newRow);
    });

    const toplamKarZarar = toplamPortfoyDegeri - toplamMaliyet;
    const toplamKarZararYuzde = toplamMaliyet > 0 ? (toplamKarZarar / toplamMaliyet) * 100 : 0;
    
    toplamDegerElem.textContent = formatCurrency(toplamPortfoyDegeri);
    toplamKarZararElem.textContent = `${formatCurrency(toplamKarZarar)} (${toplamKarZararYuzde.toFixed(2)}%)`;
    setElementColor(toplamKarZararElem, toplamKarZarar);

    const birYillikArtisOrani = 0.40;
    const hedefDeger = toplamPortfoyDegeri * (1 + birYillikArtisOrani);
    birYillikHedefElem.textContent = formatCurrency(hedefDeger);

    document.getElementById('son-guncelleme').textContent = new Date().toLocaleTimeString('tr-TR');

    grafigiCiz(chartLabels, chartData);
}

function grafigiCiz(labels, data) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');

    if(portfolioChart) {
        portfolioChart.destroy();
    }

    portfolioChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portföy Değeri',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#E0E0E0'
                    }
                }
            }
        }
    });
}

function ozluSozGoster() {
    const rastgeleSoz = ozluSozler[Math.floor(Math.random() * ozluSozler.length)];
    document.getElementById('quote-text').textContent = `"${rastgeleSoz.soz}"`;
    document.getElementById('quote-author').textContent = `- ${rastgeleSoz.yazar}`;
}

function sahtePiyasaVerileriniDoldur() {
    const yukselenlerListesi = document.getElementById('top-gainers-list');
    const dusenlerListesi = document.getElementById('top-losers-list');
    const hacimlilerListesi = document.getElementById('top-volume-list');
    yukselenlerListesi.innerHTML = '';
    dusenlerListesi.innerHTML = '';
    hacimlilerListesi.innerHTML = '';

    sahtePiyasaVerileri.yukselenler.forEach(hisse => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="stock-name">${hisse.sembol}</span> <span class="stock-change positive">${hisse.degisim}</span>`;
        yukselenlerListesi.appendChild(li);
    });
    sahtePiyasaVerileri.dusenler.forEach(hisse => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="stock-name">${hisse.sembol}</span> <span class="stock-change negative">${hisse.degisim}</span>`;
        dusenlerListesi.appendChild(li);
    });
    sahtePiyasaVerileri.hacimliler.forEach(hisse => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="stock-name">${hisse.sembol}</span> <span class="stock-volume">${hisse.hacim}</span>`;
        hacimlilerListesi.appendChild(li);
    });
}

function formatCurrency(value, currency = 'TRY') {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(value);
}

function setElementColor(element, value) {
    element.classList.remove('positive', 'negative');
    if (value > 0) { element.classList.add('positive'); }
    else if (value < 0) { element.classList.add('negative'); }
}
