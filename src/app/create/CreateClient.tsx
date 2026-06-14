'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'

import { useApp } from '@/lib/context'

type CreateSection = 'productos' | 'servicios' | 'colaboraciones' | 'proyectos'
type ProyectoEstado = 'en_proceso'
type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export interface CreateCollaboration {
  proyectoId: string
  proyectoNombre: string
  proyectoDescripcion: string | null
  proyectoEstado: string
  portadaUrl: string | null
  subtitulo: string
  estado: string
  creadorNombre: string
  createdAt: string
}

interface CreateClientProps {
  collaborations: CreateCollaboration[]
  isAuthenticated: boolean
}

interface ProductFormState {
  nombre: string
  descripcion: string
  precio: string
}

interface ServiceFormState {
  titulo: string
  descripcion: string
  categoria: string
  precio_desde: string
}

interface ProjectFormState {
  nombre: string
  descripcion: string
  portada_url: string
}

type ProductErrors = Partial<Record<keyof ProductFormState, string>>
type ServiceErrors = Partial<Record<keyof ServiceFormState, string>>
type ProjectErrors = Partial<Record<keyof ProjectFormState, string>>

interface CreateProductResponse {
  producto: {
    id: string
    user_id: string
    nombre: string
    descripcion: string
    precio: number
    moneda: 'MXN'
    created_at: string
  }
}

interface CreateServiceResponse {
  servicio: {
    id: string
    user_id: string
    titulo: string
    descripcion: string
    categoria: string
    precio_desde: number
    moneda: 'MXN'
    created_at: string
  }
}

interface CreateProyectoResponse {
  proyecto: {
    id: string
    creador_id: string
    nombre: string
    descripcion: string | null
    estado: ProyectoEstado
    portada_url: string | null
    created_at: string
  }
}

interface SectionConfig {
  id: CreateSection
  title: string
  description: string
  accent: string
  icon: ReactNode
}

const PROJECT_STATUS: ProyectoEstado = 'en_proceso'
const INITIAL_PRODUCT_FORM: ProductFormState = {
  nombre: '',
  descripcion: '',
  precio: '',
}
const INITIAL_SERVICE_FORM: ServiceFormState = {
  titulo: '',
  descripcion: '',
  categoria: '',
  precio_desde: '',
}
const INITIAL_PROJECT_FORM: ProjectFormState = {
  nombre: '',
  descripcion: '',
  portada_url: '',
}

