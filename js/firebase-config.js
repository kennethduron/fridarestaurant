import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  updateDoc,
  setDoc,
  doc,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhvj2yi52FBG8WtBi1unlASilyIrcMGVk",
  authDomain: "casabrava2-400d3.firebaseapp.com",
  projectId: "casabrava2-400d3",
  storageBucket: "casabrava2-400d3.firebasestorage.app",
  messagingSenderId: "835307342490",
  appId: "1:835307342490:web:06f1e5a95f28fcf1ba6d23"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function normalizeOrderInput(order) {
  const paymentMethod = (order.payment && order.payment.method) || "cash_on_pickup";
  const paymentStatus = (order.payment && order.payment.status) || (paymentMethod === "online" ? "pending" : "unpaid");
  const invoice = order && order.invoice && typeof order.invoice === "object"
    ? {
        billingName: String(order.invoice.billingName || "").trim(),
        billingRTN: String(order.invoice.billingRTN || "").trim(),
        invoiceNumber: String(order.invoice.invoiceNumber || "").trim(),
        notes: String(order.invoice.notes || "").trim(),
        hasExoneration: Boolean(order.invoice.hasExoneration),
        exemptionRegister: String(order.invoice.exemptionRegister || "").trim(),
        exemptOrderNumber: String(order.invoice.exemptOrderNumber || "").trim(),
        sagRegister: String(order.invoice.sagRegister || "").trim()
      }
    : null;
  return {
    displayId: order.displayId || null,
    language: order.language || "es",
    customer: {
      name: (order.customer && order.customer.name) || "",
      phone: (order.customer && order.customer.phone) || "",
      comments: (order.customer && order.customer.comments) || "",
      pickup: Boolean(order.customer && order.customer.pickup)
    },
    items: Array.isArray(order.items) ? order.items : [],
    total: Number(order.total || 0),
    payment: {
      method: paymentMethod,
      status: paymentStatus,
      provider: (order.payment && order.payment.provider) || "",
      checkoutUrl: (order.payment && order.payment.checkoutUrl) || "",
      cardLast4: (order.payment && order.payment.cardLast4) || "",
      transactionId: (order.payment && order.payment.transactionId) || "",
      paypalOrderId: (order.payment && order.payment.paypalOrderId) || ""
    },
    ...(invoice ? { invoice } : {}),
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
}

async function addOrder(order) {
  const payload = normalizeOrderInput(order);
  try {
    const ref = await addDoc(collection(db, "orders"), payload);
    return ref.id;
  } catch (error) {
    const code = String(error && error.code ? error.code : "");
    const isPermissionDenied = code.includes("permission-denied");
    if (!isPermissionDenied) throw error;

    // Backward-compatible fallback for projects still running older Firestore rules
    // that do not accept the `payment` or `invoice` fields yet.
    const legacyPayload = { ...payload };
    delete legacyPayload.payment;
    delete legacyPayload.invoice;
    if (legacyPayload.customer && typeof legacyPayload.customer === "object") {
      delete legacyPayload.customer.pickup;
    }
    const ref = await addDoc(collection(db, "orders"), legacyPayload);
    return ref.id;
  }
}

async function addReservation(reservation) {
  const payload = {
    name: reservation.name || "",
    phone: reservation.phone || "",
    email: reservation.email || "",
    date: reservation.date || "",
    time: reservation.time || "",
    party: Number(reservation.party || 1),
    occasion: reservation.occasion || "",
    allergies: reservation.allergies || "",
    notes: reservation.notes || "",
    language: reservation.language || "es",
    createdAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, "reservations"), payload);
  return ref.id;
}

function listenOrders(successCb, errorCb) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows = snapshot.docs.map((row) => ({ id: row.id, ...row.data() }));
      successCb(rows);
    },
    (error) => {
      if (typeof errorCb === "function") errorCb(error);
    }
  );
}

function listenReservations(successCb, errorCb) {
  const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows = snapshot.docs.map((row) => ({ id: row.id, ...row.data() }));
      successCb(rows);
    },
    (error) => {
      if (typeof errorCb === "function") errorCb(error);
    }
  );
}

function listenOrderById(orderId, successCb, errorCb) {
  const ref = doc(db, "orders", orderId);
  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        successCb(null);
        return;
      }
      successCb({ id: snapshot.id, ...snapshot.data() });
    },
    (error) => {
      if (typeof errorCb === "function") errorCb(error);
    }
  );
}

async function updateOrderStatus(id, status, staffUser) {
  const ref = doc(db, "orders", id);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
    updatedBy: {
      uid: staffUser && staffUser.uid ? staffUser.uid : "",
      email: staffUser && staffUser.email ? staffUser.email : ""
    }
  });
}

async function updateOrderPaymentStatus(id, paymentStatus, staffUser) {
  const ref = doc(db, "orders", id);
  await updateDoc(ref, {
    "payment.status": paymentStatus,
    updatedAt: serverTimestamp(),
    paymentUpdatedBy: {
      uid: staffUser && staffUser.uid ? staffUser.uid : "",
      email: staffUser && staffUser.email ? staffUser.email : ""
    }
  });
}

async function updateOrderPaymentMethod(id, paymentMethod, staffUser) {
  const ref = doc(db, "orders", id);
  await updateDoc(ref, {
    "payment.method": paymentMethod,
    updatedAt: serverTimestamp(),
    paymentUpdatedBy: {
      uid: staffUser && staffUser.uid ? staffUser.uid : "",
      email: staffUser && staffUser.email ? staffUser.email : ""
    }
  });
}

