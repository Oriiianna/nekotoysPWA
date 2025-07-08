import { toggleFavorito, obtenerFavoritos, iniciarFavoritos } from '../js/favoritos.js';

const basePath = "../";

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

if (!id) {
    document.getElementById("detalle-producto").innerHTML =
        "<p class='text-center text-danger mt-5'>Producto no encontrado.</p>";
    throw new Error("ID no proporcionado");
}

fetch(basePath + "data/figuras.json")
    .then(res => res.json())
    .then(productos => {
        const producto = productos.find(p => p.id === id);
        if (!producto) {
            document.getElementById("detalle-producto").innerHTML =
                "<p class='text-center text-danger mt-5'>Producto no encontrado.</p>";
            return;
        }
        renderProducto(producto);
        iniciarFavoritos(basePath);
    })
    .catch(err => {
        console.error("Error al cargar producto:", err);
        document.getElementById("detalle-producto").innerHTML =
            "<p class='text-center text-danger mt-5'>Error al cargar los datos.</p>";
    });

function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const existe = carrito.some(p => p.id === producto.id);

    if (!existe) {
        const imagen = producto.imagenes?.[0] || producto.imagen || "img/img-figuras/default.jpg";

        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            imagen,
            precio: producto.precio || 0,
        });

        localStorage.setItem("carrito", JSON.stringify(carrito));

        const toastBody = document.querySelector("#toastCarrito .toast-body");
        toastBody.textContent = `${producto.nombre} fue agregado al carrito 🛒`;

        const toast = new bootstrap.Toast(document.getElementById('toastCarrito'));
        toast.show();
    } else {
        const toastBody = document.querySelector("#toastCarrito .toast-body");
        toastBody.textContent = `${producto.nombre} ya está en el carrito`;

        const toast = new bootstrap.Toast(document.getElementById('toastCarrito'));
        toast.show();
    }
}

function renderProducto(p) {
    const container = document.getElementById("detalle-producto");

    const imagenes = (p.imagenes && p.imagenes.length
        ? p.imagenes
        : [p.imagen || "img/img-figuras/default.jpg"]).map(img => basePath + img);

    const imagenPrincipal = imagenes[0];

    container.innerHTML = `
    <div class="row g-4">
      <div class="col-md-6">
        <img id="img-principal" class="img-fluid" src="${imagenPrincipal}" alt="${p.nombre}" />
        <div id="miniaturas" class="d-flex justify-content-center gap-2 flex-wrap mt-3">
          ${imagenes
            .map((img, i) => `
              <img src="${img}" class="img-thumbnail miniatura" style="width: 60px; cursor: pointer; border: ${i === 0 ? "2px solid #6a0dad" : "1px solid #ccc"};" data-index="${i}" />
          `).join("")}
        </div>
      </div>

      <div class="col-md-6">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <button class="btn-fav-icon" id="btn-fav" title="Agregar a favoritos">🤍</button>
          <button class="btn btn-outline-secondary btn-sm" id="btn-compartir">Compartir 🔗</button>
        </div>

        <h2 class="fw-bold">${p.nombre}</h2>
        <p class="text-muted mb-1">Categoría: ${p.categorias?.join(", ") || "General"}</p>
        <p class="text-muted">Stock disponible: ${p.stock || 1}</p>
        <h4 class="text-morado fw-semibold mb-4">${new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(p.precio)}</h4>

        ${p.descripcion ? `<p class="mb-4">${p.descripcion}</p>` : ""}

        <div class="d-flex align-items-center mb-3">
          <button class="btn btn-outline-dark" id="restar">-</button>
          <input type="number" id="cantidad" class="form-control mx-2" value="1" min="1" style="width: 60px; text-align: center;" />
          <button class="btn btn-outline-dark" id="sumar">+</button>
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-morado flex-grow-1" id="btn-agregar-carrito">🛒 Agregar al carrito</button>
          <a href="https://wa.me/5491112345678" target="_blank" class="btn btn-success">WhatsApp</a>
        </div>
      </div>
    </div>
  `;

    const btnFav = document.getElementById("btn-fav");
    const favoritos = obtenerFavoritos();
    const esFav = favoritos.some(f => f.id === p.id);
    btnFav.textContent = esFav ? "❤️" : "🤍";

    btnFav.addEventListener("click", () => {
        toggleFavorito(p);
        const esAhoraFav = obtenerFavoritos().some(f => f.id === p.id);
        btnFav.textContent = esAhoraFav ? "❤️" : "🤍";
        iniciarFavoritos(basePath); 
    });

    document.getElementById("btn-agregar-carrito").addEventListener("click", () => {
        agregarAlCarrito(p);
    });

    /* Miniaturas */
    const imgPrincipal = document.getElementById("img-principal");
    document.querySelectorAll(".miniatura").forEach(thumb => {
        thumb.addEventListener("click", () => {
            imgPrincipal.src = thumb.src;
            document.querySelectorAll(".miniatura").forEach(el => el.style.border = "1px solid #ccc");
            thumb.style.border = "2px solid #6a0dad";
        });
    });

    const inputCantidad = document.getElementById("cantidad");
    document.getElementById("restar").addEventListener("click", () => {
        const val = parseInt(inputCantidad.value);
        if (val > 1) inputCantidad.value = val - 1;
    });
    document.getElementById("sumar").addEventListener("click", () => {
        inputCantidad.value = parseInt(inputCantidad.value) + 1;
    });

    document.getElementById("btn-compartir").addEventListener("click", async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    text: "¡Mirá esta figura!",
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Error al compartir:", error);
            }
        } else {
            alert("Tu navegador no soporta la función de compartir nativa.");
        }
    });
}
