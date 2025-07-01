// Bu dosya, To-Do List uygulamasının tüm etkileşim, veri yönetimi ve DOM işlemlerini içerir.
// Fonksiyonlar modüler ve açıklamalı şekilde yazılmıştır.

// Sayfa yüklendiğinde tarih inputunun min değerini bugünün tarihi olarak ayarlar.
function setMinDate() {
  const dateInput = document.getElementById('task-date'); // Tarih inputunu seçiyoruz.
  const today = new Date(); // Bugünün tarihini alıyoruz.
  const yyyy = today.getFullYear(); // Yılı alıyoruz.
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Ayı alıyoruz (0'dan başladığı için +1), iki haneli string yapıyoruz.
  const dd = String(today.getDate()).padStart(2, '0'); // Günü alıyoruz, iki haneli string yapıyoruz.
  dateInput.min = `${yyyy}-${mm}-${dd}`; // Tarih inputunun min değerini bugünün tarihi yapıyoruz. Böylece geçmiş tarih seçilemez.
}

// Uyarı mesajı gösterir. Kullanıcı eksik bilgi girerse ekranda kırmızı kutu olarak görünür.
function showWarning(msg) {
  const warn = document.getElementById('input-warning'); // Uyarı kutusunu seçiyoruz.
  warn.textContent = msg; // Uyarı mesajını kutuya yazıyoruz.
  warn.style.display = 'block'; // Kutuyu görünür yapıyoruz.
}
// Uyarı mesajını gizler.
function hideWarning() {
  const warn = document.getElementById('input-warning'); // Uyarı kutusunu seçiyoruz.
  warn.textContent = ''; // Mesajı temizliyoruz.
  warn.style.display = 'none'; // Kutuyu gizliyoruz.
}

// Görevleri localStorage'dan yükler. Sayfa yenilense bile görevler kaybolmaz.
function getTasks() {
  // localStorage'dan 'tasks' anahtarı ile kayıtlı görevleri JSON olarak alır ve diziye çevirir.
  // Eğer hiç görev yoksa boş dizi döner.
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}
// Görevleri localStorage'a kaydeder.
function saveTasks(tasks) {
  // Görevler dizisini JSON formatına çevirip localStorage'a 'tasks' anahtarı ile kaydeder.
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Kullanıcının seçtiği temayı (açık/koyu) localStorage'dan okur.
function getTheme() {
  // localStorage'dan 'theme' anahtarı ile kayıtlı temayı alır, yoksa 'light' döner.
  return localStorage.getItem('theme') || 'light';
}
// Temayı değiştirir ve localStorage'a kaydeder. data-theme ile CSS teması değişir.
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme); // HTML köküne data-theme ekler, CSS teması değişir.
  localStorage.setItem('theme', theme); // Temayı localStorage'a kaydeder.
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙'; // Butonun ikonunu değiştirir.
}
// Tema açık/koyu arasında geçiş yapar.
function toggleTheme() {
  const current = getTheme(); // Mevcut temayı alıyoruz.
  setTheme(current === 'dark' ? 'light' : 'dark'); // Eğer koyuysa açık yap, açıksa koyu yap.
}

// Bir görev için HTML'de <li> elemanı oluşturur. Checkbox, metin, tarih ve silme butonu içerir.
function createTaskElement(task, index) {
  const li = document.createElement('li'); // Yeni bir <li> oluşturuyoruz.
  li.className = 'task-item' + (task.completed ? ' completed' : ''); // Tamamlandıysa 'completed' sınıfı eklenir.
  li.dataset.index = index; // Görev dizisindeki indexi veri olarak ekleriz.
  li.style.opacity = 0; // Başlangıçta görünmez.
  setTimeout(() => { li.style.opacity = 1; }, 10); // Fade-in animasyonu ile yumuşakça görünür.

  // Checkbox (işaret kutusu) oluşturulur. Görev tamamlandıysa işaretli gelir.
  const checkbox = document.createElement('input'); // Checkbox inputu oluştur.
  checkbox.type = 'checkbox'; // Tipi checkbox.
  checkbox.className = 'task-checkbox'; // Stil için class.
  checkbox.checked = task.completed; // Tamamlandıysa işaretli gelir.
  checkbox.addEventListener('change', () => toggleTask(index)); // Değişince tamamla/geri al.

  // Görev metni için <span> oluşturulur. Çift tıklama veya Enter ile düzenlenebilir.
  const span = document.createElement('span'); // Metin için span.
  span.className = 'task-text'; // Stil için class.
  span.textContent = task.text; // Görev metni.
  span.title = 'Düzenlemek için çift tıkla'; // Kullanıcıya ipucu.
  span.tabIndex = 0; // Klavye ile erişim için.
  span.addEventListener('dblclick', () => editTask(index, span, li)); // Çift tıklayınca düzenle.
  span.addEventListener('keydown', e => { if (e.key === 'Enter') editTask(index, span, li); }); // Enter ile düzenle.

  // Teslim tarihi gösterimi. Eğer görevde tarih varsa gösterir.
  const dateSpan = document.createElement('span'); // Tarih için span.
  dateSpan.className = 'task-date'; // Stil için class.
  if (task.dueDate) {
    const dateObj = new Date(task.dueDate); // Tarihi Date objesine çevir.
    dateSpan.textContent = `Teslim Zamanı: ${dateObj.toLocaleDateString('tr-TR')}`; // Türkçe formatta göster.
  } else {
    dateSpan.textContent = ''; // Tarih yoksa boş bırak.
  }

  // Silme butonu oluşturulur. Görevi siler.
  const delBtn = document.createElement('button'); // Silme butonu.
  delBtn.className = 'task-delete'; // Stil için class.
  delBtn.innerHTML = '🗑️'; // Çöp kutusu ikonu.
  delBtn.title = 'Sil'; // Kullanıcıya ipucu.
  delBtn.tabIndex = 0; // Klavye ile erişim.
  delBtn.addEventListener('click', () => deleteTask(index, li)); // Tıklayınca sil.
  delBtn.addEventListener('keydown', e => { if (e.key === 'Enter') deleteTask(index, li); }); // Enter ile sil.

  li.appendChild(checkbox); // Checkbox'ı ekle.
  li.appendChild(span); // Metni ekle.
  li.appendChild(dateSpan); // Tarihi ekle.
  li.appendChild(delBtn); // Silme butonunu ekle.
  return li; // <li> döndürülür.
}

