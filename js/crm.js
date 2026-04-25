import {
  addOrder,
  loadOrders,
  listenOrders,
  listenReservations,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderPaymentMethod,
  updateOrderInvoiceData,
  updateOrderCustomerName,
  updateOrderItems,
  updateReservationStatus,
  loadFiscalSettings,
  loadMenuSettings,
  saveFiscalSettings,
  saveMenuSettings,
  reserveNextFiscalInvoiceNumber,
  signInWithEmailPassword,
  getEmailByUsername,
  onAuthChange,
  signOutUser,
  isStaffAuthorized,
  registerStaffNotificationToken
} from "./firebase-config.js?v=20260424b";
import { DEFAULT_FISCAL_SETTINGS, mergeFiscalSettings } from "./fiscal-config.js?v=20260309a";
import { BASE_MENU_ITEMS } from "./menu-data.js?v=20260419a";

if (window.location.search === "?") {
  window.history.replaceState({}, "", `${window.location.pathname}${window.location.hash}`);
}

const crmUrlParams = new URLSearchParams(window.location.search);
const THERMAL_ROLL_WIDTH = "79.375mm";
const CRM_RECENT_OPERATIONS_DAYS = 120;

const i18n = {
  es: {
    authTitle: "Acceso CRM del personal",
    authText: "Ingresa con usuario y contraseña para validar rol de representante.",
    authUserLabel: "Usuario",
    authPassLabel: "Contraseña",
    authButton: "Ingresar",
    authInvalid: "Usuario o contraseña inválidos.",
    authUserNotFound: "Usuario no encontrado.",
    authDenied: "Tu usuario no tiene permisos CRM. Contacta al administrador.",
    authStartupError: "El acceso fue válido, pero el CRM no pudo iniciar correctamente. Intenta de nuevo.",
    authChecking: "Validando acceso...",
    authProviderDisabled: "El acceso con usuario y contraseña no está habilitado. Revisa Supabase Auth.",
    authUnauthorizedDomain: "Este dominio no está autorizado para el backend. Revisa WEB_ORIGINS en Vercel.",
    authNetworkError: "No se pudo conectar con la API. Revisa tu conexión e intenta de nuevo.",
    authPermissionError: "La API bloqueó la validación del usuario. Revisa roles y variables privadas.",
    authSessionExpired: "No se pudo renovar la conexión. El CRM seguirá abierto; cierra sesión solo si deseas salir.",
    kitchenScreen: "Pantalla cocina",
    fiscalSettingsPage: "Ajustes fiscales",
    fiscalModalTitle: "Ajustes fiscales",
    fiscalModalText: "Completa los datos legales que se imprimen automáticamente en la factura fiscal.",
    crmTitle: "Panel de pedidos y reservas",
    crmSub: "Gestión operacional en tiempo real para representantes.",
    crmToolsNav: "Configuración",
    crmToolsEyebrow: "Configuración",
    crmToolsOpen: "Ver opciones",
    crmToolsFiscalText: "Datos legales, CAI, rango autorizado e impuestos.",
    crmToolsKitchenText: "Vista dedicada para que cocina reciba y avance pedidos.",
    crmNotificationsAction: "Activar avisos",
    crmNotificationsActionText: "Si no aceptaste al entrar, activa aquí los avisos de pedidos y reservas.",
    crmNotificationsAppleTitle: "Aviso para iPhone y iPad",
    crmNotificationsAppleText: "En Android los avisos funcionan desde Chrome. En iPhone o iPad, abre el CRM en Safari, agrégalo a pantalla de inicio y activa los avisos desde ese ícono.",
    viewOrders: "Pedidos",
    viewReservations: "Reservas",
    filterAll: "Todos",
    filterPending: "Pendiente",
    filterInProgress: "Preparando",
    filterReady: "Listo",
    filterAccepted: "Aceptada",
    filterPreparing: "Preparando",
    filterDelivered: "Entregado",
    filterRejected: "Rechazado",
    reservationStatus: "Estado de reserva",
    reservationStatus_pending: "Pendiente",
    reservationStatus_accepted: "Aceptado",
    reservationStatus_rejected: "Rechazado",
    reservationAccept: "Aceptar",
    reservationReject: "Rechazar",
    reservationPending: "Marcar pendiente",
    reservationUpdated: "Reserva actualizada",
    reservationUpdateError: "No se pudo actualizar la reserva.",
    reservationAreaLabel: "Área",
    reservationAreaOpen: "Area Libre",
    reservationAreaAir: "Area climatizada",
    reservationAreaLabel: "Área",
    reservationAreaOpen: "Área libre",
    reservationAreaAir: "Área climatizada",
    btnPending: "Pendiente",
    btnInProgress: "Preparando",
    btnReady: "Listo",
    btnAccept: "Entregar",
    btnReject: "Rechazar",
    btnRejectShort: "Rechazar",
    btnReopen: "Reabrir",
    btnReactivate: "Reactivar",
    actionBack: "Atrás",
    actionNext: "Siguiente",
    btnMarkPaid: "Marcar pagado",
  btnPrint: "Factura normal",
  btnFiscalPrint: "Factura fiscal",
  btnFiscalReprint: "Reimprimir factura fiscal",
    btnSaveInvoice: "Guardar factura",
    review: "Revisar pedido",
    reviewShort: "Detalles",
    hideOrder: "Eliminar orden",
    hideOrderConfirmTitle: "Eliminar orden",
    hideOrderConfirmText: "¿Deseas eliminar esta orden de la vista del CRM?",
    hideOrderConfirmButton: "Eliminar",
    cancelButton: "Cancelar",
    orderHidden: "Orden eliminada de la vista.",
    emptyOrders: "No hay pedidos en este estado.",
    emptyReservations: "No hay reservas registradas.",
    customer: "Cliente",
    customerNameLabel: "Nombre del cliente",
    whatsappButton: "WhatsApp",
    whatsappOpenLabel: "Abrir chat de WhatsApp",
    customerNameSaved: "Nombre actualizado",
    customerNameSaveError: "No se pudo actualizar el nombre.",
    orderTableLabel: "Mesa",
    orderComments: "Comentarios del pedido",
    invoiceRequestSummary: "Solicita factura con RTN y nombre",
    orderPickupBadge: "Recoger",
    orderDeliveryBadge: "Delivery",
    orderCashierPending: "Pagará en caja",
    orderPaidMessage: "Pago realizado",
    orderUnpaidMessage: "No ha pagado el pedido",
    payment: "Pago",
    paymentMethod: "Método",
    paymentMethodSelect: "Forma de pago",
    paymentMethodPlaceholder: "Selecciona forma de pago",
    paymentMethodRequired: "Selecciona una forma de pago antes de entregar el pedido.",
    paymentStatus: "Estado",
    orderStatus: "Estado del pedido",
    invoiceSectionTitle: "Datos de factura",
    reviewItemsTitle: "Productos del pedido",
    reviewItemsEdit: "Editar items",
    reviewItemsAdd: "Agregar item",
    reviewItemsAddInline: "Agregar otro item",
    reviewItemsSave: "Guardar cambios",
    reviewItemsCancel: "Cancelar",
    reviewItemsQty: "Cantidad",
    reviewItemsProduct: "Producto",
    reviewItemsRemove: "Quitar",
    reviewItemsNeedItems: "Agrega al menos un item a la orden.",
    reviewItemsUpdated: "Pedido actualizado",
    reviewItemsUpdateError: "No se pudieron actualizar los items.",
    invoiceBillingName: "Nombre de facturación",
    invoiceBillingRTN: "RTN del cliente",
    invoiceNumber: "Número de factura",
    invoiceNumberAuto: "Número asignado automáticamente",
    invoiceNumberPending: "Se asignará al imprimir",
    invoiceNotes: "Notas fiscales",
    invoiceHasExoneration: "Cliente con exoneración",
    invoiceExemptionRegister: "Registro de exoneración",
    invoiceExemptOrder: "Orden de compra exenta",
    invoiceSagRegister: "N.º registro SAG",
    invoiceSaved: "Factura guardada",
    invoiceMissingNumber: "Completa el número de factura antes de imprimir.",
    invoiceLegalNotice: "Verifica CAI, RTN, rango autorizado e ISV antes de usar esta factura con clientes.",
    invoiceInvalidRange: "El rango fiscal es inválido. Revisa ajustes fiscales.",
    invoiceRangeExhausted: "El rango autorizado ya se terminó. Actualiza el siguiente número de factura.",
    invoicePrintBlockedExhausted: "No se puede mostrar la factura fiscal. El rango autorizado ya se excedió y debes actualizarlo en Ajustes fiscales.",
    invoiceDeadlineExceeded: "La fecha límite de emisión ya venció. Actualiza los ajustes fiscales.",
    invoicePrintBlockedExpired: "No se puede mostrar la factura fiscal. La fecha límite de emisión ya venció y debes actualizarla en Ajustes fiscales.",
    brandName: "Marca comercial",
    legalName: "Razón social",
    phone: "Teléfono",
    address: "Dirección",
    email: "Correo",
    emissionDeadline: "Fecha límite de emisión",
    rangeStart: "Rango autorizado inicial",
    rangeEnd: "Rango autorizado final",
  nextInvoiceNumber: "Siguiente número de factura",
  duplicateNextInvoiceNumber: "Ese número ya fue dado en una factura anterior. Ingresa otro número de factura.",
    copyLegend: "Leyenda de copia",
    generalTaxRate: "ISV general (%)",
    taxAppetizers: "ISV entradas (%)",
    taxMainCourses: "ISV principales (%)",
    taxBeverages: "ISV bebidas (%)",
    taxDesserts: "ISV postres (%)",
    saveButton: "Guardar configuración",
    settingsWarning: "Cambia estos datos solo con información fiscal válida autorizada por SAR.",
    invalidRange: "El rango fiscal es inválido.",
    saved: "Configuración guardada",
    invoiceTermsCash: "Contado",
    invoiceTermsPending: "Pendiente",
    invoiceStatePaid: "Pagada",
    invoiceStatePending: "Pendiente",
    invoiceLabel: "Factura",
    customerFinalConsumer: "Consumidor final",
    customerRTNDefault: "00000000000000",
    subtotal: "Subtotal",
    exemptAmount: "Importe exento",
    taxableAmount: "Importe gravado",
    taxAmount: "ISV",
    legalInfoPending: "ACTUALIZA TUS DATOS LEGALES EN LA PÁGINA FISCAL.",
    fiscalRangeAlertTitle: "Advertencia fiscal",
    fiscalRangeAlertText: "Debes actualizar los datos fiscales para seguir imprimiendo facturas fiscales.",
    fiscalRangeAlertRangeText: "Debes actualizar el estado de las facturas en Ajustes fiscales. Ya llegaste a la cantidad estipulada y no puedes seguir imprimiendo factura fiscal.",
    fiscalRangeAlertDeadlineText: "Debes actualizar el estado de las facturas en Ajustes fiscales. La fecha límite de emisión ya venció y no puedes seguir imprimiendo factura fiscal.",
    fiscalRangeAlertAction: "Actualizar ahora",
    payMethodOnline: "En línea",
    payMethodCard: "Tarjeta",
    payMethodPaypal: "PayPal",
    payMethodCash: "Efectivo",
    payMethodTransfer: "Transferencia bancaria",
    payMethodPedidosYa: "Pedidos Ya",
    payMethodCashOnPickup: "Pago al recoger",
    payStatusPending: "Pendiente de confirmación",
    payStatusPaid: "Pagado",
    payStatusUnpaid: "No pagado",
    total: "Total",
    date: "Fecha",
    status_pending: "Pendiente",
    status_preparing: "Preparando",
    status_ready: "Listo",
    status_accepted: "Aceptada",
    status_delivered: "Entregado",
    status_rejected: "Rechazado",
    reservationsCount: "Reservas",
    ordersCount: "Pedidos",
    pendingCount: "Pendientes",
    progressCount: "Preparando",
    readyCount: "Listos",
    acceptedCount: "Entregados",
    revenueCount: "Ingresos",
    avgTicket: "Ticket promedio",
    statsSummary: "Resumen",
    statsOps: "Operación",
    statsSales: "Ventas",
    topFoodTitle: "Top comida vendida",
    topFoodEmpty: "No hay ventas aceptadas para este periodo.",
    calendarTitle: "Calendario de ventas",
    calendarSub: "Selecciona fecha para revisar ventas entregadas y sus pedidos.",
    calendarCollapsedText: "Resumen mensual listo. Abre el reporte para revisar días, pagos y comida vendida.",
    calendarShow: "Mostrar reporte",
    calendarHide: "Ocultar reporte",
    calendarMonthSummary: "Resumen del mes",
    calendarNoSalesMonth: "No hay ventas entregadas en este mes.",
    calendarNoSalesDay: "No hay ventas entregadas en esta fecha.",
    calendarSearchPlaceholder: "Buscar por cliente, número de orden, factura o pedido",
    calendarSearchEmpty: "No hay pedidos que coincidan con esa búsqueda.",
    calendarOrders: "Pedidos",
    calendarRevenue: "Ingresos",
    calendarPaymentBreakdown: "Cierre por método de pago",
    calendarPaymentFilter: "Ver ventas por método",
    calendarPaymentAll: "Todos los métodos",
    calendarPaymentSelected: "Selección actual",
    calendarPaymentOther: "Otros métodos",
    calendarDetailsTitle: "Detalle del día",
    calendarPrev: "Mes anterior",
    calendarNext: "Mes siguiente",
    calendarFoodBreakdown: "Comida vendida ese día",
    termsReportTitle: "Facturas por términos",
    termsReportToolText: "Filtra ventas entregadas por fecha y término para revisar e imprimir reportes.",
    termsReportText: "Genera un reporte bajo demanda por rango de fechas y método de pago sin recargar el CRM.",
    termsReportStart: "Fecha inicio",
    termsReportEnd: "Fecha final",
    termsReportTerms: "Términos",
    termsReportAll: "Todos los términos",
    termsReportDay: "Día",
    termsReportMonth: "Mes",
    termsReportYear: "Año",
    termsReportCurrent: "Actual",
    termsReportPreview: "Vista previa",
    termsReportPrint: "Imprimir reporte",
    termsReportCount: "Facturas",
    termsReportRowsEmpty: "No hay facturas entregadas para ese filtro.",
    termsReportPreviewTitle: "Vista previa del reporte",
    termsReportRangeLabel: "Rango",
    termsReportMethodLabel: "Término",
    termsReportInvoiceOrOrder: "Factura / Orden",
    termsReportTax: "Impuesto",
    termsReportSummaryNote: "Solo toma pedidos entregados y usa el término de pago seleccionado.",
    termsReportLoading: "Cargando reporte histórico...",
    termsReportError: "No se pudo cargar el reporte histórico.",
    foodReportTitle: "Comidas vendidas",
    foodReportToolText: "Consulta qué platos se vendieron por rango de fechas y método de pago.",
    foodReportText: "Filtra ventas entregadas por fechas, método de pago y nombre del plato para revisar su movimiento.",
    foodReportStart: "Fecha inicio",
    foodReportEnd: "Fecha final",
    foodReportPayment: "Método de pago",
    foodReportSearch: "Buscar plato",
    foodReportSearchPlaceholder: "Escribe el nombre del plato",
    foodReportDishFilter: "Plato del menú",
    foodReportAll: "Todos los métodos",
    foodReportDay: "Día",
    foodReportMonth: "Mes",
    foodReportYear: "Año",
    foodReportCurrent: "Actual",
    foodReportPreview: "Vista previa",
    foodReportPrint: "Imprimir reporte",
    foodReportCount: "Platos",
    foodReportUnits: "Unidades",
    foodReportRevenue: "Ventas",
    foodReportTop: "Más vendido",
    foodReportDish: "Comida",
    foodReportOrders: "Pedidos",
    foodReportFirstSold: "Primera venta",
    foodReportLastSold: "Última venta",
    foodReportRowsEmpty: "No hay comidas vendidas para ese filtro.",
    foodReportPreviewTitle: "Vista previa del reporte",
    foodReportRangeLabel: "Rango",
    foodReportMethodLabel: "Método",
    foodReportSearchLabel: "Plato",
    foodReportSearchAll: "Todos los platos",
    foodReportSummaryNote: "Solo toma pedidos entregados y agrupa las comidas según el filtro elegido.",
    foodReportLoading: "Cargando reporte de comidas...",
    foodReportError: "No se pudo cargar el reporte de comidas.",
    orderCreatorTitle: "Crear pedido",
    orderCreatorText: "Toma pedidos desde el CRM con productos, datos del cliente y forma de pago.",
    orderCreatorCollapsedText: "Crea pedidos internos para mesa, recoger o delivery sin salir del CRM.",
    orderCreatorShow: "Crear pedido",
    orderCreatorHide: "Ocultar pedido",
    orderCreatorSearchLabel: "Buscar producto",
    orderCreatorSearchPlaceholder: "Buscar por nombre o categoría",
    orderCreatorCategoryLabel: "Categoría",
    orderCreatorCartTitle: "Pedido actual",
    orderCreatorEmptyCart: "Agrega productos para crear el pedido.",
    orderCreatorRemoveItem: "Eliminar",
    orderCreatorCustomerTitle: "Datos del cliente",
    orderCreatorTypeLabel: "Tipo de pedido",
    orderTypeDineIn: "Comer en restaurante",
    orderTypeTakeaway: "Recoger",
    orderTypeDelivery: "Delivery",
    orderTypePedidosYa: "Pedidos Ya",
    orderCreatorNameLabel: "Nombre del cliente",
    orderCreatorPhoneLabel: "Teléfono",
    orderCreatorTableLabel: "Mesa o referencia",
    orderCreatorAddressLabel: "Dirección de delivery",
    orderCreatorNotesLabel: "Notas del pedido",
    orderCreatorPaymentMethodLabel: "Forma de pago",
    orderCreatorPaymentStatusLabel: "Estado del pago",
    orderCreatorPaymentUnpaid: "Pendiente de pago",
    orderCreatorPaymentPaid: "Pagado",
    orderCreatorRoutingHint: "Mesa entra directo a cocina. Recoger y delivery pasan por pendientes.",
    orderCreatorSubmit: "Crear pedido",
    orderCreatorReset: "Limpiar",
    orderCreatorNeedItems: "Agrega al menos un producto.",
    orderCreatorNeedCustomer: "Escribe el nombre del cliente.",
    orderCreatorNeedPhone: "Escribe el teléfono del cliente.",
    orderCreatorNeedTable: "Escribe el número de mesa.",
    orderCreatorNeedAddress: "Escribe la dirección para delivery.",
    orderCreatorCreated: "Pedido creado",
    orderCreatorError: "No se pudo crear el pedido.",
    addedToCart: "agregado al carrito",
    productManagerTitle: "Gestión de productos",
    productManagerText: "Cambia precios, agrega un comentario visible, marca productos nuevos y controla si un producto está agotado.",
    productManagerCollapsedText: "Ajustes de menú listos. Abre esta sección para editar productos.",
    productManagerShow: "Mostrar productos",
    productManagerHide: "Ocultar productos",
    productManagerSummary: "Productos",
    productSearchLabel: "Buscar producto",
    productSearchPlaceholder: "Buscar por nombre o categoría",
    productCategoryLabel: "Categoría",
    productAllCategories: "Todas las categorías",
    productPriceLabel: "Precio",
    productNoteEsLabel: "Comentario visible",
    productNewLabel: "Producto nuevo",
    productEditedLabel: "Editado",
    productEditedOnlyLabel: "Solo editados",
    productSoldOutLabel: "Agotado",
    productSave: "Guardar producto",
    productSaved: "Producto actualizado",
    productSavingLabel: "Guardando...",
    productSavedLabel: "Guardado",
    productNoResults: "No hay productos con ese filtro.",
    productSettingsError: "No se pudieron cargar los productos.",
    qtySold: "Cantidad",
    salesLabel: "Ventas",
    period_day: "Hoy",
    period_week: "Semana",
    period_month: "Mes",
    savingAction: "Aplicando cambio...",
    updated: "Estado actualizado",
    paymentUpdated: "Pago actualizado",
    paymentMethodUpdated: "Método de pago actualizado",
    paymentReceived: "Pago recibido",
    crmNotificationsReady: "Avisos del CRM activados.",
    crmNotificationsUnavailable: "El CRM está abierto, pero este navegador no pudo activar avisos push.",
    ordersListenerError: "No se pudieron cargar los pedidos.",
    reservationsListenerError: "No se pudieron cargar las reservas.",
    staffRole: "Rol",
    signOut: "Cerrar sesión",
    signOutShort: "Salir"
  },
  en: {
    authTitle: "Staff CRM access",
    authText: "Sign in with username and password to validate representative role.",
    authUserLabel: "Username",
    authPassLabel: "Password",
    authButton: "Sign in",
    authInvalid: "Invalid username or password.",
    authUserNotFound: "Username not found.",
    authDenied: "Your user does not have CRM permissions. Contact the admin.",
    authStartupError: "Sign-in succeeded, but the CRM could not start correctly. Please try again.",
    authChecking: "Validating access...",
    authProviderDisabled: "Username and password access is not enabled. Check Supabase Auth.",
    authUnauthorizedDomain: "This domain is not authorized for the backend. Check WEB_ORIGINS in Vercel.",
    authNetworkError: "The API could not be reached. Check the connection and try again.",
    authPermissionError: "The API blocked user validation. Check roles and private variables.",
    authSessionExpired: "The connection could not be refreshed. The CRM will stay open; sign out only when you want to leave.",
    kitchenScreen: "Kitchen screen",
    fiscalSettingsPage: "Fiscal settings",
    fiscalModalTitle: "Fiscal settings",
    fiscalModalText: "Complete the legal data that will print automatically on the fiscal invoice.",
    crmTitle: "Orders and reservations dashboard",
    crmSub: "Real-time operations view for representatives.",
    crmToolsNav: "Settings",
    crmToolsEyebrow: "Settings",
    crmToolsOpen: "View options",
    crmToolsFiscalText: "Legal data, CAI, authorization range, and taxes.",
    crmToolsKitchenText: "Dedicated screen for the kitchen to receive and move orders.",
    crmNotificationsAction: "Enable alerts",
    crmNotificationsActionText: "If you did not allow alerts at sign-in, enable order and reservation notices here.",
    crmNotificationsAppleTitle: "iPhone and iPad notice",
    crmNotificationsAppleText: "On Android, alerts work from Chrome. On iPhone or iPad, open the CRM in Safari, add it to the Home Screen, and enable alerts from that icon.",
    viewOrders: "Orders",
    viewReservations: "Reservations",
    filterAll: "All",
    filterPending: "Pending",
    filterInProgress: "Preparing",
    filterReady: "Ready",
    filterAccepted: "Accepted",
    filterPreparing: "Preparing",
    filterDelivered: "Delivered",
    filterRejected: "Rejected",
    reservationStatus: "Reservation status",
    reservationStatus_pending: "Pending",
    reservationStatus_accepted: "Accepted",
    reservationStatus_rejected: "Rejected",
    reservationAccept: "Accept",
    reservationReject: "Reject",
    reservationPending: "Mark pending",
    reservationUpdated: "Reservation updated",
    reservationUpdateError: "Could not update reservation.",
    reservationAreaLabel: "Area",
    reservationAreaOpen: "Open area",
    reservationAreaAir: "Air-conditioned area",
    btnPending: "Pending",
    btnInProgress: "Preparing",
    btnReady: "Ready",
    btnAccept: "Deliver",
    btnReject: "Reject",
    btnRejectShort: "Reject",
    btnReopen: "Reopen",
    btnReactivate: "Reactivate",
    actionBack: "Back",
    actionNext: "Next",
    btnMarkPaid: "Mark paid",
  btnPrint: "Normal invoice",
  btnFiscalPrint: "Fiscal invoice",
  btnFiscalReprint: "Reprint fiscal invoice",
    btnSaveInvoice: "Save invoice",
    review: "Review order",
    reviewShort: "Details",
    hideOrder: "Remove order",
    hideOrderConfirmTitle: "Remove order",
    hideOrderConfirmText: "Do you want to remove this order from the CRM view?",
    hideOrderConfirmButton: "Remove",
    cancelButton: "Cancel",
    orderHidden: "Order removed from view.",
    emptyOrders: "No orders for this status.",
    emptyReservations: "No reservations found.",
    customer: "Customer",
    customerNameLabel: "Customer name",
    whatsappButton: "WhatsApp",
    whatsappOpenLabel: "Open WhatsApp chat",
    customerNameSaved: "Name updated",
    customerNameSaveError: "Could not update the name.",
    orderTableLabel: "Table",
    orderComments: "Order comments",
    invoiceRequestSummary: "Customer requested invoice with RTN and name",
    orderPickupBadge: "Pickup",
    orderDeliveryBadge: "Delivery",
    orderCashierPending: "Will pay in person",
    orderPaidMessage: "Payment made",
    orderUnpaidMessage: "Order not paid yet",
    payment: "Payment",
    paymentMethod: "Method",
    paymentMethodSelect: "Payment method",
    paymentMethodPlaceholder: "Select payment method",
    paymentMethodRequired: "Select a payment method before delivering the order.",
    paymentStatus: "Status",
    orderStatus: "Order status",
    invoiceSectionTitle: "Invoice details",
    reviewItemsTitle: "Order items",
    reviewItemsEdit: "Edit items",
    reviewItemsAdd: "Add item",
    reviewItemsAddInline: "Add another item",
    reviewItemsSave: "Save changes",
    reviewItemsCancel: "Cancel",
    reviewItemsQty: "Qty",
    reviewItemsProduct: "Product",
    reviewItemsRemove: "Remove",
    reviewItemsNeedItems: "Add at least one item to the order.",
    reviewItemsUpdated: "Order updated",
    reviewItemsUpdateError: "Could not update the items.",
    invoiceBillingName: "Billing name",
    invoiceBillingRTN: "Customer RTN",
    invoiceNumber: "Invoice number",
    invoiceNumberAuto: "Invoice number assigned automatically",
    invoiceNumberPending: "It will be assigned on print",
    invoiceNotes: "Fiscal notes",
    invoiceHasExoneration: "Customer with exemption",
    invoiceExemptionRegister: "Exemption register",
    invoiceExemptOrder: "Tax-exempt purchase order",
    invoiceSagRegister: "SAG register no.",
    invoiceSaved: "Invoice saved",
    invoiceMissingNumber: "Complete the invoice number before printing.",
    invoiceLegalNotice: "Verify CAI, RTN, authorization range, and tax setup before using this invoice with customers.",
    invoiceInvalidRange: "The fiscal range is invalid. Review fiscal settings.",
    invoiceRangeExhausted: "The authorized range is exhausted. Update the next invoice number.",
    invoicePrintBlockedExhausted: "The fiscal invoice cannot be shown. The authorized range was exceeded and must be updated in Fiscal settings.",
    invoiceDeadlineExceeded: "The emission deadline already expired. Update Fiscal settings.",
    invoicePrintBlockedExpired: "The fiscal invoice cannot be shown. The emission deadline already expired and must be updated in Fiscal settings.",
    brandName: "Brand name",
    legalName: "Legal name",
    phone: "Phone",
    address: "Address",
    email: "Email",
    emissionDeadline: "Emission deadline",
    rangeStart: "Authorized range start",
    rangeEnd: "Authorized range end",
  nextInvoiceNumber: "Next invoice number",
  duplicateNextInvoiceNumber: "That number was already used on a previous invoice. Enter a different invoice number.",
    copyLegend: "Copy legend",
    generalTaxRate: "General tax (%)",
    taxAppetizers: "Appetizers tax (%)",
    taxMainCourses: "Main courses tax (%)",
    taxBeverages: "Beverages tax (%)",
    taxDesserts: "Desserts tax (%)",
    saveButton: "Save settings",
    settingsWarning: "Only change these values with valid tax data authorized by SAR.",
    invalidRange: "The fiscal range is invalid.",
    saved: "Settings saved",
    invoiceTermsCash: "Cash sale",
    invoiceTermsPending: "Pending",
    invoiceStatePaid: "Paid",
    invoiceStatePending: "Pending",
    invoiceLabel: "Invoice",
    customerFinalConsumer: "Final consumer",
    customerRTNDefault: "00000000000000",
    subtotal: "Subtotal",
    exemptAmount: "Exempt amount",
    taxableAmount: "Taxable amount",
    taxAmount: "Sales tax",
    legalInfoPending: "UPDATE YOUR LEGAL DATA IN THE FISCAL PAGE.",
    fiscalRangeAlertTitle: "Fiscal warning",
    fiscalRangeAlertText: "You must update fiscal settings to keep printing fiscal invoices.",
    fiscalRangeAlertRangeText: "Update Fiscal settings. You already reached the authorized quantity and cannot keep printing fiscal invoices.",
    fiscalRangeAlertDeadlineText: "Update Fiscal settings. The emission deadline already expired and you cannot keep printing fiscal invoices.",
    fiscalRangeAlertAction: "Update now",
    payMethodOnline: "Online",
    payMethodCard: "Card",
    payMethodPaypal: "PayPal",
    payMethodCash: "Cash",
    payMethodTransfer: "Bank transfer",
    payMethodPedidosYa: "Pedidos Ya",
    payMethodCashOnPickup: "Pay on pickup",
    payStatusPending: "Pending confirmation",
    payStatusPaid: "Paid",
    payStatusUnpaid: "Unpaid",
    total: "Total",
    date: "Date",
    status_pending: "Pending",
    status_preparing: "Preparing",
    status_ready: "Ready",
    status_accepted: "Accepted",
    status_delivered: "Delivered",
    status_rejected: "Rejected",
    reservationsCount: "Reservations",
    ordersCount: "Orders",
    pendingCount: "Pending",
    progressCount: "Preparing",
    readyCount: "Ready",
    acceptedCount: "Delivered",
    revenueCount: "Revenue",
    avgTicket: "Average ticket",
    statsSummary: "Summary",
    statsOps: "Operations",
    statsSales: "Sales",
    topFoodTitle: "Top food sold",
    topFoodEmpty: "No accepted sales for this period.",
    calendarTitle: "Sales calendar",
    calendarSub: "Pick a date to review delivered sales and order details.",
    calendarCollapsedText: "Monthly summary ready. Open the report to review days, payments, and food sold.",
    calendarShow: "Show report",
    calendarHide: "Hide report",
    calendarMonthSummary: "Month summary",
    calendarNoSalesMonth: "No delivered sales in this month.",
    calendarNoSalesDay: "No delivered sales on this date.",
    calendarSearchPlaceholder: "Search by customer, order number, invoice, or item",
    calendarSearchEmpty: "No orders match that search.",
    calendarOrders: "Orders",
    calendarRevenue: "Revenue",
    calendarPaymentBreakdown: "Payment method closeout",
    calendarPaymentFilter: "View sales by method",
    calendarPaymentAll: "All methods",
    calendarPaymentSelected: "Current selection",
    calendarPaymentOther: "Other methods",
    calendarDetailsTitle: "Day details",
    calendarPrev: "Previous month",
    calendarNext: "Next month",
    calendarFoodBreakdown: "Food sold that day",
    termsReportTitle: "Invoices by terms",
    termsReportToolText: "Filter delivered sales by date range and payment term to review and print reports.",
    termsReportText: "Generate an on-demand report by date range and payment method without slowing down the CRM.",
    termsReportStart: "Start date",
    termsReportEnd: "End date",
    termsReportTerms: "Terms",
    termsReportAll: "All terms",
    termsReportDay: "Day",
    termsReportMonth: "Month",
    termsReportYear: "Year",
    termsReportCurrent: "Current",
    termsReportPreview: "Preview",
    termsReportPrint: "Print report",
    termsReportCount: "Invoices",
    termsReportRowsEmpty: "No delivered invoices match that filter.",
    termsReportPreviewTitle: "Report preview",
    termsReportRangeLabel: "Range",
    termsReportMethodLabel: "Term",
    termsReportInvoiceOrOrder: "Invoice / Order",
    termsReportTax: "Tax",
    termsReportSummaryNote: "This only includes delivered orders and uses the selected payment term.",
    termsReportLoading: "Loading historical report...",
    termsReportError: "Could not load the historical report.",
    foodReportTitle: "Food sold",
    foodReportToolText: "Review which dishes were sold by date range and payment method.",
    foodReportText: "Filter delivered sales by date range, payment method, and dish name to review movement.",
    foodReportStart: "Start date",
    foodReportEnd: "End date",
    foodReportPayment: "Payment method",
    foodReportSearch: "Search dish",
    foodReportSearchPlaceholder: "Type the dish name",
    foodReportDishFilter: "Menu dish",
    foodReportAll: "All methods",
    foodReportDay: "Day",
    foodReportMonth: "Month",
    foodReportYear: "Year",
    foodReportCurrent: "Current",
    foodReportPreview: "Preview",
    foodReportPrint: "Print report",
    foodReportCount: "Dishes",
    foodReportUnits: "Units",
    foodReportRevenue: "Sales",
    foodReportTop: "Top seller",
    foodReportDish: "Food",
    foodReportOrders: "Orders",
    foodReportFirstSold: "First sale",
    foodReportLastSold: "Last sale",
    foodReportRowsEmpty: "No sold dishes match that filter.",
    foodReportPreviewTitle: "Report preview",
    foodReportRangeLabel: "Range",
    foodReportMethodLabel: "Method",
    foodReportSearchLabel: "Dish",
    foodReportSearchAll: "All dishes",
    foodReportSummaryNote: "This only includes delivered orders and groups dishes by the selected filter.",
    foodReportLoading: "Loading food report...",
    foodReportError: "Could not load the food report.",
    orderCreatorTitle: "Create order",
    orderCreatorText: "Take CRM orders with products, customer details, and payment method.",
    orderCreatorCollapsedText: "Create internal dine-in, pickup, or delivery orders without leaving the CRM.",
    orderCreatorShow: "Create order",
    orderCreatorHide: "Hide order",
    orderCreatorSearchLabel: "Search product",
    orderCreatorSearchPlaceholder: "Search by name or category",
    orderCreatorCategoryLabel: "Category",
    orderCreatorCartTitle: "Current order",
    orderCreatorEmptyCart: "Add products to create the order.",
    orderCreatorRemoveItem: "Remove",
    orderCreatorCustomerTitle: "Customer details",
    orderCreatorTypeLabel: "Order type",
    orderTypeDineIn: "Dine in",
    orderTypeTakeaway: "Pickup",
    orderTypeDelivery: "Delivery",
    orderTypePedidosYa: "Pedidos Ya",
    orderCreatorNameLabel: "Customer name",
    orderCreatorPhoneLabel: "Phone",
    orderCreatorTableLabel: "Table or reference",
    orderCreatorAddressLabel: "Delivery address",
    orderCreatorNotesLabel: "Order notes",
    orderCreatorPaymentMethodLabel: "Payment method",
    orderCreatorPaymentStatusLabel: "Payment status",
    orderCreatorPaymentUnpaid: "Payment pending",
    orderCreatorPaymentPaid: "Paid",
    orderCreatorRoutingHint: "Dine-in goes straight to kitchen. Pickup and delivery go to pending.",
    orderCreatorSubmit: "Create order",
    orderCreatorReset: "Clear",
    orderCreatorNeedItems: "Add at least one product.",
    orderCreatorNeedCustomer: "Enter the customer name.",
    orderCreatorNeedPhone: "Enter the customer phone.",
    orderCreatorNeedTable: "Enter the table number.",
    orderCreatorNeedAddress: "Enter the delivery address.",
    orderCreatorCreated: "Order created",
    orderCreatorError: "Could not create the order.",
    addedToCart: "added to cart",
    productManagerTitle: "Product management",
    productManagerText: "Change prices, add one visible note, mark new products, and control when an item is sold out.",
    productManagerCollapsedText: "Menu settings are ready. Open this section to edit products.",
    productManagerShow: "Show products",
    productManagerHide: "Hide products",
    productManagerSummary: "Products",
    productSearchLabel: "Search product",
    productSearchPlaceholder: "Search by name or category",
    productCategoryLabel: "Category",
    productAllCategories: "All categories",
    productPriceLabel: "Price",
    productNoteEsLabel: "Visible note",
    productNewLabel: "New product",
    productEditedLabel: "Edited",
    productEditedOnlyLabel: "Edited only",
    productSoldOutLabel: "Sold out",
    productSave: "Save product",
    productSaved: "Product updated",
    productSavingLabel: "Saving...",
    productSavedLabel: "Saved",
    productNoResults: "No products match that filter.",
    productSettingsError: "Could not load products.",
    qtySold: "Qty",
    salesLabel: "Sales",
    period_day: "Today",
    period_week: "Week",
    period_month: "Month",
    savingAction: "Applying change...",
    updated: "Status updated",
    paymentUpdated: "Payment updated",
    paymentMethodUpdated: "Payment method updated",
    paymentReceived: "Payment received",
    crmNotificationsReady: "CRM alerts enabled.",
    crmNotificationsUnavailable: "The CRM is open, but this browser could not enable push alerts.",
    ordersListenerError: "Could not load orders.",
    reservationsListenerError: "Could not load reservations.",
    staffRole: "Role",
    signOut: "Sign out",
    signOutShort: "Out"
  }
};