async function updateOrderInvoiceData(id, invoiceData, staffUser) {
  const ref = doc(db, "orders", id);
  await updateDoc(ref, {
    invoice: {
      billingName: String(invoiceData && invoiceData.billingName ? invoiceData.billingName : "").trim(),
      billingRTN: String(invoiceData && invoiceData.billingRTN ? invoiceData.billingRTN : "").trim(),
      invoiceNumber: String(invoiceData && invoiceData.invoiceNumber ? invoiceData.invoiceNumber : "").trim(),
      notes: String(invoiceData && invoiceData.notes ? invoiceData.notes : "").trim(),
      fiscalPrintedAt: String(invoiceData && invoiceData.fiscalPrintedAt ? invoiceData.fiscalPrintedAt : "").trim(),
      hasExoneration: Boolean(invoiceData && invoiceData.hasExoneration),
      exemptionRegister: String(invoiceData && invoiceData.exemptionRegister ? invoiceData.exemptionRegister : "").trim(),
      exemptOrderNumber: String(invoiceData && invoiceData.exemptOrderNumber ? invoiceData.exemptOrderNumber : "").trim(),
      sagRegister: String(invoiceData && invoiceData.sagRegister ? invoiceData.sagRegister : "").trim()
    },
    updatedAt: serverTimestamp(),
    invoiceUpdatedBy: {
      uid: staffUser && staffUser.uid ? staffUser.uid : "",
      email: staffUser && staffUser.email ? staffUser.email : ""
    }
  });
}

async function loadFiscalSettings() {
  const ref = doc(db, "settings", "fiscalInvoice");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

async function saveFiscalSettings(settings, staffUser) {
  const nextInvoiceNumber = String(settings && settings.nextInvoiceNumber ? settings.nextInvoiceNumber : "").trim();
  if (nextInvoiceNumber) {
    const duplicateQuery = query(
      collection(db, "orders"),
      where("invoice.invoiceNumber", "==", nextInvoiceNumber),
      limit(1)
    );
    const duplicateSnapshot = await getDocs(duplicateQuery);
    if (!duplicateSnapshot.empty) {
      throw new Error("duplicate_next_invoice_number");
    }
  }

  const ref = doc(db, "settings", "fiscalInvoice");
  await setDoc(ref, {
    ...settings,
    updatedAt: serverTimestamp(),
    updatedBy: {
      uid: staffUser && staffUser.uid ? staffUser.uid : "",
      email: staffUser && staffUser.email ? staffUser.email : ""
    }
  }, { merge: true });
}

function parseFiscalNumber(value) {
  const normalized = String(value || "").trim();
  const parts = normalized.split("-");
  if (parts.length < 4) return null;
  const serial = parts[parts.length - 1];
  const prefix = parts.slice(0, -1).join("-");
  const numeric = Number(serial);
  if (!prefix || !serial || !Number.isInteger(numeric)) return null;
  return {
    prefix,
    serial,
    width: serial.length,
    numeric
  };
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

async function reserveNextFiscalInvoiceNumber(staffUser) {
  const ref = doc(db, "settings", "fiscalInvoice");
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error("missing_fiscal_settings");
    const data = snap.data() || {};
    const currentValue = String(data.nextInvoiceNumber || data.authorizationRangeStart || "").trim();
    const endValue = String(data.authorizationRangeEnd || "").trim();
    const deadline = parseFiscalDeadline(data.emissionDeadline);
    const current = parseFiscalNumber(currentValue);
    const end = parseFiscalNumber(endValue);
    if (!current || !end || current.prefix !== end.prefix) throw new Error("invalid_fiscal_range");
    if (deadline && Date.now() > deadline.getTime()) throw new Error("fiscal_emission_deadline_exceeded");
    if (current.numeric > end.numeric) throw new Error("fiscal_range_exhausted");

    const issuedInvoiceNumber = currentValue;
    const nextNumeric = current.numeric + 1;
    const nextInvoiceNumber = nextNumeric <= end.numeric
      ? `${current.prefix}-${String(nextNumeric).padStart(current.width, "0")}`
      : "";

    transaction.set(ref, {
      nextInvoiceNumber,
      lastIssuedInvoiceNumber: issuedInvoiceNumber,
      updatedAt: new Date(),
      updatedBy: {
        uid: staffUser && staffUser.uid ? staffUser.uid : "",
        email: staffUser && staffUser.email ? staffUser.email : ""
      }
    }, { merge: true });

    return issuedInvoiceNumber;
  });
}

async function getStaffProfile(uid) {
  if (!uid) return null;
  const ref = doc(db, "staff", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() };
}

async function isStaffAuthorized(user) {
  if (!user) return { allowed: false, reason: "No user" };
  const profile = await getStaffProfile(user.uid);
  if (!profile) return { allowed: false, reason: "Missing staff profile" };
  const role = String(profile.role || "").toLowerCase();
  const active = Boolean(profile.active);
  const allowedRoles = ["admin", "agent", "representative"];
  if (!active || !allowedRoles.includes(role)) {
    return { allowed: false, reason: "Inactive or invalid role", profile };
  }
  return { allowed: true, profile };
}

async function signInWithEmailPassword(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

async function getEmailByUsername(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  const ref = doc(db, "usernames", normalized);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const email = String(snap.data().email || "").trim();
  return email || null;
}

function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

async function signOutUser() {
  await signOut(auth);
}

export {
  app,
  db,
  auth,
  addOrder,
  addReservation,
  listenOrders,
  listenReservations,
  listenOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderPaymentMethod,
  updateOrderInvoiceData,
  loadFiscalSettings,
  saveFiscalSettings,
  reserveNextFiscalInvoiceNumber,
  getStaffProfile,
  isStaffAuthorized,
  signInWithEmailPassword,
  getEmailByUsername,
  onAuthChange,
  signOutUser
};
