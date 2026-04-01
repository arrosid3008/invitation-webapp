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

    const startDate = new Date().getTime(); 
    const targetDate = new Date("April 09, 2026 10:00:00").getTime();
    
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
            document.querySelector('.scroll-view').classList.add('no-scroll'); 
        });
    });

    window.closeLightbox = () => { 
        lightbox.classList.remove('active'); 
        document.querySelector('.scroll-view').classList.remove('no-scroll'); 
    }

    // --- 6. BUKU TAMU PUBLIK & RSVP DENGAN GOOGLE SHEETS ---
    const wishesForm = document.getElementById('wishes-form');
    const wishesContainer = document.getElementById('wishes-container');
    
    // PENTING: GANTI TEXT DI BAWAH INI DENGAN URL WEB APP MILIKMU
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz7vsNobyeUUepXyvlc1U7zJBQlxgGja6swJoV3HbHn87orsQcV4QJgekdo03o1TKZU/exec'; 

    // Fungsi mengambil data dari Google Sheets
    function fetchWishes() {
        wishesContainer.innerHTML = '<div style="text-align:center; padding: 20px;"><div class="spinner" style="margin: 0 auto;"></div></div>'; 
        
        fetch(scriptURL)
            .then(response => response.json())
            .then(data => {
                wishesContainer.innerHTML = ''; 
                
                if (data.length === 0) {
                    wishesContainer.innerHTML = '<p style="text-align: center; color: var(--sys-text-tertiary); font-size: 0.9rem; padding: 20px 0;">Belum ada ucapan. Jadilah yang pertama memberikan doa restu!</p>';
                    return;
                }

                data.forEach(wish => {
                    const card = document.createElement('div');
                    card.className = 'wish-card';
                    
                    let badgeClass = 'rsvp-ragu';
                    if(wish.rsvp === 'Hadir') badgeClass = 'rsvp-hadir';
                    if(wish.rsvp === 'Tidak Hadir') badgeClass = 'rsvp-tidak';

                    const dateObj = new Date(wish.waktu);
                    const dateStr = dateObj.toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});

                    card.innerHTML = `
                        <div class="wish-header">
                            <div class="wish-name">${wish.nama}</div>
                            <div class="wish-rsvp-badge ${badgeClass}">${wish.rsvp}</div>
                        </div>
                        <div class="wish-date">${dateStr}</div>
                        <div class="wish-msg">${wish.pesan}</div>
                    `;
                    wishesContainer.appendChild(card);
                });
            })
            .catch(error => {
                wishesContainer.innerHTML = '<p style="text-align: center; color: #ff6464; font-size:0.85rem;">Gagal memuat daftar ucapan. Pastikan URL Google Script sudah benar.</p>';
                console.error('Error memuat data:', error);
            });
    }

    fetchWishes(); 

    // Fungsi mengirim data ke Google Sheets
    wishesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = wishesForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;

        const params = new URLSearchParams();
        params.append('nama', document.getElementById('wish-name').value);
        params.append('rsvp', document.getElementById('wish-rsvp').value);
        params.append('pesan', document.getElementById('wish-text').value);

        fetch(scriptURL, { method: 'POST', body: params })
            .then(response => {
                showToast("Ucapan & RSVP berhasil terkirim!");
                wishesForm.reset(); 
                fetchWishes(); 
            })
            .catch(error => {
                showToast("Gagal mengirim ucapan. Coba lagi.");
                console.error('Error mengirim data:', error);
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
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
    if(modal) {
        modal.classList.add('active'); 
        document.querySelector('.scroll-view').classList.add('no-scroll');
    }
}
function closeModal(modalId) { 
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('active'); 
        document.querySelector('.scroll-view').classList.remove('no-scroll'); 
    }
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
    const startDate = "20270409T030000Z";
    const endDate = "20270409T080000Z";
    
    const title = encodeURIComponent("Pernikahan Muhammad Arrosid & Zumrotus Sa'adah");
    const details = encodeURIComponent("Kehadiran dan doa restu Anda sangat berarti bagi kami.");
    const location = encodeURIComponent("Jatisari 03/01, Sobokerto, Ngemplak, Boyolali");
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    
    window.open(googleCalendarUrl, '_blank');
}