const authGate = document.getElementById("authGate");
const authMessage = document.getElementById("authMessage");
const authForm = document.getElementById("crmAuthForm");
const authUser = document.getElementById("crmUser");
const authPassword = document.getElementById("crmPassword");
const authSubmitBtn = document.getElementById("crmSignIn");
const signOutBtn = document.getElementById("crmSignOut");
const openFiscalSettingsBtn = document.getElementById("openFiscalSettings");
const enableCrmNotificationsBtn = document.getElementById("enableCrmNotifications");
const crmNavToggle = document.getElementById("crmNavToggle");
const crmHeaderNav = document.getElementById("crmHeaderNav");
const crmApp = document.getElementById("crmApp");
const staffBadge = document.getElementById("staffBadge");

const ordersList = document.getElementById("ordersList");
const reservationsList = document.getElementById("reservationsList");
const statsGrid = document.getElementById("statsGrid");
const foodStats = document.getElementById("foodStats");
const salesCalendar = document.getElementById("salesCalendar");
const crmSettingsModal = document.getElementById("crmSettingsModal");
const closeCrmSettingsBtn = document.getElementById("closeCrmSettings");
const crmSettingsLinks = Array.from(document.querySelectorAll("[data-open-crm-settings]"));
const orderCreatorModal = document.getElementById("orderCreatorModal");
const closeOrderCreatorModalBtn = document.getElementById("closeOrderCreatorModal");
const productManagerModal = document.getElementById("productManagerModal");
const closeProductManagerModalBtn = document.getElementById("closeProductManagerModal");
const productManager = document.getElementById("productManager");
const termsReportModal = document.getElementById("termsReportModal");
const closeTermsReportModalBtn = document.getElementById("closeTermsReportModal");
const termsReport = document.getElementById("termsReport");
const foodReportModal = document.getElementById("foodReportModal");
const closeFoodReportModalBtn = document.getElementById("closeFoodReportModal");
const foodReport = document.getElementById("foodReport");
const orderCreator = document.getElementById("orderCreator");
const viewButtons = Array.from(document.querySelectorAll(".chip[data-view]"));
const filterButtons = Array.from(document.querySelectorAll(".chip[data-filter]"));
const periodButtons = Array.from(document.querySelectorAll(".chip[data-period]"));
const ordersView = document.getElementById("ordersView");
const reservationsView = document.getElementById("reservationsView");
const reviewModal = document.getElementById("reviewModal");
const reviewTitle = document.getElementById("reviewTitle");
const reviewBody = document.getElementById("reviewBody");
const closeReview = document.getElementById("closeReview");
const reviewPending = document.getElementById("reviewPending");
const reviewProgress = document.getElementById("reviewProgress");
const reviewAccept = document.getElementById("reviewAccept");
const reviewReject = document.getElementById("reviewReject");
const hideOrderConfirmModal = document.getElementById("hideOrderConfirmModal");
const closeHideOrderConfirmBtn = document.getElementById("closeHideOrderConfirm");
const cancelHideOrderBtn = document.getElementById("cancelHideOrder");
const confirmHideOrderBtn = document.getElementById("confirmHideOrder");
const fiscalSettingsModal = document.getElementById("fiscalSettingsModal");
const fiscalSettingsForm = document.getElementById("crmFiscalSettingsForm");
const closeFiscalSettingsBtn = document.getElementById("closeFiscalSettings");
const langToggleDesktop = document.getElementById("crmLangToggleDesktop");
const langToggleMobile = document.getElementById("crmLangToggleMobile");
const fiscalRangeAlert = document.getElementById("fiscalRangeAlert");
const fiscalRangeAlertTitle = document.getElementById("fiscalRangeAlertTitle");
const fiscalRangeAlertText = document.getElementById("fiscalRangeAlertText");
const fiscalRangeAlertButton = document.getElementById("fiscalRangeAlertButton");
const toast = document.getElementById("toast");
const busyScreen = createBusyScreen();

let lang = "es";
let activeFilter = "all";
let activeReservationFilter = "all";
let selectedOrderId = null;
let currentStaffUser = null;
let currentStaffProfile = null;
let pendingAuthMessage = "";
let crmPushNotificationsReady = false;
let ordersCache = [];
let reservationsCache = [];
let activePeriod = "day";
let calendarMonth = (() => {
  const now = new Date();
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now;
})();
let selectedCalendarDate = null;
let salesDaySearchTerm = "";
let salesDayPaymentFilter = "all";
let salesCalendarExpanded = false;
let menuSettings = { items: {} };
let productManagerExpanded = false;
let productManagerSearchTerm = "";
let productManagerCategory = "all";
let productManagerEditedOnly = false;
let productSaveUiState = new Map();
let termsReportPreset = "day";
let termsReportPayment = "all";
let termsReportRange = { start: null, end: null };
let termsReportRowsCache = [];
let termsReportLoading = false;
let termsReportError = "";
let termsReportRequestId = 0;
let foodReportPreset = "day";
let foodReportPayment = "all";
let foodReportRange = { start: null, end: null };
let foodReportSearch = "";
let foodReportRowsCache = [];
let foodReportLoading = false;
let foodReportError = "";
let foodReportRequestId = 0;
let orderCreatorExpanded = false;
let orderCreatorSearchTerm = "";
let orderCreatorCategory = "all";
let orderCreatorType = "dine_in";
let orderCreatorCart = [];
let orderCreatorDraft = {
  customerName: "",
  phone: "",
  table: "",
  address: "",
  notes: "",
  paymentMethod: "cash",
  paymentStatus: "unpaid"
};
let unsubscribeOrders = null;
let unsubscribeReservations = null;
let hasSeenInitialOrdersSnapshot = false;
let hasSeenInitialReservationsSnapshot = false;
let knownOrderIds = new Set();
let knownReservationIds = new Set();
const HIDDEN_ORDER_IDS_KEY = "frida_crm_hidden_order_ids_v1";
const CRM_NOTIFICATIONS_ENABLED_KEY = "frida_crm_notifications_enabled_v1";
let hiddenOrderIds = readHiddenOrderIds();
let pendingHiddenOrderId = "";
let knownOrderPaymentStatus = new Map();
let orderNameSaveTimers = new Map();
let orderNamePendingValues = new Map();
let orderNameLastSavedValues = new Map();
let orderNameSavingIds = new Set();
let invoiceDraftSaveTimers = new Map();
let invoiceDraftPendingValues = new Map();
let invoiceDraftLastSavedValues = new Map();
let invoiceDraftSavingIds = new Set();
let reviewItemsEditMode = false;
let reviewItemsDraft = [];
let reviewItemsSaving = false;
let audioCtx = null;
let audioUnlocked = false;
let realtimeAuthExpiredHandled = false;
let fiscalSettings = mergeFiscalSettings();
let pendingLinkedOrderId = crmUrlParams.get("order") || crmUrlParams.get("orderId") || "";
let pendingLinkedReservationId = crmUrlParams.get("reservation") || crmUrlParams.get("reservationId") || "";
let highlightedReservationId = pendingLinkedReservationId;
let lastCrmPushRegisterAt = 0;
let toastTimer = null;

function t(key) {
  return (i18n[lang] && i18n[lang][key]) || key;
}

const CRM_EDITABLE_FIELD_SELECTOR = [
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([readonly]):not([disabled])',
  "textarea:not([readonly]):not([disabled])"
].join(",");

function editableFieldFromEvent(event) {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const directField = target.closest(CRM_EDITABLE_FIELD_SELECTOR);
  if (directField) return directField;
  const label = target.closest("label");
  return label ? label.querySelector(CRM_EDITABLE_FIELD_SELECTOR) : null;
}

function isCRMEditableFieldActive() {
  const active = document.activeElement;
  return active instanceof Element && active.matches(CRM_EDITABLE_FIELD_SELECTOR);
}

function readHiddenOrderIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(HIDDEN_ORDER_IDS_KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw.filter(Boolean).map(String) : []);
  } catch (_error) {
    return new Set();
  }
}

function writeHiddenOrderIds() {
  localStorage.setItem(HIDDEN_ORDER_IDS_KEY, JSON.stringify(Array.from(hiddenOrderIds)));
}

function setAuthMessage(message, state = "info") {
  authMessage.textContent = message || "";
  if (message) authMessage.dataset.state = state;
  else delete authMessage.dataset.state;
}

function setAuthBusy(isBusy) {
  authUser.disabled = isBusy;
  authPassword.disabled = isBusy;
  authSubmitBtn.disabled = isBusy;
}

function describeAuthError(error) {
  const code = error && error.code ? error.code : "unknown";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return t("authInvalid");
  }
  if (code === "auth/operation-not-allowed") return t("authProviderDisabled");
  if (code === "auth/unauthorized-domain") return t("authUnauthorizedDomain");
  if (code === "auth/network-request-failed") return t("authNetworkError");
  if (code === "permission-denied" || code === "auth/internal-error") return t("authPermissionError");
  return `Sign-in failed (${code})`;
}

function money(v) {
  return new Intl.NumberFormat(lang === "es" ? "es-HN" : "en-US", {
    style: "currency",
    currency: "HNL",
    minimumFractionDigits: 2
  }).format(Number(v || 0));
}

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("504")) return digits;
  const localDigits = digits.replace(/^0+/, "");
  return localDigits ? `504${localDigits}` : "";
}

function renderWhatsAppButton(phone, extraClass = "") {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return "";
  const classes = ["crm-whatsapp-btn", extraClass].filter(Boolean).join(" ");
  return `
    <a
      class="${classes}"
      href="https://wa.me/${normalizedPhone}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="${escapeHtml(t("whatsappOpenLabel"))}"
      title="${escapeHtml(t("whatsappOpenLabel"))}">
      ${escapeHtml(t("whatsappButton"))}
    </a>
  `;
}

function amountToWordsEs(value) {
  const units = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
  const teens = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciseis", "diecisiete", "dieciocho", "diecinueve"];
  const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

  function underHundred(n) {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n === 20) return "veinte";
    if (n < 30) return `veinti${units[n - 20]}`;
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return unit ? `${tens[ten]} y ${units[unit]}` : tens[ten];
  }

  function underThousand(n) {
    if (n === 0) return "";
    if (n === 100) return "cien";
    if (n < 100) return underHundred(n);
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return rest ? `${hundreds[hundred]} ${underHundred(rest)}` : hundreds[hundred];
  }

  function integerWords(n) {
    if (n === 0) return "cero";
    if (n < 1000) return underThousand(n);
    if (n < 1000000) {
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;
      const thousandsText = thousands === 1 ? "mil" : `${integerWords(thousands)} mil`;
      return rest ? `${thousandsText} ${underThousand(rest)}` : thousandsText;
    }
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    const millionsText = millions === 1 ? "un millon" : `${integerWords(millions)} millones`;
    return rest ? `${millionsText} ${integerWords(rest)}` : millionsText;
  }

  const amount = Number(value || 0);
  const integerPart = Math.floor(amount);
  const cents = Math.round((amount - integerPart) * 100);
  return `${integerWords(integerPart)} con ${String(cents).padStart(2, "0")}/100`;
}

function showToast(message, options = {}) {
  const { duration = 1600, center = false, highlight = false } = options;
  toast.textContent = message;
  toast.classList.remove("center", "highlight");
  if (center) toast.classList.add("center");
  if (highlight) toast.classList.add("highlight");
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show", "center", "highlight");
  }, duration);
}

function createBusyScreen() {
  const node = document.createElement("div");
  node.className = "busy-screen hidden";
  node.setAttribute("role", "status");
  node.setAttribute("aria-live", "polite");
  node.innerHTML = '<div class="busy-card"><span></span></div>';
  document.body.appendChild(node);
  return node;
}

async function withSlowBusyScreen(message, action, delay = 900) {
  let visible = false;
  const label = busyScreen.querySelector("span");
  const timer = setTimeout(() => {
    if (label) label.textContent = message;
    busyScreen.classList.remove("hidden");
    visible = true;
  }, delay);

  try {
    return await action();
  } finally {
    clearTimeout(timer);
    if (visible) busyScreen.classList.add("hidden");
  }
}

function canUseBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function canUseWebAudio() {
  return typeof window !== "undefined" && ("AudioContext" in window || "webkitAudioContext" in window);
}

function getAudioContext() {
  if (!canUseWebAudio()) return null;
  if (audioCtx) return audioCtx;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtx();
  } catch (_e) {
    audioCtx = null;
  }
  return audioCtx;
}

async function unlockNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === "suspended") await ctx.resume();
    audioUnlocked = ctx.state === "running";
  } catch (_e) {
    audioUnlocked = false;
  }
  return audioUnlocked;
}

function playNewOrderSound() {
  if (!audioUnlocked) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const beepOffsets = [0, 0.23];
  beepOffsets.forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now + offset);
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.2);
  });
}

