const API_URL = "/api/v1/productos";

const form = document.querySelector("#product-form");
const statusBanner = document.querySelector("#form-status");
const cancelEditButton = document.querySelector("#cancel-edit");
const submitButton = document.querySelector("#submit-button");
const filtersForm = document.querySelector("#filters-form");
const clearFiltersButton = document.querySelector("#clear-filters");
const searchInput = document.querySelector("#search-input");
const filterCategorySelect = document.querySelector("#filter-category");
const pageSizeSelect = document.querySelector("#page-size");
const prevPageButton = document.querySelector("#prev-page");
const nextPageButton = document.querySelector("#next-page");
const paginationSummary = document.querySelector("#pagination-summary");
const tableBody = document.querySelector("#product-table-body");
const totalProductsElement = document.querySelector("#total-products");
const activeCategoriesElement = document.querySelector("#active-categories");
const totalStockElement = document.querySelector("#total-stock");

let editingProductId = null;
let currentProducts = [];
let currentMeta = {
  totalItems: 0,
  itemCount: 0,
  page: 1,
  limit: Number(pageSizeSelect.value),
  totalPages: 1,
  hasPrevPage: false,
  hasNextPage: false,
  search: "",
  categoria: ""
};

const filtersState = {
  page: 1,
  limit: Number(pageSizeSelect.value),
  search: "",
  categoria: ""
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setStatus(message = "", tone = "") {
  statusBanner.textContent = message;

  if (tone) {
    statusBanner.dataset.tone = tone;
    return;
  }

  delete statusBanner.dataset.tone;
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2
  }).format(value);
}

function buildProductsUrl() {
  const params = new URLSearchParams({
    page: String(filtersState.page),
    limit: String(filtersState.limit)
  });

  if (filtersState.search) {
    params.set("search", filtersState.search);
  }

  if (filtersState.categoria) {
    params.set("categoria", filtersState.categoria);
  }

  return `${API_URL}?${params.toString()}`;
}

function setLoadingState(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading
    ? "Guardando..."
    : editingProductId
      ? "Actualizar producto"
      : "Guardar producto";
}

function getErrorMessage(payload) {
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    return payload.errors.map((error) => error.message).join(" | ");
  }

  return payload?.message || "No fue posible completar la solicitud";
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload;
}

function renderStats(products, meta) {
  totalProductsElement.textContent = meta.totalItems;
  activeCategoriesElement.textContent = new Set(products.map((product) => product.categoria)).size;
  totalStockElement.textContent = products.reduce((sum, product) => sum + product.stock, 0);
}

function renderPagination(meta) {
  prevPageButton.disabled = !meta.hasPrevPage;
  nextPageButton.disabled = !meta.hasNextPage;
  paginationSummary.textContent = meta.totalItems
    ? `Mostrando ${meta.itemCount} de ${meta.totalItems} productos | Pagina ${meta.page} de ${meta.totalPages}`
    : "Sin resultados";
}

