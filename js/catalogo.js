import { toggleFavorito, obtenerFavoritos, iniciarFavoritos } from './favoritos.js';

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("productos-container");
    const botonesCategorias = document.getElementById("botones-categorias");
    const inputBusqueda = document.getElementById("input-busqueda");

    let productos = [];
    let categoriaActual = "Todos";

    function mostrarNotificacionFavorito(nombre) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("Agregado a favoritos", {
                body: `"${nombre}" fue agregado a tu lista 💜`,
                icon: './img/notificacion-logo.png'
            });
        }
    }

    function formatearPrecio(precio) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);
    }

    function crearCard(producto) {
        const favoritos = obtenerFavoritos();
        const imagenPrincipal = producto.imagenes?.[0] || producto.imagen || "img/img-figuras/default.jpg";
        const esFavorito = favoritos.some(f => f.id === producto.id);
        const icono = esFavorito ? "❤️" : "🤍";
        const clase = esFavorito ? "fav" : "";

        return `
        <div class="col-6 col-md-4 col-xl-2 d-flex justify-content-center">
            <div class="card shadow-sm h-100 rounded-4 p-2" data-id="${producto.id}" style="max-width: 240px; width: 100%;">
                <img src="${imagenPrincipal}" class="card-img-top rounded-3" alt="${producto.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold">${producto.nombre}</h5>
                    <p class="card-text text-muted small mb-1">${producto.anime}</p>
                    <p class="mt-auto fw-semibold text-dark">${formatearPrecio(producto.precio)}</p>
                    <div class="d-flex justify-content-between mt-3">
                        <a href="v-producto/detalle.html?id=${producto.id}" class="btn btn-comprar">Ver detalle</a>
                        <button class="btn-fav-icon ${clase}" title="Agregar a favoritos">${icono}</button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function mostrarProductos(filtro = "Todos", textoBusqueda = "") {
        contenedor.innerHTML = "";

        let filtrados = filtro === "Todos"
            ? productos
            : productos.filter(p => p.categorias.includes(filtro));

        if (textoBusqueda.trim().length > 0) {
            const texto = textoBusqueda.toLowerCase().trim();
            filtrados = filtrados.filter(p =>
                p.nombre.toLowerCase().includes(texto) ||
                p.anime.toLowerCase().includes(texto) ||
                p.categorias.some(cat => cat.toLowerCase().includes(texto))
            );
        }

        if (filtrados.length === 0) {
            contenedor.innerHTML = `<p class="text-center fs-5 mt-4">No se encontraron productos.</p>`;
            return;
        }

        filtrados.forEach(producto => {
            contenedor.innerHTML += crearCard(producto);
        });
    }

    document.addEventListener("click", e => {
        if (e.target.classList.contains("btn-fav-icon")) {
            const card = e.target.closest(".card");
            const id = parseInt(card.dataset.id);
            const producto = productos.find(p => p.id === id);
            toggleFavorito(producto);

            const esFavorito = obtenerFavoritos().some(p => p.id === id);
            e.target.textContent = esFavorito ? "❤️" : "🤍";
            e.target.classList.toggle("fav", esFavorito);

            if (esFavorito) mostrarNotificacionFavorito(producto.nombre);
            iniciarFavoritos(""); 
        }
    });

    botonesCategorias.addEventListener("click", e => {
        if (e.target.tagName === "BUTTON") {
            categoriaActual = e.target.dataset.categoria;
            mostrarProductos(categoriaActual, inputBusqueda.value);
            Array.from(botonesCategorias.children).forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
        }
    });

    inputBusqueda.addEventListener("input", e => {
        mostrarProductos(categoriaActual, e.target.value);
    });

    async function cargarProductos() {
        try {
            const response = await fetch("data/figuras.json");
            productos = await response.json();
            mostrarProductos(categoriaActual, inputBusqueda.value);
            iniciarFavoritos(""); 
        } catch (error) {
            contenedor.innerHTML = `<p class="text-danger text-center mt-4">Error cargando productos.</p>`;
            console.error("Error al cargar JSON:", error);
        }
    }

    cargarProductos();
});