async function ensureNotificationPermission() {
  if (!canUseBrowserNotifications()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch (_e) {
    return "denied";
  }
}

function readCrmNotificationsEnabled() {
  return localStorage.getItem(CRM_NOTIFICATIONS_ENABLED_KEY) === "true";
}

function writeCrmNotificationsEnabled(enabled) {
  if (enabled) localStorage.setItem(CRM_NOTIFICATIONS_ENABLED_KEY, "true");
  else localStorage.removeItem(CRM_NOTIFICATIONS_ENABLED_KEY);
}

function canUseLocalCrmNotification() {
  return !crmPushNotificationsReady && canUseBrowserNotifications() && Notification.permission === "granted";
}

function notifyNewOrder(order) {
  const orderRef = `#${order.displayId || order.id.slice(0, 6)}`;
  const customerName = order.customer?.name || "-";
  const totalText = money(order.total);
  const title = lang === "es" ? "Nuevo pedido recibido" : "New order received";
  const body =
    lang === "es"
      ? `${orderRef} | ${customerName} | ${totalText}`
      : `${orderRef} | ${customerName} | ${totalText}`;

  showToast(`${title}: ${orderRef}`);
  playNewOrderSound();
  if (!canUseLocalCrmNotification()) return;
  try {
    new Notification(title, { body });
  } catch (_e) {
    // Ignore notification errors and keep toast feedback.
  }
}

function notifyNewReservation(reservation) {
  const title = lang === "es" ? "Nueva reserva recibida" : "New reservation received";
  const when = [reservation.date, reservation.time].filter(Boolean).join(" ");
  const partyText = `${Number(reservation.party || 1)} pax`;
  const body = `${reservation.name || "-"} | ${when || "-"} | ${partyText}`;
  const link = `${window.location.origin}${window.location.pathname}?reservation=${encodeURIComponent(reservation.id)}`;

  showToast(`${title}: ${reservation.name || partyText}`);
  playNewOrderSound();
  if (!canUseLocalCrmNotification()) return;
  try {
    const notice = new Notification(title, { body, data: { link } });
    notice.onclick = () => {
      window.focus();
      window.location.href = link;
    };
  } catch (_e) {
    // Ignore notification errors and keep toast feedback.
  }
}

function notifyPaymentReceived(order) {
  const orderRef = `#${order.displayId || order.id.slice(0, 6)}`;
  const customerName = order.customer?.name || "-";
  const title = t("paymentReceived");
  const body = `${orderRef} | ${customerName}`;
  showToast(`${title}: ${orderRef}`);
  if (!canUseLocalCrmNotification()) return;
  try {
    new Notification(title, { body });
  } catch (_e) {
    // Ignore notification errors and keep toast feedback.
  }
}

async function registerCRMPushNotifications(options = {}) {
  const { showUnavailableToast = true, remember = false, force = false } = options;
  const now = Date.now();
  if (!force && crmPushNotificationsReady && now - lastCrmPushRegisterAt < 15 * 60 * 1000) {
    return true;
  }
  try {
    const token = await registerStaffNotificationToken("web-crm");
    if (token) {
      crmPushNotificationsReady = true;
      lastCrmPushRegisterAt = now;
      if (remember) writeCrmNotificationsEnabled(true);
      if (showUnavailableToast) showToast(t("crmNotificationsReady"));
      return true;
    }
  } catch (error) {
    crmPushNotificationsReady = false;
    console.warn("CRM push registration failed", error);
    if (showUnavailableToast) showToast(t("crmNotificationsUnavailable"));
  }
  return false;
}

async function activateCRMNotifications(options = {}) {
  const { showUnavailableToast = true, remember = true, force = false } = options;
  const permission = await ensureNotificationPermission();
  await unlockNotificationSound();

  if (permission !== "granted") {
    if (permission === "denied") writeCrmNotificationsEnabled(false);
    if (showUnavailableToast) showToast(t("crmNotificationsUnavailable"));
    return false;
  }

  return registerCRMPushNotifications({ showUnavailableToast, remember, force });
}

async function renewCRMNotificationsIfAllowed(options = {}) {
  if (!canUseBrowserNotifications()) return false;
  const { force = false } = options;
  const shouldRenew = Notification.permission === "granted" || readCrmNotificationsEnabled();
  if (!shouldRenew) return false;
  if (Notification.permission === "granted") {
    await unlockNotificationSound();
    return registerCRMPushNotifications({ showUnavailableToast: false, remember: true, force });
  }
  return activateCRMNotifications({ showUnavailableToast: false, remember: true, force });
}

function orderStatusLabel(status) {
  return t(`status_${status}`);
}

function normalizeReservationStatus(status) {
  if (status === "accepted" || status === "confirmed" || status === "completed") return "accepted";
  if (status === "rejected" || status === "cancelled" || status === "canceled") return "rejected";
  return "pending";
}

function reservationStatusLabel(status) {
  return t(`reservationStatus_${normalizeReservationStatus(status)}`);
}

const ORDER_STATUS_FLOW = ["pending", "preparing", "ready", "delivered"];

function previousOrderStatus(status) {
  if (status === "accepted") return "pending";
  const index = ORDER_STATUS_FLOW.indexOf(status);
  return index > 0 ? ORDER_STATUS_FLOW[index - 1] : "";
}

function nextOrderStatus(status) {
  if (status === "accepted") return "preparing";
  const index = ORDER_STATUS_FLOW.indexOf(status);
  return index >= 0 && index < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[index + 1] : "";
}

function renderStatusActionButton({ orderId, targetStatus, variant = "outline", label, hint = "" }) {
  if (!targetStatus || !label) return "";
  const buttonClass = variant === "primary" ? "btn btn-primary" : "btn btn-outline";
  const singleLineClass = hint ? "" : " status-nav-single";
  return `
    <button class="${buttonClass} status-change status-nav-btn${singleLineClass}" data-id="${orderId}" data-status="${targetStatus}">
      ${hint ? `<span class="status-nav-hint">${hint}</span>` : ""}
      <strong>${label}</strong>
    </button>
  `;
}

function renderOrderStatusActions(order) {
  const status = order?.status || "pending";

  if (status === "delivered") {
    return renderStatusActionButton({
      orderId: order.id,
      targetStatus: "ready",
      label: t("btnReopen")
    });
  }

  if (status === "rejected") {
    return renderStatusActionButton({
      orderId: order.id,
      targetStatus: "pending",
      label: t("btnReactivate")
    });
  }

  const actions = [];
  const previousStatus = previousOrderStatus(status);

  if (previousStatus) {
    actions.push(renderStatusActionButton({
      orderId: order.id,
      targetStatus: previousStatus,
      label: orderStatusLabel(previousStatus),
      hint: t("actionBack")
    }));
  }

  if (status === "ready") {
    actions.push(renderStatusActionButton({
      orderId: order.id,
      targetStatus: "delivered",
      variant: "primary",
      label: t("btnAccept")
    }));
  } else {
    const upcomingStatus = nextOrderStatus(status);
    if (upcomingStatus) {
      actions.push(renderStatusActionButton({
        orderId: order.id,
        targetStatus: upcomingStatus,
        variant: "primary",
        label: orderStatusLabel(upcomingStatus),
        hint: t("actionNext")
      }));
    }
  }

  actions.push(`
    <button class="btn danger status-change status-nav-btn status-nav-single status-reject-btn" data-id="${order.id}" data-status="rejected">
      <strong>${t("btnRejectShort")}</strong>
    </button>
  `);

  return actions.join("");
}

function paymentMethodLabel(method) {
  if (method === "bank_transfer") return t("payMethodTransfer");
  if (method === "pedidos_ya") return t("payMethodPedidosYa");
  if (method === "cash") return t("payMethodCash");
  if (method === "paypal") return t("payMethodPaypal");
  if (method === "card") return t("payMethodCard");
  if (method === "online") return t("payMethodOnline");
  return t("payMethodCashOnPickup");
}

function paymentStatusLabel(status) {
  if (status === "paid") return t("payStatusPaid");
  if (status === "pending") return t("payStatusPending");
  return t("payStatusUnpaid");
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function formatDateInputValue(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInputValue(value, boundary = "start") {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return boundary === "end" ? endOfDay(date) : startOfDay(date);
}

function buildTermsReportPresetRange(preset, anchorDate = new Date()) {
  const anchor = parseDate(anchorDate) || new Date();
  if (preset === "month") {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return { start: startOfDay(start), end: endOfDay(end) };
  }

  if (preset === "year") {
    const start = new Date(anchor.getFullYear(), 0, 1);
    const end = new Date(anchor.getFullYear(), 11, 31);
    return { start: startOfDay(start), end: endOfDay(end) };
  }

  return { start: startOfDay(anchor), end: endOfDay(anchor) };
}

function syncTermsReportRange() {
  const start = parseDate(termsReportRange.start) || new Date();
  const end = parseDate(termsReportRange.end) || start;
  if (start > end) {
    termsReportRange = { start: startOfDay(end), end: endOfDay(start) };
    return;
  }
  termsReportRange = { start: startOfDay(start), end: endOfDay(end) };
}

function setTermsReportPreset(preset, anchorDate = new Date()) {
  termsReportPreset = preset;
  termsReportRange = buildTermsReportPresetRange(preset, anchorDate);
  syncTermsReportRange();
}

function resetTermsReportToCurrentPreset() {
  setTermsReportPreset(termsReportPreset === "custom" ? "day" : termsReportPreset || "day", new Date());
}

function invoicePaymentMethod(order) {
  const method = order?.payment?.method;
  if (method === "cash_on_pickup" && order?.status === "delivered") return "cash";
  return method;
}

function paymentDone(order) {
  if (order?.payment?.status === "paid") return true;
  const method = invoicePaymentMethod(order);
  return order?.status === "delivered" && (method === "cash" || method === "card" || method === "bank_transfer" || method === "pedidos_ya");
}

function crmPaymentLine(order) {
  const done = paymentDone(order);
  const paymentText = done ? t("orderPaidMessage") : t("orderUnpaidMessage");
  if (order?.customer?.delivery || order?.order_type === "delivery" || order?.orderType === "delivery") {
    return `${t("orderDeliveryBadge")} | ${paymentText}`;
  }
  if (order?.customer?.pickup) {
    return `${t("orderPickupBadge")} | ${paymentText}`;
  }
  if (order?.payment?.method === "cash_on_pickup" && !done) {
    return t("orderCashierPending");
  }
  return paymentText;
}

function paymentMethodSelectValue(order) {
  const method = order?.payment?.method;
  if (method === "bank_transfer") return "bank_transfer";
  if (method === "pedidos_ya") return "pedidos_ya";
  if (method === "card" || method === "paypal" || method === "online") return "card";
  if (method === "cash") return "cash";
  return "";
}

function selectedPaymentMethodLabel(order) {
  const selectedMethod = paymentMethodSelectValue(order);
  return selectedMethod ? paymentMethodLabel(selectedMethod) : "";
}

function salesPaymentMethodKey(order) {
  const method = invoicePaymentMethod(order);
  if (method === "bank_transfer") return "bank_transfer";
  if (method === "pedidos_ya") return "pedidos_ya";
  if (method === "card" || method === "paypal" || method === "online") return "card";
  if (method === "cash" || method === "cash_on_pickup") return "cash";
  return "other";
}

function salesPaymentMethodLabel(method) {
  if (method === "all") return t("calendarPaymentAll");
  if (method === "other") return t("calendarPaymentOther");
  return paymentMethodLabel(method);
}

function termsReportPaymentLabel(method) {
  if (method === "all") return t("termsReportAll");
  return salesPaymentMethodLabel(method);
}

function foodReportPaymentLabel(method) {
  if (method === "all") return t("foodReportAll");
  return salesPaymentMethodLabel(method);
}

function normalizeFoodReportSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function salesPaymentBreakdown(orders) {
  const breakdown = {
    cash: { key: "cash", count: 0, revenue: 0 },
    card: { key: "card", count: 0, revenue: 0 },
    bank_transfer: { key: "bank_transfer", count: 0, revenue: 0 },
    pedidos_ya: { key: "pedidos_ya", count: 0, revenue: 0 },
    other: { key: "other", count: 0, revenue: 0 }
  };

  orders.forEach((order) => {
    const key = salesPaymentMethodKey(order);
    const row = breakdown[key] || breakdown.other;
    row.count += 1;
    row.revenue += Number(order.total || 0);
  });

  return breakdown;
}

function selectedSalesDayOrdersForSearch() {
  const monthSales = salesByDayForMonth(calendarMonth);
  const selectedBucket = monthSales.get(selectedCalendarDate) || null;
  if (!selectedBucket) return [];
  const paymentFilteredDayOrders = salesDayPaymentFilter === "all"
    ? selectedBucket.orders
    : selectedBucket.orders.filter((order) => salesPaymentMethodKey(order) === salesDayPaymentFilter);
  const normalizedSalesDaySearch = salesDaySearchTerm.trim().toLowerCase();
  return paymentFilteredDayOrders.filter((order) => {
    if (!normalizedSalesDaySearch) return true;
    const customerName = String(order.customer?.name || "").toLowerCase();
    const invoiceNumber = String(order.invoice?.invoiceNumber || "").toLowerCase();
    const displayId = String(order.displayId || order.id.slice(0, 6) || "").toLowerCase();
    const orderId = String(order.id || "").toLowerCase();
    const itemNames = (order.items || [])
      .map((item) => String(foodName(item) || "").toLowerCase())
      .join(" ");
    return customerName.includes(normalizedSalesDaySearch)
      || invoiceNumber.includes(normalizedSalesDaySearch)
      || displayId.includes(normalizedSalesDaySearch)
      || orderId.includes(normalizedSalesDaySearch)
      || itemNames.includes(normalizedSalesDaySearch);
  });
}

function renderSalesDayListHtml(filteredDayOrders) {
  return `
    ${filteredDayOrders.length
      ? filteredDayOrders
        .map(
          (order) => `
            <article class="sales-day-row">
              <div>
                <strong>#${order.displayId || order.id.slice(0, 6)}</strong>
                <p>${t("customer")}: ${order.customer?.name || "-"} (${order.customer?.phone || "-"})</p>
                ${renderInvoiceRequestNotice(order)}
                <p><strong>${crmPaymentLine(order)}</strong></p>
                <p>${timeLabel(orderSalesDateValue(order))} | ${money(order.total)}</p>
              </div>
              <button class="btn btn-outline" data-review-order="${order.id}">${t("review")}</button>
            </article>
          `
        )
        .join("")
      : ""}
    ${filteredDayOrders.length ? "" : `<p class="sales-day-empty">${t("calendarSearchEmpty")}</p>`}
  `;
}

function renderSalesDaySearchResults() {
  const list = salesCalendar?.querySelector(".sales-day-list");
  if (!list) return;
  list.innerHTML = renderSalesDayListHtml(selectedSalesDayOrdersForSearch());
}

function menuCategoryLabel(category) {
  const labels = {
    appetizers: lang === "es" ? "Entradas" : "Appetizers",
    main_courses: lang === "es" ? "Platos principales" : "Main courses",
    beverages: lang === "es" ? "Bebidas" : "Beverages",
    desserts: lang === "es" ? "Postres" : "Desserts"
  };
  return labels[category] || String(category || "").replace(/_/g, " ");
}

function normalizeTextForTranslation(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function translateVisibleNoteToEnglish(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const phrase = normalizeTextForTranslation(text).replace(/[.!?]+$/g, "");
  const phrases = {
    "sin gluten": "Gluten-free",
    "sin lactosa": "Lactose-free",
    "sin azucar": "Sugar-free",
    "bajo en azucar": "Low in sugar",
    "vegetariano": "Vegetarian",
    "vegano": "Vegan",
    "picante": "Spicy",
    "muy picante": "Very spicy",
    "poco picante": "Mildly spicy",
    "recomendado": "Recommended",
    "favorito de la casa": "House favorite",
    "nuevo": "New",
    "producto nuevo": "New item",
    "especial de la casa": "House special",
    "preparado al momento": "Prepared fresh",
    "hecho al momento": "Made fresh",
    "ideal para compartir": "Great for sharing",
    "perfecto para compartir": "Perfect for sharing",
    "por tiempo limitado": "Limited time only",
    "disponible por tiempo limitado": "Available for a limited time",
    "acompanado de papas": "Served with fries",
    "acompanado con papas": "Served with fries",
    "incluye bebida": "Includes a drink"
  };
  if (phrases[phrase]) return phrases[phrase];

  const replacements = [
    [/\bsin\b/gi, "without"],
    [/\bcon\b/gi, "with"],
    [/\by\b/gi, "and"],
    [/\bo\b/gi, "or"],
    [/\bde la casa\b/gi, "house"],
    [/\bcasero\b/gi, "homemade"],
    [/\bcasera\b/gi, "homemade"],
    [/\bfresco\b/gi, "fresh"],
    [/\bfresca\b/gi, "fresh"],
    [/\bnatural\b/gi, "natural"],
    [/\bpicante\b/gi, "spicy"],
    [/\bsuave\b/gi, "mild"],
    [/\bdulce\b/gi, "sweet"],
    [/\bcrujiente\b/gi, "crispy"],
    [/\bcremoso\b/gi, "creamy"],
    [/\bcremosa\b/gi, "creamy"],
    [/\bartesanal\b/gi, "artisanal"],
    [/\brecomendado\b/gi, "recommended"],
    [/\brecomendada\b/gi, "recommended"],
    [/\bnuevo\b/gi, "new"],
    [/\bnueva\b/gi, "new"],
    [/\bespecial\b/gi, "special"],
    [/\bpollo\b/gi, "chicken"],
    [/\bres\b/gi, "beef"],
    [/\bcerdo\b/gi, "pork"],
    [/\bpescado\b/gi, "fish"],
    [/\bmariscos\b/gi, "seafood"],
    [/\bqueso\b/gi, "cheese"],
    [/\bpapas\b/gi, "fries"],
    [/\bensalada\b/gi, "salad"],
    [/\bsalsa\b/gi, "sauce"],
    [/\blimon\b/gi, "lime"],
    [/\blimón\b/gi, "lime"]
  ];

  let translated = text;
  replacements.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });
  return translated.trim();
}

function normalizeMenuSettings(settings) {
  const rawItems = settings?.items && typeof settings.items === "object" ? settings.items : {};
  const items = {};
  BASE_MENU_ITEMS.forEach((baseItem) => {
    const override = rawItems[baseItem.id] || {};
    const price = Number(override.price);
    const note = override.note && typeof override.note === "object" ? override.note : {};
    const noteEs = String(note.es || note.en || "").trim();
    items[baseItem.id] = {
      price: Number.isFinite(price) && price >= 0 ? price : baseItem.price,
      note: {
        es: noteEs,
        en: translateVisibleNoteToEnglish(noteEs)
      },
      isNew: Boolean(override.isNew),
      isSoldOut: Boolean(override.isSoldOut)
    };
  });
  return { items };
}

function productItem(baseItem) {
  const override = menuSettings.items?.[baseItem.id] || {};
  return {
    ...baseItem,
    price: Number.isFinite(Number(override.price)) ? Number(override.price) : baseItem.price,
    note: override.note || { es: "", en: "" },
    isNew: Boolean(override.isNew),
    isSoldOut: Boolean(override.isSoldOut)
  };
}

function isProductEdited(item) {
  const baseItem = BASE_MENU_ITEMS.find((row) => row.id === item.id);
  if (!baseItem) return false;
  return Number(item.price) !== Number(baseItem.price)
    || Boolean(item.isNew)
    || Boolean(item.isSoldOut)
    || Boolean(String(item.note?.es || "").trim());
}

async function refreshMenuSettings() {
  try {
    menuSettings = normalizeMenuSettings(await loadMenuSettings());
  } catch (_error) {
    menuSettings = normalizeMenuSettings({ items: {} });
    showToast(t("productSettingsError"));
  }
  syncOrderCreatorCartWithMenu();
  renderOrderCreator();
  renderProductManager();
}

function filteredProductItems() {
  const search = productManagerSearchTerm.trim().toLowerCase();
  return BASE_MENU_ITEMS
    .map(productItem)
    .filter((item) => productManagerCategory === "all" || item.category === productManagerCategory)
    .filter((item) => !productManagerEditedOnly || isProductEdited(item))
    .filter((item) => {
      if (!search) return true;
      return [
        item.title.es,
        item.title.en,
        menuCategoryLabel(item.category),
        item.note?.es
      ].some((value) => String(value || "").toLowerCase().includes(search));
    });
}

function productManagerRowsHtml(rows) {
  return rows.length ? rows.map((item) => {
    const saveState = productSaveUiState.get(item.id) || "idle";
    const saveLabel = saveState === "saving"
      ? t("productSavingLabel")
      : saveState === "saved"
        ? t("productSavedLabel")
        : t("productSave");
    const saveClass = saveState === "saving"
      ? "is-saving"
      : saveState === "saved"
        ? "is-saved"
        : "";
    const saveDisabled = saveState === "saving" ? "disabled" : "";
    return `
    <article class="product-row" data-product-id="${item.id}">
      <div class="product-row-main">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title[lang])}" loading="lazy" onerror="this.onerror=null;this.src='assets/food.svg';">
        <div>
          <strong>${escapeHtml(item.title[lang])}</strong>
          <span>${escapeHtml(menuCategoryLabel(item.category))}</span>
          ${isProductEdited(item) ? `<span class="product-edited-badge">${escapeHtml(t("productEditedLabel"))}</span>` : ""}
        </div>
      </div>
      <div class="product-row-fields">
        <label>
          <span>${t("productPriceLabel")}</span>
          <input class="product-price-input" type="number" min="0" step="0.01" inputmode="decimal" value="${Number(item.price).toFixed(2)}">
        </label>
        <label class="product-note-field">
          <span>${t("productNoteEsLabel")}</span>
          <textarea class="product-note-es" maxlength="180" autocomplete="off">${escapeHtml(item.note?.es || "")}</textarea>
        </label>
        <label class="product-new-toggle">
          <input class="product-new-input" type="checkbox" ${item.isNew ? "checked" : ""}>
          <span>${t("productNewLabel")}</span>
        </label>
        <label class="product-new-toggle product-soldout-toggle">
          <input class="product-soldout-input" type="checkbox" ${item.isSoldOut ? "checked" : ""}>
          <span>${t("productSoldOutLabel")}</span>
        </label>
        <button
          type="button"
          class="btn btn-outline product-save ${saveClass}"
          data-product-save="${item.id}"
          data-save-state="${saveState}"
          ${saveDisabled}>
          ${saveLabel}
        </button>
      </div>
    </article>
  `;
  }).join("") : `<p class="product-manager-empty">${t("productNoResults")}</p>`;
}

function refreshProductManagerResults() {
  const list = productManager?.querySelector(".product-manager-list");
  if (!list) {
    renderProductManager();
    return;
  }
  list.innerHTML = productManagerRowsHtml(filteredProductItems());
}

function renderProductManager() {
  if (!productManager) return;
  const categories = Array.from(new Set(BASE_MENU_ITEMS.map((item) => item.category)));
  const changedCount = BASE_MENU_ITEMS.filter((item) => {
    const override = menuSettings.items?.[item.id];
    if (!override) return false;
    return Number(override.price) !== Number(item.price)
      || Boolean(override.isNew)
      || Boolean(override.isSoldOut)
      || Boolean(override.note?.es);
  }).length;
  const rows = filteredProductItems();

  productManager.innerHTML = `
    <article class="product-manager-card ${productManagerExpanded ? "is-expanded" : "is-collapsed"}">
      <header class="product-manager-head">
        <div>
          <h3>${t("productManagerTitle")}</h3>
          <p>${productManagerExpanded ? t("productManagerText") : t("productManagerCollapsedText")}</p>
        </div>
        <div class="product-manager-actions">
          <span class="product-manager-pill">${t("productManagerSummary")}: ${BASE_MENU_ITEMS.length} | ${changedCount} ${lang === "es" ? "editados" : "edited"}</span>
          <button
            type="button"
            class="btn btn-primary product-manager-toggle"
            data-product-manager-toggle
            aria-expanded="${productManagerExpanded ? "true" : "false"}">
            ${productManagerExpanded ? t("productManagerHide") : t("productManagerShow")}
          </button>
        </div>
      </header>
      ${productManagerExpanded ? `
        <div class="product-manager-toolbar">
          <label>
            <span>${t("productSearchLabel")}</span>
            <input id="productManagerSearch" type="search" inputmode="search" autocomplete="off" value="${escapeHtml(productManagerSearchTerm)}" placeholder="${escapeHtml(t("productSearchPlaceholder"))}">
          </label>
          <label>
            <span>${t("productCategoryLabel")}</span>
            <select id="productManagerCategory">
              <option value="all" ${productManagerCategory === "all" ? "selected" : ""}>${t("productAllCategories")}</option>
              ${categories.map((category) => `
                <option value="${category}" ${productManagerCategory === category ? "selected" : ""}>${menuCategoryLabel(category)}</option>
              `).join("")}
            </select>
          </label>
          <button
            type="button"
            class="btn ${productManagerEditedOnly ? "btn-primary" : "btn-outline"} product-manager-filter-toggle"
            data-product-edited-filter-toggle
            aria-pressed="${productManagerEditedOnly ? "true" : "false"}">
            ${t("productEditedOnlyLabel")}
          </button>
        </div>
        <div class="product-manager-list">
          ${productManagerRowsHtml(rows)}
        </div>
      ` : ""}
    </article>
  `;
}

function readProductRowValues(productId) {
  const row = productManager?.querySelector(`[data-product-id="${productId}"]`);
  if (!row) return null;
  const baseItem = BASE_MENU_ITEMS.find((item) => item.id === productId);
  if (!baseItem) return null;
  const price = Number(row.querySelector(".product-price-input")?.value || baseItem.price);
  return {
    price: Number.isFinite(price) && price >= 0 ? price : baseItem.price,
    note: {
      es: String(row.querySelector(".product-note-es")?.value || "").trim().slice(0, 180),
      en: translateVisibleNoteToEnglish(row.querySelector(".product-note-es")?.value || "")
    },
    isNew: Boolean(row.querySelector(".product-new-input")?.checked),
    isSoldOut: Boolean(row.querySelector(".product-soldout-input")?.checked)
  };
}

function setProductSaveUiState(productId, state = "idle") {
  if (!productId) return;
  if (!state || state === "idle") productSaveUiState.delete(productId);
  else productSaveUiState.set(productId, state);
  renderProductManager();
}

async function saveProductSettings(productId) {
  const values = readProductRowValues(productId);
  if (!values) return;
  menuSettings = normalizeMenuSettings({
    items: {
      ...(menuSettings.items || {}),
      [productId]: values
    }
  });
  setProductSaveUiState(productId, "saving");
  try {
    menuSettings = normalizeMenuSettings(await withSlowBusyScreen(t("savingAction"), () => saveMenuSettings(menuSettings)));
    setProductSaveUiState(productId, "saved");
    showToast(t("productSaved"));
    window.setTimeout(() => {
      if ((productSaveUiState.get(productId) || "idle") === "saved") {
        setProductSaveUiState(productId, "idle");
      }
    }, 900);
  } catch (_error) {
    setProductSaveUiState(productId, "idle");
    showToast("Error");
  }
}

function orderCreatorItems() {
  return BASE_MENU_ITEMS.map(productItem);
}

function filteredOrderCreatorItems() {
  const search = orderCreatorSearchTerm.trim().toLowerCase();
  return orderCreatorItems()
    .filter((item) => orderCreatorCategory === "all" || item.category === orderCreatorCategory)
    .filter((item) => {
      if (!search) return true;
      return [
        item.title.es,
        item.title.en,
        menuCategoryLabel(item.category),
        item.note?.es,
        item.note?.en
      ].some((value) => String(value || "").toLowerCase().includes(search));
    });
}

function orderCreatorProductsHtml(rows) {
  return rows.length ? rows.map((item) => `
    <button type="button" class="order-product-card" data-order-add="${item.id}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title[lang])}" loading="lazy" onerror="this.onerror=null;this.src='assets/food.svg';">
      <span>
        <strong>${escapeHtml(item.title[lang])}</strong>
        <small>${escapeHtml(menuCategoryLabel(item.category))} | ${escapeHtml(money(item.price))}</small>
      </span>
    </button>
  `).join("") : `<p class="order-creator-empty">${t("productNoResults")}</p>`;
}

function refreshOrderCreatorProducts() {
  const grid = orderCreator?.querySelector(".order-product-grid");
  if (!grid) {
    renderOrderCreator();
    return;
  }
  grid.innerHTML = orderCreatorProductsHtml(filteredOrderCreatorItems());
}

function orderCreatorTotal() {
  return roundMoney(orderCreatorCart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0));
}

function orderCreatorItemCount() {
  return orderCreatorCart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
}

function syncOrderCreatorCartWithMenu() {
  const itemsById = new Map(orderCreatorItems().map((item) => [item.id, item]));
  orderCreatorCart = orderCreatorCart
    .map((cartItem) => {
      const freshItem = itemsById.get(cartItem.id);
      if (!freshItem) return cartItem;
      return {
        ...cartItem,
        title: { ...freshItem.title },
        name: freshItem.title.es,
        category: freshItem.category,
        image: freshItem.image,
        price: freshItem.price
      };
    })
    .filter((cartItem) => Number(cartItem.qty || 0) > 0);
}

function updateOrderCreatorDraftFromForm() {
  if (!orderCreator) return;
  const form = orderCreator.querySelector("#orderCreatorForm");
  if (!form) return;
  orderCreatorDraft = {
    customerName: String(form.elements.customerName?.value || "").trimStart(),
    phone: String(form.elements.phone?.value || "").trimStart(),
    table: String(form.elements.table?.value || "").trimStart(),
    address: String(form.elements.address?.value || "").trimStart(),
    notes: String(form.elements.notes?.value || "").trimStart(),
    paymentMethod: String(form.elements.paymentMethod?.value || "cash"),
    paymentStatus: String(form.elements.paymentStatus?.value || "unpaid")
  };
}

function addOrderCreatorItem(productId) {
  updateOrderCreatorDraftFromForm();
  const item = orderCreatorItems().find((row) => row.id === productId);
  if (!item) return;
  const existing = orderCreatorCart.find((row) => row.id === productId);
  if (existing) existing.qty += 1;
  else {
    orderCreatorCart.push({
      id: item.id,
      name: item.title.es,
      title: { ...item.title },
      category: item.category,
      image: item.image,
      price: item.price,
      qty: 1
    });
  }
  showToast(`${item.title?.[lang] || item.name} ${t("addedToCart")}`, { highlight: true, duration: 1500 });
  renderOrderCreator();
}

function changeOrderCreatorQty(productId, delta) {
  updateOrderCreatorDraftFromForm();
  orderCreatorCart = orderCreatorCart
    .map((row) => row.id === productId ? { ...row, qty: Number(row.qty || 0) + delta } : row)
    .filter((row) => Number(row.qty || 0) > 0);
  renderOrderCreator();
}

function removeOrderCreatorItem(productId) {
  updateOrderCreatorDraftFromForm();
  orderCreatorCart = orderCreatorCart.filter((row) => row.id !== productId);
  renderOrderCreator();
}

function clearOrderCreator() {
  orderCreatorCart = [];
  orderCreatorSearchTerm = "";
  orderCreatorCategory = "all";
  orderCreatorType = "dine_in";
  orderCreatorDraft = {
    customerName: "",
    phone: "",
    table: "",
    address: "",
    notes: "",
    paymentMethod: "cash",
    paymentStatus: "unpaid"
  };
  renderOrderCreator();
}

function renderOrderCreator() {
  if (!orderCreator) return;
  const categories = Array.from(new Set(BASE_MENU_ITEMS.map((item) => item.category)));
  const rows = filteredOrderCreatorItems();
  const total = orderCreatorTotal();
  const count = orderCreatorItemCount();
  const addressHidden = orderCreatorType !== "delivery";
  const tableHidden = orderCreatorType !== "dine_in";
  const phoneHidden = orderCreatorType === "dine_in" || orderCreatorType === "pedidos_ya";
  const nameHidden = orderCreatorType !== "pedidos_ya";

  orderCreator.innerHTML = `
    <article class="order-creator-card ${orderCreatorExpanded ? "is-expanded" : "is-collapsed"}">
      <header class="order-creator-head">
        <div>
          <h3>${t("orderCreatorTitle")}</h3>
          <p>${orderCreatorExpanded ? t("orderCreatorText") : t("orderCreatorCollapsedText")}</p>
        </div>
        <div class="order-creator-actions">
          <span class="order-creator-pill">${count} ${lang === "es" ? "items" : "items"} | ${money(total)}</span>
          <button
            type="button"
            class="btn btn-primary order-creator-toggle"
            data-order-creator-toggle
            aria-expanded="${orderCreatorExpanded ? "true" : "false"}">
            ${orderCreatorExpanded ? t("orderCreatorHide") : t("orderCreatorShow")}
          </button>
        </div>
      </header>
      ${orderCreatorExpanded ? `
        <div class="order-creator-layout">
          <section class="order-product-panel" aria-label="${escapeHtml(t("orderCreatorTitle"))}">
            <div class="order-creator-toolbar">
              <label>
                <span>${t("orderCreatorSearchLabel")}</span>
                <input id="orderCreatorSearch" type="search" inputmode="search" autocomplete="off" value="${escapeHtml(orderCreatorSearchTerm)}" placeholder="${escapeHtml(t("orderCreatorSearchPlaceholder"))}">
              </label>
              <label>
                <span>${t("orderCreatorCategoryLabel")}</span>
                <select id="orderCreatorCategory">
                  <option value="all" ${orderCreatorCategory === "all" ? "selected" : ""}>${t("productAllCategories")}</option>
                  ${categories.map((category) => `
                    <option value="${category}" ${orderCreatorCategory === category ? "selected" : ""}>${menuCategoryLabel(category)}</option>
                  `).join("")}
                </select>
              </label>
            </div>
            <div class="order-product-grid">
              ${orderCreatorProductsHtml(rows)}
            </div>
          </section>

          <section class="order-cart-panel">
            <h4>${t("orderCreatorCartTitle")}</h4>
            <div class="order-creator-cart">
              ${orderCreatorCart.length ? orderCreatorCart.map((item) => `
                <div class="order-creator-cart-row">
                  <div class="order-creator-cart-info">
                    <strong>${escapeHtml(item.title?.[lang] || item.name)}</strong>
                    <p>${escapeHtml(money(item.price))} x ${Number(item.qty || 0)}</p>
                  </div>
                  <div class="order-creator-qty">
                    <button type="button" class="btn btn-outline" data-order-qty="${item.id}" data-delta="-1">-</button>
                    <span>${Number(item.qty || 0)}</span>
                    <button type="button" class="btn btn-outline" data-order-qty="${item.id}" data-delta="1">+</button>
                    <button type="button" class="order-creator-remove" data-order-remove="${item.id}" title="${escapeHtml(t("orderCreatorRemoveItem"))}" aria-label="${escapeHtml(`${t("orderCreatorRemoveItem")} ${item.title?.[lang] || item.name}`)}">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                </div>
              `).join("") : `<p class="order-creator-empty">${t("orderCreatorEmptyCart")}</p>`}
            </div>
            <div class="order-creator-total">
              <span>${t("subtotal")}</span>
              <strong>${money(total)}</strong>
            </div>

            <form id="orderCreatorForm" class="order-creator-form" novalidate>
              <h4>${t("orderCreatorCustomerTitle")}</h4>
              <p class="order-creator-hint">${t("orderCreatorRoutingHint")}</p>
              <label class="full">
                <span>${t("orderCreatorTypeLabel")}</span>
                <select name="orderType" id="orderCreatorType">
                  <option value="dine_in" ${orderCreatorType === "dine_in" ? "selected" : ""}>${t("orderTypeDineIn")}</option>
                  <option value="takeaway" ${orderCreatorType === "takeaway" ? "selected" : ""}>${t("orderTypeTakeaway")}</option>
                  <option value="delivery" ${orderCreatorType === "delivery" ? "selected" : ""}>${t("orderTypeDelivery")}</option>
                  <option value="pedidos_ya" ${orderCreatorType === "pedidos_ya" ? "selected" : ""}>${t("orderTypePedidosYa")}</option>
                </select>
              </label>
              <label class="${nameHidden ? "hidden" : ""}">
                <span>${t("orderCreatorNameLabel")}</span>
                <input name="customerName" type="text" value="${escapeHtml(orderCreatorDraft.customerName)}" autocomplete="name" autocapitalize="words" required>
              </label>
              <label class="${phoneHidden ? "hidden" : ""}">
                <span>${t("orderCreatorPhoneLabel")}</span>
                <input name="phone" type="tel" value="${escapeHtml(orderCreatorDraft.phone)}" inputmode="tel" autocomplete="tel">
              </label>
              <label class="${tableHidden ? "hidden" : ""}">
                <span>${t("orderCreatorTableLabel")}</span>
                <input name="table" type="text" value="${escapeHtml(orderCreatorDraft.table)}" inputmode="numeric" autocomplete="off">
              </label>
              <label class="${addressHidden ? "hidden" : ""}">
                <span>${t("orderCreatorAddressLabel")}</span>
                <input name="address" type="text" value="${escapeHtml(orderCreatorDraft.address)}" autocomplete="street-address">
              </label>
              <label>
                <span>${t("orderCreatorPaymentMethodLabel")}</span>
                <select name="paymentMethod">
                  <option value="cash" ${orderCreatorDraft.paymentMethod === "cash" ? "selected" : ""}>${paymentMethodLabel("cash")}</option>
                  <option value="card" ${orderCreatorDraft.paymentMethod === "card" ? "selected" : ""}>${paymentMethodLabel("card")}</option>
                  <option value="bank_transfer" ${orderCreatorDraft.paymentMethod === "bank_transfer" ? "selected" : ""}>${paymentMethodLabel("bank_transfer")}</option>
                  <option value="pedidos_ya" ${orderCreatorType === "pedidos_ya" || orderCreatorDraft.paymentMethod === "pedidos_ya" ? "selected" : ""}>${paymentMethodLabel("pedidos_ya")}</option>
                </select>
              </label>
              <label>
                <span>${t("orderCreatorPaymentStatusLabel")}</span>
                <select name="paymentStatus">
                  <option value="unpaid" ${orderCreatorDraft.paymentStatus === "unpaid" ? "selected" : ""}>${t("orderCreatorPaymentUnpaid")}</option>
                  <option value="paid" ${orderCreatorDraft.paymentStatus === "paid" ? "selected" : ""}>${t("orderCreatorPaymentPaid")}</option>
                </select>
              </label>
              <label class="full">
                <span>${t("orderCreatorNotesLabel")}</span>
                <textarea name="notes" autocomplete="off">${escapeHtml(orderCreatorDraft.notes)}</textarea>
              </label>
              <div class="order-creator-submit full">
                <button type="button" class="btn btn-outline" data-order-clear>${t("orderCreatorReset")}</button>
                <button type="submit" class="btn btn-primary">${t("orderCreatorSubmit")}</button>
              </div>
            </form>
          </section>
        </div>
      ` : ""}
    </article>
  `;
}

async function submitCRMOrder() {
  updateOrderCreatorDraftFromForm();
  if (!orderCreatorCart.length) {
    showToast(t("orderCreatorNeedItems"));
    return;
  }
  if (orderCreatorType === "dine_in" && !orderCreatorDraft.table.trim()) {
    showToast(t("orderCreatorNeedTable"));
    return;
  }
  if ((orderCreatorType === "takeaway" || orderCreatorType === "delivery") && !orderCreatorDraft.phone.trim()) {
    showToast(t("orderCreatorNeedPhone"));
    return;
  }
  if (orderCreatorType === "delivery" && !orderCreatorDraft.address.trim()) {
    showToast(t("orderCreatorNeedAddress"));
    return;
  }

  const items = orderCreatorCart.map((item) => ({
    id: item.id,
    name: item.title?.es || item.name,
    title: item.title?.[lang] || item.title?.es || item.name,
    category: item.category,
    qty: Number(item.qty || 0),
    price: Number(item.price || 0),
    total: roundMoney(Number(item.qty || 0) * Number(item.price || 0))
  }));
  const total = orderCreatorTotal();
  const customerName = orderCreatorDraft.customerName.trim() || orderCreatorCustomerNameFallback();
  const normalizedOrderType = orderCreatorType === "pedidos_ya" ? "delivery" : orderCreatorType;
  const paymentMethod = orderCreatorType === "pedidos_ya" ? "pedidos_ya" : (orderCreatorDraft.paymentMethod || "cash");
  const paymentStatus = orderCreatorType === "pedidos_ya" ? "paid" : (orderCreatorDraft.paymentStatus || "unpaid");
  const payload = {
    language: lang,
    order_type: normalizedOrderType,
    customer: {
      name: customerName,
      phone: orderCreatorType === "dine_in" || orderCreatorType === "pedidos_ya" ? "" : orderCreatorDraft.phone.trim(),
      table: orderCreatorType === "dine_in" ? orderCreatorDraft.table.trim() : "",
      deliveryAddress: orderCreatorType === "delivery" ? orderCreatorDraft.address.trim() : "",
      comments: orderCreatorDraft.notes.trim(),
      pickup: orderCreatorType === "takeaway",
      delivery: orderCreatorType === "delivery" || orderCreatorType === "pedidos_ya"
    },
    items,
    subtotal: total,
    total,
    payment: {
      method: paymentMethod,
      status: paymentStatus
    }
  };

  try {
    const orderId = await withSlowBusyScreen(t("savingAction"), () => addOrder(payload));
    showToast(`${t("orderCreatorCreated")} #${String(orderId).slice(0, 6)}`);
    clearOrderCreator();
  } catch (error) {
    console.warn("CRM order create failed", error);
    showToast(t("orderCreatorError"));
  }
}

async function refreshFiscalSettings() {
  try {
    const remoteSettings = await loadFiscalSettings();
    fiscalSettings = mergeFiscalSettings(remoteSettings || {});
  } catch (_e) {
    fiscalSettings = mergeFiscalSettings(DEFAULT_FISCAL_SETTINGS);
  }
  updateFiscalRangeAlert();
}

function setFiscalFormValues(settings) {
  if (!fiscalSettingsForm) return;
  fiscalSettingsForm.elements.brandName.value = settings.brandName || "";
  fiscalSettingsForm.elements.legalName.value = settings.legalName || "";
  fiscalSettingsForm.elements.rtn.value = settings.rtn || "";
  fiscalSettingsForm.elements.phone.value = settings.phone || "";
  fiscalSettingsForm.elements.address.value = settings.address || "";
  fiscalSettingsForm.elements.email.value = settings.email || "";
  fiscalSettingsForm.elements.cai.value = settings.cai || "";
  fiscalSettingsForm.elements.emissionDeadline.value = settings.emissionDeadline || "";
  fiscalSettingsForm.elements.authorizationRangeStart.value = settings.authorizationRangeStart || "";
  fiscalSettingsForm.elements.authorizationRangeEnd.value = settings.authorizationRangeEnd || "";
  fiscalSettingsForm.elements.nextInvoiceNumber.value = settings.nextInvoiceNumber || "";
  fiscalSettingsForm.elements.copyLegend.value = settings.copyLegend || "";
  fiscalSettingsForm.elements.taxRatePercent.value = String((Number(settings.taxRate || 0) * 100).toFixed(2));
  fiscalSettingsForm.elements.tax_appetizers.value = String((Number(settings.categoryRates?.appetizers || 0) * 100).toFixed(2));
  fiscalSettingsForm.elements.tax_main_courses.value = String((Number(settings.categoryRates?.main_courses || 0) * 100).toFixed(2));
  fiscalSettingsForm.elements.tax_beverages.value = String((Number(settings.categoryRates?.beverages || 0) * 100).toFixed(2));
  fiscalSettingsForm.elements.tax_desserts.value = String((Number(settings.categoryRates?.desserts || 0) * 100).toFixed(2));
}

function getFiscalFormValues() {
  return {
    brandName: fiscalSettingsForm.elements.brandName.value.trim(),
    legalName: fiscalSettingsForm.elements.legalName.value.trim(),
    rtn: fiscalSettingsForm.elements.rtn.value.trim(),
    phone: fiscalSettingsForm.elements.phone.value.trim(),
    address: fiscalSettingsForm.elements.address.value.trim(),
    email: fiscalSettingsForm.elements.email.value.trim(),
    cai: fiscalSettingsForm.elements.cai.value.trim(),
    emissionDeadline: fiscalSettingsForm.elements.emissionDeadline.value.trim(),
    authorizationRangeStart: fiscalSettingsForm.elements.authorizationRangeStart.value.trim(),
    authorizationRangeEnd: fiscalSettingsForm.elements.authorizationRangeEnd.value.trim(),
    nextInvoiceNumber: fiscalSettingsForm.elements.nextInvoiceNumber.value.trim(),
    copyLegend: fiscalSettingsForm.elements.copyLegend.value.trim(),
    taxRate: Number(fiscalSettingsForm.elements.taxRatePercent.value || 0) / 100,
    categoryRates: {
      appetizers: Number(fiscalSettingsForm.elements.tax_appetizers.value || 0) / 100,
      main_courses: Number(fiscalSettingsForm.elements.tax_main_courses.value || 0) / 100,
      beverages: Number(fiscalSettingsForm.elements.tax_beverages.value || 0) / 100,
      desserts: Number(fiscalSettingsForm.elements.tax_desserts.value || 0) / 100
    }
  };
}

function openCrmSettingsModal() {
  if (!crmSettingsModal) return;
  crmSettingsModal.classList.remove("hidden");
}

function closeCrmSettingsModal() {
  if (!crmSettingsModal) return;
  crmSettingsModal.classList.add("hidden");
}

function closeOrderCreatorModal() {
  if (!orderCreatorModal) return;
  updateOrderCreatorDraftFromForm();
  orderCreatorModal.classList.add("hidden");
}

function closeProductManagerModal() {
  if (!productManagerModal) return;
  productManagerModal.classList.add("hidden");
}

function closeTermsReportModal() {
  if (!termsReportModal) return;
  termsReportModal.classList.add("hidden");
}

function closeFoodReportModal() {
  if (!foodReportModal) return;
  foodReportModal.classList.add("hidden");
}

function closeCrmWorkModals() {
  closeOrderCreatorModal();
  closeProductManagerModal();
  closeTermsReportModal();
  closeFoodReportModal();
}

async function showCrmWorkspaceTool(tool) {
  closeCrmSettingsModal();

  if (tool === "order") {
    updateOrderCreatorDraftFromForm();
    orderCreatorExpanded = true;
    renderOrderCreator();
    closeProductManagerModal();
    closeTermsReportModal();
    closeFoodReportModal();
    orderCreatorModal?.classList.remove("hidden");
    return;
  }

  if (tool === "products") {
    productManagerExpanded = true;
    renderProductManager();
    closeOrderCreatorModal();
    closeTermsReportModal();
    closeFoodReportModal();
    productManagerModal?.classList.remove("hidden");
    return;
  }

  if (tool === "terms-report") {
    closeOrderCreatorModal();
    closeProductManagerModal();
    closeFoodReportModal();
    termsReportModal?.classList.remove("hidden");
    renderTermsReport();
    await refreshTermsReportData();
    return;
  }

  if (tool === "food-report") {
    closeOrderCreatorModal();
    closeProductManagerModal();
    closeTermsReportModal();
    foodReportModal?.classList.remove("hidden");
    renderFoodReport();
    await refreshFoodReportData();
  }
}

async function openFiscalSettingsModal() {
  if (!currentStaffUser || !fiscalSettingsModal) return;
  await refreshFiscalSettings();
  setFiscalFormValues(fiscalSettings);
  fiscalSettingsModal.classList.remove("hidden");
  updateFiscalRangeAlert();
}

function closeFiscalSettingsModal() {
  if (!fiscalSettingsModal) return;
  fiscalSettingsModal.classList.add("hidden");
  updateFiscalRangeAlert();
}

function updateFiscalRangeAlert() {
  if (!fiscalRangeAlert) return;
  const rangeCheck = validateFiscalRange(fiscalSettings);
  const reason = rangeCheck.reason;
  const modalOpen = fiscalSettingsModal && !fiscalSettingsModal.classList.contains("hidden");
  const showAlert = Boolean(
    currentStaffUser &&
    currentStaffProfile &&
    !modalOpen &&
    (reason === "exhausted" || reason === "expired")
  );
  fiscalRangeAlert.classList.toggle("hidden", !showAlert);
  if (!showAlert) return;
  if (fiscalRangeAlertTitle) fiscalRangeAlertTitle.textContent = t("fiscalRangeAlertTitle");
  if (fiscalRangeAlertText) {
    fiscalRangeAlertText.textContent = reason === "expired"
      ? t("fiscalRangeAlertDeadlineText")
      : t("fiscalRangeAlertRangeText");
  }
  if (fiscalRangeAlertButton) fiscalRangeAlertButton.textContent = t("fiscalRangeAlertAction");
}

function invoiceStateLabel(order) {
  if (order?.status === "delivered") return orderStatusLabel("delivered");
  return orderStatusLabel(order?.status || "pending");
}

function defaultInvoiceData(order) {
  const hasCustomerInvoiceRequest = Boolean(
    order?.customer?.needsInvoice ||
    String(order?.invoice?.billingName || "").trim() ||
    String(order?.invoice?.billingRTN || "").trim()
  );
  return {
    billingName: hasCustomerInvoiceRequest
      ? String(order?.invoice?.billingName || "").trim()
      : "",
    billingRTN: hasCustomerInvoiceRequest
      ? String(order?.invoice?.billingRTN || "").trim()
      : "",
    invoiceNumber: String(order?.invoice?.invoiceNumber || "").trim(),
    notes: String(order?.invoice?.notes || "").trim(),
    fiscalPrintedAt: String(order?.invoice?.fiscalPrintedAt || "").trim(),
    hasExoneration: Boolean(order?.invoice?.hasExoneration),
    exemptionRegister: String(order?.invoice?.exemptionRegister || "").trim(),
    exemptOrderNumber: String(order?.invoice?.exemptOrderNumber || "").trim(),
    sagRegister: String(order?.invoice?.sagRegister || "").trim()
  };
}

function orderCreatorCustomerNameFallback() {
  const table = orderCreatorDraft.table.trim();
  if (orderCreatorType === "dine_in") {
    return table
      ? `${lang === "es" ? "Mesa" : "Table"} ${table}`
      : (lang === "es" ? "Cliente en restaurante" : "Dine-in customer");
  }
  if (orderCreatorType === "pedidos_ya") return "Pedidos Ya";
  if (orderCreatorType === "delivery") return lang === "es" ? "Cliente delivery" : "Delivery customer";
  return lang === "es" ? "Cliente para llevar" : "Pickup customer";
}

function normalizeInvoiceDraftData(invoiceData = {}) {
  return {
    billingName: String(invoiceData.billingName || "").trim(),
    billingRTN: String(invoiceData.billingRTN || "").trim(),
    invoiceNumber: String(invoiceData.invoiceNumber || "").trim(),
    notes: String(invoiceData.notes || "").trim(),
    fiscalPrintedAt: String(invoiceData.fiscalPrintedAt || "").trim(),
    hasExoneration: Boolean(invoiceData.hasExoneration),
    exemptionRegister: String(invoiceData.exemptionRegister || "").trim(),
    exemptOrderNumber: String(invoiceData.exemptOrderNumber || "").trim(),
    sagRegister: String(invoiceData.sagRegister || "").trim()
  };
}

function serializeInvoiceDraft(invoiceData = {}) {
  return JSON.stringify(normalizeInvoiceDraftData(invoiceData));
}

function visibleInvoiceData(order) {
  const base = defaultInvoiceData(order);
  if (!order?.id || !invoiceDraftPendingValues.has(order.id)) return base;
  return {
    ...base,
    ...invoiceDraftPendingValues.get(order.id)
  };
}

function fiscalPrintButtonLabel(order) {
  const fiscalPrintedAt = String(order?.invoice?.fiscalPrintedAt || "").trim();
  return fiscalPrintedAt ? t("btnFiscalReprint") : t("btnFiscalPrint");
}

function hasCustomerInvoiceRequest(order) {
  return Boolean(
    order?.customer?.needsInvoice ||
    String(order?.invoice?.billingName || "").trim() ||
    String(order?.invoice?.billingRTN || "").trim()
  );
}

function renderInvoiceRequestNotice(order) {
  return hasCustomerInvoiceRequest(order)
    ? `<p><strong>${t("invoiceRequestSummary")}</strong></p>`
    : "";
}

function renderOrderComments(order) {
  const comments = String(order?.customer?.comments || "").trim();
  return comments ? `<p>${t("orderComments")}: ${escapeHtml(comments)}</p>` : "";
}

function renderOrderTableLine(order) {
  const table = String(order?.customer?.table || "").trim();
  return table ? `<p><strong>${t("orderTableLabel")}:</strong> ${escapeHtml(table)}</p>` : "";
}

function parseFiscalNumber(value) {
  const normalized = String(value || "").trim();
  const parts = normalized.split("-");
  if (parts.length < 4) return null;
  const serial = parts[parts.length - 1];
  const prefix = parts.slice(0, -1).join("-");
  const numeric = Number(serial);
  if (!prefix || !serial || !Number.isInteger(numeric)) return null;
  return { prefix, serial, width: serial.length, numeric };
}

function parseFiscalDeadline(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 23, 59, 59, 999);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateFiscalRange(settings) {
  const start = parseFiscalNumber(settings.authorizationRangeStart);
  const end = parseFiscalNumber(settings.authorizationRangeEnd);
  const nextRaw = String(settings.nextInvoiceNumber || "").trim();
  const lastIssued = parseFiscalNumber(settings.lastIssuedInvoiceNumber);
  const next = nextRaw ? parseFiscalNumber(nextRaw) : null;
  const deadline = parseFiscalDeadline(settings.emissionDeadline);
  if (!start || !end) return { ok: false, reason: "invalid" };
  if (deadline && Date.now() > deadline.getTime()) return { ok: false, reason: "expired" };
  if (start.prefix !== end.prefix) return { ok: false, reason: "invalid" };
  if (!next) {
    if (lastIssued && lastIssued.prefix === end.prefix && lastIssued.numeric >= end.numeric) {
      return { ok: false, reason: "exhausted" };
    }
    return { ok: false, reason: "invalid" };
  }
  if (next.prefix !== start.prefix) return { ok: false, reason: "invalid" };
  if (start.numeric > end.numeric) return { ok: false, reason: "invalid" };
  if (next.numeric < start.numeric || next.numeric > end.numeric + 1) return { ok: false, reason: "invalid" };
  if (next.numeric > end.numeric) return { ok: false, reason: "exhausted" };
  return { ok: true };
}

function resolveItemTaxRate(item) {
  if (typeof item?.taxRate === "number") return item.taxRate;
  const categoryRate = fiscalSettings.categoryRates[item?.category];
  if (typeof categoryRate === "number") return categoryRate;
  return fiscalSettings.taxRate;
}

function buildFiscalBreakdown(order) {
  const lines = (order.items || []).map((item) => {
    const qty = Number(item.qty || 0);
    const unitPrice = Number(item.price || 0);
    const gross = roundMoney(qty * unitPrice);
    const taxRate = resolveItemTaxRate(item);
    if (!taxRate) {
      return {
        item,
        qty,
        unitPrice,
        gross,
        taxRate: 0,
        taxableBase: 0,
        exemptAmount: gross,
        taxAmount: 0
      };
    }

    const taxableBase = roundMoney(gross / (1 + taxRate));
    const taxAmount = roundMoney(gross - taxableBase);
    return {
      item,
      qty,
      unitPrice,
      gross,
      taxRate,
      taxableBase,
      exemptAmount: 0,
      taxAmount
    };
  });

  const exemptAmount = roundMoney(lines.reduce((sum, row) => sum + row.exemptAmount, 0));
  const taxableAmount = roundMoney(lines.reduce((sum, row) => sum + row.taxableBase, 0));
  const taxAmount = roundMoney(lines.reduce((sum, row) => sum + row.taxAmount, 0));
  const subtotal = roundMoney(exemptAmount + taxableAmount);
  const total = roundMoney(subtotal + taxAmount);

  return { lines, exemptAmount, taxableAmount, taxAmount, subtotal, total };
}


function formatDate(value) {
  if (!value) return "-";
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString(lang === "es" ? "es-ES" : "en-US");
}

function buildPrintableOrderHtml(order) {
  const orderRef = `#${escapeHtml(order.displayId || order.id.slice(0, 6))}`;
  const createdAt = formatDate(order.createdAt);
  const customerName = escapeHtml(order.customer?.name || "Consumidor final");
  const businessName = escapeHtml(fiscalSettings.brandName || "Frida Restaurant");
  const businessPhone = escapeHtml(fiscalSettings.phone || "-");
  const businessEmail = escapeHtml(fiscalSettings.email || "info@fridarestaurant.hn");
  const businessAddress = escapeHtml(fiscalSettings.address || "-");
  const paymentMethodText = escapeHtml(paymentMethodLabel(invoicePaymentMethod(order)));
  const amountInWords = escapeHtml(amountToWordsEs(order.total).toUpperCase());
  const logoUrl = new URL("assets/icon.jpg", window.location.href).href;
  const itemRows = (order.items || [])
    .map((item) => {
      const title = escapeHtml(foodName(item));
      const qty = Number(item.qty || 0);
      const unitPrice = Number(item.price || 0);
      const lineTotal = qty * unitPrice;
      return `
        <div class="line-item">
          <div class="line-main">${qty} x ${escapeHtml(money(unitPrice))} ${title}</div>
          <div class="line-total">${escapeHtml(money(lineTotal))}</div>
        </div>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html lang="${lang}">
    <head>
      <meta charset="utf-8">
      <title>Frida Restaurant ${orderRef}</title>
      <style>
        @page { size: ${THERMAL_ROLL_WIDTH} auto; margin: 0; }
        * { box-sizing: border-box; }
        html,
        body {
          margin: 0;
          padding: 0;
          width: ${THERMAL_ROLL_WIDTH};
          min-width: ${THERMAL_ROLL_WIDTH};
          color: #000;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11.5px;
          line-height: 1.3;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          overflow-x: hidden;
        }
        .ticket {
          width: ${THERMAL_ROLL_WIDTH};
          max-width: ${THERMAL_ROLL_WIDTH};
          padding: 3mm;
        }
        .center { text-align: center; }
        .logo {
          width: 42mm;
          max-width: 100%;
          display: block;
          margin: 0 auto 4mm;
          filter: grayscale(100%);
        }
        h1, h2, p { margin: 0; }
        .brand-title {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.35px;
          margin-bottom: 2px;
        }
        .muted { margin-top: 1px; }
        .row, .line-item, .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }
        .row strong:last-child,
        .line-total,
        .summary-row strong:last-child,
        .summary-row span:last-child {
          text-align: right;
          white-space: nowrap;
        }
        .section { margin-top: 4mm; }
        .rule {
          border-top: 1px dashed #000;
          margin: 3mm 0 2mm;
        }
        .header-rule {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 1mm 0;
          margin: 3mm 0 2mm;
          font-weight: 700;
        }
        .line-item { padding: 1mm 0; align-items: flex-start; }
        .line-main { flex: 1; }
        .summary { margin-top: 2mm; }
        .summary-row { padding: 0.8mm 0; }
        .summary-row.total {
          font-size: 14px;
          font-weight: 700;
        }
        .amount-words {
          margin-top: 3mm;
          text-align: center;
          font-weight: 700;
        }
        .thanks {
          margin-top: 5mm;
          text-align: center;
          font-weight: 700;
        }
        @media print {
          html,
          body,
          .ticket {
            width: ${THERMAL_ROLL_WIDTH};
            max-width: ${THERMAL_ROLL_WIDTH};
          }
          body {
            margin: 0;
          }
        }
      </style>
      <script>
        window.addEventListener("load", () => {
          const logo = document.querySelector(".logo");
          const triggerPrint = () => {
            window.focus();
            window.print();
          };
          if (logo && !logo.complete) {
            logo.addEventListener("load", triggerPrint, { once: true });
            logo.addEventListener("error", triggerPrint, { once: true });
            setTimeout(triggerPrint, 800);
          } else {
            setTimeout(triggerPrint, 150);
          }
        });
      </script>
    </head>
    <body>
      <div class="ticket">
        <div class="center">
          <img class="logo" src="${escapeHtml(logoUrl)}" alt="Frida Restaurant">
          <p class="brand-title">${businessName}</p>
          <p class="muted">TEL: ${businessPhone}</p>
          <p class="muted">${businessEmail}</p>
          <p class="muted">${businessAddress}</p>
        </div>
        <div class="section">
          <div class="row">
            <strong>${lang === "es" ? "TICKET" : "TICKET"}</strong>
            <strong>${lang === "es" ? "FECHA" : "DATE"}</strong>
          </div>
          <div class="row">
            <span>${orderRef}</span>
            <span>${escapeHtml(createdAt)}</span>
          </div>
        </div>
        <div class="section">
          <strong>${lang === "es" ? "CLIENTE" : "CUSTOMER"}: ${customerName}</strong>
        </div>
        <div class="section">
          <p><strong>${lang === "es" ? "ESTADO" : "STATUS"}:</strong> ${escapeHtml(lang === "es" ? "Entregado" : "Delivered")}</p>
          <p><strong>${lang === "es" ? "PAGO" : "PAYMENT"}:</strong> ${paymentMethodText}</p>
        </div>
        <div class="header-rule">${lang === "es" ? "CANTIDAD / PRECIO / DESCRIPCION" : "QTY / PRICE / DESCRIPTION"} <span style="float:right;">${lang === "es" ? "TOTAL" : "TOTAL"}</span></div>
        <div>${itemRows}</div>
        <div class="rule"></div>
        <div class="summary">
          <div class="summary-row"><span>${lang === "es" ? "DESCUENTO" : "DISCOUNT"}</span><span>${escapeHtml(money(0))}</span></div>
          <div class="summary-row"><span>${lang === "es" ? "IMPORTE GRAVADO" : "TAXABLE AMOUNT"}</span><span>${escapeHtml(money(order.total))}</span></div>
          <div class="summary-row total"><strong>${lang === "es" ? "TOTAL A PAGAR" : "TOTAL DUE"}</strong><strong>${escapeHtml(money(order.total))}</strong></div>
          <div class="amount-words">${amountInWords}</div>
          <div class="summary-row"><span>${lang === "es" ? "PAGO" : "PAYMENT"}</span><span>${escapeHtml(money(order.total))}</span></div>
          <div class="summary-row"><span>${lang === "es" ? "CAMBIO" : "CHANGE"}</span><span>${escapeHtml(money(0))}</span></div>
        </div>
        <p class="thanks">${lang === "es" ? "MUCHAS GRACIAS, TE ESPERAMOS PRONTO" : "THANK YOU, SEE YOU SOON"}</p>
      </div>
    </body>
    </html>
  `;
}

async function printOrder(orderId) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return;
  const printWindow = window.open("", "_blank", "width=420,height=900");
  if (!printWindow) return;
  try {
    printWindow.opener = null;
  } catch (_error) {
    // Ignore browsers that block changing opener.
  }
  printWindow.document.open();
  printWindow.document.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>Imprimiendo...</title></head><body style=\"font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.35;padding:16px;\">Preparando factura...</body></html>");
  printWindow.document.close();
  await refreshFiscalSettings();
  printWindow.document.open();
  printWindow.document.write(buildPrintableOrderHtml(order));
  printWindow.document.close();
}

function buildFiscalPrintableOrderHtml(order) {
  const invoice = defaultInvoiceData(order);
  const createdAt = parseDate(order.createdAt) || new Date();
  const createdAtDateText = createdAt.toLocaleDateString(lang === "es" ? "es-HN" : "en-US");
  const createdAtTimeText = createdAt.toLocaleTimeString(lang === "es" ? "es-HN" : "en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
  const customerName = escapeHtml(invoice.billingName || t("customerFinalConsumer"));
  const customerRTN = escapeHtml(invoice.billingRTN || t("customerRTNDefault"));
  const orderPhone = escapeHtml(order.customer?.phone || "-");
  const invoiceNumber = escapeHtml(invoice.invoiceNumber || "PENDIENTE");
  const logoUrl = new URL("assets/casa-brava-logo.jpg", window.location.href).href;
  const breakdown = buildFiscalBreakdown(order);
  const amountInWords = escapeHtml(amountToWordsEs(breakdown.total).toUpperCase());
  const lineRows = breakdown.lines.map((row) => {
    const itemTitle = escapeHtml(foodName(row.item));
    const taxPercent = Math.round(row.taxRate * 100);
    const taxLabel = row.taxRate ? `ISV ${taxPercent}%` : "ISV 0%";
    return `
      <div class="line-item">
        <div class="line-main">${row.qty} X ${escapeHtml(roundMoney(row.unitPrice).toFixed(2))} ${itemTitle.toUpperCase()}</div>
        <div class="line-total">${escapeHtml(money(row.gross))}</div>
      </div>
      <div class="tax-row">${taxLabel}: ${escapeHtml(money(row.taxAmount))}</div>
    `;
  }).join("");
  const exonerationBlock = invoice.hasExoneration
    ? `
      <p>${t("invoiceExemptionRegister").toUpperCase()}: ${escapeHtml(invoice.exemptionRegister)}</p>
      <p>${t("invoiceExemptOrder").toUpperCase()}: ${escapeHtml(invoice.exemptOrderNumber)}</p>
      <p>${t("invoiceSagRegister").toUpperCase()}: ${escapeHtml(invoice.sagRegister)}</p>
    `
    : "";

  function buildCopy(copyLabel) {
    return `
      <div class="ticket">
        <div class="center">
          <img class="logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(fiscalSettings.brandName)}">
          <p class="brand-title">${escapeHtml(fiscalSettings.brandName)}</p>
          <p><strong>${escapeHtml(fiscalSettings.legalName)}</strong></p>
          <p class="muted">RTN: ${escapeHtml(fiscalSettings.rtn)} TEL: ${escapeHtml(fiscalSettings.phone)}</p>
          <p class="muted">${escapeHtml(fiscalSettings.address)}</p>
          <p class="muted">${escapeHtml(fiscalSettings.email)}</p>
        </div>
        <div class="section">
          <div class="row invoice-meta-head">
            <strong>${t("invoiceLabel").toUpperCase()}</strong>
            <strong>${lang === "es" ? "FECHA" : "DATE"}</strong>
          </div>
          <div class="row invoice-meta-values">
            <span>${invoiceNumber}</span>
            <span class="invoice-datetime">
              <span>${escapeHtml(createdAtDateText)}</span>
              <span>${escapeHtml(createdAtTimeText)}</span>
            </span>
          </div>
        </div>
        <div class="section center">
          <p class="big-customer"><strong>${lang === "es" ? "CLIENTE" : "CUSTOMER"}:</strong> ${customerName}</p>
          <p><strong>RTN:</strong> ${customerRTN}</p>
          <p><strong>TEL:</strong> ${orderPhone}</p>
        </div>
        <div class="section">
          <p><strong>${lang === "es" ? "ESTADO" : "STATUS"}:</strong> ${escapeHtml(invoiceStateLabel(order))}</p>
          <p><strong>${lang === "es" ? "PAGO" : "PAYMENT"}:</strong> ${escapeHtml(paymentMethodLabel(invoicePaymentMethod(order)))}</p>
          ${invoice.notes ? `<p><strong>${t("invoiceNotes").toUpperCase()}:</strong> ${escapeHtml(invoice.notes)}</p>` : ""}
        </div>
        <div class="header-rule">${lang === "es" ? "CANTIDAD / PRECIO / DESCRIPCION" : "QTY / PRICE / DESCRIPTION"} <span style="float:right;">${lang === "es" ? "TOTAL" : "TOTAL"}</span></div>
        <div>${lineRows}</div>
        <div class="rule"></div>
        <div class="summary">
          <div class="summary-row"><span>${lang === "es" ? "DESCUENTO" : "DISCOUNT"}</span><span>${escapeHtml(money(0))}</span></div>
          <div class="summary-row"><span>${t("subtotal").toUpperCase()}</span><span>${escapeHtml(money(breakdown.subtotal))}</span></div>
          <div class="summary-row"><span>${t("exemptAmount").toUpperCase()}</span><span>${escapeHtml(money(breakdown.exemptAmount))}</span></div>
          <div class="summary-row"><span>${t("taxableAmount").toUpperCase()}</span><span>${escapeHtml(money(breakdown.taxableAmount))}</span></div>
          <div class="summary-row"><span>${t("taxAmount").toUpperCase()}</span><span>${escapeHtml(money(breakdown.taxAmount))}</span></div>
          <div class="summary-row total"><strong>${lang === "es" ? "TOTAL A PAGAR" : "TOTAL DUE"}</strong><strong>${escapeHtml(money(breakdown.total))}</strong></div>
        </div>
        <div class="amount-words">${amountInWords}</div>
        <div class="section center">
          <div class="summary-row"><span>${lang === "es" ? "PAGO" : "PAYMENT"}</span><span>${escapeHtml(money(breakdown.total))}</span></div>
          <div class="summary-row"><span>${lang === "es" ? "CAMBIO" : "CHANGE"}</span><span>${escapeHtml(money(0))}</span></div>
        </div>
        <div class="section center">
          <p>CAI: ${escapeHtml(fiscalSettings.cai)}</p>
          <p>${lang === "es" ? "RANGO AUTORIZADO" : "AUTHORIZED RANGE"}: ${escapeHtml(fiscalSettings.authorizationRangeStart)} / ${escapeHtml(fiscalSettings.authorizationRangeEnd)}</p>
          <p>${lang === "es" ? "FECHA LIMITE DE EMISION" : "ISSUE DEADLINE"}: ${escapeHtml(fiscalSettings.emissionDeadline)}</p>
          <p>${escapeHtml(copyLabel)}</p>
          ${exonerationBlock}
        </div>
      </div>
    `;
  }

  return `
    <!doctype html>
    <html lang="${lang}">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(fiscalSettings.brandName)} ${invoiceNumber}</title>
      <style>
        @page { size: ${THERMAL_ROLL_WIDTH} auto; margin: 0; }
        * { box-sizing: border-box; }
        html,
        body {
          margin: 0;
          padding: 0;
          width: ${THERMAL_ROLL_WIDTH};
          min-width: ${THERMAL_ROLL_WIDTH};
          color: #000;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11.5px;
          line-height: 1.25;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          overflow-x: hidden;
        }
        .ticket {
          width: ${THERMAL_ROLL_WIDTH};
          max-width: ${THERMAL_ROLL_WIDTH};
          padding: 3mm;
        }
        .ticket-copy + .ticket-copy {
          page-break-before: always;
          break-before: page;
        }
        .center { text-align: center; }
        .logo {
          width: 42mm;
          max-width: 100%;
          display: block;
          margin: 0 auto 4mm;
          filter: grayscale(100%);
        }
        p { margin: 0; }
        .brand-title {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.3px;
          margin: 1mm 0 0.4mm;
        }
        .muted { margin-top: 1px; }
        .row, .line-item, .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }
        .invoice-meta-head,
        .invoice-meta-values {
          display: grid;
          grid-template-columns: minmax(0, 24mm) minmax(0, 38mm);
          column-gap: 4mm;
          align-items: start;
        }
        .invoice-meta-head strong:last-child,
        .invoice-meta-values span:last-child {
          text-align: right;
        }
        .invoice-meta-values span {
          display: block;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .invoice-datetime {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1mm;
        }
        .invoice-meta-values span:first-child {
          padding-right: 2mm;
        }
        .section { margin-top: 4mm; }
        .rule {
          border-top: 1px solid #000;
          margin: 3mm 0 2mm;
        }
        .header-rule {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 1mm 0;
          margin: 3mm 0 2mm;
          font-weight: 700;
        }
        .line-item { padding-top: 1mm; align-items: flex-start; }
        .line-main { flex: 1; }
        .line-total, .summary-row span:last-child, .summary-row strong:last-child {
          text-align: right;
          white-space: nowrap;
        }
        .tax-row {
          padding-left: 4mm;
          margin-top: 0.5mm;
        }
        .summary {
          margin-top: 1mm;
        }
        .summary-row {
          padding: 0.5mm 0;
        }
        .summary-row.total {
          font-size: 14px;
          font-weight: 700;
        }
        .big-customer {
          font-size: 12.5px;
          font-weight: 700;
        }
        .amount-words,
        .thanks,
        .notice {
          text-align: center;
          margin-top: 3mm;
        }
        .notice {
          font-size: 9.5px;
          font-weight: 700;
        }
        @media print {
          html,
          body,
          .ticket,
          .ticket-copy {
            width: ${THERMAL_ROLL_WIDTH};
            max-width: ${THERMAL_ROLL_WIDTH};
          }
          body {
            margin: 0;
          }
        }
      </style>
      <script>
        window.addEventListener("load", () => {
          const logo = document.querySelector(".logo");
          const triggerPrint = () => {
            window.focus();
            window.print();
          };
          if (logo && !logo.complete) {
            logo.addEventListener("load", triggerPrint, { once: true });
            logo.addEventListener("error", triggerPrint, { once: true });
            setTimeout(triggerPrint, 800);
          } else {
            setTimeout(triggerPrint, 150);
          }
        });
      </script>
    </head>
    <body>
      <div class="ticket-copy">
        ${buildCopy("ORIGINAL: CLIENTE")}
      </div>
      <div class="ticket-copy">
        ${buildCopy("COPIA: EMISOR")}
      </div>
    </body>
    </html>
  `;
}

async function printFiscalOrder(orderId) {
  const printWindow = window.open("", "_blank", "width=420,height=900");
  if (!printWindow) return;
  try {
    printWindow.opener = null;
  } catch (_error) {
    // Ignore browsers that block changing opener.
  }
  printWindow.document.open();
  printWindow.document.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>Imprimiendo...</title></head><body style=\"font-family:Arial,Helvetica,sans-serif;padding:16px;\">Preparando factura fiscal...</body></html>");
  printWindow.document.close();
  const order = await ensureInvoiceDataBeforePrint(orderId);
  if (!order) {
    printWindow.close();
    return;
  }
  const fiscalOrder = order.invoice?.fiscalPrintedAt
    ? order
    : ((await persistInvoiceData(orderId, {
        ...defaultInvoiceData(order),
        fiscalPrintedAt: new Date().toISOString()
      })) && (ordersCache.find((row) => row.id === orderId) || order));
  printWindow.document.open();
  printWindow.document.write(buildFiscalPrintableOrderHtml(fiscalOrder));
  printWindow.document.close();
}

function parseDate(value) {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function routeForStaffRole(role) {
  if (role === "agent") return "/agent.html";
  if (role === "kitchen") return "/kitchen.html";
  return "/crm.html";
}

function redirectIfWrongPanel(profile) {
  const targetPath = routeForStaffRole(profile?.role || "");
  if (!targetPath || window.location.pathname.endsWith(targetPath)) return false;
  window.location.replace(`${targetPath}${window.location.search}${window.location.hash}`);
  return true;
}

function activePeriodRange() {
  const now = new Date();
  if (activePeriod === "day") {
    const start = new Date(now);
    const end = new Date(now);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (activePeriod === "week") {
    const start = new Date(now);
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function activePeriodSummaryLabel() {
  if (activePeriod === "day") return t("period_day");
  if (activePeriod === "week") {
    const { start, end } = activePeriodRange();
    const locale = lang === "es" ? "es-ES" : "en-US";
    const options = { day: "numeric", month: "short" };
    return `${t("period_week")}: ${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`;
  }
  return `${t("period_month")}: ${monthLabel(calendarMonth)}`;
}

function inActivePeriod(value) {
  const date = parseDate(value);
  if (!date) return false;
  const { start, end } = activePeriodRange();
  return date >= start && date <= end;
}

function orderSalesDateValue(order) {
  if (!order || order.status !== "delivered") return order?.createdAt;
  return order.deliveredAt || order.createdAt;
}

function salesRowsForPeriod() {
  return ordersCache.filter((order) => inActivePeriod(order.status === "delivered" ? orderSalesDateValue(order) : order.createdAt));
}

function reservationsForPeriod() {
  return reservationsCache.filter((res) => inActivePeriod(res.createdAt));
}

function acceptedSalesRows() {
  return salesRowsForPeriod().filter((order) => order.status === "delivered");
}

function updateLanguageToggleButtons() {
  const nextLabel = lang === "es" ? "EN" : "ES";
  if (langToggleDesktop) langToggleDesktop.textContent = nextLabel;
  if (langToggleMobile) langToggleMobile.textContent = nextLabel;
}

function applyI18n() {
  document.documentElement.lang = lang;
  updateLanguageToggleButtons();
  updateStatusFilterButtonsForView(currentCRMView());
  const shortLabel = window.matchMedia("(max-width: 560px)").matches;
  signOutBtn.textContent = shortLabel ? t("signOutShort") : t("signOut");
  periodButtons.forEach((button) => {
    const label = t(`period_${button.dataset.period}`);
    button.textContent = label;
  });
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  updateStatusFilterButtonsForView(currentCRMView());
  renderStats();
  renderFoodStats();
  renderSalesCalendar();
  renderOrderCreator();
  renderProductManager();
  renderTermsReport();
  renderFoodReport();
  renderOrders();
  renderReservations();
}

function currentCRMView() {
  return viewButtons.find((button) => button.classList.contains("active"))?.dataset.view || "orders";
}

function showCRMView(view) {
  const nextView = view === "reservations" ? "reservations" : "orders";
  viewButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === nextView));
  ordersView.classList.toggle("hidden", nextView !== "orders");
  reservationsView.classList.toggle("hidden", nextView !== "reservations");
  updateStatusFilterButtonsForView(nextView);
}

function updateStatusFilterButtonsForView(view) {
  const isReservations = view === "reservations";
  const configs = isReservations
    ? [
        { filter: "all", label: t("filterAll") },
        { filter: "pending", label: t("reservationStatus_pending") },
        { filter: "accepted", label: t("reservationStatus_accepted") },
        { filter: "rejected", label: t("reservationStatus_rejected") }
      ]
    : [
        { filter: "all", label: t("filterAll") },
        { filter: "pending", label: t("filterPending") },
        { filter: "preparing", label: t("filterPreparing") },
        { filter: "ready", label: t("filterReady") },
        { filter: "delivered", label: t("filterDelivered") },
        { filter: "rejected", label: t("filterRejected") }
      ];
  const active = isReservations ? activeReservationFilter : activeFilter;
  filterButtons.forEach((button, index) => {
    const config = configs[index];
    button.classList.toggle("hidden", !config);
    if (!config) return;
    button.dataset.filter = config.filter;
    button.textContent = config.label;
    button.classList.toggle("active", active === config.filter);
  });
}

function filteredOrders() {
  return ordersCache
    .filter((o) => !hiddenOrderIds.has(String(o.id)))
    .filter((o) => (activeFilter === "all" ? true : o.status === activeFilter));
}

function filteredReservations() {
  return reservationsCache.filter((reservation) => (
    activeReservationFilter === "all"
      ? true
      : normalizeReservationStatus(reservation.status) === activeReservationFilter
  ));
}

function renderStats() {
  const periodOrders = salesRowsForPeriod();
  const periodReservations = reservationsForPeriod();
  const pending = periodOrders.filter((o) => o.status === "pending").length;
  const progress = periodOrders.filter((o) => o.status === "preparing").length;
  const ready = periodOrders.filter((o) => o.status === "ready").length;
  const acceptedOrders = periodOrders.filter((o) => o.status === "delivered");
  const revenue = acceptedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const avgTicket = acceptedOrders.length ? revenue / acceptedOrders.length : 0;
  statsGrid.innerHTML = `
    <article class="stats-panel-card">
      <header class="stats-panel-head">
        <h3>${t("statsSummary")} (${activePeriodSummaryLabel()})</h3>
      </header>
      <div class="stats-groups">
        <section class="stats-group">
          <h4>${t("statsOps")}</h4>
          <div class="stats-subgrid">
            <article class="stat-card tone-neutral"><p>${t("ordersCount")}</p><h3>${periodOrders.length}</h3></article>
            <article class="stat-card tone-warn"><p>${t("pendingCount")}</p><h3>${pending}</h3></article>
            <article class="stat-card tone-progress"><p>${t("progressCount")}</p><h3>${progress}</h3></article>
            <article class="stat-card tone-ready"><p>${t("readyCount")}</p><h3>${ready}</h3></article>
            <article class="stat-card tone-ok"><p>${t("acceptedCount")}</p><h3>${acceptedOrders.length}</h3></article>
            <article class="stat-card tone-neutral"><p>${t("reservationsCount")}</p><h3>${periodReservations.length}</h3></article>
          </div>
        </section>
        <section class="stats-group">
          <h4>${t("statsSales")}</h4>
          <div class="stats-subgrid stats-subgrid-sales">
            <article class="stat-card tone-sales"><p>${t("revenueCount")}</p><h3>${money(revenue)}</h3></article>
            <article class="stat-card tone-sales-soft"><p>${t("avgTicket")}</p><h3>${money(avgTicket)}</h3></article>
          </div>
        </section>
      </div>
    </article>
  `;
}

function meaningfulFoodText(value) {
  const text = String(value || "").trim();
  return text && text !== "[object Object]" ? text : "";
}

function foodName(item) {
  const title = item?.title;
  const candidates = [
    title && typeof title === "object" ? title[lang] : "",
    title && typeof title === "object" ? title.es : "",
    title && typeof title === "object" ? title.en : "",
    typeof title === "string" ? title : "",
    item?.name
  ];
  for (const candidate of candidates) {
    const text = meaningfulFoodText(candidate);
    if (text) return text;
  }
  const source = menuItemForOrderItem(item);
  return source?.title?.[lang] || source?.title?.es || source?.title?.en || "Item";
}

function menuItemForOrderItem(item) {
  const byId = BASE_MENU_ITEMS.find((menuItem) => menuItem.id === item?.id || menuItem.id === item?.menu_item_id);
  if (byId) return byId;

  const price = Number(item?.price || item?.unit_price || 0);
  if (!price) return null;
  const samePrice = BASE_MENU_ITEMS.filter((menuItem) => Number(menuItem.price) === price);
  return samePrice.length === 1 ? samePrice[0] : null;
}

function dayKeyFromDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthKeyFromDate(date) {
  return dayKeyFromDate(date).slice(0, 7);
}

function monthLabel(date) {
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" });
}

function timeLabel(value) {
  const date = parseDate(value);
  if (!date) return "-";
  return date.toLocaleTimeString(lang === "es" ? "es-ES" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

function calendarWeekdayLabels() {
  return lang === "es"
    ? ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

function salesByDayForMonth(referenceMonth) {
  const month = referenceMonth.getMonth();
  const year = referenceMonth.getFullYear();
  const map = new Map();
  ordersCache
    .filter((order) => order.status === "delivered")
    .forEach((order) => {
      const when = parseDate(orderSalesDateValue(order));
      if (!when) return;
      if (when.getMonth() !== month || when.getFullYear() !== year) return;
      const key = dayKeyFromDate(when);
      const row = map.get(key) || { orders: [], count: 0, revenue: 0 };
      row.orders.push(order);
      row.count += 1;
      row.revenue += Number(order.total || 0);
      map.set(key, row);
    });
  return map;
}

function renderFoodStats() {
  if (!foodStats) return;
  const acceptedOrders = acceptedSalesRows();
  const byFood = new Map();

  acceptedOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const key = item.id || foodName(item);
      const existing = byFood.get(key) || { name: foodName(item), qty: 0, sales: 0 };
      const qty = Number(item.qty || 0);
      const lineTotal = qty * Number(item.price || 0);
      existing.qty += qty;
      existing.sales += lineTotal;
      byFood.set(key, existing);
    });
  });

  const topRows = Array.from(byFood.values()).sort((a, b) => b.qty - a.qty).slice(0, 8);
  if (!topRows.length) {
    foodStats.innerHTML = `
      <article class="food-stats-card">
        <h3>${t("topFoodTitle")} (${activePeriodSummaryLabel()})</h3>
        <p>${t("topFoodEmpty")}</p>
      </article>
    `;
    return;
  }

  foodStats.innerHTML = `
    <article class="food-stats-card">
      <h3>${t("topFoodTitle")} (${activePeriodSummaryLabel()})</h3>
      <ul>
        ${topRows
          .map((row, index) => `
            <li>
              <span class="food-rank">#${index + 1}</span>
              <span class="food-name">${row.name}</span>
              <span class="food-metrics">
                <em>${t("qtySold")}: ${row.qty}</em>
                <strong>${t("salesLabel")}: ${money(row.sales)}</strong>
              </span>
            </li>
          `)
          .join("")}
      </ul>
    </article>
  `;
}

function renderSalesCalendar() {
  if (!salesCalendar) return;
  const monthSales = salesByDayForMonth(calendarMonth);
  const firstOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const today = new Date();
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayOffset = (firstOfMonth.getDay() + 6) % 7;
  const monthKey = monthKeyFromDate(firstOfMonth);
  const dayCells = [];

  if (!selectedCalendarDate || !selectedCalendarDate.startsWith(monthKey)) {
    if (isCurrentMonth) {
      selectedCalendarDate = dayKeyFromDate(today);
    } else {
      selectedCalendarDate = monthSales.size ? Array.from(monthSales.keys())[0] : `${monthKey}-01`;
    }
  }

  for (let i = 0; i < firstDayOffset; i += 1) {
    dayCells.push('<div class="calendar-cell muted" aria-hidden="true"></div>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const key = dayKeyFromDate(date);
    const bucket = monthSales.get(key);
    const selected = selectedCalendarDate === key ? "selected" : "";
    const hasSales = bucket ? "has-sales" : "";
    dayCells.push(`
      <button class="calendar-cell day ${selected} ${hasSales}" data-calendar-date="${key}">
        <span class="calendar-day">${day}</span>
        <span class="calendar-meta">${bucket ? `${bucket.count} ${t("calendarOrders")}` : "-"}</span>
      </button>
    `);
  }

  const selectedBucket = monthSales.get(selectedCalendarDate) || null;
  const selectedDayOrders = selectedBucket ? selectedBucket.orders : [];
  const paymentBreakdown = salesPaymentBreakdown(selectedDayOrders);
  const paymentBreakdownRows = [
    paymentBreakdown.cash,
    paymentBreakdown.card,
    paymentBreakdown.bank_transfer,
    paymentBreakdown.pedidos_ya,
    ...(paymentBreakdown.other.count ? [paymentBreakdown.other] : [])
  ];
  const paymentFilterOptions = [
    { key: "all", label: t("calendarPaymentAll") },
    { key: "cash", label: t("payMethodCash") },
    { key: "card", label: t("payMethodCard") },
    { key: "bank_transfer", label: t("payMethodTransfer") },
    { key: "pedidos_ya", label: t("payMethodPedidosYa") },
    ...(paymentBreakdown.other.count || salesDayPaymentFilter === "other"
      ? [{ key: "other", label: t("calendarPaymentOther") }]
      : [])
  ];
  const paymentFilteredDayOrders = salesDayPaymentFilter === "all"
    ? selectedDayOrders
    : selectedDayOrders.filter((order) => salesPaymentMethodKey(order) === salesDayPaymentFilter);
  const paymentFilteredRevenue = paymentFilteredDayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const filteredDayOrders = selectedSalesDayOrdersForSearch();
  const dayFoodRows = (() => {
    if (!selectedBucket) return [];
    const byFood = new Map();
    paymentFilteredDayOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.id || foodName(item);
        const existing = byFood.get(key) || { name: foodName(item), qty: 0, sales: 0 };
        const qty = Number(item.qty || 0);
        existing.qty += qty;
        existing.sales += qty * Number(item.price || 0);
        byFood.set(key, existing);
      });
    });
    return Array.from(byFood.values()).sort((a, b) => b.qty - a.qty);
  })();
  const selectedDateObject = new Date(`${selectedCalendarDate}T00:00:00`);
  const selectedDateLabel = Number.isNaN(selectedDateObject.getTime())
    ? selectedCalendarDate
    : selectedDateObject.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
  const monthSummary = Array.from(monthSales.values()).reduce(
    (summary, row) => ({
      count: summary.count + row.count,
      revenue: summary.revenue + row.revenue
    }),
    { count: 0, revenue: 0 }
  );
  const calendarNav = `
    <div class="sales-calendar-nav">
      <button class="btn btn-outline" data-calendar-shift="-1" aria-label="${t("calendarPrev")}">&lt;</button>
      <strong>${monthLabel(calendarMonth)}</strong>
      <button class="btn btn-outline" data-calendar-shift="1" aria-label="${t("calendarNext")}">&gt;</button>
    </div>
  `;
  const expandedCalendarContent = `
    ${calendarNav}
    <div class="sales-calendar-grid">
      ${calendarWeekdayLabels().map((label) => `<div class="calendar-cell weekday">${label}</div>`).join("")}
      ${dayCells.join("")}
    </div>
    ${monthSales.size ? "" : `<p class="calendar-empty-month">${t("calendarNoSalesMonth")}</p>`}
    <section class="sales-day-details">
      ${
        selectedBucket
          ? `
            <div class="sales-day-head">
              <div class="sales-day-copy">
                <h4>${t("calendarDetailsTitle")}: ${selectedDateLabel}</h4>
                <p><strong>${t("calendarOrders")}:</strong> ${selectedBucket.count} | <strong>${t("calendarRevenue")}:</strong> ${money(selectedBucket.revenue)}</p>
                <p class="sales-payment-selected"><strong>${t("calendarPaymentSelected")}:</strong> ${salesPaymentMethodLabel(salesDayPaymentFilter)} | ${paymentFilteredDayOrders.length} ${t("calendarOrders")} | ${money(paymentFilteredRevenue)}</p>
              </div>
              <label class="sales-day-search" for="salesDaySearch">
                <span>${escapeHtml(t("calendarSearchPlaceholder"))}</span>
                <input
                  id="salesDaySearch"
                  class="sales-day-search-input"
                  type="search"
                  name="salesDaySearch"
                  inputmode="search"
                  enterkeyhint="search"
                  autocapitalize="off"
                  autocomplete="off"
                  autocorrect="off"
                  spellcheck="false"
                  value="${escapeHtml(salesDaySearchTerm)}"
                  placeholder="${escapeHtml(t("calendarSearchPlaceholder"))}">
              </label>
            </div>
            <div class="sales-payment-tools">
              <section class="sales-payment-breakdown" aria-label="${escapeHtml(t("calendarPaymentBreakdown"))}">
                <h5>${t("calendarPaymentBreakdown")}</h5>
                <div class="sales-payment-cards">
                  ${paymentBreakdownRows
                    .map((row) => `
                      <button
                        type="button"
                        class="sales-payment-card ${salesDayPaymentFilter === row.key ? "selected" : ""}"
                        data-sales-payment-filter="${row.key}">
                        <span>${escapeHtml(salesPaymentMethodLabel(row.key))}</span>
                        <strong>${money(row.revenue)}</strong>
                        <em>${row.count} ${t("calendarOrders")}</em>
                      </button>
                    `)
                    .join("")}
                </div>
              </section>
              <label class="sales-payment-filter" for="salesDayPaymentFilter">
                <span>${t("calendarPaymentFilter")}</span>
                <select id="salesDayPaymentFilter">
                  ${paymentFilterOptions
                    .map((option) => `
                      <option value="${option.key}" ${salesDayPaymentFilter === option.key ? "selected" : ""}>
                        ${escapeHtml(option.label)}
                      </option>
                    `)
                    .join("")}
                </select>
              </label>
            </div>
            <div class="sales-day-list">
              ${renderSalesDayListHtml(filteredDayOrders)}
            </div>
            <div class="sales-food-breakdown">
              <h5>${t("calendarFoodBreakdown")}</h5>
              ${
                dayFoodRows.length
                  ? `
                    <ul>
                      ${dayFoodRows
                        .map(
                          (row) => `
                            <li>
                              <span>${row.name}</span>
                              <span>${t("qtySold")}: ${row.qty} | ${t("salesLabel")}: ${money(row.sales)}</span>
                            </li>
                          `
                        )
                        .join("")}
                    </ul>
                  `
                  : `<p>${t("calendarNoSalesDay")}</p>`
              }
            </div>
          `
          : `
            <div class="sales-day-head">
              <div class="sales-day-copy">
                <h4>${t("calendarDetailsTitle")}: ${selectedDateLabel}</h4>
              </div>
            </div>
            <p>${t("calendarNoSalesDay")}</p>
          `
      }
    </section>
  `;

  salesCalendar.innerHTML = `
    <article class="sales-calendar-card ${salesCalendarExpanded ? "is-expanded" : "is-collapsed"}">
      <header class="sales-calendar-head">
        <div>
          <h3>${t("calendarTitle")}</h3>
          <p>${salesCalendarExpanded ? t("calendarSub") : t("calendarCollapsedText")}</p>
        </div>
        <div class="sales-calendar-actions">
          <span class="sales-calendar-pill">${t("calendarMonthSummary")}: ${monthSummary.count} ${t("calendarOrders")} | ${money(monthSummary.revenue)}</span>
          <button
            type="button"
            class="btn btn-primary sales-calendar-toggle"
            data-sales-calendar-toggle
            aria-expanded="${salesCalendarExpanded ? "true" : "false"}">
            ${salesCalendarExpanded ? t("calendarHide") : t("calendarShow")}
          </button>
        </div>
      </header>
      ${salesCalendarExpanded ? expandedCalendarContent : ""}
    </article>
  `;
}