function renderProducts(products, meta) {
  currentProducts = products;
  currentMeta = meta;
  filtersState.page = meta.page;
  filtersState.limit = meta.limit;
  pageSizeSelect.value = String(meta.limit);

  renderStats(products, meta);
  renderPagination(meta);

  if (products.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">No hay productos registrados para esta busqueda</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td data-label="Producto">
            <div class="product-main">
              <strong>${escapeHtml(product.nombre)}</strong>
              <span class="product-meta">ID ${escapeHtml(product.id.slice(-6).toUpperCase())}</span>
            </div>
          </td>
          <td data-label="Descripcion" class="description-cell">${escapeHtml(product.descripcion)}</td>
          <td data-label="Categoria"><span class="badge">${escapeHtml(product.categoria)}</span></td>
          <td data-label="Precio">${formatPrice(product.precio)}</td>
          <td data-label="Stock">${product.stock}</td>
          <td data-label="Acciones" class="actions-cell">
            <button type="button" class="btn btn-table" data-action="edit" data-id="${product.id}">Editar</button>
            <button type="button" class="btn btn-danger btn-table" data-action="delete" data-id="${product.id}">Eliminar</button>
          </td>
        </tr>
      `
    )
    .join("");
}

function resetForm() {
  editingProductId = null;
  form.reset();
  cancelEditButton.hidden = true;
  submitButton.textContent = "Guardar producto";
}

function fillForm(product) {
  editingProductId = product.id;
  form.nombre.value = product.nombre;
  form.descripcion.value = product.descripcion;
  form.precio.value = product.precio;
  form.stock.value = product.stock;
  form.categoria.value = product.categoria;
  cancelEditButton.hidden = false;
  submitButton.textContent = "Actualizar producto";
  setStatus("Editando producto seleccionado", "success");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getFormPayload() {
  return {
    nombre: form.nombre.value.trim(),
    descripcion: form.descripcion.value.trim(),
    precio: Number(form.precio.value),
    stock: Number(form.stock.value),
    categoria: form.categoria.value
  };
}

async function loadProducts() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="empty-row">Cargando productos...</td>
    </tr>
  `;

  try {
    const response = await request(buildProductsUrl());
    renderProducts(response.data || [], response.meta || currentMeta);
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">${escapeHtml(error.message)}</td>
      </tr>
    `;
    setStatus(error.message, "error");
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  setLoadingState(true);
  setStatus("");
  const isEditing = Boolean(editingProductId);

  try {
    const method = editingProductId ? "PUT" : "POST";
    const url = editingProductId ? `${API_URL}/${editingProductId}` : API_URL;

    const response = await request(url, {
      method,
      body: JSON.stringify(getFormPayload())
    });

    resetForm();

    if (!isEditing) {
      filtersState.page = 1;
    }

    setStatus(response.message, "success");
    await loadProducts();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setLoadingState(false);
  }
}

async function handleTableAction(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  const selectedProduct = currentProducts.find((product) => product.id === id);

  if (!selectedProduct) {
    setStatus("No se encontro el producto seleccionado", "error");
    return;
  }

  if (action === "edit") {
    fillForm(selectedProduct);
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(
      `¿Deseas eliminar "${selectedProduct.nombre}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await request(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (editingProductId === id) {
        resetForm();
      }

      setStatus(response.message, "success");
      await loadProducts();
    } catch (error) {
      setStatus(error.message, "error");
    }
  }
}

async function handleFiltersSubmit(event) {
  event.preventDefault();
  filtersState.search = searchInput.value.trim();
  filtersState.categoria = filterCategorySelect.value;
  filtersState.limit = Number(pageSizeSelect.value);
  filtersState.page = 1;
  await loadProducts();
}

async function handleClearFilters() {
  filtersForm.reset();
  filtersState.search = "";
  filtersState.categoria = "";
  filtersState.limit = Number(pageSizeSelect.value);
  filtersState.page = 1;
  await loadProducts();
}

async function handlePrevPage() {
  if (!currentMeta.hasPrevPage) {
    return;
  }

  filtersState.page -= 1;
  await loadProducts();
}

async function handleNextPage() {
  if (!currentMeta.hasNextPage) {
    return;
  }

  filtersState.page += 1;
  await loadProducts();
}

form.addEventListener("submit", handleSubmit);
filtersForm.addEventListener("submit", handleFiltersSubmit);
tableBody.addEventListener("click", handleTableAction);
clearFiltersButton.addEventListener("click", handleClearFilters);
pageSizeSelect.addEventListener("change", async () => {
  filtersState.limit = Number(pageSizeSelect.value);
  filtersState.page = 1;
  await loadProducts();
});
prevPageButton.addEventListener("click", handlePrevPage);
nextPageButton.addEventListener("click", handleNextPage);
cancelEditButton.addEventListener("click", () => {
  resetForm();
  setStatus("Edicion cancelada", "success");
});

loadProducts();