// Görevleri filtreye göre döndürür ve teslim tarihine göre sıralar.
function filterTasks(tasks, filter) {
  let filtered = tasks; // Başlangıçta tüm görevler.
  if (filter === 'completed') filtered = tasks.filter(t => t.completed); // Sadece tamamlananlar.
  if (filter === 'active') filtered = tasks.filter(t => !t.completed); // Sadece tamamlanmayanlar.
  // Teslim tarihi olanlar önce, olmayanlar sonra ve tarihe göre artan sırada döner.
  return filtered.slice().sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0; // İkisi de tarihsizse sıralama yok.
    if (!a.dueDate) return 1; // a'nın tarihi yoksa sona at.
    if (!b.dueDate) return -1; // b'nin tarihi yoksa sona at.
    return new Date(a.dueDate) - new Date(b.dueDate); // Tarihe göre artan sırala.
  });
}

// Görev listesini ekrana yazar. Filtre ve sıralama uygular.
function renderTasks() {
  const tasks = getTasks(); // Tüm görevleri al.
  const filter = document.querySelector('.filter-btn.active').dataset.filter; // Aktif filtreyi bul.
  const list = document.getElementById('task-list'); // Listeyi seç.
  list.innerHTML = ''; // Önceki görevleri temizle.
  filterTasks(tasks, filter).forEach((task, i) => {
    list.appendChild(createTaskElement(task, i)); // Her görevi ekle.
  });
}

// Yeni görev ekler. Hem metin hem teslim tarihi zorunludur. Eksikse uyarı gösterir.
function addTask() {
  const input = document.getElementById('task-input'); // Metin kutusunu seç.
  const dateInput = document.getElementById('task-date'); // Tarih kutusunu seç.
  const text = input.value.trim(); // Girilen metni al, baştaki/sondaki boşlukları temizle.
  const dueDate = dateInput.value ? dateInput.value : null; // Tarih varsa al, yoksa null.
  if (!text && !dueDate) { // İkisi de boşsa uyarı göster.
    showWarning('Görev ve teslim zamanı boş olamaz!');
    return;
  }
  if (!text) { // Metin boşsa uyarı göster.
    showWarning('Görev metni boş olamaz!');
    return;
  }
  if (!dueDate) { // Tarih boşsa uyarı göster.
    showWarning('Teslim zamanı seçmelisiniz!');
    return;
  }
  hideWarning(); // Uyarı yoksa gizle.
  const tasks = getTasks(); // Mevcut görevleri al.
  tasks.push({ text, completed: false, dueDate }); // Yeni görevi diziye ekle.
  saveTasks(tasks); // Görevleri kaydet.
  input.value = ''; // Metin kutusunu temizle.
  dateInput.value = ''; // Tarih kutusunu temizle.
  renderTasks(); // Listeyi güncelle.
}

// Belirtilen indexteki görevi siler. Fade-out animasyonu ile silinir.
function deleteTask(index, li) {
  const tasks = getTasks(); // Mevcut görevleri al.
  tasks.splice(index, 1); // İlgili indexteki görevi diziden çıkar.
  saveTasks(tasks); // Görevleri kaydet.
  if (li) {
    li.style.opacity = 0; // Silme animasyonu başlat.
    setTimeout(renderTasks, 250); // 0.25 saniye sonra listeyi güncelle.
  } else {
    renderTasks(); // Animasyon yoksa hemen güncelle.
  }
}