function renderSalesCalendarKeepingSearchPosition(selectionStart = null, selectionEnd = null) {
  const previousScrollY = window.scrollY;
  renderSalesCalendar();
  const nextSearchInput = document.getElementById("salesDaySearch");
  if (!nextSearchInput) return;
  nextSearchInput.focus({ preventScroll: true });
  const inputLength = nextSearchInput.value.length;
  const start = Number.isInteger(selectionStart) ? Math.min(selectionStart, inputLength) : inputLength;
  const end = Number.isInteger(selectionEnd) ? Math.min(selectionEnd, inputLength) : start;
  nextSearchInput.setSelectionRange(start, end);
  window.scrollTo({ top: previousScrollY, behavior: "auto" });
}

function reportAmountsForOrder(order) {
  const storedSubtotal = Number(order?.subtotal);
  const storedTax = Number(order?.tax);
  const storedTotal = Number(order?.total);
  if (Number.isFinite(storedSubtotal) && Number.isFinite(storedTax)) {
    return {
      subtotal: roundMoney(storedSubtotal),
      tax: roundMoney(storedTax),
      total: Number.isFinite(storedTotal) ? roundMoney(storedTotal) : roundMoney(storedSubtotal + storedTax)
    };
  }

  const breakdown = buildFiscalBreakdown(order);
  return {
    subtotal: roundMoney(breakdown.subtotal),
    tax: roundMoney(breakdown.taxAmount),
    total: Number.isFinite(storedTotal) ? roundMoney(storedTotal) : roundMoney(breakdown.total)
  };
}

