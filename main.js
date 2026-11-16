// ===== 1. DATOS =====
const productos = [
  { id: 1, nombre: "Teclado mecánico", precio: 45000, comprado: false },
  { id: 2, nombre: "Mouse inalámbrico", precio: 22000, comprado: false },
  { id: 3, nombre: "Monitor 24''", precio: 180000, comprado: false }
];

let proximoId = 4;
let idNuevo = null; // id del último producto agregado (para resaltarlo)

// ===== 2. SELECCIÓN DE ELEMENTOS DEL DOM =====
const formulario = document.getElementById("formulario");
const inputNombre = document.getElementById("input-nombre");
const inputPrecio = document.getElementById("input-precio");
const inputBuscar = document.querySelector("#input-buscar");
const contenedor = document.querySelector("#contenedor");
const mensaje = document.getElementById("mensaje");
const resumen = document.getElementById("resumen");

// ===== 3. FUNCIONES =====

// Evita que lo que escribe el usuario se interprete como HTML
function escaparHTML(texto) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatearPrecio(numero) {
  return "$" + numero.toLocaleString("es-AR");
}

// Feedback visual: muestra un mensaje en pantalla y lo borra a los 3 segundos
let temporizadorMensaje;
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(() => {
    mensaje.textContent = "";
    mensaje.className = "mensaje";
  }, 3000);
}

// Renderizado dinámico: limpia el contenedor y dibuja cada producto
function renderizarProductos() {
  const texto = inputBuscar.value.trim().toLowerCase();
  const filtrados = productos.filter((p) => p.nombre.toLowerCase().includes(texto));

  contenedor.innerHTML = "";

  if (filtrados.length === 0) {
    contenedor.innerHTML = `<p class="vacio">No hay productos para mostrar.</p>`;
  }

  filtrados.forEach((producto) => {
    const clases = ["tarjeta"];
    if (producto.comprado) clases.push("comprado");
    if (producto.id === idNuevo) clases.push("nuevo");

    contenedor.innerHTML += `
      <div class="${clases.join(" ")}" data-id="${producto.id}">
        <h3>${escaparHTML(producto.nombre)}</h3>
        <p>${formatearPrecio(producto.precio)}</p>
        <div class="acciones">
          <button class="btn-comprado" data-accion="comprado">
            ${producto.comprado ? "Deshacer" : "Comprado"}
          </button>
          <button class="btn-eliminar" data-accion="eliminar">Eliminar</button>
        </div>
      </div>
    `;
  });

  actualizarResumen();
}

function actualizarResumen() {
  const total = productos.reduce((suma, p) => suma + p.precio, 0);
  const pendientes = productos.filter((p) => !p.comprado).length;
  resumen.textContent = `${productos.length} productos · ${pendientes} pendientes · Total: ${formatearPrecio(total)}`;
}

function agregarProducto() {
  const nombre = inputNombre.value.trim();
  const precio = Number(inputPrecio.value);

  // Validación con feedback visual
  inputNombre.classList.toggle("error", nombre === "");
  inputPrecio.classList.toggle("error", !(precio > 0));

  if (nombre === "" || !(precio > 0)) {
    mostrarMensaje("Completá el nombre y un precio mayor a 0.", "error");
    return;
  }

  const nuevo = { id: proximoId++, nombre: nombre, precio: precio, comprado: false };
  productos.push(nuevo);
  idNuevo = nuevo.id;

  inputBuscar.value = ""; // para que el producto nuevo siempre se vea
  formulario.reset();
  inputNombre.focus();

  renderizarProductos();
  idNuevo = null;
  mostrarMensaje(`"${nuevo.nombre}" se agregó a la lista.`, "exito");
}

function eliminarProducto(id) {
  const indice = productos.findIndex((p) => p.id === id);
  if (indice === -1) return;
  const eliminado = productos[indice];
  const tarjeta = contenedor.querySelector(`[data-id="${id}"]`);

  // animación de salida y luego se actualiza el array y la vista
  tarjeta.classList.add("saliendo");
  setTimeout(() => {
    productos.splice(indice, 1);
    renderizarProductos();
    mostrarMensaje(`"${eliminado.nombre}" se eliminó de la lista.`, "aviso");
  }, 300);
}

function alternarComprado(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;
  producto.comprado = !producto.comprado;
  renderizarProductos();
  mostrarMensaje(
    producto.comprado
      ? `"${producto.nombre}" marcado como comprado.`
      : `"${producto.nombre}" volvió a pendientes.`,
    "exito"
  );
}

// ===== 4. EVENTOS =====

// Click en "+ Agregar" (submit del formulario, también funciona con Enter)
formulario.addEventListener("submit", (event) => {
  event.preventDefault(); // evita que la página se recargue
  agregarProducto();
});

// Evento de teclado: filtra la lista mientras se escribe
inputBuscar.addEventListener("keyup", renderizarProductos);
// Escape limpia el buscador
inputBuscar.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    inputBuscar.value = "";
    renderizarProductos();
  }
});

// Click en los botones de cada tarjeta (delegación de eventos)
contenedor.addEventListener("click", (event) => {
  const boton = event.target.closest("button");
  if (!boton) return;
  const id = Number(boton.closest(".tarjeta").dataset.id);

  if (boton.dataset.accion === "eliminar") eliminarProducto(id);
  if (boton.dataset.accion === "comprado") alternarComprado(id);
});

// Quita el borde rojo apenas el usuario corrige el campo
inputNombre.addEventListener("input", () => inputNombre.classList.remove("error"));
inputPrecio.addEventListener("input", () => inputPrecio.classList.remove("error"));

// ===== 5. INICIO =====
renderizarProductos();
