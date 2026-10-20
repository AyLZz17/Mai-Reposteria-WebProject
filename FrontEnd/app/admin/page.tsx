"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  CatalogCategory,
  CatalogProduct,
  createCatalogCategory,
  createCatalogProduct,
  deleteCatalogCategory,
  permanentlyDeleteCatalogCategory,
  deleteCatalogProduct,
  permanentlyDeleteCatalogProduct,
  getCatalogCategories,
  getCatalogProducts,
  getStorefront,
  StorefrontSettings,
  updateStorefront,
  updateCatalogCategory,
  updateCatalogProduct,
  promoteUserToAdmin,
  removeUserAdminRole,
} from "../../lib/api";

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  main_image_url: string;
  category_id: string;
  is_featured: boolean;
  display_order: string;
  display_colors: string;
  image_position: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
};

const emptyProduct: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "0",
  main_image_url: "",
  category_id: "",
  is_featured: true,
  display_order: "0",
  display_colors: "#d9c4b8, #b76d55, #d4ae7b",
  image_position: "50% 50%",
};
const defaultStorefront: StorefrontSettings = { id: 1, hero_title: "New Product", hero_background_url: "/images/banner/Diseño sin título.svg", hero_logo_url: "/images/brand/logo.svg", hero_overlay_color: "#d9bcae", hero_title_color: "#f5eee7", card_button_label: "ADD TO CART" };