const COPY = {
  es: {
    kicker: 'Crear',
    title: 'Centro de produccion artistica',
    subtitle: 'Publica productos, ofrece servicios, revisa colaboraciones y administra proyectos desde una sola pantalla.',
    sectionsLabel: 'Secciones',
    products: 'Productos',
    productsDescription: 'productos comerciales de la serie o pelicula',
    services: 'Servicios',
    servicesDescription: 'ofrece servicios musicales, guiones, ediciones',
    collaborations: 'Colaboraciones',
    collaborationsDescription: 'colaboraciones en las que trabajas',
    projects: 'Proyectos',
    projectsDescription: 'administra tus proyectos o crea nuevos',
    productTitle: 'Crear producto',
    productIntro: 'Registra merch, objetos de coleccion o articulos ligados a una serie o pelicula.',
    productName: 'Nombre',
    productNamePlaceholder: 'Ej. Poster oficial de la serie',
    productDescription: 'Descripcion',
    productDescriptionPlaceholder: 'Describe el producto, materiales o entrega.',
    price: 'Precio',
    pricePlaceholder: '350',
    currency: 'Moneda',
    submitProduct: 'Publicar producto',
    submittingProduct: 'Publicando producto',
    productSuccess: 'Producto publicado.',
    serviceTitle: 'Crear servicio',
    serviceIntro: 'Ofrece servicios creativos para otros artistas y proyectos.',
    serviceName: 'Titulo',
    serviceNamePlaceholder: 'Ej. Edicion de trailer animado',
    serviceDescription: 'Descripcion',
    serviceDescriptionPlaceholder: 'Cuenta que entregas, tiempos y estilo de trabajo.',
    category: 'Categoria',
    categoryPlaceholder: 'Musica, guion, edicion',
    priceFrom: 'Precio desde',
    priceFromPlaceholder: '1200',
    submitService: 'Publicar servicio',
    submittingService: 'Publicando servicio',
    serviceSuccess: 'Servicio publicado.',
    collaborationsTitle: 'Tus colaboraciones',
    collaborationsIntro: 'Proyectos donde apareces como miembro o colaborador.',
    noCollaborations: 'Todavia no tienes colaboraciones activas.',
    noCollaborationsText: 'Cuando entres a un proyecto, aparecera aqui con tu rol y estado.',
    signedOutTitle: 'Inicia sesion para ver tus colaboraciones.',
    signedOutText: 'Tambien necesitaras sesion para publicar productos o servicios.',
    projectTitle: 'Nuevo proyecto',
    projectIntro: 'Define la base del proyecto para abrirlo a colaboracion artistica.',
    projectName: 'Nombre',
    projectNamePlaceholder: 'Ej. Corto animado Andes 2080',
    projectDescription: 'Descripcion',
    projectDescriptionPlaceholder: 'Cuenta el tono, la idea y que tipo de equipo buscas.',
    status: 'Estado',
    statusValue: 'En proceso',
    cover: 'Portada opcional',
    coverPlaceholder: 'https://... o /hf/studio.webp',
    submitProject: 'Crear proyecto',
    submittingProject: 'Creando proyecto',
    projectSuccess: 'Proyecto creado. Abriendo la galeria...',
    studioLink: 'Abrir studio',
    viewProject: 'Ver proyecto',
    genericError: 'No se pudo completar la accion.',
    invalidResponse: 'El servidor respondio con un formato inesperado.',
    requiredName: 'Agrega un nombre.',
    requiredTitle: 'Agrega un titulo.',
    requiredDescription: 'Agrega una descripcion.',
    requiredCategory: 'Agrega una categoria.',
    requiredPrice: 'Agrega un precio.',
    invalidPrice: 'Usa un precio valido mayor o igual a 0.',
    longName: 'Usa 120 caracteres o menos.',
    longTitle: 'Usa 120 caracteres o menos.',
    longCategory: 'Usa 80 caracteres o menos.',
    longDescription: 'Usa 1000 caracteres o menos.',
    invalidCover: 'Usa una URL http(s) o una ruta que empiece con /.',
    active: 'Activo',
    request: 'Solicitud',
    removed: 'Expulsado',
    unknown: 'Estado',
    creator: 'Creador',
  },
  en: {
    kicker: 'Create',
    title: 'Art production hub',
    subtitle: 'Publish products, offer services, review collaborations, and manage projects from one focused screen.',
    sectionsLabel: 'Sections',
    products: 'Products',
    productsDescription: 'commercial products from the series or film',
    services: 'Services',
    servicesDescription: 'offer music, scripts, editing, and more',
    collaborations: 'Collaborations',
    collaborationsDescription: 'collaborations you are working on',
    projects: 'Projects',
    projectsDescription: 'manage your projects or create new ones',
    productTitle: 'Create product',
    productIntro: 'Register merch, collectibles, or items linked to a series or film.',
    productName: 'Name',
    productNamePlaceholder: 'Example: Official series poster',
    productDescription: 'Description',
    productDescriptionPlaceholder: 'Describe the product, materials, or delivery.',
    price: 'Price',
    pricePlaceholder: '350',
    currency: 'Currency',
    submitProduct: 'Publish product',
    submittingProduct: 'Publishing product',
    productSuccess: 'Product published.',
    serviceTitle: 'Create service',
    serviceIntro: 'Offer creative services for other artists and projects.',
    serviceName: 'Title',
    serviceNamePlaceholder: 'Example: Animated trailer editing',
    serviceDescription: 'Description',
    serviceDescriptionPlaceholder: 'Share deliverables, timing, and working style.',
    category: 'Category',
    categoryPlaceholder: 'Music, script, editing',
    priceFrom: 'Price from',
    priceFromPlaceholder: '1200',
    submitService: 'Publish service',
    submittingService: 'Publishing service',
    serviceSuccess: 'Service published.',
    collaborationsTitle: 'Your collaborations',
    collaborationsIntro: 'Projects where you appear as a member or collaborator.',
    noCollaborations: 'You do not have active collaborations yet.',
    noCollaborationsText: 'When you join a project, it will appear here with your role and status.',
    signedOutTitle: 'Sign in to view your collaborations.',
    signedOutText: 'You will also need a session to publish products or services.',
    projectTitle: 'New project',
    projectIntro: 'Set the foundation for a project before opening it to artistic collaboration.',
    projectName: 'Name',
    projectNamePlaceholder: 'Example: Andes 2080 animated short',
    projectDescription: 'Description',
    projectDescriptionPlaceholder: 'Share the tone, idea, and what kind of team you need.',
    status: 'Status',
    statusValue: 'In progress',
    cover: 'Optional cover',
    coverPlaceholder: 'https://... or /hf/studio.webp',
    submitProject: 'Create project',
    submittingProject: 'Creating project',
    projectSuccess: 'Project created. Opening the gallery...',
    studioLink: 'Open studio',
    viewProject: 'View project',
    genericError: 'The action could not be completed.',
    invalidResponse: 'The server returned an unexpected format.',
    requiredName: 'Add a name.',
    requiredTitle: 'Add a title.',
    requiredDescription: 'Add a description.',
    requiredCategory: 'Add a category.',
    requiredPrice: 'Add a price.',
    invalidPrice: 'Use a valid price greater than or equal to 0.',
    longName: 'Use 120 characters or fewer.',
    longTitle: 'Use 120 characters or fewer.',
    longCategory: 'Use 80 characters or fewer.',
    longDescription: 'Use 1000 characters or fewer.',
    invalidCover: 'Use an http(s) URL or a path that starts with /.',
    active: 'Active',
    request: 'Request',
    removed: 'Removed',
    unknown: 'Status',
    creator: 'Creator',
  },
}