function termsReportRows() {
  syncTermsReportRange();
  return termsReportRowsCache
    .filter((order) => order.status === "delivered")
    .sort((left, right) => {
      const leftDate = parseDate(orderSalesDateValue(left))?.getTime() || 0;
      const rightDate = parseDate(orderSalesDateValue(right))?.getTime() || 0;
      return leftDate - rightDate;
    })
    .map((order) => {
      const when = parseDate(orderSalesDateValue(order)) || new Date();
      const amounts = reportAmountsForOrder(order);
      return {
        order,
        when,
        paymentMethod: salesPaymentMethodKey(order),
        invoiceOrOrder: String(order.invoice?.invoiceNumber || "").trim() || `#${order.displayId || String(order.id || "").slice(0, 6)}`,
        customerName: String(order.customer?.name || "").trim() || t("customerFinalConsumer"),
        subtotal: amounts.subtotal,
        tax: amounts.tax,
        total: amounts.total
      };
    });
}

function termsReportSummary(rows) {
  return rows.reduce((summary, row) => ({
    count: summary.count + 1,
    subtotal: roundMoney(summary.subtotal + row.subtotal),
    tax: roundMoney(summary.tax + row.tax),
    total: roundMoney(summary.total + row.total)
  }), { count: 0, subtotal: 0, tax: 0, total: 0 });
}

function termsReportRangeText() {
  syncTermsReportRange();
  const locale = lang === "es" ? "es-HN" : "en-US";
  const startText = termsReportRange.start.toLocaleDateString(locale);
  const endText = termsReportRange.end.toLocaleDateString(locale);
  return `${startText} - ${endText}`;
}

function shiftTermsReportRange(direction) {
  const factor = Number(direction || 0);
  if (!factor) return;
  syncTermsReportRange();
  if (termsReportPreset === "month") {
    const anchor = new Date(termsReportRange.start);
    anchor.setMonth(anchor.getMonth() + factor);
    setTermsReportPreset("month", anchor);
    return;
  }
  if (termsReportPreset === "year") {
    const anchor = new Date(termsReportRange.start);
    anchor.setFullYear(anchor.getFullYear() + factor);
    setTermsReportPreset("year", anchor);
    return;
  }
  const anchor = new Date(termsReportRange.start);
  anchor.setDate(anchor.getDate() + factor);
  setTermsReportPreset("day", anchor);
}

function buildTermsReportPrintableHtml(rows, summary) {
  const printedAt = new Date();
  const printedAtText = printedAt.toLocaleString(lang === "es" ? "es-HN" : "en-US");
  const tableRows = rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.when.toLocaleDateString(lang === "es" ? "es-HN" : "en-US"))}</td>
        <td>${escapeHtml(row.customerName)}</td>
        <td>${escapeHtml(row.invoiceOrOrder)}</td>
        <td>${escapeHtml(termsReportPaymentLabel(row.paymentMethod))}</td>
        <td class="num">${escapeHtml(money(row.subtotal))}</td>
        <td class="num">${escapeHtml(money(row.tax))}</td>
        <td class="num">${escapeHtml(money(row.total))}</td>
      </tr>
    `).join("");

  return `
    <!doctype html>
    <html lang="${lang}">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(t("termsReportTitle"))}</title>
      <style>
        @page { margin: 12mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          color: #111;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          line-height: 1.35;
        }
        h1, p { margin: 0; }
        .head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 12mm;
        }
        .head h1 {
          font-size: 24px;
          margin-bottom: 4px;
        }
        .meta {
          text-align: right;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 10mm;
        }
        .summary-card {
          border: 1px solid #d6d6d6;
          border-radius: 10px;
          padding: 10px 12px;
        }
        .summary-card span {
          display: block;
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }
        .summary-card strong {
          font-size: 18px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border-bottom: 1px solid #ddd;
          padding: 7px 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          font-size: 11px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .num {
          text-align: right;
          white-space: nowrap;
        }
        tfoot td {
          font-weight: 700;
          border-top: 2px solid #aaa;
        }
      </style>
      <script>
        window.addEventListener("load", () => {
          setTimeout(() => {
            window.focus();
            window.print();
          }, 150);
        });
      </script>
    </head>
    <body>
      <section class="head">
        <div>
          <h1>Frida Restaurant</h1>
          <p><strong>${escapeHtml(t("termsReportTitle"))}</strong></p>
          <p>${escapeHtml(t("termsReportRangeLabel"))}: ${escapeHtml(termsReportRangeText())}</p>
          <p>${escapeHtml(t("termsReportMethodLabel"))}: ${escapeHtml(termsReportPaymentLabel(termsReportPayment))}</p>
        </div>
        <div class="meta">
          <p><strong>${lang === "es" ? "Impreso" : "Printed"}:</strong></p>
          <p>${escapeHtml(printedAtText)}</p>
        </div>
      </section>
      <section class="summary">
        <article class="summary-card"><span>${escapeHtml(t("termsReportCount"))}</span><strong>${summary.count}</strong></article>
        <article class="summary-card"><span>${escapeHtml(t("subtotal"))}</span><strong>${escapeHtml(money(summary.subtotal))}</strong></article>
        <article class="summary-card"><span>${escapeHtml(t("termsReportTax"))}</span><strong>${escapeHtml(money(summary.tax))}</strong></article>
        <article class="summary-card"><span>${escapeHtml(t("total"))}</span><strong>${escapeHtml(money(summary.total))}</strong></article>
      </section>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t("date"))}</th>
            <th>${escapeHtml(t("customer"))}</th>
            <th>${escapeHtml(t("termsReportInvoiceOrOrder"))}</th>
            <th>${escapeHtml(t("termsReportTerms"))}</th>
            <th class="num">${escapeHtml(t("subtotal"))}</th>
            <th class="num">${escapeHtml(t("termsReportTax"))}</th>
            <th class="num">${escapeHtml(t("total"))}</th>
          </tr>
        </thead>
        <tbody>${tableRows || `<tr><td colspan="7">${escapeHtml(t("termsReportRowsEmpty"))}</td></tr>`}</tbody>
        <tfoot>
          <tr>
            <td colspan="4">${lang === "es" ? "Totales" : "Totals"}</td>
            <td class="num">${escapeHtml(money(summary.subtotal))}</td>
            <td class="num">${escapeHtml(money(summary.tax))}</td>
            <td class="num">${escapeHtml(money(summary.total))}</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;
}

function printTermsReport() {
  if (termsReportLoading) return;
  const rows = termsReportRows();
  const summary = termsReportSummary(rows);
  if (!rows.length) return;
  const printWindow = window.open("", "_blank", "width=1100,height=900");
  if (!printWindow) return;
  try {
    printWindow.opener = null;
  } catch (_error) {
    // Ignore browsers that block changing opener.
  }
  printWindow.document.open();
  printWindow.document.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>Imprimiendo...</title></head><body style=\"font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.35;padding:16px;\">Preparando reporte...</body></html>");
  printWindow.document.close();
  printWindow.document.open();
  printWindow.document.write(buildTermsReportPrintableHtml(rows, summary));
  printWindow.document.close();
}

async function refreshTermsReportData() {
  if (!termsReportRange.start || !termsReportRange.end) setTermsReportPreset("day");
  syncTermsReportRange();
  const requestId = ++termsReportRequestId;
  termsReportLoading = true;
  termsReportError = "";
  termsReportRowsCache = [];
  renderTermsReport();

  try {
    const rows = await loadOrders({
      statuses: ["delivered"],
      startDate: termsReportRange.start,
      endDate: termsReportRange.end,
      paymentMethod: termsReportPayment === "all" ? "" : termsReportPayment
    });
    if (requestId !== termsReportRequestId) return;
    termsReportRowsCache = rows;
  } catch (error) {
    console.warn("Terms report load failed", error);
    if (requestId !== termsReportRequestId) return;
    termsReportRowsCache = [];
    termsReportError = t("termsReportError");
  } finally {
    if (requestId !== termsReportRequestId) return;
    termsReportLoading = false;
    renderTermsReport();
  }
}