const emptyCategory: CategoryForm = { name: "", slug: "", description: "", image_url: "" };
const fallbackImage = "/images/products/galletas-chocolate.svg";
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const money = (value: number | string) =>
  `$${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [fileError, setFileError] = useState("");

  async function readImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Selecciona un archivo de imagen válido.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setFileError("La imagen no puede superar 4 MB.");
      return;
    }
    setFileError("");
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f4e9df]">
          <img
            src={value || fallbackImage}
            alt="Vista previa"
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
        </div>
        <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-[#cdb09d] bg-[#fffaf6] px-4 py-3 text-sm font-semibold text-[#805744] hover:border-[#a96f52]">
          <span className="block">Subir foto desde tu equipo</span>
          <span className="mt-1 block text-xs font-normal text-[#9b7d6e]">PNG, JPG o WEBP · máximo 4 MB</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={readImage} />
        </label>
      </div>
      <input
        className="field"
        type="url"
        placeholder="O pega una URL de imagen"
        value={value.startsWith("data:") ? "" : value}
        onChange={(event) => onChange(event.target.value)}
      />
      {fileError && <p className="text-xs font-semibold text-red-700">{fileError}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.roles?.some((role) => role === "ADMIN" || role === "SUPER_ADMIN") ?? false;
  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN") ?? false;
  const [tab, setTab] = useState<"overview" | "products" | "categories" | "storefront" | "users">("overview");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategory);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [storefront, setStorefront] = useState<StorefrontSettings>(defaultStorefront);

  const loadCatalog = async () => {
    setBusy(true);
    setError("");
    try {
      const [loadedProducts, loadedCategories, loadedStorefront] = await Promise.all([
        getCatalogProducts(true),
        getCatalogCategories(true),
        getStorefront(),
      ]);
      setProducts(loadedProducts);
      setCategories(loadedCategories);
      setStorefront(loadedStorefront.settings);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el catálogo.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    const timer = window.setTimeout(() => void loadCatalog(), 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin]);

  useEffect(() => {
    const redirectAfterExpiry = () => window.location.assign("/login?expired=1");
    window.addEventListener("mai:auth-expired", redirectAfterExpiry);
    return () => window.removeEventListener("mai:auth-expired", redirectAfterExpiry);
  }, []);

  const activeProducts = products.filter((product) => product.is_active !== false);
  const activeCategories = categories.filter((category) => category.is_active !== false);
  const filteredProducts = useMemo(
    () => products.filter((product) => `${product.name} ${product.category_name || ""}`.toLowerCase().includes(search.toLowerCase())),
    [products, search],
  );

  if (isLoading) return <main className="admin-shell grid min-h-screen place-items-center">Cargando panel...</main>;
  if (!isAdmin) {
    return (
      <main className="admin-shell grid min-h-screen place-items-center p-6">
        <section className="admin-card max-w-md text-center">
          <span className="eyebrow">MAI · ÁREA PRIVADA</span>
          <h1 className="mt-4 text-3xl font-bold">Acceso restringido</h1>
          <p className="mt-3 text-[#806557]">Solo los administradores pueden gestionar el catálogo.</p>
        </section>
      </main>
    );
  }

  function clearMessages() {
    setError("");
    setNotice("");
  }

  function editProduct(product: CatalogProduct) {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      slug: product.slug || slugify(product.name),
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock || 0),
      main_image_url: product.main_image_url || "",
      category_id: product.category_id || "",
      is_featured: product.is_featured !== false,
      display_order: String(product.display_order || 0),
      display_colors: (product.display_colors || []).join(", "),
      image_position: product.image_position || "50% 50%",
    });
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editCategory(category: CatalogCategory) {
    setEditingCategory(category.id);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setTab("categories");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitProduct(event: FormEvent) {
    event.preventDefault();
    clearMessages();
    setBusy(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock || 0),
        category_id: productForm.category_id || undefined,
        main_image_url: productForm.main_image_url || undefined,
        is_featured: productForm.is_featured,
        display_order: Number(productForm.display_order || 0),
        display_colors: productForm.display_colors.split(",").map((color) => color.trim()).filter(Boolean),
        image_position: productForm.image_position,
      };
      if (editingProduct) await updateCatalogProduct(editingProduct, payload);
      else await createCatalogProduct(payload);
      setNotice(editingProduct ? "Producto actualizado." : "Producto publicado.");
      setEditingProduct(null);
      setProductForm(emptyProduct);
      await loadCatalog();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar el producto.");
    } finally {
      setBusy(false);
    }
  }

  async function submitStorefront(event: FormEvent) {
    event.preventDefault(); clearMessages(); setBusy(true);
    try { const saved = await updateStorefront(storefront); setStorefront(saved); setNotice("Portada actualizada."); }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la portada."); }
    finally { setBusy(false); }
  }

  async function toggleFeatured(product: CatalogProduct) {
    clearMessages();
    setBusy(true);
    try {
      const updated = await updateCatalogProduct(product.id, { is_featured: !product.is_featured });
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, ...updated } : item));
      setNotice(updated.is_featured ? `“${product.name}” aparecerá en el inicio.` : `“${product.name}” se quitó del inicio.`);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "No se pudo actualizar la selección.");
    } finally { setBusy(false); }
  }

  async function promoteAdmin(event: FormEvent) {
    event.preventDefault(); clearMessages(); setBusy(true);
    try { await promoteUserToAdmin(adminEmail); setNotice(`El usuario ${adminEmail} ahora es administrador.`); setAdminEmail(""); }
    catch (promoteError) { setError(promoteError instanceof Error ? promoteError.message : "No se pudo asignar el rol."); }
    finally { setBusy(false); }
  }

  async function removeAdmin() {
    if (!adminEmail.trim()) return;
    if (!window.confirm(`¿Quitar el rol ADMIN a ${adminEmail}?`)) return;
    clearMessages(); setBusy(true);
    try { await removeUserAdminRole(adminEmail); setNotice(`Se quitó el rol ADMIN a ${adminEmail}.`); setAdminEmail(""); }
    catch (removeError) { setError(removeError instanceof Error ? removeError.message : "No se pudo quitar el rol."); }
    finally { setBusy(false); }
  }

  async function submitCategory(event: FormEvent) {
    event.preventDefault();
    clearMessages();
    setBusy(true);
    try {
      const payload = { ...categoryForm, slug: categoryForm.slug || slugify(categoryForm.name) };
      if (editingCategory) await updateCatalogCategory(editingCategory, payload);
      else await createCatalogCategory(payload);
      setNotice(editingCategory ? "Categoría actualizada." : "Categoría creada.");
      setEditingCategory(null);
      setCategoryForm(emptyCategory);
      await loadCatalog();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la categoría.");
    } finally {
      setBusy(false);
    }
  }

  async function archiveProduct(product: CatalogProduct) {
    if (!window.confirm(`¿Desactivar “${product.name}”?`)) return;
    clearMessages();
    try {
      await deleteCatalogProduct(product.id);
      setNotice("Producto desactivado.");
      await loadCatalog();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo desactivar el producto.");
    }
  }

  async function permanentlyDeleteProduct(product: CatalogProduct) {
    if (!window.confirm(`Esta acción eliminará definitivamente “${product.name}” y no se puede deshacer. ¿Deseas continuar?`)) return;
    clearMessages();
    try { await permanentlyDeleteCatalogProduct(product.id); setNotice("Producto eliminado definitivamente."); await loadCatalog(); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar definitivamente el producto."); }
  }

  async function archiveCategory(category: CatalogCategory) {
    if (!window.confirm(`¿Desactivar la categoría “${category.name}”?`)) return;
    clearMessages();
    try {
      await deleteCatalogCategory(category.id);
      setNotice("Categoría desactivada.");
      await loadCatalog();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo desactivar la categoría.");
    }
  }

  async function permanentlyDeleteCategory(category: CatalogCategory) {
    if (!window.confirm(`Esta acción eliminará definitivamente la categoría “${category.name}”. Los productos quedarán sin categoría. ¿Deseas continuar?`)) return;
    clearMessages();
    try { await permanentlyDeleteCatalogCategory(category.id); setNotice("Categoría eliminada definitivamente."); await loadCatalog(); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar definitivamente la categoría."); }
  }

  const input = "field";
  const menu = [
    { id: "overview" as const, label: "Resumen", icon: "◈" },
    { id: "products" as const, label: "Productos", icon: "✦" },
    { id: "categories" as const, label: "Categorías", icon: "⌘" },
    { id: "storefront" as const, label: "Portada", icon: "⌂" },
    ...(isSuperAdmin ? [{ id: "users" as const, label: "Administradores", icon: "♙" }] : []),
  ];

  return (
    <main className="admin-shell min-h-screen">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="brand-mark"><span>MAI</span><strong>REPOSTERÍA</strong></div>
          <div className="mt-14">
            <span className="eyebrow">CENTRO DE CONTROL</span>
            <nav className="mt-5 space-y-2">
              {menu.map((item) => (
                <button key={item.id} onClick={() => setTab(item.id)} className={`admin-nav ${tab === item.id ? "active" : ""}`}>
                  <span className="text-lg">{item.icon}</span>{item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="admin-user mt-auto">
            <span className="avatar">{(user?.name || "A").slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold">{user?.name || "Administrador"}</p><p className="truncate text-xs text-[#b69683]">{user?.email}</p></div>
          </div>
        </aside>

        <section className="admin-content">
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div><span className="eyebrow">PANEL DE ADMINISTRACIÓN</span><h1 className="mt-3 text-4xl font-bold tracking-tight text-[#493126]">Tu catálogo, bajo control.</h1><p className="mt-2 text-[#806557]">Crea experiencias dulces que tus clientes recuerden.</p></div>
            <button className="secondary-button" onClick={() => void loadCatalog()} disabled={busy}>↻ {busy ? "Actualizando" : "Actualizar datos"}</button>
          </header>

          <div className="admin-tabs mt-8 lg:hidden">{menu.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={tab === item.id ? "active" : ""}>{item.label}</button>)}</div>
          {(notice || error) && <div className={`alert mt-6 ${error ? "error" : "success"}`}>{error || notice}<button onClick={clearMessages}>×</button></div>}

          <div className="stats-grid mt-8">
            <div className="stat-card highlight"><span>PRODUCTOS ACTIVOS</span><strong>{activeProducts.length}</strong><small>en tu vitrina actual</small></div>
            <div className="stat-card"><span>CATEGORÍAS</span><strong>{activeCategories.length}</strong><small>colecciones organizadas</small></div>
            <div className="stat-card"><span>INVENTARIO</span><strong>{activeProducts.reduce((total, product) => total + Number(product.stock || 0), 0)}</strong><small>unidades disponibles</small></div>
          </div>

          {tab === "overview" && (
            <section className="admin-card mt-8">
              <div className="flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow">VISTA GENERAL</span><h2 className="section-title">Lo último de tu tienda</h2></div><button className="text-button" onClick={() => setTab("products")}>Ver todos →</button></div>
              <div className="mt-6 grid gap-3">{activeProducts.slice(0, 4).map((product) => <ProductRow key={product.id} product={product} onEdit={editProduct} onArchive={archiveProduct} onDelete={permanentlyDeleteProduct} />)}{activeProducts.length === 0 && <EmptyState text="Todavía no hay productos. Crea el primero desde Productos." />}</div>
            </section>
          )}

          {tab === "products" && (
            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
              <section className="admin-card order-2 xl:order-1">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow">INVENTARIO</span><h2 className="section-title">Productos</h2></div><input className="field max-w-xs" placeholder="Buscar producto..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
                <div className="mt-6 space-y-3">{filteredProducts.map((product) => <ProductRow key={product.id} product={product} onEdit={editProduct} onArchive={archiveProduct} onDelete={permanentlyDeleteProduct} />)}{filteredProducts.length === 0 && <EmptyState text="No encontramos productos con esa búsqueda." />}</div>
              </section>
              <ProductFormCard form={productForm} setForm={setProductForm} editing={Boolean(editingProduct)} onSubmit={submitProduct} onCancel={() => { setEditingProduct(null); setProductForm(emptyProduct); }} categories={categories} imageField={<ImageField value={productForm.main_image_url} onChange={(value) => setProductForm({ ...productForm, main_image_url: value })} />} input={input} busy={busy} />
            </div>
          )}

          {tab === "categories" && (
            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
              <section className="admin-card order-2 xl:order-1"><span className="eyebrow">ORGANIZACIÓN</span><h2 className="section-title">Categorías</h2><div className="mt-6 grid gap-3">{categories.map((category) => <CategoryRow key={category.id} category={category} onEdit={editCategory} onArchive={archiveCategory} onDelete={permanentlyDeleteCategory} />)}{categories.length === 0 && <EmptyState text="Crea una categoría para ordenar tu vitrina." />}</div></section>
              <section className="admin-card order-1 xl:order-2"><span className="eyebrow">{editingCategory ? "EDITAR COLECCIÓN" : "NUEVA COLECCIÓN"}</span><h2 className="section-title">{editingCategory ? "Editar categoría" : "Crear categoría"}</h2><form onSubmit={submitCategory} className="mt-6 space-y-4"><input required className={input} placeholder="Nombre de categoría" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value, slug: categoryForm.slug || slugify(event.target.value) })} /><input required className={input} placeholder="Slug" value={categoryForm.slug} onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })} /><textarea className={`${input} min-h-28 resize-y`} placeholder="Describe esta colección..." value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} /><ImageField value={categoryForm.image_url} onChange={(value) => setCategoryForm({ ...categoryForm, image_url: value })} /><FormActions editing={Boolean(editingCategory)} onCancel={() => { setEditingCategory(null); setCategoryForm(emptyCategory); }} busy={busy} /></form></section>
            </div>
          )}
          {tab === "storefront" && <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="admin-card"><span className="eyebrow">PRODUCTOS DEL INICIO</span><h2 className="section-title">Elige qué productos mostrar</h2><p className="mt-2 text-sm text-[#806557]">Selecciona los productos que aparecerán en la portada. Puedes ajustar su orden desde Productos.</p><div className="mt-6 space-y-3">{activeProducts.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[#ead8ca] p-3 hover:bg-[#fffaf6]"><input type="checkbox" className="h-5 w-5 accent-[#6a3d2b]" checked={product.is_featured === true} onChange={() => void toggleFeatured(product)} disabled={busy} /><img src={product.main_image_url || fallbackImage} alt="" className="h-14 w-14 rounded-xl object-cover" /><span className="min-w-0 flex-1"><strong className="block truncate">{product.name}</strong><small className="text-[#927466]">{money(product.price)}</small></span><span className="text-xs text-[#927466]">{product.is_featured ? "Visible" : "Oculto"}</span></label>)}{activeProducts.length === 0 && <EmptyState text="Primero crea un producto desde Productos." />}</div></section>
            <section className="admin-card"><span className="eyebrow">CONFIGURACIÓN DE PORTADA</span><h2 className="section-title">Título y apariencia</h2><form onSubmit={submitStorefront} className="mt-6 grid gap-4"><input className={input} placeholder="Título del banner" value={storefront.hero_title} onChange={(e) => setStorefront({ ...storefront, hero_title: e.target.value })} /><input className={input} placeholder="Texto del botón" value={storefront.card_button_label} onChange={(e) => setStorefront({ ...storefront, card_button_label: e.target.value })} /><input className={input} placeholder="URL fondo del banner" value={storefront.hero_background_url} onChange={(e) => setStorefront({ ...storefront, hero_background_url: e.target.value })} /><input className={input} placeholder="URL logo del banner" value={storefront.hero_logo_url} onChange={(e) => setStorefront({ ...storefront, hero_logo_url: e.target.value })} /><label className="text-sm">Color del título<input className={input} type="color" value={storefront.hero_title_color} onChange={(e) => setStorefront({ ...storefront, hero_title_color: e.target.value })} /></label><FormActions editing={false} onCancel={() => setStorefront(defaultStorefront)} busy={busy} /></form></section>
          </div>}
          {tab === "users" && isSuperAdmin && <section className="admin-card mt-8 max-w-2xl"><span className="eyebrow">SUPER ADMIN</span><h2 className="section-title">Gestionar administradores</h2><p className="mt-2 text-sm text-[#806557]">Usa el correo exacto de una cuenta registrada para asignar o quitar el rol ADMIN.</p><form onSubmit={promoteAdmin} className="mt-6 flex flex-wrap gap-3"><input required type="email" className={`${input} min-w-[240px] flex-1`} placeholder="correo@ejemplo.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} /><button type="submit" className="primary-button" disabled={busy}>{busy ? "Guardando..." : "Hacer admin"}</button><button type="button" className="secondary-button" onClick={() => void removeAdmin()} disabled={busy}>Quitar admin</button></form></section>}
        </section>
      </div>
    </main>
  );
}

function ProductFormCard({ form, setForm, editing, onSubmit, onCancel, categories, imageField, input, busy }: { form: ProductForm; setForm: (form: ProductForm) => void; editing: boolean; onSubmit: (event: FormEvent) => void; onCancel: () => void; categories: CatalogCategory[]; imageField: ReactNode; input: string; busy: boolean }) {
  return <section className="admin-card order-1 xl:order-2"><span className="eyebrow">{editing ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}</span><h2 className="section-title">{editing ? "Actualizar producto" : "Añadir al catálogo"}</h2><form onSubmit={onSubmit} className="mt-6 space-y-4"><input required className={input} placeholder="Nombre del producto" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.slug || slugify(event.target.value) })} /><input required className={input} placeholder="Slug único" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /><textarea required className={`${input} min-h-28 resize-y`} placeholder="Descripción del producto..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><div className="grid grid-cols-2 gap-3"><input required type="number" min="0" step="100" className={input} placeholder="Precio (COP)" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /><input required type="number" min="0" className={input} placeholder="Stock" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></div><select required className={input} value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })}><option value="">Elige una categoría</option>{categories.filter((category) => category.is_active !== false).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{imageField}<input className={input} placeholder="Colores hex separados por coma" value={form.display_colors} onChange={(e) => setForm({ ...form, display_colors: e.target.value })} /><input className={input} placeholder="Posición de imagen (ej. 50% 50%)" value={form.image_position} onChange={(e) => setForm({ ...form, image_position: e.target.value })} /><div className="grid grid-cols-2 gap-3"><input type="number" className={input} placeholder="Orden en portada" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Mostrar en portada</label></div><FormActions editing={editing} onCancel={onCancel} busy={busy} /></form></section>;
}

function FormActions({ editing, onCancel, busy }: { editing: boolean; onCancel: () => void; busy: boolean }) {
  return <div className="flex gap-3 pt-2"><button type="submit" className="primary-button flex-1" disabled={busy}>{busy ? "Guardando..." : editing ? "Guardar cambios" : "Publicar ahora"}</button>{editing && <button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button>}</div>;
}

function ProductRow({ product, onEdit, onArchive, onDelete }: { product: CatalogProduct; onEdit: (product: CatalogProduct) => void; onArchive: (product: CatalogProduct) => void; onDelete: (product: CatalogProduct) => void }) {
  return <article className="catalog-row"><img src={product.main_image_url || fallbackImage} alt="" onError={(event) => { event.currentTarget.src = fallbackImage; }} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold">{product.name}</h3>{product.is_active === false && <span className="status muted">Inactivo</span>}</div><p className="mt-1 truncate text-sm text-[#927466]">{product.category_name || "Sin categoría"} · {product.description || "Sin descripción"}</p></div><strong className="hidden text-sm sm:block">{money(product.price)}</strong><div className="row-actions"><button onClick={() => onEdit(product)} aria-label={`Editar ${product.name}`}>Editar</button>{product.is_active !== false && <button className="danger" onClick={() => onArchive(product)} aria-label={`Desactivar ${product.name}`}>Desactivar</button>}<button className="danger" onClick={() => onDelete(product)} aria-label={`Eliminar definitivamente ${product.name}`}>Eliminar</button></div></article>;
}

function CategoryRow({ category, onEdit, onArchive, onDelete }: { category: CatalogCategory; onEdit: (category: CatalogCategory) => void; onArchive: (category: CatalogCategory) => void; onDelete: (category: CatalogCategory) => void }) {
  return <article className="catalog-row"><img src={category.image_url || fallbackImage} alt="" onError={(event) => { event.currentTarget.src = fallbackImage; }} /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="truncate font-bold">{category.name}</h3>{category.is_active === false && <span className="status muted">Inactiva</span>}</div><p className="mt-1 truncate text-sm text-[#927466]">{category.description || "Sin descripción"} · /{category.slug}</p></div><div className="row-actions"><button onClick={() => onEdit(category)}>Editar</button>{category.is_active !== false && <button className="danger" onClick={() => onArchive(category)}>Desactivar</button>}<button className="danger" onClick={() => onDelete(category)}>Eliminar</button></div></article>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-[#dbc7b9] px-5 py-10 text-center text-sm text-[#927466]">{text}</div>;
}
