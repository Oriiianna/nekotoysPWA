const sonidoFavorito = new Audio("audio/click.mp3");

export function obtenerFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

export function toggleFavorito(producto) {
    const favoritos = obtenerFavoritos();
    const index = favoritos.findIndex(p => p.id === producto.id);

    if (index !== -1) {
        favoritos.splice(index, 1);
    } else {
        const imagen = producto.imagenes?.[0] || producto.imagen || "img/img-figuras/default.jpg";
        favoritos.push({
            id: producto.id,
            nombre: producto.nombre,
            imagen,
            precio: producto.precio || 0
        });
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    sonidoFavorito.currentTime = 0;
    sonidoFavorito.play();

    renderFavoritos();
}


export function renderFavoritos(basePath = "") {
    const lista = document.getElementById("favoritos-lista");
    if (!lista) return;

    const favoritos = obtenerFavoritos();

    lista.innerHTML = favoritos.length === 0
        ? "<p class='text-muted'>No hay productos en favoritos.</p>"
        : favoritos.map(p => `
            <li class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <img src="${basePath + p.imagen}" class="fav-img" alt="${p.nombre}">
                <a href="${basePath}v-producto/detalle.html?id=${p.id}" class="fav-nombre">${p.nombre}</a>
                <button class="fav-remove" data-id="${p.id}" title="Eliminar de favoritos">❤️</button>
            </li>
        `).join("");
}

export function iniciarFavoritos(basePath = "") {
    renderFavoritos(basePath);

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("fav-remove")) {
            const id = parseInt(e.target.dataset.id);
            let favoritos = obtenerFavoritos();
            favoritos = favoritos.filter(p => p.id !== id);
            localStorage.setItem("favoritos", JSON.stringify(favoritos));
            renderFavoritos(basePath);

            document.querySelectorAll(".card").forEach(card => {
                if (parseInt(card.dataset.id) === id) {
                    const btn = card.querySelector(".btn-fav-icon");
                    if (btn) {
                        btn.textContent = "🤍";
                        btn.classList.remove("fav");
                    }
                }
            });
        }
    });
}