export default function CreateClient({ collaborations, isAuthenticated }: CreateClientProps) {
  const router = useRouter()
  const { lang } = useApp()
  const tx = COPY[lang]
  const [activeSection, setActiveSection] = useState<CreateSection>('proyectos')
  const sections = useMemo<SectionConfig[]>(
    () => [
      {
        id: 'productos',
        title: tx.products,
        description: tx.productsDescription,
        accent: '#F2C53D',
        icon: <ProductIcon />,
      },
      {
        id: 'servicios',
        title: tx.services,
        description: tx.servicesDescription,
        accent: '#39D3C8',
        icon: <ServiceIcon />,
      },
      {
        id: 'colaboraciones',
        title: tx.collaborations,
        description: tx.collaborationsDescription,
        accent: '#FF6B00',
        icon: <CollaborationIcon />,
      },
      {
        id: 'proyectos',
        title: tx.projects,
        description: tx.projectsDescription,
        accent: '#FF1493',
        icon: <ProjectIcon />,
      },
    ],
    [tx],
  )

  return (
    <>
      <header className="glass safe-top sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 pb-3 pt-1">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg toon-gradient-bg text-white">
            <CreateIcon />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--c-muted)]">{tx.kicker}</p>
            <h1 className="truncate text-lg font-black text-[var(--c-text)]">{tx.title}</h1>
          </div>
        </div>
      </header>

      <main className="page-content px-4 py-5">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-lg border p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(18,18,18,0.98), rgba(28,20,24,0.9))',
            borderColor: 'var(--c-border)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--c-muted)]">{tx.kicker}</p>
          <h2 className="mt-1 text-2xl font-black leading-tight text-[var(--c-text)]">{tx.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--c-muted)]">{tx.subtitle}</p>
        </motion.section>

        <section className="mt-4" aria-label={tx.sectionsLabel}>
          <div className="grid grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <SectionButton
                key={section.id}
                section={section}
                active={activeSection === section.id}
                index={index}
                onSelect={setActiveSection}
              />
            ))}
          </div>
        </section>

        <section className="mt-4 pb-5">
          <AnimatePresence mode="wait">
            {activeSection === 'productos' ? (
              <ProductPanel key="productos" tx={tx} isAuthenticated={isAuthenticated} />
            ) : activeSection === 'servicios' ? (
              <ServicePanel key="servicios" tx={tx} isAuthenticated={isAuthenticated} />
            ) : activeSection === 'colaboraciones' ? (
              <CollaborationsPanel
                key="colaboraciones"
                tx={tx}
                collaborations={collaborations}
                isAuthenticated={isAuthenticated}
              />
            ) : (
              <ProjectPanel key="proyectos" tx={tx} routerPush={router.push} />
            )}
          </AnimatePresence>
        </section>
      </main>
    </>
  )
}