function renderTermsReport() {
  if (!termsReport) return;
  if (!termsReportRange.start || !termsReportRange.end) setTermsReportPreset("day");
  syncTermsReportRange();
  const rows = termsReportRows();
  const summary = termsReportSummary(rows);
  const previewMarkup = termsReportLoading
    ? `<p class="terms-report-empty">${t("termsReportLoading")}</p>`
    : termsReportError
      ? `<p class="terms-report-empty">${escapeHtml(termsReportError)}</p>`
      : rows.length
        ? `
              <div class="terms-report-table-wrap">
                <table class="terms-report-table">
                  <thead>
                    <tr>
                      <th>${t("date")}</th>
                      <th>${t("customer")}</th>
                      <th>${t("termsReportInvoiceOrOrder")}</th>
                      <th>${t("termsReportTerms")}</th>
                      <th class="num">${t("subtotal")}</th>
                      <th class="num">${t("termsReportTax")}</th>
                      <th class="num">${t("total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows.map((row) => `
                      <tr>
                        <td>${escapeHtml(row.when.toLocaleDateString(lang === "es" ? "es-HN" : "en-US"))}</td>
                        <td>${escapeHtml(row.customerName)}</td>
                        <td>${escapeHtml(row.invoiceOrOrder)}</td>
                        <td>${escapeHtml(termsReportPaymentLabel(row.paymentMethod))}</td>
                        <td class="num">${escapeHtml(money(row.subtotal))}</td>
                        <td class="num">${escapeHtml(money(row.tax))}</td>
                        <td class="num">${escapeHtml(money(row.total))}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            `
        : `<p class="terms-report-empty">${t("termsReportRowsEmpty")}</p>`;

  termsReport.innerHTML = `
    <article class="terms-report-card">
      <header class="terms-report-head">
        <div>
          <h3>${t("termsReportTitle")}</h3>
          <p>${t("termsReportText")}</p>
        </div>
        <div class="terms-report-head-actions">
          <button type="button" class="btn btn-outline" data-terms-report-preview>${t("termsReportPreview")}</button>
          <button type="button" class="btn btn-primary" data-terms-report-print ${!rows.length || termsReportLoading || termsReportError ? "disabled" : ""}>${t("termsReportPrint")}</button>
        </div>
      </header>
      <div class="terms-report-toolbar">
        <label>
          <span>${t("termsReportStart")}</span>
          <input id="termsReportStart" type="date" value="${escapeHtml(formatDateInputValue(termsReportRange.start))}">
        </label>
        <label>
          <span>${t("termsReportEnd")}</span>
          <input id="termsReportEnd" type="date" value="${escapeHtml(formatDateInputValue(termsReportRange.end))}">
        </label>
        <label>
          <span>${t("termsReportTerms")}</span>
          <select id="termsReportPayment">
            <option value="all" ${termsReportPayment === "all" ? "selected" : ""}>${t("termsReportAll")}</option>
            <option value="cash" ${termsReportPayment === "cash" ? "selected" : ""}>${t("payMethodCash")}</option>
            <option value="card" ${termsReportPayment === "card" ? "selected" : ""}>${t("payMethodCard")}</option>
            <option value="bank_transfer" ${termsReportPayment === "bank_transfer" ? "selected" : ""}>${t("payMethodTransfer")}</option>
            <option value="pedidos_ya" ${termsReportPayment === "pedidos_ya" ? "selected" : ""}>${t("payMethodPedidosYa")}</option>
          </select>
        </label>
      </div>
      <div class="terms-report-controls">
        <div class="terms-report-shift">
          <button type="button" class="btn btn-outline" data-terms-report-shift="-1" aria-label="${escapeHtml(t("actionBack"))}">&lt;</button>
          <button type="button" class="btn btn-outline" data-terms-report-current>${t("termsReportCurrent")}</button>
          <button type="button" class="btn btn-outline" data-terms-report-shift="1" aria-label="${escapeHtml(t("actionNext"))}">&gt;</button>
        </div>
        <div class="terms-report-presets">
          <button type="button" class="btn ${termsReportPreset === "day" ? "btn-primary" : "btn-outline"}" data-terms-report-preset="day" ${termsReportLoading ? "disabled" : ""}>${t("termsReportDay")}</button>
          <button type="button" class="btn ${termsReportPreset === "month" ? "btn-primary" : "btn-outline"}" data-terms-report-preset="month" ${termsReportLoading ? "disabled" : ""}>${t("termsReportMonth")}</button>
          <button type="button" class="btn ${termsReportPreset === "year" ? "btn-primary" : "btn-outline"}" data-terms-report-preset="year" ${termsReportLoading ? "disabled" : ""}>${t("termsReportYear")}</button>
        </div>
      </div>
      <div class="terms-report-summary">
        <article class="terms-report-summary-card">
          <span>${t("termsReportCount")}</span>
          <strong>${summary.count}</strong>
        </article>
        <article class="terms-report-summary-card">
          <span>${t("subtotal")}</span>
          <strong>${money(summary.subtotal)}</strong>
        </article>
        <article class="terms-report-summary-card">
          <span>${t("termsReportTax")}</span>
          <strong>${money(summary.tax)}</strong>
        </article>
        <article class="terms-report-summary-card">
          <span>${t("total")}</span>
          <strong>${money(summary.total)}</strong>
        </article>
      </div>
      <section class="terms-report-preview">
        <div class="terms-report-preview-head">
          <div>
            <h4>${t("termsReportPreviewTitle")}</h4>
            <p><strong>${t("termsReportRangeLabel")}:</strong> ${termsReportRangeText()}</p>
            <p><strong>${t("termsReportMethodLabel")}:</strong> ${termsReportPaymentLabel(termsReportPayment)}</p>
          </div>
          <p class="terms-report-note">${t("termsReportSummaryNote")}</p>
        </div>
        ${previewMarkup}
      </section>
    </article>
  `;
}

function refreshTermsReportIfOpen() {
  if (!termsReportModal || termsReportModal.classList.contains("hidden")) return;
  renderTermsReport();
}

function syncFoodReportRange() {
  const start = parseDate(foodReportRange.start) || new Date();
  const end = parseDate(foodReportRange.end) || start;
  if (start > end) {
    foodReportRange = { start: startOfDay(end), end: endOfDay(start) };
    return;
  }
  foodReportRange = { start: startOfDay(start), end: endOfDay(end) };
}

function setFoodReportPreset(preset, anchorDate = new Date()) {
  foodReportPreset = preset;
  foodReportRange = buildTermsReportPresetRange(preset, anchorDate);
  syncFoodReportRange();
}

function resetFoodReportToCurrentPreset() {
  setFoodReportPreset(foodReportPreset === "custom" ? "day" : foodReportPreset || "day", new Date());
}

function foodReportRangeText() {
  syncFoodReportRange();
  const locale = lang === "es" ? "es-HN" : "en-US";
  const startText = foodReportRange.start.toLocaleDateString(locale);
  const endText = foodReportRange.end.toLocaleDateString(locale);
  return `${startText} - ${endText}`;
}

function shiftFoodReportRange(direction) {
  const factor = Number(direction || 0);
  if (!factor) return;
  syncFoodReportRange();
  if (foodReportPreset === "month") {
    const anchor = new Date(foodReportRange.start);
    anchor.setMonth(anchor.getMonth() + factor);
    setFoodReportPreset("month", anchor);
    return;
  }
  if (foodReportPreset === "year") {
    const anchor = new Date(foodReportRange.start);
    anchor.setFullYear(anchor.getFullYear() + factor);
    setFoodReportPreset("year", anchor);
    return;
  }
  const anchor = new Date(foodReportRange.start);
  anchor.setDate(anchor.getDate() + factor);
  setFoodReportPreset("day", anchor);
}

function foodReportRows() {
  syncFoodReportRange();
  const searchTerm = normalizeFoodReportSearchText(foodReportSearch);
  const byFood = new Map();

  foodReportRowsCache
    .filter((order) => order.status === "delivered")
    .forEach((order) => {
      const when = parseDate(orderSalesDateValue(order)) || new Date();
      (order.items || []).forEach((item) => {
        const name = foodName(item);
        const key = item?.id || item?.menu_item_id || normalizeFoodReportSearchText(name);
        const qty = Number(item?.qty || item?.quantity || 0);
        if (!key || !Number.isFinite(qty) || qty <= 0) return;
        const unitPrice = Number(item?.price || 0);
        const existing = byFood.get(key) || {
          key,
          name,
          qty: 0,
          sales: 0,
          orderIds: new Set(),
          firstSoldAt: when,
          lastSoldAt: when
        };
        existing.qty += qty;
        existing.sales = roundMoney(existing.sales + qty * (Number.isFinite(unitPrice) ? unitPrice : 0));
        if (order?.id) existing.orderIds.add(order.id);
        if (when < existing.firstSoldAt) existing.firstSoldAt = when;
        if (when > existing.lastSoldAt) existing.lastSoldAt = when;
        byFood.set(key, existing);
      });
    });

  return Array.from(byFood.values())
    .filter((row) => !searchTerm || normalizeFoodReportSearchText(row.name).includes(searchTerm))
    .map((row) => ({
      ...row,
      orderCount: row.orderIds.size
    }))
    .sort((left, right) => {
      if (right.qty !== left.qty) return right.qty - left.qty;
      if (right.sales !== left.sales) return right.sales - left.sales;
      return left.name.localeCompare(right.name, lang === "es" ? "es" : "en", { sensitivity: "base" });
    });
}

function foodReportDishOptions() {
  const names = new Map();

  BASE_MENU_ITEMS.forEach((item) => {
    const name = foodName(item);
    const normalized = normalizeFoodReportSearchText(name);
    if (!normalized) return;
    names.set(normalized, name);
  });

  foodReportRowsCache.forEach((order) => {
    (order.items || []).forEach((item) => {
      const name = foodName(item);
      const normalized = normalizeFoodReportSearchText(name);
      if (!normalized) return;
      if (!names.has(normalized)) names.set(normalized, name);
    });
  });

  return Array.from(names.entries())
    .map(([normalized, name]) => ({ normalized, name }))
    .sort((left, right) => left.name.localeCompare(right.name, lang === "es" ? "es" : "en", { sensitivity: "base" }));
}

function foodReportSummary(rows) {
  return rows.reduce((summary, row, index) => ({
    count: summary.count + 1,
    qty: summary.qty + row.qty,
    sales: roundMoney(summary.sales + row.sales),
    top: index === 0 ? row.name : summary.top
  }), {
    count: 0,
    qty: 0,
    sales: 0,
    top: ""
  });
}

function buildFoodReportPrintableHtml(rows, summary) {
  const printedAt = new Date();
  const locale = lang === "es" ? "es-HN" : "en-US";
  const printedAtText = printedAt.toLocaleString(locale);
  const selectedDishText = foodReportSearch.trim() || t("foodReportSearchAll");
  const tableRows = rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td class="num">${row.qty}</td>
        <td class="num">${escapeHtml(money(row.sales))}</td>
        <td class="num">${row.orderCount}</td>
        <td>${escapeHtml(row.firstSoldAt.toLocaleDateString(locale))}</td>
        <td>${escapeHtml(row.lastSoldAt.toLocaleDateString(locale))}</td>
      </tr>
    `).join("");

  return `
    <!doctype html>
    <html lang="${lang}">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(t("foodReportTitle"))}</title>
      <style>
        @page { margin: 12mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          color: #111;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          line-height: 1.35;
        }
        h1, p { margin: 0; }
        .head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 12mm;
        }
        .head h1 {
          font-size: 24px;
          margin-bottom: 4px;
        }
        .meta {
          text-align: right;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 10mm;
        }
        .summary-card {
          border: 1px solid #d6d6d6;
          border-radius: 10px;
          padding: 10px 12px;
        }
        .summary-card span {
          display: block;
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }
        .summary-card strong {
          font-size: 18px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border-bottom: 1px solid #ddd;
          padding: 7px 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          font-size: 11px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .num {
          text-align: right;
          white-space: nowrap;
        }
        tfoot td {
          font-weight: 700;
          border-top: 2px solid #aaa;
        }
      </style>
      <script>
        window.addEventListener("load", () => {
          setTimeout(() => {
            window.focus();
            window.print();
          }, 150);
        });
      </script>
    </head>
    <body>
      <section class="head">
        <div>
          <h1>Frida Restaurant</h1>
          <p><strong>${escapeHtml(t("foodReportTitle"))}</strong></p>
          <p>${escapeHtml(t("foodReportRangeLabel"))}: ${escapeHtml(foodReportRangeText())}</p>
          <p>${escapeHtml(t("foodReportMethodLabel"))}: ${escapeHtml(foodReportPaymentLabel(foodReportPayment))}</p>
          <p>${escapeHtml(t("foodReportSearchLabel"))}: ${escapeHtml(selectedDishText)}</p>
        </div>
        <div class="meta">
          <p><strong>${lang === "es" ? "Impreso" : "Printed"}:</strong></p>
          <p>${escapeHtml(printedAtText)}</p>
        </div>
      </section>
      <section class="summary">
        <article class="summary-card"><span>${escapeHtml(t("foodReportCount"))}</span><strong>${summary.count}</strong></article>
        <article class="summary-card"><span>${escapeHtml(t("foodReportUnits"))}</span><strong>${summary.qty}</strong></article>
        <article class="summary-card"><span>${escapeHtml(t("foodReportRevenue"))}</span><strong>${escapeHtml(money(summary.sales))}</strong></article>
        <article class="summary-card"><span>${escapeHtml(t("foodReportTop"))}</span><strong>${escapeHtml(summary.top || "-")}</strong></article>
      </section>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t("foodReportDish"))}</th>
            <th class="num">${escapeHtml(t("foodReportUnits"))}</th>
            <th class="num">${escapeHtml(t("foodReportRevenue"))}</th>
            <th class="num">${escapeHtml(t("foodReportOrders"))}</th>
            <th>${escapeHtml(t("foodReportFirstSold"))}</th>
            <th>${escapeHtml(t("foodReportLastSold"))}</th>
          </tr>
        </thead>
        <tbody>${tableRows || `<tr><td colspan="6">${escapeHtml(t("foodReportRowsEmpty"))}</td></tr>`}</tbody>
        <tfoot>
          <tr>
            <td>${lang === "es" ? "Totales" : "Totals"}</td>
            <td class="num">${summary.qty}</td>
            <td class="num">${escapeHtml(money(summary.sales))}</td>
            <td colspan="3">${escapeHtml(summary.top || "-")}</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;
}

function printFoodReport() {
  if (foodReportLoading) return;
  const rows = foodReportRows();
  const summary = foodReportSummary(rows);
  if (!rows.length) return;
  const printWindow = window.open("", "_blank", "width=1100,height=900");
  if (!printWindow) return;
  try {
    printWindow.opener = null;
  } catch (_error) {
    // Ignore browsers that block changing opener.
  }
  printWindow.document.open();
  printWindow.document.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>Imprimiendo...</title></head><body style=\"font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.35;padding:16px;\">Preparando reporte...</body></html>");
  printWindow.document.close();
  printWindow.document.open();
  printWindow.document.write(buildFoodReportPrintableHtml(rows, summary));
  printWindow.document.close();
}

async function refreshFoodReportData() {
  if (!foodReportRange.start || !foodReportRange.end) setFoodReportPreset("day");
  syncFoodReportRange();
  const requestId = ++foodReportRequestId;
  foodReportLoading = true;
  foodReportError = "";
  foodReportRowsCache = [];
  renderFoodReport();

  try {
    const rows = await loadOrders({
      statuses: ["delivered"],
      startDate: foodReportRange.start,
      endDate: foodReportRange.end,
      paymentMethod: foodReportPayment === "all" ? "" : foodReportPayment
    });
    if (requestId !== foodReportRequestId) return;
    foodReportRowsCache = rows;
  } catch (error) {
    console.warn("Food report load failed", error);
    if (requestId !== foodReportRequestId) return;
    foodReportRowsCache = [];
    foodReportError = t("foodReportError");
  } finally {
    if (requestId !== foodReportRequestId) return;
    foodReportLoading = false;
    renderFoodReport();
  }
}

function renderFoodReport() {
  if (!foodReport) return;
  if (!foodReportRange.start || !foodReportRange.end) setFoodReportPreset("day");
  syncFoodReportRange();
  const rows = foodReportRows();
  const summary = foodReportSummary(rows);
  const locale = lang === "es" ? "es-HN" : "en-US";
  const selectedDishText = foodReportSearch.trim() || t("foodReportSearchAll");
  const dishOptions = foodReportDishOptions();
  const normalizedSelectedDish = normalizeFoodReportSearchText(foodReportSearch);
  const previewMarkup = foodReportLoading
    ? `<p class="terms-report-empty">${t("foodReportLoading")}</p>`
    : foodReportError
      ? `<p class="terms-report-empty">${escapeHtml(foodReportError)}</p>`
      : rows.length
        ? `
            <div class="terms-report-table-wrap">
              <table class="terms-report-table">
                <thead>
                  <tr>
                    <th>${t("foodReportDish")}</th>
                    <th class="num">${t("foodReportUnits")}</th>
                    <th class="num">${t("foodReportRevenue")}</th>
                    <th class="num">${t("foodReportOrders")}</th>
                    <th>${t("foodReportFirstSold")}</th>
                    <th>${t("foodReportLastSold")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.map((row) => `
                    <tr>
                      <td>${escapeHtml(row.name)}</td>
                      <td class="num">${row.qty}</td>
                      <td class="num">${escapeHtml(money(row.sales))}</td>
                      <td class="num">${row.orderCount}</td>
                      <td>${escapeHtml(row.firstSoldAt.toLocaleDateString(locale))}</td>
                      <td>${escapeHtml(row.lastSoldAt.toLocaleDateString(locale))}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          `
        : `<p class="terms-report-empty">${t("foodReportRowsEmpty")}</p>`;

  foodReport.innerHTML = `
    <article class="terms-report-card">
      <header class="terms-report-head">
        <div>
          <h3>${t("foodReportTitle")}</h3>
          <p>${t("foodReportText")}</p>
        </div>
        <div class="terms-report-head-actions">
          <button type="button" class="btn btn-outline" data-food-report-preview>${t("foodReportPreview")}</button>
          <button type="button" class="btn btn-primary" data-food-report-print ${!rows.length || foodReportLoading || foodReportError ? "disabled" : ""}>${t("foodReportPrint")}</button>
        </div>
      </header>
      <div class="terms-report-toolbar">
        <label>
          <span>${t("foodReportStart")}</span>
          <input id="foodReportStart" type="date" value="${escapeHtml(formatDateInputValue(foodReportRange.start))}">
        </label>
        <label>
          <span>${t("foodReportEnd")}</span>
          <input id="foodReportEnd" type="date" value="${escapeHtml(formatDateInputValue(foodReportRange.end))}">
        </label>
        <label>
          <span>${t("foodReportPayment")}</span>
          <select id="foodReportPayment">
            <option value="all" ${foodReportPayment === "all" ? "selected" : ""}>${t("foodReportAll")}</option>
            <option value="cash" ${foodReportPayment === "cash" ? "selected" : ""}>${t("payMethodCash")}</option>
            <option value="card" ${foodReportPayment === "card" ? "selected" : ""}>${t("payMethodCard")}</option>
            <option value="bank_transfer" ${foodReportPayment === "bank_transfer" ? "selected" : ""}>${t("payMethodTransfer")}</option>
            <option value="pedidos_ya" ${foodReportPayment === "pedidos_ya" ? "selected" : ""}>${t("payMethodPedidosYa")}</option>
          </select>
        </label>
        <label>
          <span>${t("foodReportDishFilter")}</span>
          <select id="foodReportDishSelect">
            <option value="">${t("foodReportSearchAll")}</option>
            ${dishOptions.map((option) => `
              <option value="${escapeHtml(option.name)}" ${normalizedSelectedDish === option.normalized ? "selected" : ""}>${escapeHtml(option.name)}</option>
            `).join("")}
          </select>
        </label>
        <label>
          <span>${t("foodReportSearch")}</span>
          <input id="foodReportSearch" type="search" value="${escapeHtml(foodReportSearch)}" placeholder="${escapeHtml(t("foodReportSearchPlaceholder"))}" autocapitalize="words" autocomplete="off" spellcheck="false">
        </label>
      </div>
      <div class="terms-report-controls">
        <div class="terms-report-shift">
          <button type="button" class="btn btn-outline" data-food-report-shift="-1" aria-label="${escapeHtml(t("actionBack"))}">&lt;</button>
          <button type="button" class="btn btn-outline" data-food-report-current>${t("foodReportCurrent")}</button>
          <button type="button" class="btn btn-outline" data-food-report-shift="1" aria-label="${escapeHtml(t("actionNext"))}">&gt;</button>
        </div>
        <div class="terms-report-presets">
          <button type="button" class="btn ${foodReportPreset === "day" ? "btn-primary" : "btn-outline"}" data-food-report-preset="day" ${foodReportLoading ? "disabled" : ""}>${t("foodReportDay")}</button>
          <button type="button" class="btn ${foodReportPreset === "month" ? "btn-primary" : "btn-outline"}" data-food-report-preset="month" ${foodReportLoading ? "disabled" : ""}>${t("foodReportMonth")}</button>
          <button type="button" class="btn ${foodReportPreset === "year" ? "btn-primary" : "btn-outline"}" data-food-report-preset="year" ${foodReportLoading ? "disabled" : ""}>${t("foodReportYear")}</button>
        </div>
      </div>
      <div class="terms-report-summary">
        <article class="terms-report-summary-card">
          <span>${t("foodReportCount")}</span>
          <strong>${summary.count}</strong>
        </article>
        <article class="terms-report-summary-card">
          <span>${t("foodReportUnits")}</span>
          <strong>${summary.qty}</strong>
        </article>
        <article class="terms-report-summary-card">
          <span>${t("foodReportRevenue")}</span>
          <strong>${money(summary.sales)}</strong>
        </article>
        <article class="terms-report-summary-card">
          <span>${t("foodReportTop")}</span>
          <strong>${escapeHtml(summary.top || "-")}</strong>
        </article>
      </div>
      <section class="terms-report-preview">
        <div class="terms-report-preview-head">
          <div>
            <h4>${t("foodReportPreviewTitle")}</h4>
            <p><strong>${t("foodReportRangeLabel")}:</strong> ${foodReportRangeText()}</p>
            <p><strong>${t("foodReportMethodLabel")}:</strong> ${foodReportPaymentLabel(foodReportPayment)}</p>
            <p><strong>${t("foodReportSearchLabel")}:</strong> ${escapeHtml(selectedDishText)}</p>
          </div>
          <p class="terms-report-note">${t("foodReportSummaryNote")}</p>
        </div>
        ${previewMarkup}
      </section>
    </article>
  `;
}

function renderFoodReportKeepingSearchPosition(selectionStart = null, selectionEnd = null) {
  const previousScrollY = window.scrollY;
  renderFoodReport();
  const nextSearchInput = document.getElementById("foodReportSearch");
  if (!nextSearchInput) return;
  nextSearchInput.focus({ preventScroll: true });
  const inputLength = nextSearchInput.value.length;
  const start = Number.isInteger(selectionStart) ? Math.min(selectionStart, inputLength) : inputLength;
  const end = Number.isInteger(selectionEnd) ? Math.min(selectionEnd, inputLength) : start;
  nextSearchInput.setSelectionRange(start, end);
  window.scrollTo({ top: previousScrollY, behavior: "auto" });
}

function refreshFoodReportIfOpen() {
  if (!foodReportModal || foodReportModal.classList.contains("hidden")) return;
  renderFoodReport();
}

function renderOrders() {
  const rows = filteredOrders();
  if (!rows.length) {
    ordersList.innerHTML = `<p>${t("emptyOrders")}</p>`;
    return;
  }

  ordersList.innerHTML = rows
    .map((order) => `
      <article class="crm-card">
        <div class="crm-top">
          <div>
            <strong>#${order.displayId || order.id.slice(0, 6)}</strong>
            ${renderCustomerNameEditor(order)}
            ${renderOrderTableLine(order)}
            ${renderInvoiceRequestNotice(order)}
            <p><strong>${crmPaymentLine(order)}</strong></p>
          </div>
          <div class="crm-side-actions">
            <div class="crm-card-controls">
              <span class="badge ${order.status}">${orderStatusLabel(order.status)}</span>
              <button class="crm-trash-btn hide-order" type="button" data-id="${order.id}" aria-label="${t("hideOrder")}" title="${t("hideOrder")}">
                <span aria-hidden="true">&#128465;</span>
              </button>
            </div>
            <div class="crm-print-actions">
              <button class="btn btn-outline print-order print-order-small" data-id="${order.id}">${t("btnPrint")}</button>
              <button class="btn btn-outline print-fiscal-order print-order-small" data-id="${order.id}">${fiscalPrintButtonLabel(order)}</button>
            </div>
          </div>
        </div>
        <p>${t("total")}: <strong>${money(order.total)}</strong></p>
        <p>${t("date")}: ${formatDate(order.createdAt)}</p>
        <div class="crm-payment-row">
          <label class="crm-payment-method-select">
            <span>${t("paymentMethodSelect")}</span>
            <select class="payment-method-select" data-id="${order.id}">
              <option value="" ${paymentMethodSelectValue(order) === "" ? "selected" : ""} disabled>${t("paymentMethodPlaceholder")}</option>
              <option value="cash" ${paymentMethodSelectValue(order) === "cash" ? "selected" : ""}>${t("payMethodCash")}</option>
              <option value="card" ${paymentMethodSelectValue(order) === "card" ? "selected" : ""}>${t("payMethodCard")}</option>
              <option value="bank_transfer" ${paymentMethodSelectValue(order) === "bank_transfer" ? "selected" : ""}>${t("payMethodTransfer")}</option>
              <option value="pedidos_ya" ${paymentMethodSelectValue(order) === "pedidos_ya" ? "selected" : ""}>${t("payMethodPedidosYa")}</option>
            </select>
          </label>
        </div>
        <div class="crm-actions">
          <div class="crm-main-actions">
            <button class="btn btn-outline review-order crm-review-btn" data-id="${order.id}">${t("reviewShort")}</button>
            <div class="crm-status-actions">
              ${renderOrderStatusActions(order)}
            </div>
          </div>
          ${
            order.payment?.method === "online" && order.payment?.status !== "paid"
              ? `<div class="crm-meta-actions"><button class="btn btn-outline payment-change" data-id="${order.id}" data-payment-status="paid">${t("btnMarkPaid")}</button></div>`
              : ""
          }
        </div>
      </article>
    `)
    .join("");
}

function renderReservations() {
  const rows = filteredReservations();
  if (!rows.length) {
    reservationsList.innerHTML = `<p>${t("emptyReservations")}</p>`;
    return;
  }

  reservationsList.innerHTML = rows
    .map((res) => {
      const status = normalizeReservationStatus(res.status);
      return `
      <article class="crm-card ${highlightedReservationId === res.id ? "is-linked-reservation" : ""}" data-reservation-id="${res.id}">
        <div class="crm-top">
          <div>
            <strong>${res.name || "-"}</strong>
            <p>${res.phone || ""}${res.email ? ` | ${res.email}` : ""}</p>
          </div>
          <div class="crm-card-controls">
            <span class="badge ${status}">${reservationStatusLabel(status)}</span>
            <span class="badge pending">${res.party || 1} pax</span>
          </div>
        </div>
        <p>${t("date")}: ${res.date || "-"} ${res.time || ""}</p>
        <p>${t("reservationAreaLabel")}: ${reservationAreaLabel(res.reservationArea)}</p>
        <p>${lang === "es" ? "Ocasión" : "Occasion"}: ${res.occasion || "-"}</p>
        <p>${lang === "es" ? "Alergias" : "Allergies"}: ${res.allergies || "-"}</p>
        <p>${lang === "es" ? "Notas" : "Notes"}: ${res.notes || "-"}</p>
        <div class="crm-actions reservation-actions" aria-label="${escapeHtml(t("reservationStatus"))}">
          ${renderReservationStatusActions(res.id, status)}
        </div>
      </article>
    `;
    })
    .join("");
}

function renderReservationStatusActions(reservationId, status) {
  if (status === "accepted") {
    return `<button type="button" class="btn btn-outline reservation-status-change" data-reservation-id="${reservationId}" data-reservation-status="pending">${t("btnReopen")}</button>`;
  }
  if (status === "rejected") {
    return `<button type="button" class="btn btn-outline reservation-status-change" data-reservation-id="${reservationId}" data-reservation-status="pending">${t("btnReactivate")}</button>`;
  }
  return `
    <button type="button" class="btn btn-primary reservation-status-change" data-reservation-id="${reservationId}" data-reservation-status="accepted">${t("reservationAccept")}</button>
    <button type="button" class="btn btn-outline reservation-status-change" data-reservation-id="${reservationId}" data-reservation-status="rejected">${t("reservationReject")}</button>
  `;
}

function reservationAreaLabel(value) {
  if (value === "area_climatizada") return t("reservationAreaAir");
  if (value === "area_libre") return t("reservationAreaOpen");
  return "-";
}

function canEditReviewItems(order) {
  const role = String(currentStaffProfile?.role || "").toLowerCase();
  return role === "admin" && order && !["delivered", "rejected"].includes(order.status);
}

function reviewCatalogItems() {
  return orderCreatorItems();
}

function reviewIconMarkup(type) {
  if (type === "add") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 5v14"/>
        <path d="M5 12h14"/>
      </svg>
    `;
  }
  if (type === "edit") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    `;
  }
  if (type === "cancel") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
      </svg>
    `;
  }
  if (type === "save") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="m20 6-11 11-5-5"/>
      </svg>
    `;
  }
  if (type === "remove") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="m19 6-1 14H6L5 6"/>
        <path d="M10 11v6"/>
        <path d="M14 11v6"/>
      </svg>
    `;
  }
  return reviewIconMarkup("add");
}

function reviewCatalogItemById(productId) {
  return reviewCatalogItems().find((item) => item.id === productId) || null;
}

function normalizeReviewDraftItem(item = {}) {
  const source = reviewCatalogItemById(item.id || item.menu_item_id || item.menuItemId || "");
  const name = String(
    source?.title?.es
      || source?.title?.[lang]
      || item.name
      || item.title?.es
      || item.title?.en
      || ""
  ).trim();
  const price = Number.isFinite(Number(item.price))
    ? Number(item.price)
    : Number.isFinite(Number(item.unit_price))
      ? Number(item.unit_price)
      : Number(source?.price || 0);
  const qty = Math.max(1, Math.round(Number(item.qty || item.quantity || 1)));

  return {
    id: source?.id || item.id || item.menu_item_id || item.menuItemId || "",
    name,
    title: source?.title ? { ...source.title } : { es: name, en: name },
    category: source?.category || item.category || "",
    image: source?.image || item.image || "",
    price: roundMoney(price),
    qty,
    total: roundMoney(price * qty),
    notes: String(item.notes || "").trim()
  };
}

function buildReviewItemsDraft(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  return items.length ? items.map((item) => normalizeReviewDraftItem(item)) : [];
}

function createReviewDraftItem(productId = "") {
  const source = reviewCatalogItemById(productId) || reviewCatalogItems()[0] || null;
  return normalizeReviewDraftItem({
    id: source?.id || productId || "",
    name: source?.title?.es || "",
    title: source?.title ? { ...source.title } : undefined,
    price: source?.price || 0,
    qty: 1
  });
}

function reviewDraftSubtotal() {
  return roundMoney(reviewItemsDraft.reduce((sum, item) => sum + roundMoney(Number(item.price || 0) * Number(item.qty || 0)), 0));
}

function reviewDraftGrandTotal(order) {
  return roundMoney(reviewDraftSubtotal() + Number(order?.tax || 0) + Number(order?.deliveryFee || 0));
}

function reviewDisplayedTotal(order) {
  if (reviewItemsEditMode && selectedOrderId === order.id) {
    return reviewDraftGrandTotal(order);
  }
  return Number(order.total || 0);
}

function reviewProductOptionsHtml(currentId = "", fallbackLabel = "") {
  const catalog = reviewCatalogItems();
  const knownIds = new Set(catalog.map((item) => item.id));
  const options = [];

  if (currentId && !knownIds.has(currentId)) {
    options.push({
      id: currentId,
      label: fallbackLabel || currentId
    });
  }

  catalog.forEach((item) => {
    options.push({
      id: item.id,
      label: item.title?.[lang] || item.title?.es || item.name || item.id
    });
  });

  return options
    .map((option) => `
      <option value="${escapeHtml(option.id)}" ${option.id === currentId ? "selected" : ""}>
        ${escapeHtml(option.label)}
      </option>
    `)
    .join("");
}

function renderReviewItemsStatic(order) {
  return `
    <ul class="review-items-list">
      ${(order.items || [])
        .map((item) => `<li>${escapeHtml(foodName(item))} x ${Number(item.qty || 0)} (${money(item.price)})</li>`)
        .join("")}
    </ul>
  `;
}

function renderReviewItemsEditor(order) {
  if (!reviewItemsDraft.length) {
    reviewItemsDraft = [createReviewDraftItem()];
  }

  return `
    <div class="review-items-editor">
      <div class="review-item-editor-list">
        ${reviewItemsDraft.map((item, index) => `
          <article class="review-item-editor-row" data-review-item-row="${index}">
            <label class="review-item-field review-item-product-field">
              <span>${t("reviewItemsProduct")}</span>
              <select class="review-item-select" data-review-item-product="${index}">
                ${reviewProductOptionsHtml(item.id, foodName(item))}
              </select>
            </label>
            <div class="review-item-field review-item-qty-field">
              <span>${t("reviewItemsQty")}</span>
              <div class="review-item-qty-controls">
                <button type="button" class="btn btn-outline review-item-icon-btn" data-review-item-qty="${index}" data-review-item-step="-1" aria-label="Disminuir cantidad">-</button>
                <strong class="review-item-qty-value">${Number(item.qty || 1)}</strong>
                <button type="button" class="btn btn-outline review-item-icon-btn" data-review-item-qty="${index}" data-review-item-step="1" aria-label="Aumentar cantidad">+</button>
              </div>
            </div>
            <div class="review-item-meta">
              <strong>${escapeHtml(money(item.price))}</strong>
              <span>${escapeHtml(foodName(item))}</span>
            </div>
            <button
              type="button"
              class="btn btn-outline review-item-remove-btn review-items-action-btn"
              data-review-item-remove="${index}"
              aria-label="${escapeHtml(t("reviewItemsRemove"))}"
              title="${escapeHtml(t("reviewItemsRemove"))}">
              ${reviewIconMarkup("remove")}
              <span class="review-item-remove-label">${t("reviewItemsRemove")}</span>
            </button>
          </article>
        `).join("")}
      </div>
      <div class="review-items-editor-actions">
        <button
          type="button"
          class="btn btn-outline review-items-action-btn"
          data-review-items-add-row
          aria-label="${escapeHtml(t("reviewItemsAddInline"))}"
          title="${escapeHtml(t("reviewItemsAddInline"))}">
          ${reviewIconMarkup("add")}
          <span class="review-items-action-label">${t("reviewItemsAddInline")}</span>
        </button>
        <button
          type="button"
          class="btn btn-outline review-items-action-btn"
          data-review-items-cancel
          aria-label="${escapeHtml(t("reviewItemsCancel"))}"
          title="${escapeHtml(t("reviewItemsCancel"))}">
          ${reviewIconMarkup("cancel")}
          <span class="review-items-action-label">${t("reviewItemsCancel")}</span>
        </button>
        <button
          type="button"
          class="btn btn-primary review-items-action-btn"
          data-review-items-save
          aria-label="${escapeHtml(t("reviewItemsSave"))}"
          title="${escapeHtml(t("reviewItemsSave"))}">
          ${reviewIconMarkup("save")}
          <span class="review-items-action-label">${t("reviewItemsSave")}</span>
        </button>
      </div>
    </div>
  `;
}

function renderReviewItemsSection(order) {
  const canEdit = canEditReviewItems(order);
  const editing = canEdit && reviewItemsEditMode && selectedOrderId === order.id;

  return `
    <section class="review-items-section">
      <div class="review-items-head">
        <h4>${t("reviewItemsTitle")}</h4>
        ${
          canEdit && !editing
            ? `
              <div class="review-items-head-actions">
                <button
                  type="button"
                  class="btn btn-outline review-items-icon-action"
                  data-review-items-edit
                  aria-label="${escapeHtml(t("reviewItemsEdit"))}"
                  title="${escapeHtml(t("reviewItemsEdit"))}">
                  ${reviewIconMarkup("edit")}
                </button>
                <button
                  type="button"
                  class="btn btn-primary review-items-icon-action"
                  data-review-items-start-add
                  aria-label="${escapeHtml(t("reviewItemsAdd"))}"
                  title="${escapeHtml(t("reviewItemsAdd"))}">
                  ${reviewIconMarkup("add")}
                </button>
              </div>
            `
            : ""
        }
      </div>
      ${editing ? renderReviewItemsEditor(order) : renderReviewItemsStatic(order)}
    </section>
  `;
}

function renderReviewBody(order) {
  const invoice = visibleInvoiceData(order);
  const phone = String(order.customer?.phone || "").trim();
  return `
    <p>
      ${t("customer")}: <strong>${order.customer?.name || ""}</strong>
      ${phone ? `<span class="crm-review-phone">(${escapeHtml(phone)}) ${renderWhatsAppButton(phone, "crm-whatsapp-btn-inline")}</span>` : ""}
    </p>
    ${renderOrderTableLine(order)}
    ${renderOrderComments(order)}
    ${renderInvoiceRequestNotice(order)}
    <p><strong>${crmPaymentLine(order)}</strong></p>
    <p>${t("date")}: ${formatDate(order.createdAt)}</p>
    <p>${t("total")}: <strong>${money(reviewDisplayedTotal(order))}</strong></p>
    ${renderReviewItemsSection(order)}
    <p><strong>${t("orderStatus")}:</strong> ${orderStatusLabel(order.status)}</p>
    <p><strong>${t("paymentMethodSelect")}:</strong> ${escapeHtml(selectedPaymentMethodLabel(order))}</p>
    <section class="invoice-editor">
      <h4>${t("invoiceSectionTitle")}</h4>
      <div class="invoice-editor-grid">
        <label>
          <span>${t("invoiceBillingName")}</span>
          <input class="invoice-input" data-field="billingName" value="${escapeHtml(invoice.billingName)}">
        </label>
        <label>
          <span>${t("invoiceBillingRTN")}</span>
          <input class="invoice-input" data-field="billingRTN" value="${escapeHtml(invoice.billingRTN)}">
        </label>
        <label>
          <span>${t("invoiceNumberAuto")}</span>
          <input class="invoice-input" value="${escapeHtml(invoice.invoiceNumber || t("invoiceNumberPending"))}" readonly>
        </label>
      </div>
      <div class="invoice-editor-actions">
        <button class="btn btn-outline print-fiscal-order" data-id="${order.id}">${fiscalPrintButtonLabel(order)}</button>
      </div>
    </section>
  `;
}

function openReview(orderId, options = {}) {
  const order = ordersCache.find((o) => o.id === orderId);
  if (!order) return;
  const preserveState = Boolean(options.preserveState);
  const isSameOrder = selectedOrderId === orderId;
  selectedOrderId = orderId;
  if (!preserveState || !isSameOrder) {
    reviewItemsEditMode = false;
    reviewItemsDraft = buildReviewItemsDraft(order);
    reviewItemsSaving = false;
  } else if (!canEditReviewItems(order)) {
    reviewItemsEditMode = false;
    reviewItemsDraft = buildReviewItemsDraft(order);
  } else if (!reviewItemsEditMode) {
    reviewItemsDraft = buildReviewItemsDraft(order);
  }
  reviewTitle.textContent = `#${order.displayId || order.id.slice(0, 6)}`;
  reviewBody.innerHTML = renderReviewBody(order);
  reviewModal.classList.remove("hidden");
}

