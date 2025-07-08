if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/nekotoys/sw.js')
        .then(() => console.log("SW registrado correctamente"))
        .catch(err => console.error("[SW] Error al registrar:", err));
}

let deferredPrompt;
const btnInstalar = document.getElementById("btn-instalar");

if (btnInstalar) btnInstalar.style.display = "none";

window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnInstalar) btnInstalar.style.display = "inline-block";
});

if (btnInstalar) {
    btnInstalar.addEventListener("click", () => {
        btnInstalar.style.display = "none";
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            console.log("[PWA]", choice.outcome === "accepted" ? "Instalada" : "Cancelada");
            deferredPrompt = null;
        });
    });
}

window.addEventListener("appinstalled", () => {
    console.log("[PWA] App instalada");
    if (btnInstalar) btnInstalar.style.display = "none";
});

function updateOnlineStatus() {
    if (!navigator.onLine) {
        console.warn("[APP] Estás sin conexión");
    } else {
        console.log("[APP] Estás conectado");
    }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

function solicitarPermisoNotificaciones() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then(p => {
            console.log("[Notif] Permiso:", p);
        });
    }
}
solicitarPermisoNotificaciones();