function SectionButton({
  section,
  active,
  index,
  onSelect,
}: {
  section: SectionConfig
  active: boolean
  index: number
  onSelect: (section: CreateSection) => void
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.04 * index, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(section.id)}
      aria-pressed={active}
      className="min-h-[142px] rounded-lg border p-3 text-left transition-colors"
      style={{
        background: active
          ? `linear-gradient(135deg, ${hexToRgba(section.accent, 0.18)}, rgba(18,18,18,0.98))`
          : 'var(--c-surface)',
        borderColor: active ? section.accent : 'var(--c-border)',
      }}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg border"
        style={{
          color: active ? '#ffffff' : section.accent,
          background: active ? section.accent : 'var(--c-surface2)',
          borderColor: active ? section.accent : 'var(--c-border)',
        }}
      >
        {section.icon}
      </span>
      <span className="mt-3 block text-sm font-black text-[var(--c-text)]">{section.title}</span>
      <span className="mt-1 block text-xs font-medium leading-relaxed text-[var(--c-muted)]">
        {section.description}
      </span>
    </motion.button>
  )
}

function ProductPanel({ tx, isAuthenticated }: { tx: (typeof COPY)['es']; isAuthenticated: boolean }) {
  const [form, setForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM)
  const [errors, setErrors] = useState<ProductErrors>({})
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')
  const isSubmitting = submitState === 'submitting'

  function updateField(field: keyof ProductFormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
      resetErrorState(submitState, setSubmitState, setMessage)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateProductForm(form, tx)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitState('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          precio: Number(form.precio),
          moneda: 'MXN',
        }),
      })
      const data: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        setSubmitState('error')
        setMessage(getApiError(data, tx.genericError))
        return
      }

      if (!isCreateProductResponse(data)) {
        setSubmitState('error')
        setMessage(tx.invalidResponse)
        return
      }

      setSubmitState('success')
      setMessage(tx.productSuccess)
      setForm(INITIAL_PRODUCT_FORM)
    } catch {
      setSubmitState('error')
      setMessage(tx.genericError)
    }
  }

  return (
    <PanelShell title={tx.productTitle} intro={tx.productIntro} icon={<ProductIcon />} accent="#F2C53D">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <FieldBlock label={tx.productName} error={errors.nombre}>
          <TextInput
            id="producto_nombre"
            name="nombre"
            value={form.nombre}
            onChange={updateField('nombre')}
            placeholder={tx.productNamePlaceholder}
            maxLength={120}
            disabled={isSubmitting}
            required
          />
        </FieldBlock>

        <FieldBlock label={tx.productDescription} error={errors.descripcion}>
          <TextArea
            id="producto_descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={updateField('descripcion')}
            placeholder={tx.productDescriptionPlaceholder}
            maxLength={1000}
            disabled={isSubmitting}
            required
          />
        </FieldBlock>

        <div className="grid grid-cols-[1fr_96px] gap-2">
          <FieldBlock label={tx.price} error={errors.precio}>
            <TextInput
              id="producto_precio"
              name="precio"
              type="number"
              value={form.precio}
              onChange={updateField('precio')}
              placeholder={tx.pricePlaceholder}
              min="0"
              step="0.01"
              inputMode="decimal"
              disabled={isSubmitting}
              required
            />
          </FieldBlock>
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--c-muted)]">
              {tx.currency}
            </span>
            <div className="flex h-[46px] items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] text-sm font-black text-[var(--c-text)]">
              MXN
            </div>
          </div>
        </div>

        <AuthHint tx={tx} show={!isAuthenticated} />
        <SubmitMessage state={submitState} message={message} />
        <SubmitButton
          isSubmitting={isSubmitting}
          idleLabel={tx.submitProduct}
          submittingLabel={tx.submittingProduct}
          icon={<ProductIcon />}
        />
      </form>
    </PanelShell>
  )
}