function openLinkedOrderIfReady() {
  if (!pendingLinkedOrderId) return;
  const order = ordersCache.find((row) => row.id === pendingLinkedOrderId);
  if (!order) return;
  activeFilter = "all";
  showCRMView("orders");
  renderOrders();
  openReview(pendingLinkedOrderId);
  pendingLinkedOrderId = "";
  window.history.replaceState({}, "", `${window.location.pathname}${window.location.hash}`);
}

function openLinkedReservationIfReady() {
  if (!pendingLinkedReservationId) return;
  const reservation = reservationsCache.find((row) => row.id === pendingLinkedReservationId);
  if (!reservation) return;
  activeReservationFilter = "all";
  highlightedReservationId = pendingLinkedReservationId;
  showCRMView("reservations");
  renderReservations();
  window.requestAnimationFrame(() => {
    reservationsList
      .querySelector(`[data-reservation-id="${CSS.escape(pendingLinkedReservationId)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    pendingLinkedReservationId = "";
    window.history.replaceState({}, "", `${window.location.pathname}${window.location.hash}`);
  });
}

function closeReviewModal() {
  selectedOrderId = null;
  reviewItemsEditMode = false;
  reviewItemsDraft = [];
  reviewItemsSaving = false;
  reviewModal.classList.add("hidden");
}

function openHideOrderConfirm(orderId) {
  if (!orderId) return;
  pendingHiddenOrderId = orderId;
  hideOrderConfirmModal?.classList.remove("hidden");
}

function closeHideOrderConfirm() {
  pendingHiddenOrderId = "";
  hideOrderConfirmModal?.classList.add("hidden");
}

function confirmHideOrder() {
  if (!pendingHiddenOrderId) return;
  const orderId = pendingHiddenOrderId;
  hiddenOrderIds.add(String(orderId));
  writeHiddenOrderIds();
  if (selectedOrderId === orderId) closeReviewModal();
  closeHideOrderConfirm();
  renderOrders();
  showToast(t("orderHidden"));
}

function closeCRMHeaderNav() {
  if (!crmHeaderNav || !crmNavToggle) return;
  crmHeaderNav.classList.remove("open");
  crmNavToggle.setAttribute("aria-expanded", "false");
}

function toggleCRMHeaderNav() {
  if (!crmHeaderNav || !crmNavToggle) return;
  const isOpen = crmHeaderNav.classList.toggle("open");
  crmNavToggle.setAttribute("aria-expanded", String(isOpen));
}

function refreshOrderViews(orderId) {
  renderStats();
  renderFoodStats();
  renderSalesCalendar();
  renderOrders();
  if (selectedOrderId === orderId) openReview(orderId, { preserveState: true });
}

function patchOrderInCache(orderId, patcher) {
  let previousOrder = null;
  let nextOrder = null;
  ordersCache = ordersCache.map((order) => {
    if (order.id !== orderId) return order;
    previousOrder = order;
    nextOrder = patcher(order);
    return nextOrder;
  });
  return { previousOrder, nextOrder };
}

function focusedOrderNameInput() {
  const active = document.activeElement;
  return active && active.classList && active.classList.contains("crm-customer-name-input") ? active : null;
}

function isEditingOrderCustomerName() {
  return Boolean(focusedOrderNameInput());
}

function focusedInvoiceInput() {
  const active = document.activeElement;
  return active && active.classList && active.classList.contains("invoice-input") ? active : null;
}

function isEditingInvoiceData() {
  return Boolean(focusedInvoiceInput());
}

function renderCustomerNameEditor(order) {
  const value = orderNamePendingValues.has(order.id)
    ? orderNamePendingValues.get(order.id)
    : (order.customer?.name || "");
  const phone = String(order.customer?.phone || "").trim();
  return `
    <label class="crm-customer-name-field">
      <span>${t("customer")}:</span>
      <input
        class="crm-customer-name-input"
        type="text"
        autocomplete="name"
        autocapitalize="words"
        spellcheck="false"
        data-id="${order.id}"
        value="${escapeHtml(value)}"
        aria-label="${escapeHtml(t("customerNameLabel"))}"
      >
      ${
        phone
          ? `<span class="crm-customer-phone-actions">
              <small>(${escapeHtml(phone)})</small>
              ${renderWhatsAppButton(phone)}
            </span>`
          : ""
      }
    </label>
  `;
}

function patchOrderCustomerNameInCache(orderId, customerName) {
  patchOrderInCache(orderId, (current) => ({
    ...current,
    customer: {
      ...(current.customer || {}),
      name: customerName
    },
    updatedAt: new Date().toISOString()
  }));
  renderSalesCalendar();
  renderStats();
  renderFoodStats();
}

async function persistOrderCustomerName(orderId, rawName) {
  const customerName = String(rawName || "").trim();
  if (!customerName || orderNameSavingIds.has(orderId)) return;
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return;
  const previousName = orderNameLastSavedValues.get(orderId) || order.customer?.name || "";
  if (customerName === previousName.trim()) return;

  orderNameSavingIds.add(orderId);
  try {
    await updateOrderCustomerName(orderId, customerName, currentStaffUser);
    orderNameLastSavedValues.set(orderId, customerName);
    if (String(orderNamePendingValues.get(orderId) || "").trim() === customerName) {
      orderNamePendingValues.delete(orderId);
    }
    patchOrderCustomerNameInCache(orderId, customerName);
  } catch (_error) {
    showToast(t("customerNameSaveError"));
  } finally {
    orderNameSavingIds.delete(orderId);
    const pendingValue = orderNamePendingValues.get(orderId);
    if (pendingValue !== undefined && String(pendingValue).trim() !== customerName) {
      scheduleOrderCustomerNameSave(orderId, pendingValue);
    }
  }
}

function scheduleOrderCustomerNameSave(orderId, customerName, delay = 650) {
  if (orderNameSaveTimers.has(orderId)) {
    window.clearTimeout(orderNameSaveTimers.get(orderId));
  }
  orderNameSaveTimers.set(orderId, window.setTimeout(() => {
    orderNameSaveTimers.delete(orderId);
    persistOrderCustomerName(orderId, customerName);
  }, delay));
}

async function setStatus(orderId, status) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return;
  if (status === "delivered" && !paymentMethodSelectValue(order)) {
    showToast(t("paymentMethodRequired"));
    return;
  }
  const previousStatus = order.status;
  const now = new Date().toISOString();
  if (status === "delivered") {
    const deliveredDate = new Date(now);
    calendarMonth = new Date(deliveredDate.getFullYear(), deliveredDate.getMonth(), 1);
    selectedCalendarDate = dayKeyFromDate(deliveredDate);
  }
  patchOrderInCache(orderId, (current) => ({
    ...current,
    status,
    deliveredAt: status === "delivered" ? now : current.deliveredAt,
    statusEvents: status === "delivered"
      ? [
          ...(Array.isArray(current.statusEvents) ? current.statusEvents : []),
          { status: "delivered", createdAt: now }
        ]
      : current.statusEvents,
    updatedAt: now
  }));
  refreshOrderViews(orderId);
  try {
    await withSlowBusyScreen(t("savingAction"), () => updateOrderStatus(orderId, status, currentStaffUser));
    showToast(t("updated"));
  } catch (_e) {
    patchOrderInCache(orderId, (current) => ({
      ...current,
      status: previousStatus,
      updatedAt: order.updatedAt
    }));
    refreshOrderViews(orderId);
    showToast("Error");
  }
}

async function setReservationStatus(reservationId, status) {
  const reservation = reservationsCache.find((row) => row.id === reservationId);
  if (!reservation) return;
  const normalizedStatus = normalizeReservationStatus(status);
  const previousStatus = reservation.status;
  reservationsCache = reservationsCache.map((row) => (
    row.id === reservationId
      ? { ...row, status: normalizedStatus, updatedAt: new Date().toISOString() }
      : row
  ));
  renderStats();
  renderReservations();
  try {
    await withSlowBusyScreen(t("savingAction"), () => updateReservationStatus(reservationId, normalizedStatus));
    showToast(t("reservationUpdated"));
  } catch (_error) {
    reservationsCache = reservationsCache.map((row) => (
      row.id === reservationId ? { ...row, status: previousStatus } : row
    ));
    renderStats();
    renderReservations();
    showToast(t("reservationUpdateError"));
  }
}

async function setPaymentStatus(orderId, paymentStatus) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return;
  const previousStatus = order.payment?.status || "unpaid";
  patchOrderInCache(orderId, (current) => ({
    ...current,
    payment: {
      ...(current.payment || {}),
      status: paymentStatus
    },
    updatedAt: new Date().toISOString()
  }));
  refreshOrderViews(orderId);
  try {
    await withSlowBusyScreen(t("savingAction"), () => updateOrderPaymentStatus(orderId, paymentStatus, currentStaffUser));
    showToast(t("paymentUpdated"));
  } catch (_e) {
    patchOrderInCache(orderId, (current) => ({
      ...current,
      payment: {
        ...(current.payment || {}),
        status: previousStatus
      },
      updatedAt: order.updatedAt
    }));
    refreshOrderViews(orderId);
    showToast("Error");
  }
}

async function setPaymentMethod(orderId, paymentMethod) {
  if (!paymentMethod) return;
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return;
  const previousMethod = order.payment?.method || "";
  patchOrderInCache(orderId, (current) => ({
    ...current,
    payment: {
      ...(current.payment || {}),
      method: paymentMethod
    },
    updatedAt: new Date().toISOString()
  }));
  refreshOrderViews(orderId);
  try {
    await withSlowBusyScreen(t("savingAction"), () => updateOrderPaymentMethod(orderId, paymentMethod, currentStaffUser));
    showToast(t("paymentMethodUpdated"));
  } catch (_e) {
    patchOrderInCache(orderId, (current) => ({
      ...current,
      payment: {
        ...(current.payment || {}),
        method: previousMethod
      },
      updatedAt: order.updatedAt
    }));
    refreshOrderViews(orderId);
    showToast("Error");
  }
}

function getInvoiceDraftFromReview() {
  const inputs = Array.from(reviewBody.querySelectorAll(".invoice-input, .invoice-checkbox"));
  return inputs.reduce((acc, input) => {
    const field = input.dataset.field;
    if (!field) return acc;
    if (input.classList.contains("invoice-checkbox")) {
      acc[field] = input.checked;
      return acc;
    }
    acc[field] = input.value;
    return acc;
  }, {});
}

function mergeOrderInvoiceInCache(orderId, invoiceData) {
  ordersCache = ordersCache.map((order) => (
    order.id === orderId
      ? {
          ...order,
          invoice: {
            ...(order.invoice || {}),
            ...invoiceData
          }
        }
      : order
  ));
}

async function persistInvoiceData(orderId, invoiceData, successMessage = "") {
  try {
    await updateOrderInvoiceData(orderId, invoiceData, currentStaffUser);
    mergeOrderInvoiceInCache(orderId, invoiceData);
    const selectedOrder = ordersCache.find((order) => order.id === orderId);
    if (selectedOrder && selectedOrder.id === selectedOrderId) {
      reviewBody.innerHTML = renderReviewBody(selectedOrder);
    }
    renderOrders();
    if (successMessage) showToast(successMessage);
    return true;
  } catch (_e) {
    showToast("Error");
    return false;
  }
}

function currentInvoiceDraftForOrder(orderId) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return null;
  return normalizeInvoiceDraftData({
    ...defaultInvoiceData(order),
    ...(invoiceDraftPendingValues.get(orderId) || {})
  });
}

function scheduleInvoiceDraftSave(orderId, invoiceData, delay = 300) {
  if (invoiceDraftSaveTimers.has(orderId)) {
    window.clearTimeout(invoiceDraftSaveTimers.get(orderId));
  }
  invoiceDraftSaveTimers.set(orderId, window.setTimeout(() => {
    invoiceDraftSaveTimers.delete(orderId);
    persistInvoiceDraft(orderId, invoiceData);
  }, delay));
}

async function persistInvoiceDraft(orderId, rawInvoiceData, successMessage = "") {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return false;
  const invoiceData = normalizeInvoiceDraftData(rawInvoiceData || currentInvoiceDraftForOrder(orderId) || {});
  const previousSerialized = invoiceDraftLastSavedValues.get(orderId) || serializeInvoiceDraft(defaultInvoiceData(order));
  const nextSerialized = serializeInvoiceDraft(invoiceData);
  if (nextSerialized === previousSerialized) {
    invoiceDraftPendingValues.delete(orderId);
    return true;
  }
  invoiceDraftPendingValues.set(orderId, invoiceData);
  if (invoiceDraftSavingIds.has(orderId)) return true;

  invoiceDraftSavingIds.add(orderId);
  try {
    const saved = await persistInvoiceData(orderId, invoiceData, successMessage);
    if (saved) {
      invoiceDraftLastSavedValues.set(orderId, nextSerialized);
      if (serializeInvoiceDraft(invoiceDraftPendingValues.get(orderId) || {}) === nextSerialized) {
        invoiceDraftPendingValues.delete(orderId);
      }
    }
    return saved;
  } finally {
    invoiceDraftSavingIds.delete(orderId);
    const pendingDraft = invoiceDraftPendingValues.get(orderId);
    if (pendingDraft && serializeInvoiceDraft(pendingDraft) !== nextSerialized) {
      scheduleInvoiceDraftSave(orderId, pendingDraft);
    }
  }
}

async function setInvoiceData(orderId) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return false;
  const invoiceData = normalizeInvoiceDraftData({
    ...defaultInvoiceData(order),
    ...getInvoiceDraftFromReview()
  });
  return persistInvoiceDraft(orderId, invoiceData, t("invoiceSaved"));
}

async function ensureInvoiceDataBeforePrint(orderId) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return null;

  const draft = orderId === selectedOrderId
    ? { ...defaultInvoiceData(order), ...getInvoiceDraftFromReview() }
    : defaultInvoiceData(order);

  await refreshFiscalSettings();
  const rangeCheck = validateFiscalRange(fiscalSettings);

  if (!draft.invoiceNumber) {
    if (!rangeCheck.ok) {
      showToast(t(
        rangeCheck.reason === "exhausted"
          ? "invoiceRangeExhausted"
          : rangeCheck.reason === "expired"
            ? "invoiceDeadlineExceeded"
            : "invoiceInvalidRange"
      ));
      return null;
    }
    try {
      draft.invoiceNumber = await reserveNextFiscalInvoiceNumber(currentStaffUser);
      await refreshFiscalSettings();
    } catch (error) {
      const code = error && error.message ? error.message : "";
      if (code === "fiscal_range_exhausted") {
        showToast(t("invoicePrintBlockedExhausted"));
        return null;
      }
      if (code === "fiscal_emission_deadline_exceeded") {
        showToast(t("invoicePrintBlockedExpired"));
        return null;
      }
      if (code === "invalid_fiscal_range" || code === "missing_fiscal_settings") {
        showToast(t("invoiceInvalidRange"));
        return null;
      }
      showToast("Error");
      return null;
    }
  }

  const saved = await persistInvoiceData(orderId, draft);
  if (!saved) return null;
  return ordersCache.find((row) => row.id === orderId) || null;
}

function stopRealtime() {
  if (unsubscribeOrders) unsubscribeOrders();
  if (unsubscribeReservations) unsubscribeReservations();
  unsubscribeOrders = null;
  unsubscribeReservations = null;
  hasSeenInitialOrdersSnapshot = false;
  hasSeenInitialReservationsSnapshot = false;
  knownOrderIds = new Set();
  knownReservationIds = new Set();
  knownOrderPaymentStatus = new Map();
}

function isAuthRealtimeError(error) {
  const code = String(error?.code || "");
  return code === "invalid_token" ||
    code === "missing_token" ||
    code === "staff_denied" ||
    code === "role_denied" ||
    code === "http/401" ||
    code === "http/403";
}

async function handleRealtimeError(error, fallbackKey) {
  console.warn("CRM realtime error", error);
  if (isAuthRealtimeError(error)) {
    if (realtimeAuthExpiredHandled) return;
    realtimeAuthExpiredHandled = true;
    showToast(t("authSessionExpired"));
    return;
  }
  showToast(t(fallbackKey));
}

function startRealtime() {
  stopRealtime();
  realtimeAuthExpiredHandled = false;
  unsubscribeOrders = listenOrders(
    (orders) => {
      const nextIds = new Set(orders.map((order) => order.id));
      const nextPaymentMap = new Map(orders.map((order) => [order.id, order.payment?.status || "unpaid"]));
      if (!hasSeenInitialOrdersSnapshot) {
        knownOrderIds = nextIds;
        knownOrderPaymentStatus = nextPaymentMap;
        hasSeenInitialOrdersSnapshot = true;
      } else {
        const newOrders = orders.filter((order) => !knownOrderIds.has(order.id));
        newOrders.forEach((order) => {
          notifyNewOrder(order);
          if ((order.payment?.status || "unpaid") === "paid") notifyPaymentReceived(order);
        });
        orders.forEach((order) => {
          const previous = knownOrderPaymentStatus.get(order.id) || "unpaid";
          const current = order.payment?.status || "unpaid";
          if (previous !== "paid" && current === "paid") notifyPaymentReceived(order);
        });
        knownOrderIds = nextIds;
        knownOrderPaymentStatus = nextPaymentMap;
      }

      const editingOrderName = isEditingOrderCustomerName();
      const editingInvoiceData = isEditingInvoiceData();
      const editingReviewItems = reviewItemsEditMode && Boolean(selectedOrderId);
      orders.forEach((order) => {
        if (!orderNamePendingValues.has(order.id) && !orderNameSavingIds.has(order.id)) {
          orderNameLastSavedValues.set(order.id, order.customer?.name || "");
        }
        if (!invoiceDraftPendingValues.has(order.id) && !invoiceDraftSavingIds.has(order.id)) {
          invoiceDraftLastSavedValues.set(order.id, serializeInvoiceDraft(defaultInvoiceData(order)));
        }
      });
      ordersCache = orders.map((order) => (
        orderNamePendingValues.has(order.id)
          ? {
              ...order,
              customer: {
                ...(order.customer || {}),
                name: orderNamePendingValues.get(order.id)
              }
            }
          : order
      ));
      renderStats();
      renderFoodStats();
      renderSalesCalendar();
      refreshTermsReportIfOpen();
      refreshFoodReportIfOpen();
      if (!editingOrderName && !editingInvoiceData && !editingReviewItems) {
        renderOrders();
        if (selectedOrderId) openReview(selectedOrderId, { preserveState: true });
      } else if (editingReviewItems) {
        renderOrders();
      }
      openLinkedOrderIfReady();
    },
    (error) => handleRealtimeError(error, "ordersListenerError"),
    { scope: "ops", recentDays: CRM_RECENT_OPERATIONS_DAYS, limit: 250, intervalMs: 6000, hiddenIntervalMs: 18000 }
  );

  unsubscribeReservations = listenReservations(
    (reservations) => {
      const nextReservationIds = new Set(reservations.map((reservation) => reservation.id));
      if (!hasSeenInitialReservationsSnapshot) {
        knownReservationIds = nextReservationIds;
        hasSeenInitialReservationsSnapshot = true;
      } else {
        const newReservations = reservations.filter((reservation) => !knownReservationIds.has(reservation.id));
        newReservations.forEach(notifyNewReservation);
        knownReservationIds = nextReservationIds;
      }

      reservationsCache = reservations;
      renderStats();
      renderReservations();
      openLinkedReservationIfReady();
    },
    (error) => handleRealtimeError(error, "reservationsListenerError"),
    { intervalMs: 12000, hiddenIntervalMs: 30000 }
  );
}

function lockUI() {
  crmPushNotificationsReady = false;
  authGate.classList.remove("hidden");
  crmApp.classList.add("hidden");
  signOutBtn.classList.add("hidden");
  staffBadge.textContent = "";
  updateFiscalRangeAlert();
  closeCrmSettingsModal();
  closeCrmWorkModals();
  closeFiscalSettingsModal();
  stopRealtime();
}

async function unlockUI(user, profile) {
  authGate.classList.add("hidden");
  crmApp.classList.remove("hidden");
  signOutBtn.classList.remove("hidden");
  staffBadge.textContent = `${user.email} | ${t("staffRole")}: ${profile.role}`;
  await refreshFiscalSettings();
  await refreshMenuSettings();
  renewCRMNotificationsIfAllowed({ force: true });
  startRealtime();
}

ordersList.addEventListener("click", (event) => {
  const reviewButton = event.target.closest(".review-order");
  if (reviewButton) {
    openReview(reviewButton.dataset.id);
    return;
  }
  const hideButton = event.target.closest(".hide-order");
  if (hideButton) {
    openHideOrderConfirm(hideButton.dataset.id);
    return;
  }
  const printButton = event.target.closest(".print-order");
  if (printButton) {
    printOrder(printButton.dataset.id);
    return;
  }
  const fiscalPrintButton = event.target.closest(".print-fiscal-order");
  if (fiscalPrintButton) {
    printFiscalOrder(fiscalPrintButton.dataset.id);
    return;
  }
  const statusButton = event.target.closest(".status-change");
  if (statusButton) setStatus(statusButton.dataset.id, statusButton.dataset.status);
  const paymentButton = event.target.closest(".payment-change");
  if (paymentButton) setPaymentStatus(paymentButton.dataset.id, paymentButton.dataset.paymentStatus);
});

ordersList.addEventListener("change", (event) => {
  const paymentMethodSelect = event.target.closest(".payment-method-select");
  if (paymentMethodSelect) setPaymentMethod(paymentMethodSelect.dataset.id, paymentMethodSelect.value);
});

ordersList.addEventListener("focusin", (event) => {
  const input = event.target.closest(".crm-customer-name-input");
  if (!input) return;
  const orderId = input.dataset.id;
  const order = ordersCache.find((row) => row.id === orderId);
  if (order && !orderNameLastSavedValues.has(orderId)) {
    orderNameLastSavedValues.set(orderId, order.customer?.name || "");
  }
});

ordersList.addEventListener("input", (event) => {
  const input = event.target.closest(".crm-customer-name-input");
  if (!input) return;
  const orderId = input.dataset.id;
  const order = ordersCache.find((row) => row.id === orderId);
  if (order && !orderNameLastSavedValues.has(orderId)) {
    orderNameLastSavedValues.set(orderId, order.customer?.name || "");
  }
  orderNamePendingValues.set(orderId, input.value);
  patchOrderCustomerNameInCache(orderId, input.value);
  scheduleOrderCustomerNameSave(orderId, input.value);
});

ordersList.addEventListener("keydown", (event) => {
  const input = event.target.closest(".crm-customer-name-input");
  if (input && event.key === "Enter") {
    event.preventDefault();
    input.blur();
  }
});

ordersList.addEventListener("focusout", (event) => {
  const input = event.target.closest(".crm-customer-name-input");
  if (!input) return;
  const orderId = input.dataset.id;
  const nextName = input.value.trim();
  if (orderNameSaveTimers.has(orderId)) {
    window.clearTimeout(orderNameSaveTimers.get(orderId));
    orderNameSaveTimers.delete(orderId);
  }
  if (!nextName) {
    const previousName = orderNameLastSavedValues.get(orderId) || "";
    input.value = previousName;
    orderNamePendingValues.delete(orderId);
    patchOrderCustomerNameInCache(orderId, previousName);
    window.requestAnimationFrame(renderOrders);
    return;
  }
  persistOrderCustomerName(orderId, nextName).finally(() => {
    window.requestAnimationFrame(renderOrders);
  });
});

reservationsList.addEventListener("click", (event) => {
  const statusButton = event.target.closest(".reservation-status-change");
  if (!statusButton) return;
  setReservationStatus(statusButton.dataset.reservationId, statusButton.dataset.reservationStatus);
});


if (salesCalendar) {
  salesCalendar.addEventListener("click", (event) => {
    const searchInputTarget = event.target.closest("#salesDaySearch");
    if (searchInputTarget) {
      event.stopPropagation();
      return;
    }

    const searchField = event.target.closest(".sales-day-search");
    if (searchField) {
      event.stopPropagation();
      const searchInput = searchField.querySelector("#salesDaySearch");
      if (searchInput) {
        searchInput.focus();
        const length = searchInput.value.length;
        searchInput.setSelectionRange(length, length);
      }
      return;
    }

    const calendarToggle = event.target.closest("[data-sales-calendar-toggle]");
    if (calendarToggle) {
      salesCalendarExpanded = !salesCalendarExpanded;
      renderSalesCalendar();
      return;
    }

    const shiftBtn = event.target.closest("[data-calendar-shift]");
    if (shiftBtn) {
      const shift = Number(shiftBtn.dataset.calendarShift || 0);
      calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + shift, 1);
      renderSalesCalendar();
      return;
    }

    const paymentFilterBtn = event.target.closest("[data-sales-payment-filter]");
    if (paymentFilterBtn) {
      salesDayPaymentFilter = paymentFilterBtn.dataset.salesPaymentFilter || "all";
      renderSalesCalendar();
      return;
    }

    const dayBtn = event.target.closest("[data-calendar-date]");
    if (dayBtn) {
      selectedCalendarDate = dayBtn.dataset.calendarDate;
      salesDaySearchTerm = "";
      renderSalesCalendar();
      return;
    }

    const reviewBtn = event.target.closest("[data-review-order]");
    if (reviewBtn) {
      openReview(reviewBtn.dataset.reviewOrder);
      return;
    }

  });

  salesCalendar.addEventListener("input", (event) => {
    const searchInput = event.target.closest("#salesDaySearch");
    if (!searchInput) return;
    salesDaySearchTerm = searchInput.value || "";
    renderSalesDaySearchResults();
  });

  salesCalendar.addEventListener("focusout", (event) => {
    const searchInput = event.target.closest("#salesDaySearch");
    if (!searchInput) return;
    salesDaySearchTerm = searchInput.value || "";
    window.requestAnimationFrame(renderSalesCalendar);
  });

  salesCalendar.addEventListener("keydown", (event) => {
    const searchInput = event.target.closest("#salesDaySearch");
    if (searchInput && event.key === "Enter") {
      event.preventDefault();
      searchInput.blur();
    }
  });

  salesCalendar.addEventListener("change", (event) => {
    const paymentFilterSelect = event.target.closest("#salesDayPaymentFilter");
    if (!paymentFilterSelect) return;
    salesDayPaymentFilter = paymentFilterSelect.value || "all";
    renderSalesCalendar();
  });
}

crmSettingsLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openCrmSettingsModal();
    closeCRMHeaderNav();
  });
});

if (crmSettingsModal) {
  crmSettingsModal.addEventListener("click", (event) => {
    if (event.target === crmSettingsModal) {
      closeCrmSettingsModal();
      return;
    }

    const toolButton = event.target.closest("[data-open-crm-tool]");
    if (!toolButton) return;
    showCrmWorkspaceTool(toolButton.dataset.openCrmTool);
  });
}

if (orderCreatorModal) {
  orderCreatorModal.addEventListener("click", (event) => {
    if (event.target === orderCreatorModal) closeOrderCreatorModal();
  });
}
if (productManagerModal) {
  productManagerModal.addEventListener("click", (event) => {
    if (event.target === productManagerModal) closeProductManagerModal();
  });
}
if (termsReportModal) {
  termsReportModal.addEventListener("click", (event) => {
    if (event.target === termsReportModal) closeTermsReportModal();
  });
}
if (foodReportModal) {
  foodReportModal.addEventListener("click", (event) => {
    if (event.target === foodReportModal) closeFoodReportModal();
  });
}

if (productManager) {
  productManager.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-product-manager-toggle]");
    if (toggle) {
      productManagerExpanded = !productManagerExpanded;
      renderProductManager();
      return;
    }

    const editedFilterToggle = event.target.closest("[data-product-edited-filter-toggle]");
    if (editedFilterToggle) {
      productManagerEditedOnly = !productManagerEditedOnly;
      renderProductManager();
      return;
    }

    const saveBtn = event.target.closest("[data-product-save]");
    if (saveBtn) {
      saveProductSettings(saveBtn.dataset.productSave);
    }
  });

  productManager.addEventListener("input", (event) => {
    const searchInput = event.target.closest("#productManagerSearch");
    if (!searchInput) return;
    productManagerSearchTerm = searchInput.value || "";
    refreshProductManagerResults();
  });

  productManager.addEventListener("focusout", (event) => {
    const searchInput = event.target.closest("#productManagerSearch");
    if (!searchInput) return;
    productManagerSearchTerm = searchInput.value || "";
    window.requestAnimationFrame(renderProductManager);
  });

  productManager.addEventListener("keydown", (event) => {
    const searchInput = event.target.closest("#productManagerSearch");
    if (searchInput && event.key === "Enter") {
      event.preventDefault();
      searchInput.blur();
    }
  });

  productManager.addEventListener("change", (event) => {
    const categorySelect = event.target.closest("#productManagerCategory");
    if (!categorySelect) return;
    productManagerCategory = categorySelect.value || "all";
    renderProductManager();
  });
}

if (termsReport) {
  termsReport.addEventListener("click", (event) => {
    const presetButton = event.target.closest("[data-terms-report-preset]");
    if (presetButton) {
      setTermsReportPreset(presetButton.dataset.termsReportPreset || "day");
      refreshTermsReportData();
      return;
    }

    const shiftButton = event.target.closest("[data-terms-report-shift]");
    if (shiftButton) {
      shiftTermsReportRange(shiftButton.dataset.termsReportShift);
      refreshTermsReportData();
      return;
    }

    const currentButton = event.target.closest("[data-terms-report-current]");
    if (currentButton) {
      resetTermsReportToCurrentPreset();
      refreshTermsReportData();
      return;
    }

    const previewButton = event.target.closest("[data-terms-report-preview]");
    if (previewButton) {
      refreshTermsReportData();
      return;
    }

    const printButton = event.target.closest("[data-terms-report-print]");
    if (printButton) {
      printTermsReport();
    }
  });

  termsReport.addEventListener("change", (event) => {
    const startInput = event.target.closest("#termsReportStart");
    if (startInput) {
      termsReportPreset = "custom";
      termsReportRange = {
        start: parseDateInputValue(startInput.value, "start") || termsReportRange.start || startOfDay(new Date()),
        end: termsReportRange.end || endOfDay(new Date())
      };
      refreshTermsReportData();
      return;
    }

    const endInput = event.target.closest("#termsReportEnd");
    if (endInput) {
      termsReportPreset = "custom";
      termsReportRange = {
        start: termsReportRange.start || startOfDay(new Date()),
        end: parseDateInputValue(endInput.value, "end") || termsReportRange.end || endOfDay(new Date())
      };
      refreshTermsReportData();
      return;
    }

    const paymentSelect = event.target.closest("#termsReportPayment");
    if (paymentSelect) {
      termsReportPayment = paymentSelect.value || "all";
      refreshTermsReportData();
    }
  });
}

if (foodReport) {
  foodReport.addEventListener("click", (event) => {
    const presetButton = event.target.closest("[data-food-report-preset]");
    if (presetButton) {
      setFoodReportPreset(presetButton.dataset.foodReportPreset || "day");
      refreshFoodReportData();
      return;
    }

    const shiftButton = event.target.closest("[data-food-report-shift]");
    if (shiftButton) {
      shiftFoodReportRange(shiftButton.dataset.foodReportShift);
      refreshFoodReportData();
      return;
    }

    const currentButton = event.target.closest("[data-food-report-current]");
    if (currentButton) {
      resetFoodReportToCurrentPreset();
      refreshFoodReportData();
      return;
    }

    const previewButton = event.target.closest("[data-food-report-preview]");
    if (previewButton) {
      refreshFoodReportData();
      return;
    }

    const printButton = event.target.closest("[data-food-report-print]");
    if (printButton) {
      printFoodReport();
    }
  });

  foodReport.addEventListener("input", (event) => {
    const searchInput = event.target.closest("#foodReportSearch");
    if (!searchInput) return;
    foodReportSearch = searchInput.value || "";
    renderFoodReportKeepingSearchPosition(searchInput.selectionStart, searchInput.selectionEnd);
  });

  foodReport.addEventListener("focusout", (event) => {
    const searchInput = event.target.closest("#foodReportSearch");
    if (!searchInput) return;
    foodReportSearch = searchInput.value || "";
    window.requestAnimationFrame(renderFoodReport);
  });

  foodReport.addEventListener("keydown", (event) => {
    const searchInput = event.target.closest("#foodReportSearch");
    if (searchInput && event.key === "Enter") {
      event.preventDefault();
      searchInput.blur();
    }
  });

  foodReport.addEventListener("change", (event) => {
    const startInput = event.target.closest("#foodReportStart");
    if (startInput) {
      foodReportPreset = "custom";
      foodReportRange = {
        start: parseDateInputValue(startInput.value, "start") || foodReportRange.start || startOfDay(new Date()),
        end: foodReportRange.end || endOfDay(new Date())
      };
      refreshFoodReportData();
      return;
    }

    const endInput = event.target.closest("#foodReportEnd");
    if (endInput) {
      foodReportPreset = "custom";
      foodReportRange = {
        start: foodReportRange.start || startOfDay(new Date()),
        end: parseDateInputValue(endInput.value, "end") || foodReportRange.end || endOfDay(new Date())
      };
      refreshFoodReportData();
      return;
    }

    const paymentSelect = event.target.closest("#foodReportPayment");
    if (paymentSelect) {
      foodReportPayment = paymentSelect.value || "all";
      refreshFoodReportData();
      return;
    }

    const dishSelect = event.target.closest("#foodReportDishSelect");
    if (dishSelect) {
      foodReportSearch = dishSelect.value || "";
      renderFoodReport();
    }
  });
}

if (orderCreator) {
  orderCreator.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-order-creator-toggle]");
    if (toggle) {
      updateOrderCreatorDraftFromForm();
      orderCreatorExpanded = !orderCreatorExpanded;
      renderOrderCreator();
      return;
    }

    const addBtn = event.target.closest("[data-order-add]");
    if (addBtn) {
      addOrderCreatorItem(addBtn.dataset.orderAdd);
      return;
    }

    const qtyBtn = event.target.closest("[data-order-qty]");
    if (qtyBtn) {
      changeOrderCreatorQty(qtyBtn.dataset.orderQty, Number(qtyBtn.dataset.delta || 0));
      return;
    }

    const removeBtn = event.target.closest("[data-order-remove]");
    if (removeBtn) {
      removeOrderCreatorItem(removeBtn.dataset.orderRemove);
      return;
    }

    const clearBtn = event.target.closest("[data-order-clear]");
    if (clearBtn) clearOrderCreator();
  });

  orderCreator.addEventListener("input", (event) => {
    const searchInput = event.target.closest("#orderCreatorSearch");
    if (searchInput) {
      orderCreatorSearchTerm = searchInput.value || "";
      updateOrderCreatorDraftFromForm();
      refreshOrderCreatorProducts();
      return;
    }

    if (event.target.closest("#orderCreatorForm")) {
      updateOrderCreatorDraftFromForm();
    }
  });

  orderCreator.addEventListener("focusout", (event) => {
    const searchInput = event.target.closest("#orderCreatorSearch");
    if (!searchInput) return;
    orderCreatorSearchTerm = searchInput.value || "";
    updateOrderCreatorDraftFromForm();
    window.requestAnimationFrame(renderOrderCreator);
  });

  orderCreator.addEventListener("keydown", (event) => {
    const searchInput = event.target.closest("#orderCreatorSearch");
    if (searchInput && event.key === "Enter") {
      event.preventDefault();
      searchInput.blur();
    }
  });

  orderCreator.addEventListener("change", (event) => {
    const categorySelect = event.target.closest("#orderCreatorCategory");
    if (categorySelect) {
      orderCreatorCategory = categorySelect.value || "all";
      updateOrderCreatorDraftFromForm();
      renderOrderCreator();
      return;
    }

    const typeSelect = event.target.closest("#orderCreatorType");
    if (typeSelect) {
      orderCreatorType = typeSelect.value || "dine_in";
      updateOrderCreatorDraftFromForm();
      renderOrderCreator();
      return;
    }

    if (event.target.closest("#orderCreatorForm")) {
      updateOrderCreatorDraftFromForm();
    }
  });

  orderCreator.addEventListener("submit", (event) => {
    if (!event.target.closest("#orderCreatorForm")) return;
    event.preventDefault();
    submitCRMOrder();
  });
}

if (reviewPending) reviewPending.addEventListener("click", () => selectedOrderId && setStatus(selectedOrderId, "pending"));
if (reviewProgress) reviewProgress.addEventListener("click", () => selectedOrderId && setStatus(selectedOrderId, "preparing"));
if (reviewAccept) reviewAccept.addEventListener("click", () => selectedOrderId && setStatus(selectedOrderId, "accepted"));
if (reviewReject) reviewReject.addEventListener("click", () => selectedOrderId && setStatus(selectedOrderId, "rejected"));
closeReview.addEventListener("click", closeReviewModal);
reviewModal.addEventListener("click", (event) => {
  if (event.target === reviewModal) closeReviewModal();
});
closeHideOrderConfirmBtn?.addEventListener("click", closeHideOrderConfirm);
cancelHideOrderBtn?.addEventListener("click", closeHideOrderConfirm);
confirmHideOrderBtn?.addEventListener("click", confirmHideOrder);
hideOrderConfirmModal?.addEventListener("click", (event) => {
  if (event.target === hideOrderConfirmModal) closeHideOrderConfirm();
});
if (openFiscalSettingsBtn) {
  openFiscalSettingsBtn.addEventListener("click", () => {
    closeCrmSettingsModal();
    closeCRMHeaderNav();
    openFiscalSettingsModal();
  });
}
if (enableCrmNotificationsBtn) {
  enableCrmNotificationsBtn.addEventListener("click", async () => {
    closeCrmSettingsModal();
    closeCRMHeaderNav();
    await activateCRMNotifications({ remember: true, force: true });
  });
}
if (fiscalRangeAlertButton) {
  fiscalRangeAlertButton.addEventListener("click", () => {
    closeCRMHeaderNav();
    openFiscalSettingsModal();
  });
}
if (closeFiscalSettingsBtn) closeFiscalSettingsBtn.addEventListener("click", closeFiscalSettingsModal);
if (closeCrmSettingsBtn) closeCrmSettingsBtn.addEventListener("click", closeCrmSettingsModal);
if (closeOrderCreatorModalBtn) closeOrderCreatorModalBtn.addEventListener("click", closeOrderCreatorModal);
if (closeProductManagerModalBtn) closeProductManagerModalBtn.addEventListener("click", closeProductManagerModal);
if (closeTermsReportModalBtn) closeTermsReportModalBtn.addEventListener("click", closeTermsReportModal);
if (closeFoodReportModalBtn) closeFoodReportModalBtn.addEventListener("click", closeFoodReportModal);
if (crmNavToggle) crmNavToggle.addEventListener("click", toggleCRMHeaderNav);
if (crmHeaderNav) {
  crmHeaderNav.addEventListener("click", (event) => {
    const action = event.target.closest("a, button");
    if (action && window.innerWidth <= 860) closeCRMHeaderNav();
  });
}
document.addEventListener("click", (event) => {
  if (window.innerWidth > 860) return;
  if (!crmHeaderNav || !crmNavToggle) return;
  if (crmHeaderNav.contains(event.target) || crmNavToggle.contains(event.target)) return;
  closeCRMHeaderNav();
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 860) closeCRMHeaderNav();
});
if (fiscalSettingsModal) {
  fiscalSettingsModal.addEventListener("click", (event) => {
    if (event.target === fiscalSettingsModal) closeFiscalSettingsModal();
  });
}

reviewBody.addEventListener("click", async (event) => {
  const saveInvoiceButton = event.target.closest(".save-invoice-data");
  if (saveInvoiceButton) {
    await setInvoiceData(saveInvoiceButton.dataset.id);
    return;
  }

  const reviewEditItemsButton = event.target.closest("[data-review-items-edit]");
  if (reviewEditItemsButton && selectedOrderId) {
    const order = ordersCache.find((row) => row.id === selectedOrderId);
    if (!order || !canEditReviewItems(order)) return;
    reviewItemsEditMode = true;
    reviewItemsDraft = buildReviewItemsDraft(order);
    reviewBody.innerHTML = renderReviewBody(order);
    return;
  }

  const reviewStartAddButton = event.target.closest("[data-review-items-start-add]");
  if (reviewStartAddButton && selectedOrderId) {
    const order = ordersCache.find((row) => row.id === selectedOrderId);
    if (!order || !canEditReviewItems(order)) return;
    reviewItemsEditMode = true;
    reviewItemsDraft = buildReviewItemsDraft(order);
    reviewItemsDraft.push(createReviewDraftItem());
    reviewBody.innerHTML = renderReviewBody(order);
    return;
  }

  const reviewAddRowButton = event.target.closest("[data-review-items-add-row]");
  if (reviewAddRowButton && selectedOrderId) {
    const order = ordersCache.find((row) => row.id === selectedOrderId);
    if (!order || !canEditReviewItems(order)) return;
    reviewItemsDraft.push(createReviewDraftItem());
    reviewBody.innerHTML = renderReviewBody(order);
    return;
  }

  const reviewCancelItemsButton = event.target.closest("[data-review-items-cancel]");
  if (reviewCancelItemsButton && selectedOrderId) {
    const order = ordersCache.find((row) => row.id === selectedOrderId);
    if (!order) return;
    reviewItemsEditMode = false;
    reviewItemsDraft = buildReviewItemsDraft(order);
    reviewBody.innerHTML = renderReviewBody(order);
    return;
  }

  const reviewRemoveItemButton = event.target.closest("[data-review-item-remove]");
  if (reviewRemoveItemButton && selectedOrderId) {
    const order = ordersCache.find((row) => row.id === selectedOrderId);
    if (!order || !canEditReviewItems(order)) return;
    const index = Number(reviewRemoveItemButton.dataset.reviewItemRemove);
    reviewItemsDraft = reviewItemsDraft.filter((_item, itemIndex) => itemIndex !== index);
    if (!reviewItemsDraft.length) {
      reviewItemsDraft = [createReviewDraftItem()];
    }
    reviewBody.innerHTML = renderReviewBody(order);
    return;
  }

  const reviewQtyButton = event.target.closest("[data-review-item-qty]");
  if (reviewQtyButton && selectedOrderId) {
    const order = ordersCache.find((row) => row.id === selectedOrderId);
    if (!order || !canEditReviewItems(order)) return;
    const index = Number(reviewQtyButton.dataset.reviewItemQty);
    const step = Number(reviewQtyButton.dataset.reviewItemStep || 0);
    reviewItemsDraft = reviewItemsDraft.map((item, itemIndex) => itemIndex !== index
      ? item
      : normalizeReviewDraftItem({
          ...item,
          qty: Math.max(1, Number(item.qty || 1) + step)
        }));
    reviewBody.innerHTML = renderReviewBody(order);
    return;
  }

  const reviewSaveItemsButton = event.target.closest("[data-review-items-save]");
  if (reviewSaveItemsButton && selectedOrderId && !reviewItemsSaving) {
    const order = ordersCache.find((row) => row.id === selectedOrderId);
    if (!order || !canEditReviewItems(order)) return;
    const nextItems = reviewItemsDraft
      .map((item) => normalizeReviewDraftItem(item))
      .filter((item) => item.id && item.qty > 0);
    if (!nextItems.length) {
      showToast(t("reviewItemsNeedItems"));
      return;
    }

    reviewItemsSaving = true;
    try {
      const updatedOrder = await withSlowBusyScreen(t("savingAction"), () => updateOrderItems(selectedOrderId, nextItems));
      if (!updatedOrder) throw new Error("missing_updated_order");
      patchOrderInCache(selectedOrderId, () => updatedOrder);
      reviewItemsEditMode = false;
      reviewItemsDraft = buildReviewItemsDraft(updatedOrder);
      refreshOrderViews(selectedOrderId);
      showToast(t("reviewItemsUpdated"));
    } catch (_error) {
      showToast(t("reviewItemsUpdateError"));
    } finally {
      reviewItemsSaving = false;
    }
    return;
  }

  const fiscalPrintButton = event.target.closest(".print-fiscal-order");
  if (fiscalPrintButton) {
    await printFiscalOrder(fiscalPrintButton.dataset.id);
  }
});

reviewBody.addEventListener("focusin", (event) => {
  const input = event.target.closest(".invoice-input");
  if (!input || input.readOnly || !selectedOrderId) return;
  const order = ordersCache.find((row) => row.id === selectedOrderId);
  if (order && !invoiceDraftLastSavedValues.has(selectedOrderId)) {
    invoiceDraftLastSavedValues.set(selectedOrderId, serializeInvoiceDraft(defaultInvoiceData(order)));
  }
});

reviewBody.addEventListener("input", (event) => {
  const input = event.target.closest(".invoice-input");
  if (!input || input.readOnly || !selectedOrderId) return;
  const order = ordersCache.find((row) => row.id === selectedOrderId);
  if (order && !invoiceDraftLastSavedValues.has(selectedOrderId)) {
    invoiceDraftLastSavedValues.set(selectedOrderId, serializeInvoiceDraft(defaultInvoiceData(order)));
  }
  const nextDraft = normalizeInvoiceDraftData({
    ...defaultInvoiceData(order),
    ...getInvoiceDraftFromReview()
  });
  invoiceDraftPendingValues.set(selectedOrderId, nextDraft);
});

reviewBody.addEventListener("keydown", (event) => {
  const input = event.target.closest(".invoice-input");
  if (!input || input.readOnly) return;
  if (event.key === "Enter") {
    event.preventDefault();
    input.blur();
  }
});

reviewBody.addEventListener("focusout", (event) => {
  const input = event.target.closest(".invoice-input");
  if (!input || input.readOnly || !selectedOrderId) return;
  const order = ordersCache.find((row) => row.id === selectedOrderId);
  if (!order) return;
  const nextDraft = normalizeInvoiceDraftData({
    ...defaultInvoiceData(order),
    ...getInvoiceDraftFromReview()
  });
  invoiceDraftPendingValues.set(selectedOrderId, nextDraft);
  if (invoiceDraftSaveTimers.has(selectedOrderId)) {
    window.clearTimeout(invoiceDraftSaveTimers.get(selectedOrderId));
    invoiceDraftSaveTimers.delete(selectedOrderId);
  }
  persistInvoiceDraft(selectedOrderId, nextDraft);
});

reviewBody.addEventListener("change", (event) => {
  const productSelect = event.target.closest("[data-review-item-product]");
  if (productSelect && selectedOrderId) {
    const order = ordersCache.find((row) => row.id === selectedOrderId);
    if (!order || !canEditReviewItems(order)) return;
    const index = Number(productSelect.dataset.reviewItemProduct);
    const currentDraft = reviewItemsDraft[index];
    const sourceItem = reviewCatalogItemById(productSelect.value);
    reviewItemsDraft = reviewItemsDraft.map((item, itemIndex) => itemIndex !== index
      ? item
      : normalizeReviewDraftItem({
          ...currentDraft,
          id: productSelect.value,
          name: sourceItem?.title?.es || sourceItem?.title?.[lang] || currentDraft?.name || "",
          title: sourceItem?.title ? { ...sourceItem.title } : currentDraft?.title,
          price: Number(sourceItem?.price || 0),
          qty: Number(currentDraft?.qty || 1)
        }));
    reviewBody.innerHTML = renderReviewBody(order);
    return;
  }

  const toggle = event.target.closest(".invoice-checkbox");
  if (!toggle || !selectedOrderId) return;
  const order = ordersCache.find((row) => row.id === selectedOrderId);
  if (!order) return;
  const nextDraft = normalizeInvoiceDraftData({
    ...defaultInvoiceData(order),
    ...getInvoiceDraftFromReview()
  });
  invoiceDraftPendingValues.set(selectedOrderId, nextDraft);
  mergeOrderInvoiceInCache(selectedOrderId, nextDraft);
  const selectedOrder = ordersCache.find((row) => row.id === selectedOrderId);
  if (selectedOrder) reviewBody.innerHTML = renderReviewBody(selectedOrder);
  persistInvoiceDraft(selectedOrderId, nextDraft);
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showCRMView(button.dataset.view);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = currentCRMView();
    if (view === "reservations") {
      activeReservationFilter = button.dataset.filter;
      updateStatusFilterButtonsForView("reservations");
      renderReservations();
      return;
    }
    activeFilter = button.dataset.filter;
    updateStatusFilterButtonsForView("orders");
    renderOrders();
  });
});

periodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    periodButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    activePeriod = button.dataset.period;
    renderStats();
    renderFoodStats();
  });
});

function toggleLanguage() {
  lang = lang === "es" ? "en" : "es";
  applyI18n();
}

let crmI18nResizeFrame = null;
let crmI18nLastViewportWidth = window.innerWidth;
function scheduleCRMApplyI18n() {
  const nextViewportWidth = window.innerWidth;
  if (nextViewportWidth === crmI18nLastViewportWidth || isCRMEditableFieldActive()) return;
  crmI18nLastViewportWidth = nextViewportWidth;
  if (crmI18nResizeFrame !== null) return;
  crmI18nResizeFrame = window.requestAnimationFrame(() => {
    crmI18nResizeFrame = null;
    applyI18n();
  });
}

if (langToggleDesktop) langToggleDesktop.addEventListener("click", toggleLanguage);
if (langToggleMobile) langToggleMobile.addEventListener("click", toggleLanguage);

window.addEventListener("resize", scheduleCRMApplyI18n);
window.addEventListener("pointerdown", unlockNotificationSound, { once: true });
window.addEventListener("keydown", unlockNotificationSound, { once: true });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && currentStaffUser) {
    renewCRMNotificationsIfAllowed();
  }
});
window.addEventListener("focus", () => {
  if (currentStaffUser) renewCRMNotificationsIfAllowed();
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  pendingAuthMessage = "";
  const username = authUser.value.trim();
  const password = authPassword.value;

  if (!username || !password) {
    setAuthMessage(t("authInvalid"), "error");
    return;
  }

  setAuthBusy(true);
  setAuthMessage(t("authChecking"), "info");
  try {
    const email = await getEmailByUsername(username);
    if (!email) {
      throw { code: "crm/username-not-found" };
    }
    await signInWithEmailPassword(email, password);
    authPassword.value = "";
  } catch (error) {
    setAuthMessage(describeAuthError(error), "error");
  } finally {
    setAuthBusy(false);
  }
});

signOutBtn.addEventListener("click", async () => {
  await signOutUser();
  lockUI();
});

if (fiscalSettingsForm) {
  fiscalSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      if (!currentStaffUser) {
        lockUI();
        return;
      }
      const values = getFiscalFormValues();
      const rangeCheck = validateFiscalRange(values);
      if (!rangeCheck.ok) {
        showToast(t(
          rangeCheck.reason === "exhausted"
            ? "invoiceRangeExhausted"
            : rangeCheck.reason === "expired"
              ? "invoiceDeadlineExceeded"
              : "invalidRange"
        ));
        return;
      }
      await saveFiscalSettings(values, currentStaffUser);
      fiscalSettings = mergeFiscalSettings(values);
      updateFiscalRangeAlert();
      showToast(t("saved"));
      renderOrders();
      if (selectedOrderId) openReview(selectedOrderId);
    } catch (error) {
      if (error && error.message === "duplicate_next_invoice_number") {
        showToast(t("duplicateNextInvoiceNumber"));
        return;
      }
      showToast("Error");
    }
  });
}

onAuthChange(async (user) => {
  if (!user) {
    currentStaffUser = null;
    currentStaffProfile = null;
    setAuthBusy(false);
    setAuthMessage(pendingAuthMessage || "", pendingAuthMessage ? "error" : "info");
    pendingAuthMessage = "";
    lockUI();
    return;
  }

  try {
    currentStaffUser = user;
    setAuthMessage(t("authChecking"), "info");
    const access = await isStaffAuthorized(user);
    if (!access.allowed) {
      currentStaffProfile = null;
      pendingAuthMessage = t("authDenied");
      await signOutUser();
      return;
    }

    currentStaffProfile = access.profile;
    if (redirectIfWrongPanel(currentStaffProfile)) return;
    setAuthMessage("");
    await unlockUI(user, currentStaffProfile);
  } catch (_error) {
    setAuthBusy(false);
    showToast(t("authSessionExpired"));
  }
});

applyI18n();
lockUI();
