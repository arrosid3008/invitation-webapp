document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. PARAMETER NAMA TAMU ---
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to') || 'Tamu Kehormatan';
    document.getElementById('guest-name-display').textContent = guestName;

    // --- 2. LOADER ---
    setTimeout(() => {
        const loader = document.getElementById('loader-screen');
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }, 1200);

    // --- 3. ANIMASI SCROLL ---
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                obs.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // --- 4. HITUNG MUNDUR INTERAKTIF ---
    const circle = document.getElementById('dynamic-ring');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    function setProgress(percent) {
        circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    }

    const startDate = new Date().getTime(); // Dihitung dari hari ini
    // Diubah ke 9 April 2027 pukul 10:00
    const targetDate = new Date("April 09, 2026 10:00:00").getTime();
    
    // Total durasi statis (misal 1 tahun) untuk perhitungan lingkaran
    const totalDuration = targetDate - new Date("January 01, 2026 00:00:00").getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            document.getElementById('countdown-days-text').textContent = days;
            
            let progressPercent = ((totalDuration - diff) / totalDuration) * 100;
            if(progressPercent < 0) progressPercent = 0;
            if(progressPercent > 100) progressPercent = 100;
            
            setProgress(progressPercent);
        } else {
            document.getElementById('countdown-days-text').textContent = "0";
            setProgress(100); 
        }
    }
    updateTimer(); 
    setInterval(updateTimer, 3600000); 

    // --- 5. LIGHTBOX GALERI ---
    const galleryItems = document.querySelectorAll('.gallery-trigger');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const imagesArray = Array.from(galleryItems).map(item => item.style.backgroundImage.replace(/(url\(|\)|"|')/g, ''));
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            let currIdx = parseInt(item.getAttribute('data-index'));
            lightboxImg.src = imagesArray[currIdx];
            lightbox.classList.add('active');
        });
    });

    window.closeLightbox = () => { 
        lightbox.classList.remove('active'); 
    }

    // --- 6. BUKU TAMU PUBLIK & RSVP ---
    const wishesForm = document.getElementById('wishes-form');
    const wishesContainer = document.getElementById('wishes-container');
    
    let wishesData = [
        { name: "Keluarga Besar", date: "Baru saja", rsvp: "Hadir", text: "Selamat menempuh hidup baru! Semoga menjadi keluarga sakinah, mawaddah, warahmah." },
        { name: "Teman Kampus", date: "2 Jam yang lalu", rsvp: "Tidak Hadir", text: "Akhirnya! Selamat ya untuk kalian berdua, maaf belum bisa hadir." }
    ];

    function renderWishes() {
        wishesContainer.innerHTML = '';
        wishesData.forEach(wish => {
            const card = document.createElement('div');
            card.className = 'wish-card';
            
            // Menentukan warna badge RSVP
            let badgeClass = 'rsvp-ragu';
            if(wish.rsvp === 'Hadir') badgeClass = 'rsvp-hadir';
            if(wish.rsvp === 'Tidak Hadir') badgeClass = 'rsvp-tidak';

            card.innerHTML = `
                <div class="wish-header">
                    <div class="wish-name">${wish.name}</div>
                    <div class="wish-rsvp-badge ${badgeClass}">${wish.rsvp}</div>
                </div>
                <div class="wish-date">${wish.date}</div>
                <div class="wish-msg">${wish.text}</div>
            `;
            wishesContainer.appendChild(card);
        });
    }

    renderWishes(); 
    wishesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('wish-name').value;
        const rsvpInput = document.getElementById('wish-rsvp').value;
        const textInput = document.getElementById('wish-text').value;

        wishesData.unshift({
            name: nameInput,
            date: "Baru saja",
            rsvp: rsvpInput,
            text: textInput
        });

        renderWishes(); 
        wishesForm.reset(); 
        showToast("Ucapan & RSVP terkirim");
    });
});

// --- FUNGSI GLOBAL ---

function openInvitation() {
    const cover = document.getElementById('cover-screen');
    cover.classList.add('hide-cover');
    
    const audio = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-icon');
    
    audio.play().then(() => {
        musicIcon.classList.add('playing');
    }).catch(error => {
        console.log("Autoplay diblokir, pengguna harus memutar secara manual.");
    });
}

function toggleMusic() {
    const audio = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-icon');
    
    if (audio.paused) {
        audio.play();
        musicIcon.classList.add('playing');
    } else {
        audio.pause();
        musicIcon.classList.remove('playing');
    }
}

function openModal(modalId) { 
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('active'); 
}
function closeModal(modalId) { 
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.remove('active'); 
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            showToast("Tersalin ke papan klip");
        } else {
            let ta = document.createElement("textarea"); ta.value = text;
            ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta);
            ta.select(); document.execCommand('copy'); ta.remove();
            showToast("Tersalin ke papan klip");
        }
    } catch (e) { showToast("Gagal menyalin"); }
}

function showToast(msg) {
    const cont = document.getElementById('toast-container');
    const toast = document.createElement('div'); toast.className = 'toast'; toast.innerText = msg;
    cont.appendChild(toast); 
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => { 
        toast.classList.remove('show'); 
        setTimeout(() => toast.remove(), 400); 
    }, 2500);
}

// --- FUNGSI SAVE THE DATE (GOOGLE CALENDAR) ---
function saveTheDate() {
    // Format Waktu UTC untuk 9 April 2027 pukul 10:00 WIB sampai 15:00 WIB
    const startDate = "20270409T030000Z";
    const endDate = "20270409T080000Z";
    
    const title = encodeURIComponent("Pernikahan Muhammad Arrosid & Zumrotus Sa'adah");
    const details = encodeURIComponent("Kehadiran dan doa restu Anda sangat berarti bagi kami.");
    const location = encodeURIComponent("Jatisari 03/01, Sobokerto, Ngemplak, Boyolali");
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    
    // Buka di tab baru
    window.open(googleCalendarUrl, '_blank');
}