function ServicePanel({ tx, isAuthenticated }: { tx: (typeof COPY)['es']; isAuthenticated: boolean }) {
  const [form, setForm] = useState<ServiceFormState>(INITIAL_SERVICE_FORM)
  const [errors, setErrors] = useState<ServiceErrors>({})
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')
  const isSubmitting = submitState === 'submitting'

  function updateField(field: keyof ServiceFormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
      resetErrorState(submitState, setSubmitState, setMessage)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateServiceForm(form, tx)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitState('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          categoria: form.categoria.trim(),
          precio_desde: Number(form.precio_desde),
          moneda: 'MXN',
        }),
      })
      const data: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        setSubmitState('error')
        setMessage(getApiError(data, tx.genericError))
        return
      }

      if (!isCreateServiceResponse(data)) {
        setSubmitState('error')
        setMessage(tx.invalidResponse)
        return
      }

      setSubmitState('success')
      setMessage(tx.serviceSuccess)
      setForm(INITIAL_SERVICE_FORM)
    } catch {
      setSubmitState('error')
      setMessage(tx.genericError)
    }
  }

  return (
    <PanelShell title={tx.serviceTitle} intro={tx.serviceIntro} icon={<ServiceIcon />} accent="#39D3C8">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <FieldBlock label={tx.serviceName} error={errors.titulo}>
          <TextInput
            id="servicio_titulo"
            name="titulo"
            value={form.titulo}
            onChange={updateField('titulo')}
            placeholder={tx.serviceNamePlaceholder}
            maxLength={120}
            disabled={isSubmitting}
            required
          />
        </FieldBlock>

        <FieldBlock label={tx.serviceDescription} error={errors.descripcion}>
          <TextArea
            id="servicio_descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={updateField('descripcion')}
            placeholder={tx.serviceDescriptionPlaceholder}
            maxLength={1000}
            disabled={isSubmitting}
            required
          />
        </FieldBlock>

        <FieldBlock label={tx.category} error={errors.categoria}>
          <TextInput
            id="servicio_categoria"
            name="categoria"
            value={form.categoria}
            onChange={updateField('categoria')}
            placeholder={tx.categoryPlaceholder}
            maxLength={80}
            disabled={isSubmitting}
            required
          />
        </FieldBlock>

        <div className="grid grid-cols-[1fr_96px] gap-2">
          <FieldBlock label={tx.priceFrom} error={errors.precio_desde}>
            <TextInput
              id="servicio_precio_desde"
              name="precio_desde"
              type="number"
              value={form.precio_desde}
              onChange={updateField('precio_desde')}
              placeholder={tx.priceFromPlaceholder}
              min="0"
              step="0.01"
              inputMode="decimal"
              disabled={isSubmitting}
              required
            />
          </FieldBlock>
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--c-muted)]">
              {tx.currency}
            </span>
            <div className="flex h-[46px] items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] text-sm font-black text-[var(--c-text)]">
              MXN
            </div>
          </div>
        </div>

        <AuthHint tx={tx} show={!isAuthenticated} />
        <SubmitMessage state={submitState} message={message} />
        <SubmitButton
          isSubmitting={isSubmitting}
          idleLabel={tx.submitService}
          submittingLabel={tx.submittingService}
          icon={<ServiceIcon />}
        />
      </form>
    </PanelShell>
  )
}

