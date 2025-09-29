# Sipariş Paneli Önizleme

Bu depo, yerel olarak çalışan bir portföy panelinin statik dosyalarını içerir. Kodun hem yerel geliştirmede hem de CodePen gibi çevrimiçi editörlerde çalışması için gerekli adımlar aşağıdadır.

## Yerel Önizleme
1. Depo klasöründe basit bir HTTP sunucusu başlatın:
   ```bash
   python -m http.server 8000
   ```
2. Tarayıcıda `http://localhost:8000/index.html` adresini açın.
3. Portföy verileri `data/mock-data.json` dosyasından alınır; sunucu çalışmazsa betik otomatik olarak yerleşik örnek verileri kullanır.

## CodePen / Çevrimiçi Editör Kullanımı
### Hızlı Başlangıç
- `codepen.html` dosyasını açın ve içeriğini CodePen'in **HTML** paneline tek seferde yapıştırın.
- Harici bağımlılıklar dosyada zaten CDN üzerinden tanımlıdır. Ek script eklemenize gerek yoktur.

### Alternatif Yöntem
1. **HTML paneli:** `index.html` dosyasındaki `<body>` içeriğini kopyalayın.
2. **CSS paneli:** `style.css` dosyasının tamamını yapıştırın.
3. **JS paneli:** `script.js` dosyasının tamamını yapıştırın.
4. **Settings → JS** bölümünden şu CDN adreslerini ekleyin (sırasıyla):
   - `https://cdn.jsdelivr.net/npm/chart.js`
   - `https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0`
   - `https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js`
5. `mock-data.json` dosyasını yüklemeyi unutsanız bile betik varsayılan örnek veriye döner; panel boş kalmaz.

## Bilinen Dayanıklılık Önlemleri
- Chart.js veya veri etiketi eklentileri yüklenemezse grafik alanı gizlenir ve kullanıcıya bilgilendirici mesaj gösterilir.
- Profil görseli bulunamazsa otomatik olarak 60x60 boyutlarında bir yer tutucu görüntü kullanılır.
- Tüm dinamik panellerde veri olmadığı durumlar için açıklayıcı geri bildirim mesajları gösterilir.

## Testler
Depoda otomatik test altyapısı yoktur, ancak sözdizimi kontrolleri için aşağıdaki komutları kullanabilirsiniz:
```bash
node --check script.js
python -m json.tool data/mock-data.json > /dev/null
```