// Görevin tamamlanma durumunu değiştirir.
function toggleTask(index) {
  const tasks = getTasks(); // Mevcut görevleri al.
  tasks[index].completed = !tasks[index].completed; // Durumu tersine çevir.
  saveTasks(tasks); // Kaydet.
  renderTasks(); // Listeyi güncelle.
}

// Görev metnini ve teslim tarihini düzenlemeye açar. Hem metin hem tarih inputu ile düzenlenebilir.
function editTask(index, span, li) {
  const tasks = getTasks(); // Mevcut görevleri al.
  // Düzenleme için input ve tarih inputunu kapsayan bir wrapper oluşturulur.
  const wrapper = document.createElement('span'); // Yeni bir span (wrapper).
  wrapper.style.display = 'flex'; // Yan yana hizalama.
  wrapper.style.alignItems = 'center'; // Dikeyde ortala.
  wrapper.style.gap = '0.5rem'; // Elemanlar arası boşluk.

  const input = document.createElement('input'); // Metin inputu.
  input.type = 'text'; // Tipi metin.
  input.value = tasks[index].text; // Mevcut metni ekle.
  input.className = 'task-text'; // Stil için class.
  input.style.flex = '1'; // Kalan alanı kapla.
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') finishEdit(); // Enter ile kaydet.
    if (e.key === 'Escape') cancelEdit(); // Escape ile iptal.
  });

  const dateInput = document.createElement('input'); // Tarih inputu.
  dateInput.type = 'date'; // Tipi date.
  dateInput.value = tasks[index].dueDate || ''; // Mevcut tarihi ekle.
  dateInput.min = document.getElementById('task-date').min; // Geçmiş tarih engeli.
  dateInput.className = 'task-date'; // Stil için class.

  input.addEventListener('blur', () => setTimeout(finishEdit, 100)); // Odak kaybolunca kaydet.
  dateInput.addEventListener('blur', () => setTimeout(finishEdit, 100)); // Odak kaybolunca kaydet.

  wrapper.appendChild(input); // Metin inputunu ekle.
  wrapper.appendChild(dateInput); // Tarih inputunu ekle.
  span.replaceWith(wrapper); // Eski metni yeni wrapper ile değiştir.
  input.focus(); // Odağı metin inputuna ver.

  // Düzenleme işlemini tamamlayan fonksiyon.
  function finishEdit() {
    const val = input.value.trim(); // Metni al ve boşlukları temizle.
    const dateVal = dateInput.value ? dateInput.value : null; // Tarihi al.
    if (val && dateVal) { // İkisi de doluysa güncelle.
      tasks[index].text = val;
      tasks[index].dueDate = dateVal;
      saveTasks(tasks);
      renderTasks();
    } else {
      showWarning('Görev ve teslim zamanı boş olamaz!'); // Eksikse uyarı göster.
      setTimeout(hideWarning, 2000); // 2 saniye sonra uyarıyı gizle.
      renderTasks();
    }
  }
  // Düzenlemeyi iptal eder.
  function cancelEdit() {
    renderTasks(); // Listeyi eski haline getir.
  }
}

// Filtre butonlarına ve toplu silme butonlarına tıklama olayları ekler.
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => { // Tüm filtre butonlarını seç.
    btn.addEventListener('click', function() { // Her butona tıklama olayı ekle.
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); // Diğerlerinden 'active' kaldır.
      this.classList.add('active'); // Tıklananı aktif yap.
      renderTasks(); // Listeyi güncelle.
    });
  });
  document.getElementById('clear-completed-btn').addEventListener('click', clearCompletedTasks); // Tamamlananları sil butonu.
  document.getElementById('clear-all-btn').addEventListener('click', clearAllTasks); // Tümünü sil butonu.
}

// Tamamlanan görevleri siler.
function clearCompletedTasks() {
  let tasks = getTasks(); // Mevcut görevleri al.
  tasks = tasks.filter(t => !t.completed); // Tamamlanmayanları bırak.
  saveTasks(tasks); // Kaydet.
  renderTasks(); // Listeyi güncelle.
}
// Tüm görevleri siler.
function clearAllTasks() {
  saveTasks([]); // Boş dizi kaydet.
  renderTasks(); // Listeyi güncelle.
}

// Temel butonlara olay ekler. Ekle butonu, Enter ile ekleme ve tema değiştirici.
function setupEvents() {
  document.getElementById('add-task-btn').addEventListener('click', addTask); // Ekle butonuna tıklama.
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask(); // Enter ile ekle.
  });
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme); // Tema değiştirici.
}

// Sayfa yüklendiğinde çalışacak ana fonksiyon. Tüm başlatıcıları çağırır.
function init() {
  setMinDate(); // Tarih inputunu bugünden başlatır.
  setTheme(getTheme()); // Temayı uygular.
  setupEvents(); // Olayları kurar.
  setupFilters(); // Filtreleri ve toplu silmeleri kurar.
  renderTasks(); // Görevleri gösterir.
}
document.addEventListener('DOMContentLoaded', init); // Sayfa yüklendiğinde başlatıcı fonksiyonu çağırır. 