function CollaborationsPanel({
  tx,
  collaborations,
  isAuthenticated,
}: {
  tx: (typeof COPY)['es']
  collaborations: CreateCollaboration[]
  isAuthenticated: boolean
}) {
  return (
    <PanelShell title={tx.collaborationsTitle} intro={tx.collaborationsIntro} icon={<CollaborationIcon />} accent="#FF6B00">
      <div className="mt-4">
        {!isAuthenticated ? (
          <EmptyState title={tx.signedOutTitle} description={tx.signedOutText} />
        ) : collaborations.length === 0 ? (
          <EmptyState title={tx.noCollaborations} description={tx.noCollaborationsText} />
        ) : (
          <div className="divide-y divide-[var(--c-border)] overflow-hidden rounded-lg border border-[var(--c-border)]">
            {collaborations.map((collaboration) => (
              <article key={collaboration.proyectoId} className="bg-[var(--c-surface2)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-[var(--c-text)]">{collaboration.proyectoNombre}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--c-muted)]">
                      {collaboration.proyectoDescripcion ?? tx.projectsDescription}
                    </p>
                  </div>
                  <StatusPill status={collaboration.estado} tx={tx} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MetaBlock label={tx.collaborations} value={collaboration.subtitulo} />
                  <MetaBlock label={tx.creator} value={collaboration.creadorNombre} />
                </div>
                <Link
                  href={`/studio?proyecto=${collaboration.proyectoId}`}
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--c-border)] px-3 text-xs font-black text-[var(--c-text)]"
                >
                  <ProjectIcon />
                  {tx.viewProject}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  )
}

function ProjectPanel({
  tx,
  routerPush,
}: {
  tx: (typeof COPY)['es']
  routerPush: (href: string) => void
}) {
  const [form, setForm] = useState<ProjectFormState>(INITIAL_PROJECT_FORM)
  const [errors, setErrors] = useState<ProjectErrors>({})
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')
  const isSubmitting = submitState === 'submitting'

  function updateField(field: keyof ProjectFormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
      resetErrorState(submitState, setSubmitState, setMessage)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateProjectForm(form, tx)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitState('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          estado: PROJECT_STATUS,
          portada_url: normalizeOptional(form.portada_url),
        }),
      })
      const data: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        setSubmitState('error')
        setMessage(getApiError(data, tx.genericError))
        return
      }

      if (!isCreateProyectoResponse(data)) {
        setSubmitState('error')
        setMessage(tx.invalidResponse)
        return
      }

      setSubmitState('success')
      setMessage(tx.projectSuccess)
      routerPush('/proyectos')
    } catch {
      setSubmitState('error')
      setMessage(tx.genericError)
    }
  }

  return (
    <PanelShell title={tx.projectTitle} intro={tx.projectIntro} icon={<ProjectIcon />} accent="#FF1493">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <FieldBlock label={tx.projectName} error={errors.nombre}>
          <TextInput
            id="proyecto_nombre"
            name="nombre"
            value={form.nombre}
            onChange={updateField('nombre')}
            placeholder={tx.projectNamePlaceholder}
            maxLength={120}
            disabled={isSubmitting}
            required
          />
        </FieldBlock>

        <FieldBlock label={tx.projectDescription} error={errors.descripcion}>
          <TextArea
            id="proyecto_descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={updateField('descripcion')}
            placeholder={tx.projectDescriptionPlaceholder}
            maxLength={1000}
            disabled={isSubmitting}
            required
          />
        </FieldBlock>

        <div>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--c-muted)]">
            {tx.status}
          </span>
          <div className="flex h-[46px] items-center justify-between rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] px-3.5">
            <span className="text-sm font-bold text-[var(--c-text)]">{tx.statusValue}</span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#F2C53D]" />
          </div>
        </div>

        <FieldBlock label={tx.cover} error={errors.portada_url}>
          <TextInput
            id="proyecto_portada_url"
            name="portada_url"
            value={form.portada_url}
            onChange={updateField('portada_url')}
            placeholder={tx.coverPlaceholder}
            maxLength={500}
            disabled={isSubmitting}
          />
        </FieldBlock>

        <SubmitMessage state={submitState} message={message} />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <SubmitButton
            isSubmitting={isSubmitting}
            idleLabel={tx.submitProject}
            submittingLabel={tx.submittingProject}
            icon={<CreateIcon />}
          />
          <Link
            href="/studio"
            className="flex h-[46px] items-center justify-center rounded-lg border border-[var(--c-border)] px-3 text-sm font-black text-[var(--c-text)]"
          >
            {tx.studioLink}
          </Link>
        </div>
      </form>
    </PanelShell>
  )
}

