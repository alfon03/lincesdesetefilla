let productos = [];
let categoriaActual = "Todas";

const contenedorProductos = document.getElementById("productos-container");
const numeroProductos = document.getElementById("numero-productos");
const mensajeError = document.getElementById("mensaje-error");

// ==========================================
// CARGAR PRODUCTOS DESDE JSON
// ==========================================

async function cargarProductos() {

    if (
        !contenedorProductos ||
        !numeroProductos ||
        !mensajeError
    ) {
        return;
    }


    try {

        const respuesta = await fetch("productos.json");

        if (!respuesta.ok) {
            throw new Error("No se ha podido cargar productos.json");
        }

        productos = await respuesta.json();

        mostrarProductos();

    } catch (error) {

        console.error(error);

        numeroProductos.textContent = "";

        mensajeError.textContent =
            "No se han podido cargar los productos. Comprueba que productos.json existe y que estás utilizando un servidor local.";

    }


}

// ==========================================
// MOSTRAR PRODUCTOS
// ==========================================

function mostrarProductos() {

    if (
        !contenedorProductos ||
        !numeroProductos
    ) {
        return;
    }


    contenedorProductos.innerHTML = "";

    let productosFiltrados = productos.filter(producto => {

        if (!producto.disponible) {
            return false;
        }

        if (categoriaActual === "Todas") {
            return true;
        }

        return producto.categoria === categoriaActual;

    });


    numeroProductos.textContent =
        `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? "s" : ""}`;


    if (productosFiltrados.length === 0) {

        contenedorProductos.innerHTML = `
        <div class="sin-productos">
            <p>No hay productos disponibles en esta categoría.</p>
        </div>
    `;

        return;
    }


    productosFiltrados.forEach(producto => {

        const tarjeta = document.createElement("article");

        tarjeta.className = "producto-card";


        const imagenPrincipal =
            producto.imagenes && producto.imagenes.length > 0
                ? producto.imagenes[0]
                : "";


        tarjeta.innerHTML = `

        <a href="producto.html?id=${producto.id}" class="producto-imagen">

            ${imagenPrincipal
                ? `<img src="${imagenPrincipal}" alt="${producto.nombre}">`
                : `<div class="sin-imagen">Sin imagen</div>`
            }

            ${producto.destacado
                ? `<span class="producto-destacado">Destacado</span>`
                : ""
            }

        </a>


        <div class="producto-info">

            <p class="producto-categoria">
                ${producto.categoria}
            </p>

            <h3>
                ${producto.nombre}
            </h3>

            <p class="producto-descripcion">
                ${producto.descripcion}
            </p>

            <div class="producto-pie">

                <strong class="producto-precio">
                    ${producto.precio.toFixed(2)} €
                </strong>

                <a
                    href="producto.html?id=${producto.id}"
                    class="boton-producto"
                >
                    Ver producto
                </a>

            </div>

        </div>

    `;


        contenedorProductos.appendChild(tarjeta);

    });


}

// ==========================================
// FILTROS DE CATEGORÍA
// ==========================================

const botonesCategoria =
    document.querySelectorAll(".filtro-categoria");

botonesCategoria.forEach(boton => {


    boton.addEventListener("click", () => {

        categoriaActual =
            boton.dataset.categoria;


        botonesCategoria.forEach(botonCategoria => {
            botonCategoria.classList.remove("activo");
        });


        boton.classList.add("activo");


        mostrarProductos();

    });


});

// ==========================================
// CONTADOR DEL CARRITO
// ==========================================

function actualizarContadorCarrito() {

    const contador =
        document.getElementById("contador-carrito");

    if (!contador) {
        return;
    }

    const carrito =
        JSON.parse(localStorage.getItem("carrito")) || [];


    const cantidad =
        carrito.reduce((total, producto) => {
            return total + producto.cantidad;
        }, 0);


    contador.textContent = cantidad;

}

// ==========================================
// INICIAR TIENDA
// ==========================================

cargarProductos();

actualizarContadorCarrito();
