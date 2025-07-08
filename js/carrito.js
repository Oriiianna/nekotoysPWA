const basePath = "../";

const carritoContainer = document.getElementById('carrito-container');
const totalCarrito = document.getElementById('total-carrito');
const btnVaciar = document.getElementById('btn-vaciar');

import { iniciarFavoritos } from './favoritos.js';

document.addEventListener("DOMContentLoaded", () => {
    renderCarrito();
    iniciarFavoritos(basePath); 
});


function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);
}

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function renderCarrito() {
    const carrito = obtenerCarrito();
    carritoContainer.innerHTML = "";

    if (carrito.length === 0) {
        carritoContainer.innerHTML = `<p class="text-center text-muted fs-5">Tu carrito está vacío.</p>`;
        totalCarrito.textContent = "Total: $0,00";
        return;
    }

    carrito.forEach(p => {
        carritoContainer.innerHTML += `
      <div class="item-carrito d-flex align-items-center gap-3 border-bottom py-2">
        <img src="${basePath + p.imagen}" alt="${p.nombre}" style="width: 60px; height: auto; object-fit: contain;" />
        <div class="flex-grow-1">
          <h5 class="mb-1">${p.nombre}</h5>
          <p class="mb-0">Precio: <strong>${formatearPrecio(p.precio || 0)}</strong></p>
        </div>
        <button class="btn-fav-icon fav text-danger fs-4" data-id="${p.id}" title="Eliminar del carrito">❤️</button>
      </div>
    `;
    });

    const total = carrito.reduce((acc, p) => acc + (p.precio || 0), 0);
    totalCarrito.textContent = `Total: ${formatearPrecio(total)}`;

    document.querySelectorAll(".btn-fav-icon.fav").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            let carrito = obtenerCarrito();
            carrito = carrito.filter(p => p.id !== id);
            guardarCarrito(carrito);
            renderCarrito();
        });
    });
}

btnVaciar.addEventListener("click", () => {
    localStorage.removeItem("carrito");
    renderCarrito();
});

document.addEventListener("DOMContentLoaded", () => {
    renderCarrito();
});