function PanelShell({
  title,
  intro,
  icon,
  accent,
  children,
}: {
  title: string
  intro: string
  icon: ReactNode
  accent: string
  children: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-lg border bg-[var(--c-surface)] p-4"
      style={{ borderColor: 'var(--c-border)' }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-white"
          style={{ background: accent }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-black leading-tight text-[var(--c-text)]">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--c-muted)]">{intro}</p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function FieldBlock({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--c-muted)]">{label}</span>
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 block text-xs font-semibold text-[#FF8BC5]"
          >
            {error}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </label>
  )
}

function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-[46px] w-full rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] px-3.5 text-sm font-semibold text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[var(--toon-orange)] disabled:opacity-60 ${className ?? ''}`}
    />
  )
}

function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={5}
      className={`min-h-32 w-full resize-none rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] px-3.5 py-3 text-sm leading-relaxed text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[var(--toon-orange)] disabled:opacity-60 ${className ?? ''}`}
    />
  )
}

function SubmitButton({
  isSubmitting,
  idleLabel,
  submittingLabel,
  icon,
}: {
  isSubmitting: boolean
  idleLabel: string
  submittingLabel: string
  icon: ReactNode
}) {
  return (
    <motion.button
      type="submit"
      disabled={isSubmitting}
      whileTap={{ scale: 0.97 }}
      className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-black text-white toon-gradient-bg disabled:opacity-60"
    >
      {isSubmitting ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="block h-4 w-4 rounded-full border-2 border-white/35 border-t-white"
          />
          {submittingLabel}
        </>
      ) : (
        <>
          {icon}
          {idleLabel}
        </>
      )}
    </motion.button>
  )
}

function SubmitMessage({ state, message }: { state: SubmitState; message: string }) {
  return (
    <AnimatePresence mode="popLayout">
      {message ? (
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`rounded-lg border px-3 py-2 text-xs font-bold ${
            state === 'success'
              ? 'border-[#3CA55C]/40 bg-[#3CA55C]/10 text-[#8DE0A0]'
              : 'border-[#FF1493]/40 bg-[#FF1493]/10 text-[#FF8BC5]'
          }`}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}

function AuthHint({ tx, show }: { tx: (typeof COPY)['es']; show: boolean }) {
  if (!show) {
    return null
  }

  return (
    <p className="rounded-lg border border-[#F2C53D]/30 bg-[#F2C53D]/10 px-3 py-2 text-xs font-semibold text-[#F2C53D]">
      {tx.signedOutText}
    </p>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] px-4 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--c-surface)] text-[var(--c-muted)]">
        <CollaborationIcon />
      </div>
      <h3 className="mt-4 text-base font-black text-[var(--c-text)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-[var(--c-muted)]">{description}</p>
    </div>
  )
}

function StatusPill({ status, tx }: { status: string; tx: (typeof COPY)['es'] }) {
  const label = getStatusLabel(status, tx)
  const color = status === 'activo' ? '#39D3C8' : status === 'solicitud' ? '#F2C53D' : '#FF8BC5'

  return (
    <span
      className="flex-shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em]"
      style={{
        borderColor: hexToRgba(color, 0.4),
        background: hexToRgba(color, 0.12),
        color,
      }}
    >
      {label}
    </span>
  )
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-black/20 p-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--c-muted)]">{label}</p>
      <p className="mt-1 truncate text-xs font-black text-[var(--c-text)]">{value}</p>
    </div>
  )
}

function validateProductForm(form: ProductFormState, tx: (typeof COPY)['es']): ProductErrors {
  const errors: ProductErrors = {}
  const nombre = form.nombre.trim()
  const descripcion = form.descripcion.trim()

  if (!nombre) {
    errors.nombre = tx.requiredName
  } else if (nombre.length > 120) {
    errors.nombre = tx.longName
  }

  if (!descripcion) {
    errors.descripcion = tx.requiredDescription
  } else if (descripcion.length > 1000) {
    errors.descripcion = tx.longDescription
  }

  if (!form.precio.trim()) {
    errors.precio = tx.requiredPrice
  } else if (!isValidMoney(form.precio)) {
    errors.precio = tx.invalidPrice
  }

  return errors
}

function validateServiceForm(form: ServiceFormState, tx: (typeof COPY)['es']): ServiceErrors {
  const errors: ServiceErrors = {}
  const titulo = form.titulo.trim()
  const descripcion = form.descripcion.trim()
  const categoria = form.categoria.trim()

  if (!titulo) {
    errors.titulo = tx.requiredTitle
  } else if (titulo.length > 120) {
    errors.titulo = tx.longTitle
  }

  if (!descripcion) {
    errors.descripcion = tx.requiredDescription
  } else if (descripcion.length > 1000) {
    errors.descripcion = tx.longDescription
  }

  if (!categoria) {
    errors.categoria = tx.requiredCategory
  } else if (categoria.length > 80) {
    errors.categoria = tx.longCategory
  }

  if (!form.precio_desde.trim()) {
    errors.precio_desde = tx.requiredPrice
  } else if (!isValidMoney(form.precio_desde)) {
    errors.precio_desde = tx.invalidPrice
  }

  return errors
}

function validateProjectForm(form: ProjectFormState, tx: (typeof COPY)['es']): ProjectErrors {
  const errors: ProjectErrors = {}
  const nombre = form.nombre.trim()
  const descripcion = form.descripcion.trim()
  const portada = form.portada_url.trim()

  if (!nombre) {
    errors.nombre = tx.requiredName
  } else if (nombre.length > 120) {
    errors.nombre = tx.longName
  }

  if (!descripcion) {
    errors.descripcion = tx.requiredDescription
  } else if (descripcion.length > 1000) {
    errors.descripcion = tx.longDescription
  }

  if (portada && !isValidCoverPath(portada)) {
    errors.portada_url = tx.invalidCover
  }

  return errors
}

function isValidMoney(value: string): boolean {
  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed >= 0
}

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

function isValidCoverPath(value: string): boolean {
  if (value.startsWith('/')) {
    return true
  }

  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isCreateProductResponse(value: unknown): value is CreateProductResponse {
  if (!isRecord(value) || !isRecord(value.producto)) {
    return false
  }

  const producto = value.producto

  return (
    typeof producto.id === 'string' &&
    typeof producto.user_id === 'string' &&
    typeof producto.nombre === 'string' &&
    typeof producto.precio === 'number' &&
    producto.moneda === 'MXN' &&
    typeof producto.created_at === 'string'
  )
}

function isCreateServiceResponse(value: unknown): value is CreateServiceResponse {
  if (!isRecord(value) || !isRecord(value.servicio)) {
    return false
  }

  const servicio = value.servicio

  return (
    typeof servicio.id === 'string' &&
    typeof servicio.user_id === 'string' &&
    typeof servicio.titulo === 'string' &&
    typeof servicio.categoria === 'string' &&
    typeof servicio.precio_desde === 'number' &&
    servicio.moneda === 'MXN' &&
    typeof servicio.created_at === 'string'
  )
}

function isCreateProyectoResponse(value: unknown): value is CreateProyectoResponse {
  if (!isRecord(value) || !isRecord(value.proyecto)) {
    return false
  }

  const proyecto = value.proyecto

  return (
    typeof proyecto.id === 'string' &&
    typeof proyecto.creador_id === 'string' &&
    typeof proyecto.nombre === 'string' &&
    proyecto.estado === PROJECT_STATUS &&
    typeof proyecto.created_at === 'string'
  )
}

function getApiError(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.error === 'string' && value.error.trim()) {
    return value.error
  }

  return fallback
}

function getStatusLabel(status: string, tx: (typeof COPY)['es']): string {
  if (status === 'activo') {
    return tx.active
  }

  if (status === 'solicitud') {
    return tx.request
  }

  if (status === 'expulsado') {
    return tx.removed
  }

  return tx.unknown
}

function resetErrorState(
  submitState: SubmitState,
  setSubmitState: (state: SubmitState) => void,
  setMessage: (message: string) => void,
) {
  if (submitState === 'error') {
    setSubmitState('idle')
    setMessage('')
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '')
  const red = Number.parseInt(cleanHex.slice(0, 2), 16)
  const green = Number.parseInt(cleanHex.slice(2, 4), 16)
  const blue = Number.parseInt(cleanHex.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function CreateIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  )
}

function ProductIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 9.5h11l-.8 9.2a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.8l-.8-9.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 9.5V7a3 3 0 0 1 6 0v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 9.5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ServiceIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 18.5V7.2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9h8M8 12.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 18.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CollaborationIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 11.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM15.8 11.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19.2c.6-3.2 2.4-5 4.7-5s4.1 1.8 4.7 5M11.1 16.1c.9-1.3 2.5-1.9 4.7-1.9 2.3 0 4.1 1.8 4.7 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ProjectIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 6.5a2 2 0 0 1 2-2h5l2 2h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 13h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
