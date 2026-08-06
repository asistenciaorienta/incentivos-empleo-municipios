(() => {
  "use strict";

  const config = window.INCENTIVOS_CONFIG ?? {};
  const url = String(config.SUPABASE_URL ?? "").trim();
  const publishableKey = String(config.SUPABASE_PUBLISHABLE_KEY ?? "").trim();
  const PAYLOAD_SCHEMA = "incentivos-empleo.participant.v1";
  const AES_ADDITIONAL_DATA = new TextEncoder().encode(PAYLOAD_SCHEMA);
  const DOCUMENT_SCHEMA = "incentivos-empleo.signed-annex.v1";
  const MAX_SIGNED_ANNEX_BYTES = 12 * 1024 * 1024;
  const GENERATED_ANNEX_SCHEMA = "incentivos-empleo.generated-annex.v1";
  const ANNEX_KEY_STORAGE_PREFIX = "incentivos-generated-annex-key";

  const elements = {
    notice: document.querySelector("#appNotice"),
    loginView: document.querySelector("#loginView"),
    portalView: document.querySelector("#portalView"),
    loginForm: document.querySelector("#loginForm"),
    loginButton: document.querySelector("#loginButton"),
    email: document.querySelector("#email"),
    password: document.querySelector("#password"),
    logoutButton: document.querySelector("#logoutButton"),
    refreshButton: document.querySelector("#refreshButton"),
    refreshRegistrationsButton: document.querySelector("#refreshRegistrationsButton"),
    municipalityName: document.querySelector("#municipalityName"),
    userSummary: document.querySelector("#userSummary"),
    sessionCount: document.querySelector("#sessionCount"),
    initialCount: document.querySelector("#initialCount"),
    finalCount: document.querySelector("#finalCount"),
    registrationTabCount: document.querySelector("#registrationTabCount"),
    sessionsLoading: document.querySelector("#sessionsLoading"),
    sessionsEmpty: document.querySelector("#sessionsEmpty"),
    sessionsGrid: document.querySelector("#sessionsGrid"),
    registrationsLoading: document.querySelector("#registrationsLoading"),
    registrationsEmpty: document.querySelector("#registrationsEmpty"),
    registrationsList: document.querySelector("#registrationsList"),
    initialDialog: document.querySelector("#initialRegistrationDialog"),
    initialForm: document.querySelector("#initialRegistrationForm"),
    registrationNotice: document.querySelector("#registrationNotice"),
    initialSessionId: document.querySelector("#initialSessionId"),
    initialSessionSummary: document.querySelector("#initialSessionSummary"),
    closeInitialDialog: document.querySelector("#closeInitialDialog"),
    cancelInitialRegistration: document.querySelector("#cancelInitialRegistration"),
    submitInitialRegistration: document.querySelector("#submitInitialRegistration"),
    firstName: document.querySelector("#firstName"),
    firstSurname: document.querySelector("#firstSurname"),
    secondSurname: document.querySelector("#secondSurname"),
    documentType: document.querySelector("#documentType"),
    documentNumber: document.querySelector("#documentNumber"),
    informationConfirmed: document.querySelector("#informationConfirmed"),
    initialProgram: document.querySelector("#initialProgram"),
    initialProgramHelp: document.querySelector("#initialProgramHelp"),
    safePreview: document.querySelector("#safePreview"),
    finalDialog: document.querySelector("#finalRegistrationDialog"),
    finalForm: document.querySelector("#finalRegistrationForm"),
    finalRegistrationNotice: document.querySelector("#finalRegistrationNotice"),
    finalSessionId: document.querySelector("#finalSessionId"),
    finalSessionSummary: document.querySelector("#finalSessionSummary"),
    eligibleParticipant: document.querySelector("#eligibleParticipant"),
    finalProgram: document.querySelector("#finalProgram"),
    closeFinalDialog: document.querySelector("#closeFinalDialog"),
    cancelFinalRegistration: document.querySelector("#cancelFinalRegistration"),
    submitFinalRegistration: document.querySelector("#submitFinalRegistration"),
    cancelDialog: document.querySelector("#cancelDialog"),
    cancelDialogText: document.querySelector("#cancelDialogText"),
    closeCancelDialog: document.querySelector("#closeCancelDialog"),
    keepRegistrationButton: document.querySelector("#keepRegistrationButton"),
    confirmCancelButton: document.querySelector("#confirmCancelButton"),
    documentTabCount: document.querySelector("#documentTabCount"),
    refreshDocumentsButton: document.querySelector("#refreshDocumentsButton"),
    documentsLoading: document.querySelector("#documentsLoading"),
    documentsEmpty: document.querySelector("#documentsEmpty"),
    documentsList: document.querySelector("#documentsList"),
    documentUploadDialog: document.querySelector("#documentUploadDialog"),
    documentUploadForm: document.querySelector("#documentUploadForm"),
    documentUploadNotice: document.querySelector("#documentUploadNotice"),
    documentSessionId: document.querySelector("#documentSessionId"),
    documentSessionSummary: document.querySelector("#documentSessionSummary"),
    signedAnnexFile: document.querySelector("#signedAnnexFile"),
    closeDocumentUploadDialog: document.querySelector("#closeDocumentUploadDialog"),
    cancelDocumentUpload: document.querySelector("#cancelDocumentUpload"),
    submitDocumentUpload: document.querySelector("#submitDocumentUpload"),
    annexGenerationDialog: document.querySelector("#annexGenerationDialog"),
    annexGenerationForm: document.querySelector("#annexGenerationForm"),
    annexGenerationNotice: document.querySelector("#annexGenerationNotice"),
    annexGenerationSessionId: document.querySelector("#annexGenerationSessionId"),
    annexGenerationSummary: document.querySelector("#annexGenerationSummary"),
    annexModality: document.querySelector("#annexModality"),
    annexRepresentativeName: document.querySelector("#annexRepresentativeName"),
    annexRepresentativePosition: document.querySelector("#annexRepresentativePosition"),
    annexParticipantCount: document.querySelector("#annexParticipantCount"),
    annexParticipantsList: document.querySelector("#annexParticipantsList"),
    annexSelectAll: document.querySelector("#annexSelectAll"),
    closeAnnexGenerationDialog: document.querySelector("#closeAnnexGenerationDialog"),
    cancelAnnexGeneration: document.querySelector("#cancelAnnexGeneration"),
    submitAnnexGeneration: document.querySelector("#submitAnnexGeneration")
  };

  let client = null;
  let currentUser = null;
  let currentProfile = null;
  let sessions = [];
  let registrations = [];
  let eligibleParticipants = [];
  let programs = [];
  let activeEncryptionKey = null;
  let registrationToCancel = null;
  let municipalDocuments = [];
  let annexGenerationRequests = [];

  function showNotice(type, message, target = elements.notice) {
    target.className = `notice ${type}`;
    target.textContent = message;
    target.hidden = false;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearNotice(target = elements.notice) {
    target.hidden = true;
    target.textContent = "";
    target.className = "notice";
  }

  function configurationIsValid() {
    return url.startsWith("https://") && !url.includes("PEGA_AQUI") && publishableKey.length >= 20 && !publishableKey.includes("PEGA_AQUI");
  }

  function setLoginBusy(isBusy) {
    elements.loginButton.disabled = isBusy;
    elements.email.disabled = isBusy;
    elements.password.disabled = isBusy;
    elements.loginButton.textContent = isBusy ? "Comprobando…" : "Entrar";
  }

  function setPortalVisible(visible) {
    elements.loginView.hidden = visible;
    elements.portalView.hidden = !visible;
  }

  function setActiveSection(sectionId) {
    document.querySelectorAll(".portal-section").forEach((section) => {
      section.hidden = section.id !== sectionId;
    });
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === sectionId);
    });
  }

  function formatDate(value) {
    if (!value) return "—";
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(date);
  }

  function formatTime(value) {
    return value ? String(value).slice(0, 5) : "—";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizePersonText(value) {
    return String(value ?? "").normalize("NFC").trim().replace(/\s+/g, " ");
  }

  function initialOf(value) {
    const normalized = normalizePersonText(value);
    return normalized ? normalized.charAt(0).toLocaleUpperCase("es-ES") : "";
  }

  function displayName(firstName, firstSurname, secondSurname) {
    const name = normalizePersonText(firstName);
    const firstInitial = initialOf(firstSurname);
    const secondInitial = initialOf(secondSurname);
    return `${name} ${firstInitial || "_"}. ${secondInitial || "_"}.`;
  }

  function normalizeDocument(value) {
    return String(value ?? "").toUpperCase().replace(/[\s.-]/g, "");
  }

  function validateDocument(type, value) {
    const normalized = normalizeDocument(value);
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE";

    if (type === "DNI") {
      if (!/^\d{8}[A-Z]$/.test(normalized)) return false;
      return letters[Number(normalized.slice(0, 8)) % 23] === normalized.at(-1);
    }

    if (!/^[XYZ]\d{7}[A-Z]$/.test(normalized)) return false;
    const prefix = { X: "0", Y: "1", Z: "2" }[normalized.charAt(0)];
    const number = Number(prefix + normalized.slice(1, 8));
    return letters[number % 23] === normalized.at(-1);
  }

  function maskedDocument(value) {
    const digits = normalizeDocument(value).replace(/\D/g, "");
    return `***${digits.slice(-4).padStart(4, "0")}**`;
  }

  function updateSafePreview() {
    elements.safePreview.textContent = `${displayName(elements.firstName.value, elements.firstSurname.value, elements.secondSurname.value)} · ${maskedDocument(elements.documentNumber.value)}`;
  }

  function bytesToBase64(bytes) {
    const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < array.length; index += chunkSize) {
      binary += String.fromCharCode(...array.subarray(index, index + chunkSize));
    }
    return btoa(binary);
  }


  function base64ToBytes(value) {
    const binary = atob(String(value || ""));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function annexKeyStorageName(requestId) {
    return `${ANNEX_KEY_STORAGE_PREFIX}:${currentUser?.id || "user"}:${requestId}`;
  }

  function generatedAnnexAdditionalData(request) {
    return JSON.stringify({
      schema: GENERATED_ANNEX_SCHEMA,
      version: 1,
      request_id: String(request.id),
      municipality_id: String(request.municipality_id),
      session_id: String(request.session_id),
    });
  }

  async function createAnnexDownloadKey(publicKeyPem) {
    const rsaKey = await crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(publicKeyPem),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
    const aesKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const rawKey = await crypto.subtle.exportKey("raw", aesKey);
    const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKey, rawKey);
    return {
      rawKey: bytesToBase64(rawKey),
      encryptedKey: bytesToBase64(encryptedKey),
    };
  }

  function pemToArrayBuffer(pem) {
    const base64 = String(pem)
      .trim()
      .replace("-----BEGIN PUBLIC KEY-----", "")
      .replace("-----END PUBLIC KEY-----", "")
      .replace(/\s/g, "");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  async function encryptIdentity(identity, context, publicKeyPem) {
    if (!window.isSecureContext || !window.crypto?.subtle) {
      throw new Error("El navegador no dispone de un contexto seguro para cifrar los datos.");
    }

    const rsaKey = await crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(publicKeyPem),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );

    const aesKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const payload = {
      schema: PAYLOAD_SCHEMA,
      version: 1,
      generated_at: new Date().toISOString(),
      context,
      identity,
      declarations: {
        information_provided: true,
        confirmed_at: new Date().toISOString()
      }
    };

    const plaintext = new TextEncoder().encode(JSON.stringify(payload));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData: AES_ADDITIONAL_DATA, tagLength: 128 },
      aesKey,
      plaintext
    );
    const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
    const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKey, rawAesKey);

    return {
      encryptedKey: bytesToBase64(encryptedKey),
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(ciphertext)
    };
  }


  function bytesToHex(bytes) {
    return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  function documentAdditionalData(documentId, sessionId) {
    return JSON.stringify({
      schema: DOCUMENT_SCHEMA,
      version: 1,
      document_id: String(documentId),
      municipality_id: String(currentProfile.municipality.id),
      session_id: String(sessionId),
    });
  }

  async function validateAndReadPdf(file) {
    if (!file) throw new Error("Selecciona un archivo PDF.");
    if (file.size < 5 || file.size > MAX_SIGNED_ANNEX_BYTES) {
      throw new Error("El PDF debe ocupar como máximo 12 MB.");
    }
    const buffer = await file.arrayBuffer();
    const header = new TextDecoder("ascii").decode(buffer.slice(0, 5));
    if (header !== "%PDF-") throw new Error("El archivo seleccionado no es un PDF válido.");
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return { buffer, sha256: bytesToHex(digest) };
  }

  async function encryptSignedAnnex(buffer, documentId, sessionId, publicKeyPem) {
    const rsaKey = await crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(publicKeyPem),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
    const aesKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const additionalData = new TextEncoder().encode(documentAdditionalData(documentId, sessionId));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData, tagLength: 128 },
      aesKey,
      buffer
    );
    const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
    const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKey, rawAesKey);
    return {
      encryptedKey: bytesToBase64(encryptedKey),
      iv: bytesToBase64(iv),
      ciphertext,
    };
  }

  function documentSyncLabel(status) {
    return ({
      pending: "Pendiente de incorporar al SAE",
      processing: "Incorporando al SAE",
      synced: "Incorporado al SAE",
      error: "Error de sincronización",
    })[status] ?? status;
  }

  function documentValidationLabel(status) {
    return ({
      pending_validation: "Pendiente de validación",
      validated: "Validado",
      incident: "Con incidencia",
      superseded: "Versión sustituida",
    })[status] ?? status;
  }


  function annexGenerationStatusLabel(status) {
    return ({
      pending: "Pendiente de generar",
      processing: "Generando en el SAE",
      ready: "Preparado para descargar",
      downloaded: "Descargado",
      error: "Error de generación",
      expired: "Descarga caducada",
    })[status] ?? status;
  }

  function statusLabel(status) {
    return ({ pending: "Pendiente", confirmed: "Confirmada", incident: "Incidencia", cancelled: "Cancelada", attended: "Realizada", absent: "No asistió" })[status] ?? status;
  }

  function syncLabel(status) {
    return ({ pending: "Pendiente de incorporar al SAE", processing: "Procesando", synced: "Incorporada al SAE", error: "Error de sincronización" })[status] ?? status;
  }

  function sessionCard(session) {
    const isInitial = session.session_type === "initial";
    const phaseLabel = isInitial ? "Sesión inicial" : "Sesión final";
    const availability = session.registration_open ? "Inscripción abierta" : "Inscripción cerrada";
    const available = Number(session.regular_available ?? 0);
    const canRegisterInitial = isInitial && session.registration_open && available > 0;
    const canRegisterFinal = !isInitial && session.registration_open && available > 0 && eligibleParticipants.length > 0;
    let actionLabel = "Inscripción cerrada";
    let actionClass = "";
    let note = "";

    if (canRegisterInitial) {
      actionLabel = "Inscribir persona";
      actionClass = "js-register-initial";
    } else if (canRegisterFinal) {
      actionLabel = "Inscribir en final";
      actionClass = "js-register-final";
    } else if (!isInitial && session.registration_open && eligibleParticipants.length === 0) {
      actionLabel = "Sin personas disponibles";
      note = "La sesión final se habilita cuando el SAE confirma que la persona completó la sesión inicial.";
    }

    return `
      <article class="session-card">
        <span class="badge ${isInitial ? "initial" : "final"}">${phaseLabel}</span>
        <h3>${escapeHtml(session.title)}</h3>
        <dl class="session-meta">
          <div><dt>Fecha</dt><dd>${escapeHtml(formatDate(session.session_date))}</dd></div>
          <div><dt>Horario</dt><dd>${escapeHtml(formatTime(session.start_time))}–${escapeHtml(formatTime(session.end_time))}</dd></div>
          <div><dt>Personal formador</dt><dd>${escapeHtml(session.trainer || "Pendiente")}</dd></div>
          <div><dt>Plazas ordinarias libres</dt><dd>${available}</dd></div>
        </dl>
        <div class="session-footer">
          <span class="badge ${session.registration_open ? "open" : "closed"}">${availability}</span>
          <button class="button ${actionClass ? "primary" : "secondary"} small ${actionClass}" type="button" data-session-id="${session.id}" ${actionClass ? "" : "disabled"}>${actionLabel}</button>
        </div>
        ${note ? `<p class="session-enrol-note">${escapeHtml(note)}</p>` : ""}
      </article>`;
  }

  function registrationItem(registration) {
    const participant = registration.participant ?? {};
    const session = registration.session ?? {};
    const canCancel = ["pending", "confirmed", "incident"].includes(registration.status);
    return `
      <article class="registration-item">
        <div class="registration-person">
          <strong>${escapeHtml(participant.display_name || "Persona")}</strong>
          <small>${escapeHtml(participant.masked_document || "Documento protegido")}</small>
          ${participant.incident_message ? `<small class="danger-text">${escapeHtml(participant.incident_message)}</small>` : ""}
        </div>
        <div class="registration-session">
          <strong>${escapeHtml(session.title || "Sesión")}</strong>
          <small>${escapeHtml(formatDate(session.session_date))} · ${registration.phase === "initial" ? "Inicial" : "Final"}</small>
          <small>Programa: ${escapeHtml(registration.program_name_snapshot || "Sin programa")}</small>
          <div class="status-row">
            <span class="badge ${registration.status}">${escapeHtml(statusLabel(registration.status))}</span>
            <span class="badge ${registration.sync_status}">${escapeHtml(syncLabel(registration.sync_status))}</span>
          </div>
        </div>
        <button class="button secondary small js-cancel-registration" type="button" data-registration-id="${registration.id}" ${canCancel ? "" : "disabled"}>${canCancel ? "Cancelar inscripción" : "Sin acciones"}</button>
      </article>`;
  }


  function latestDocumentForSession(sessionId) {
    return municipalDocuments
      .filter((item) => item.session_id === sessionId && item.validation_status !== "superseded")
      .sort((a, b) => Number(b.version) - Number(a.version))[0] ?? null;
  }

  function latestGenerationForSession(sessionId) {
    return annexGenerationRequests
      .filter((item) => item.session_id === sessionId)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0] ?? null;
  }

  function documentSessionItem(group) {
    const document = latestDocumentForSession(group.session.id);
    const generation = latestGenerationForSession(group.session.id);
    const today = new Date().toISOString().slice(0, 10);
    const sessionCelebrated = group.session.session_date <= today;
    const canUpload = sessionCelebrated && (!document || document.validation_status === "incident" || document.sync_status === "error");
    const uploadLabel = document ? "Enviar nueva versión" : "Incorporar PDF firmado";
    const documentStatusHtml = document
      ? `<div class="status-row"><span class="badge ${document.sync_status}">${escapeHtml(documentSyncLabel(document.sync_status))}</span><span class="badge ${document.validation_status === "validated" ? "synced" : document.validation_status === "incident" ? "incident" : "pending"}">${escapeHtml(documentValidationLabel(document.validation_status))}</span></div><small>Versión ${document.version}${document.processed_at ? ` · recibida por el SAE` : ""}</small>${document.incident_message ? `<small class="danger-text">${escapeHtml(document.incident_message)}</small>` : ""}`
      : `<span class="badge pending">Sin PDF firmado</span><small>${sessionCelebrated ? "Pendiente de escanear y entregar." : "Se incorporará después de la sesión."}</small>`;

    const localKeyAvailable = generation ? Boolean(localStorage.getItem(annexKeyStorageName(generation.id))) : false;
    const generationStatusHtml = generation
      ? `<div class="status-row"><span class="badge ${generation.status === "ready" ? "synced" : generation.status === "error" ? "incident" : "pending"}">${escapeHtml(annexGenerationStatusLabel(generation.status))}</span></div><small>${generation.page_count ? `${generation.page_count} página${generation.page_count === 1 ? "" : "s"} · ` : ""}${generation.generated_at ? "generado por el SAE" : "solicitud en curso"}</small>${generation.incident_message ? `<small class="danger-text">${escapeHtml(generation.incident_message)}</small>` : ""}`
      : `<span class="badge pending">No generado</span><small>Prepara el listado oficial para recoger las firmas.</small>`;

    const canDownload = generation?.status === "ready" && localKeyAvailable && generation.storage_path;
    const generationAction = generation?.status === "pending" || generation?.status === "processing"
      ? `<button class="button secondary small" type="button" disabled>Generando…</button>`
      : canDownload
        ? `<button class="button primary small js-download-generated" type="button" data-request-id="${generation.id}">Descargar e imprimir</button>`
        : `<button class="button secondary small js-generate-annex" type="button" data-session-id="${group.session.id}">${generation?.status === "ready" && !localKeyAvailable ? "Generar en este dispositivo" : "Generar Anexo I"}</button>`;

    return `<article class="document-item annex-document-item">
      <div>
        <h3>${escapeHtml(group.session.title || "Sesión")}</h3>
        <p>${escapeHtml(formatDate(group.session.session_date))} · ${group.session.session_type === "initial" ? "Inicial" : "Final"}</p>
        <small>${group.count} persona${group.count === 1 ? "" : "s"} disponible${group.count === 1 ? "" : "s"} para el listado</small>
      </div>
      <div class="document-status-column"><strong>Listado para firmas</strong>${generationStatusHtml}</div>
      <div class="document-status-column"><strong>PDF firmado</strong>${documentStatusHtml}</div>
      <div class="document-actions-stack">
        ${generationAction}
        <button class="button ${document ? "secondary" : "primary"} small js-upload-document" type="button" data-session-id="${group.session.id}" ${canUpload ? "" : "disabled"}>${canUpload ? uploadLabel : sessionCelebrated ? "Sin acciones" : "Disponible tras la sesión"}</button>
      </div>
    </article>`;
  }

  async function loadDocuments() {
    elements.documentsLoading.hidden = false;
    elements.documentsEmpty.hidden = true;
    elements.documentsList.hidden = true;
    elements.refreshDocumentsButton.disabled = true;
    try {
      const [documentsResult, generationsResult] = await Promise.all([
        client
          .from("municipal_documents")
          .select("id, session_id, version, sync_status, validation_status, incident_message, upload_status, created_at, processed_at")
          .order("version", { ascending: false }),
        client
          .from("annex_generation_requests")
          .select("id, municipality_id, session_id, status, storage_bucket, storage_path, output_iv, plain_size_bytes, plain_sha256, encrypted_size_bytes, page_count, file_name, incident_message, created_at, generated_at, downloaded_at, expires_at")
          .order("created_at", { ascending: false }),
      ]);
      if (documentsResult.error) throw new Error(documentsResult.error.message);
      if (generationsResult.error) throw new Error(generationsResult.error.message);
      municipalDocuments = Array.isArray(documentsResult.data) ? documentsResult.data : [];
      annexGenerationRequests = Array.isArray(generationsResult.data) ? generationsResult.data : [];
      elements.documentTabCount.textContent = String(municipalDocuments.filter((item) => item.validation_status !== "superseded").length);

      const grouped = new Map();
      for (const registration of registrations) {
        if (!registration.session || ["cancelled", "absent"].includes(registration.status)) continue;
        const key = registration.session.id;
        const current = grouped.get(key) ?? { session: registration.session, count: 0 };
        current.count += 1;
        grouped.set(key, current);
      }
      const groups = [...grouped.values()].sort((a, b) => b.session.session_date.localeCompare(a.session.session_date));
      if (groups.length === 0) {
        elements.documentsEmpty.hidden = false;
        return;
      }
      elements.documentsList.innerHTML = groups.map(documentSessionItem).join("");
      elements.documentsList.hidden = false;
    } finally {
      elements.documentsLoading.hidden = true;
      elements.refreshDocumentsButton.disabled = false;
    }
  }

  function findRegistrationSession(sessionId) {
    return registrations.find((item) => item.session?.id === sessionId)?.session ?? null;
  }


  function registrationsForAnnex(sessionId) {
    return registrations.filter((registration) =>
      registration.session?.id === sessionId
      && !["cancelled", "absent"].includes(registration.status)
      && registration.program_id
      && registration.program_name_snapshot
    );
  }

  function updateAnnexParticipantCount() {
    const selected = elements.annexParticipantsList.querySelectorAll('input[type="checkbox"]:checked').length;
    elements.annexParticipantCount.textContent = `${selected} persona${selected === 1 ? "" : "s"} seleccionada${selected === 1 ? "" : "s"}`;
    elements.annexSelectAll.checked = selected > 0
      && selected === elements.annexParticipantsList.querySelectorAll('input[type="checkbox"]').length;
  }

  function openAnnexGenerationDialog(sessionId) {
    const session = findRegistrationSession(sessionId);
    if (!session) return;
    const available = registrationsForAnnex(sessionId);
    if (available.length === 0) {
      showNotice("warning", "No hay personas disponibles con programa asignado para generar el Anexo I.");
      return;
    }

    const attended = available.filter((item) => item.status === "attended");
    const initiallySelected = new Set((attended.length > 0 ? attended : available).map((item) => item.id));
    clearNotice(elements.annexGenerationNotice);
    elements.annexGenerationForm.reset();
    elements.annexGenerationSessionId.value = session.id;
    elements.annexGenerationSummary.textContent = `${session.title} · ${formatDate(session.session_date)} · ${formatTime(session.start_time)}`;
    elements.annexModality.value = "in_person";
    elements.annexRepresentativeName.value = currentProfile?.full_name || "";
    elements.annexRepresentativePosition.value = "";
    elements.annexParticipantsList.innerHTML = available.map((registration) => `
      <label class="annex-participant-row">
        <input type="checkbox" value="${registration.id}" ${initiallySelected.has(registration.id) ? "checked" : ""}>
        <span><strong>${escapeHtml(registration.participant?.display_name || "Persona")}</strong><small>${escapeHtml(registration.participant?.masked_document || "Documento protegido")} · ${escapeHtml(registration.program_name_snapshot)}</small></span>
      </label>
    `).join("");
    updateAnnexParticipantCount();
    elements.annexGenerationDialog.showModal();
  }

  function closeAnnexGenerationDialog() {
    elements.annexGenerationForm.reset();
    elements.annexParticipantsList.innerHTML = "";
    clearNotice(elements.annexGenerationNotice);
    elements.annexGenerationDialog.close();
  }

  async function handleAnnexGeneration(event) {
    event.preventDefault();
    clearNotice(elements.annexGenerationNotice);
    const sessionId = elements.annexGenerationSessionId.value;
    const registrationIds = [...elements.annexParticipantsList.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
    const representativeName = normalizePersonText(elements.annexRepresentativeName.value);
    const representativePosition = normalizePersonText(elements.annexRepresentativePosition.value);

    if (registrationIds.length < 1) {
      showNotice("warning", "Selecciona al menos una persona.", elements.annexGenerationNotice);
      return;
    }
    if (!representativeName || !representativePosition) {
      showNotice("warning", "Indica el nombre y el cargo de la corporación local.", elements.annexGenerationNotice);
      return;
    }
    if (!activeEncryptionKey) {
      showNotice("error", "No está disponible la clave pública de cifrado.", elements.annexGenerationNotice);
      return;
    }

    elements.submitAnnexGeneration.disabled = true;
    elements.submitAnnexGeneration.textContent = "Preparando cifrado…";
    try {
      const key = await createAnnexDownloadKey(activeEncryptionKey.public_key_pem);
      elements.submitAnnexGeneration.textContent = "Solicitando al SAE…";
      const { data, error } = await client.rpc("begin_annex_generation", {
        p_session_id: sessionId,
        p_registration_ids: registrationIds,
        p_modality: elements.annexModality.value,
        p_representative_name: representativeName,
        p_representative_position: representativePosition,
        p_key_id: activeEncryptionKey.id,
        p_encrypted_download_key: key.encryptedKey,
      });
      if (error) throw new Error(error.message);
      const response = Array.isArray(data) ? data[0] : data;
      if (!response?.request_id) throw new Error("Supabase no devolvió la solicitud de generación.");
      localStorage.setItem(annexKeyStorageName(response.request_id), key.rawKey);
      closeAnnexGenerationDialog();
      await loadDocuments();
      showNotice("success", "El SAE está generando el Anexo I. Estará disponible en aproximadamente un minuto.");
    } catch (error) {
      showNotice("error", error.message || "No se pudo solicitar el Anexo I.", elements.annexGenerationNotice);
    } finally {
      elements.submitAnnexGeneration.disabled = false;
      elements.submitAnnexGeneration.textContent = "Generar PDF para firmas";
    }
  }

  async function downloadGeneratedAnnex(requestId) {
    const request = annexGenerationRequests.find((item) => item.id === requestId);
    if (!request || request.status !== "ready" || !request.storage_path) return;
    const rawKeyBase64 = localStorage.getItem(annexKeyStorageName(request.id));
    if (!rawKeyBase64) {
      showNotice("warning", "Este PDF se solicitó desde otro navegador o se eliminó su clave local. Genera una nueva copia en este dispositivo.");
      return;
    }

    clearNotice();
    try {
      const { data, error } = await client.storage
        .from(request.storage_bucket)
        .download(request.storage_path);
      if (error) throw new Error(error.message);
      const encrypted = new Uint8Array(await data.arrayBuffer());
      if (encrypted.byteLength !== Number(request.encrypted_size_bytes)) {
        throw new Error("El tamaño del archivo cifrado no coincide.");
      }

      const key = await crypto.subtle.importKey(
        "raw",
        base64ToBytes(rawKeyBase64),
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
      const plain = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: base64ToBytes(request.output_iv),
          additionalData: new TextEncoder().encode(generatedAnnexAdditionalData(request)),
          tagLength: 128,
        },
        key,
        encrypted
      );
      const bytes = new Uint8Array(plain);
      const header = new TextDecoder("ascii").decode(bytes.slice(0, 5));
      if (header !== "%PDF-") throw new Error("El contenido descifrado no es un PDF válido.");
      const digest = bytesToHex(await crypto.subtle.digest("SHA-256", bytes));
      if (digest !== request.plain_sha256) throw new Error("La huella del PDF no coincide.");

      const blobUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = request.file_name || "Anexo_I.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);

      const { error: markError } = await client.rpc("mark_annex_generation_downloaded", { p_request_id: request.id });
      if (markError) throw new Error(markError.message);
      await client.storage.from(request.storage_bucket).remove([request.storage_path]);
      localStorage.removeItem(annexKeyStorageName(request.id));
      await loadDocuments();
      showNotice("success", "El Anexo I se ha descargado. Ya puede imprimirse para recoger las firmas.");
    } catch (error) {
      showNotice("error", `No se pudo descargar y descifrar el Anexo I: ${error.message}`);
    }
  }

  function openDocumentUploadDialog(sessionId) {
    const session = findRegistrationSession(sessionId);
    if (!session) return;
    clearNotice(elements.documentUploadNotice);
    elements.documentUploadForm.reset();
    elements.documentSessionId.value = session.id;
    elements.documentSessionSummary.textContent = `${session.title} · ${formatDate(session.session_date)}`;
    elements.documentUploadDialog.showModal();
  }

  function closeDocumentUploadDialog() {
    elements.documentUploadForm.reset();
    clearNotice(elements.documentUploadNotice);
    elements.documentUploadDialog.close();
  }

  async function handleDocumentUpload(event) {
    event.preventDefault();
    clearNotice(elements.documentUploadNotice);
    const sessionId = elements.documentSessionId.value;
    const file = elements.signedAnnexFile.files?.[0];
    let reservation = null;
    elements.submitDocumentUpload.disabled = true;
    elements.submitDocumentUpload.textContent = "Comprobando PDF…";

    try {
      if (!activeEncryptionKey) throw new Error("No está disponible la clave pública de cifrado.");
      const pdf = await validateAndReadPdf(file);

      const { data: beginData, error: beginError } = await client.rpc("begin_signed_annex_upload", {
        p_session_id: sessionId,
        p_plain_size_bytes: pdf.buffer.byteLength,
        p_plain_sha256: pdf.sha256,
        p_key_id: activeEncryptionKey.id,
      });
      if (beginError) throw new Error(beginError.message);
      reservation = Array.isArray(beginData) ? beginData[0] : beginData;
      if (!reservation?.document_id) throw new Error("No se pudo reservar el envío documental.");

      elements.submitDocumentUpload.textContent = "Cifrando PDF…";
      const encrypted = await encryptSignedAnnex(
        pdf.buffer,
        reservation.document_id,
        sessionId,
        activeEncryptionKey.public_key_pem
      );

      elements.submitDocumentUpload.textContent = "Enviando cifrado…";
      const { error: uploadError } = await client.storage
        .from(reservation.storage_bucket)
        .upload(
          reservation.storage_path,
          new Blob([encrypted.ciphertext], { type: "application/octet-stream" }),
          { contentType: "application/octet-stream", upsert: false }
        );
      if (uploadError) throw new Error(uploadError.message);

      const { data: completeData, error: completeError } = await client.rpc("complete_signed_annex_upload", {
        p_document_id: reservation.document_id,
        p_encrypted_key: encrypted.encryptedKey,
        p_iv: encrypted.iv,
        p_encrypted_size_bytes: encrypted.ciphertext.byteLength,
        p_payload_version: 1,
      });
      if (completeError) throw new Error(completeError.message);
      if (!completeData) throw new Error("El envío cifrado no pudo confirmarse.");

      closeDocumentUploadDialog();
      await reloadPortalData();
      showNotice("success", "El Anexo I firmado se ha cifrado y enviado al SAE.");
      setActiveSection("documentsSection");
    } catch (error) {
      if (reservation?.storage_bucket && reservation?.storage_path) {
        await client.storage.from(reservation.storage_bucket).remove([reservation.storage_path]).catch(() => {});
      }
      if (reservation?.document_id) {
        await client.rpc("abort_signed_annex_upload", { p_document_id: reservation.document_id }).catch(() => {});
      }
      showNotice("error", error.message || "No se pudo enviar el Anexo I firmado.", elements.documentUploadNotice);
    } finally {
      elements.submitDocumentUpload.disabled = false;
      elements.submitDocumentUpload.textContent = "Cifrar y enviar";
    }
  }

  async function loadProfile() {
    const { data, error } = await client
      .from("profiles")
      .select(`user_id, full_name, email, role, active, municipality:municipalities (id, code, name)`)
      .eq("user_id", currentUser.id)
      .single();
    if (error) throw new Error(`No se pudo consultar el perfil: ${error.message}`);
    if (!data.active) {
      await client.auth.signOut();
      throw new Error("El usuario existe, pero su acceso municipal está desactivado.");
    }
    if (!data.municipality) {
      await client.auth.signOut();
      throw new Error("El usuario no está asociado a ningún ayuntamiento.");
    }
    currentProfile = data;
    elements.municipalityName.textContent = data.municipality.name;
    elements.userSummary.textContent = `${data.full_name || data.email || "Usuario municipal"} · ${data.role}`;
  }

  async function loadEncryptionKey() {
    const { data, error } = await client
      .from("encryption_keys")
      .select("id, key_name, algorithm, public_key_pem")
      .eq("active", true)
      .is("retired_at", null)
      .single();
    if (error) throw new Error(`No se pudo obtener la clave pública activa: ${error.message}`);
    if (data.algorithm !== "RSA-OAEP-256+A256GCM") throw new Error("El algoritmo de cifrado publicado no es compatible.");
    activeEncryptionKey = data;
  }

  async function loadPrograms() {
    const { data, error } = await client
      .from("programs")
      .select("id, internal_id, code, name, start_date, end_date, active")
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw new Error(`No se pudo consultar el catálogo de programas: ${error.message}`);
    programs = Array.isArray(data) ? data : [];
    if (programs.length === 0) throw new Error("No hay ningún programa activo disponible para las inscripciones.");
  }

  function programsForSession(session) {
    const sessionDate = String(session?.session_date || "");
    return programs.filter((program) =>
      (!program.start_date || !sessionDate || program.start_date <= sessionDate)
      && (!program.end_date || !sessionDate || program.end_date >= sessionDate)
    );
  }

  function programOptions(session, preferredId = "") {
    const available = programsForSession(session);
    const preferredAvailable = available.some((program) => String(program.id) === String(preferredId));
    const selectedId = preferredAvailable
      ? String(preferredId)
      : (available.length === 1 ? String(available[0].id) : "");
    const prompt = available.length > 1
      ? '<option value="">Selecciona un programa</option>'
      : "";
    return prompt + available.map((program) => `<option value="${program.id}" ${String(program.id) === selectedId ? "selected" : ""}>${escapeHtml(program.name)}</option>`).join("");
  }

  async function loadRegistrations() {
    elements.registrationsLoading.hidden = false;
    elements.registrationsEmpty.hidden = true;
    elements.registrationsList.hidden = true;
    elements.refreshRegistrationsButton.disabled = true;
    try {
      const { data, error } = await client
        .from("session_registrations")
        .select(`
          id, phase, status, sync_status, incident_message, created_at, program_id, program_name_snapshot,
          participant:participants (id, display_name, masked_document, progress_status, sync_status, incident_message),
          session:sessions (id, title, session_type, session_date, start_time, end_time, trainer, status)
        `)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      registrations = Array.isArray(data) ? data : [];
      eligibleParticipants = registrations
        .filter((item) => item.phase === "initial" && item.participant?.progress_status === "initial_completed")
        .map((item) => ({ ...item.participant, previous_program_id: item.program_id, previous_program_name: item.program_name_snapshot }))
        .filter((participant, index, all) => all.findIndex((other) => other?.id === participant.id) === index);
      elements.registrationTabCount.textContent = String(registrations.length);
      if (registrations.length === 0) {
        elements.registrationsEmpty.hidden = false;
        return;
      }
      elements.registrationsList.innerHTML = registrations.map(registrationItem).join("");
      elements.registrationsList.hidden = false;
    } finally {
      elements.registrationsLoading.hidden = true;
      elements.refreshRegistrationsButton.disabled = false;
    }
  }

  async function loadSessions() {
    elements.sessionsLoading.hidden = false;
    elements.sessionsEmpty.hidden = true;
    elements.sessionsGrid.hidden = true;
    elements.refreshButton.disabled = true;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await client
        .from("sessions")
        .select(`id, session_type, title, session_date, start_time, end_time, trainer, capacity_regular, regular_available, maximum_available, registration_open, published, status`)
        .eq("published", true)
        .eq("status", "scheduled")
        .gte("session_date", today)
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw new Error(error.message);
      sessions = Array.isArray(data) ? data : [];
      elements.sessionCount.textContent = String(sessions.length);
      elements.initialCount.textContent = String(sessions.filter((item) => item.session_type === "initial").length);
      elements.finalCount.textContent = String(sessions.filter((item) => item.session_type === "final").length);
      if (sessions.length === 0) {
        elements.sessionsEmpty.hidden = false;
        return;
      }
      elements.sessionsGrid.innerHTML = sessions.map(sessionCard).join("");
      elements.sessionsGrid.hidden = false;
    } finally {
      elements.sessionsLoading.hidden = true;
      elements.refreshButton.disabled = false;
    }
  }

  async function reloadPortalData() {
    await loadPrograms();
    await loadRegistrations();
    await Promise.all([loadSessions(), loadDocuments()]);
  }

  function findSession(sessionId) {
    return sessions.find((item) => item.id === sessionId);
  }

  function openInitialDialog(sessionId) {
    const session = findSession(sessionId);
    if (!session) return;
    clearNotice(elements.registrationNotice);
    elements.initialForm.reset();
    const availablePrograms = programsForSession(session);
    if (availablePrograms.length === 0) {
      showNotice("warning", "No hay ningún programa activo para la fecha de esta sesión.");
      return;
    }
    elements.initialSessionId.value = session.id;
    elements.initialSessionSummary.textContent = `${session.title} · ${formatDate(session.session_date)} · ${formatTime(session.start_time)}`;
    elements.initialProgram.innerHTML = programOptions(session);
    elements.initialProgramHelp.textContent = availablePrograms.length === 1 ? "Programa seleccionado automáticamente." : "Hay varios programas activos para esta fecha; selecciona el correspondiente.";
    updateSafePreview();
    elements.initialDialog.showModal();
    elements.firstName.focus();
  }

  function closeInitialDialog() {
    elements.initialForm.reset();
    clearNotice(elements.registrationNotice);
    elements.initialDialog.close();
  }

  function openFinalDialog(sessionId) {
    const session = findSession(sessionId);
    if (!session) return;
    clearNotice(elements.finalRegistrationNotice);
    const availablePrograms = programsForSession(session);
    if (availablePrograms.length === 0) {
      showNotice("warning", "No hay ningún programa activo para la fecha de esta sesión final.");
      return;
    }
    elements.finalSessionId.value = session.id;
    elements.finalSessionSummary.textContent = `${session.title} · ${formatDate(session.session_date)} · ${formatTime(session.start_time)}`;
    elements.eligibleParticipant.innerHTML = eligibleParticipants.map((participant) => `<option value="${participant.id}">${escapeHtml(participant.display_name)} · ${escapeHtml(participant.masked_document)}</option>`).join("");
    const selectedParticipant = eligibleParticipants[0];
    elements.finalProgram.innerHTML = programOptions(session, selectedParticipant?.previous_program_id || "");
    elements.finalDialog.showModal();
  }

  function closeFinalDialog() {
    clearNotice(elements.finalRegistrationNotice);
    elements.finalDialog.close();
  }

  async function handleInitialRegistration(event) {
    event.preventDefault();
    clearNotice(elements.registrationNotice);

    const firstName = normalizePersonText(elements.firstName.value);
    const firstSurname = normalizePersonText(elements.firstSurname.value);
    const secondSurname = normalizePersonText(elements.secondSurname.value);
    const documentType = elements.documentType.value;
    const documentNumber = normalizeDocument(elements.documentNumber.value);
    const sessionId = elements.initialSessionId.value;
    const programId = elements.initialProgram.value;

    if (!firstName || !firstSurname || !secondSurname) {
      showNotice("warning", "Completa el nombre y los dos apellidos.", elements.registrationNotice);
      return;
    }
    if (!validateDocument(documentType, documentNumber)) {
      showNotice("warning", `El ${documentType} no tiene un formato o letra de control válidos.`, elements.registrationNotice);
      return;
    }
    if (!programId) {
      showNotice("warning", "Selecciona el programa en el que participa la persona.", elements.registrationNotice);
      return;
    }
    if (!elements.informationConfirmed.checked) {
      showNotice("warning", "Debes confirmar que se ha facilitado la información sobre protección de datos.", elements.registrationNotice);
      return;
    }
    if (!activeEncryptionKey) {
      showNotice("error", "No está disponible la clave pública de cifrado.", elements.registrationNotice);
      return;
    }

    elements.submitInitialRegistration.disabled = true;
    elements.submitInitialRegistration.textContent = "Cifrando…";

    try {
      const identity = {
        first_name: firstName,
        first_surname: firstSurname,
        second_surname: secondSurname,
        document_type: documentType,
        document_number: documentNumber
      };
      const context = {
        municipality_id: currentProfile.municipality.id,
        session_id: sessionId,
        created_by: currentUser.id
      };
      const encrypted = await encryptIdentity(identity, context, activeEncryptionKey.public_key_pem);
      elements.submitInitialRegistration.textContent = "Registrando…";
      const { error } = await client.rpc("register_initial", {
        p_session_id: sessionId,
        p_program_id: programId,
        p_display_name: displayName(firstName, firstSurname, secondSurname),
        p_masked_document: maskedDocument(documentNumber),
        p_key_id: activeEncryptionKey.id,
        p_encrypted_key: encrypted.encryptedKey,
        p_iv: encrypted.iv,
        p_ciphertext: encrypted.ciphertext,
        p_payload_version: 1
      });
      if (error) throw new Error(error.message);
      closeInitialDialog();
      await reloadPortalData();
      showNotice("success", "La persona ha quedado inscrita. Los datos completos se han enviado cifrados.");
      setActiveSection("registrationsSection");
    } catch (error) {
      const message = String(error?.message ?? "No se pudo completar la inscripción.");
      const friendly = message.includes("capacidad ordinaria") ? "La sesión acaba de completar sus plazas ordinarias." : message.includes("duplicate key") ? "Esta persona ya tiene una inscripción activa en esa fase." : message;
      showNotice("error", friendly, elements.registrationNotice);
    } finally {
      elements.submitInitialRegistration.disabled = false;
      elements.submitInitialRegistration.textContent = "Cifrar e inscribir";
    }
  }

  async function handleFinalRegistration(event) {
    event.preventDefault();
    clearNotice(elements.finalRegistrationNotice);
    const participantId = elements.eligibleParticipant.value;
    const sessionId = elements.finalSessionId.value;
    const programId = elements.finalProgram.value;
    if (!participantId) {
      showNotice("warning", "Selecciona una persona disponible.", elements.finalRegistrationNotice);
      return;
    }
    if (!programId) {
      showNotice("warning", "Selecciona el programa en el que participa.", elements.finalRegistrationNotice);
      return;
    }
    elements.submitFinalRegistration.disabled = true;
    try {
      const { error } = await client.rpc("register_final", { p_participant_id: participantId, p_session_id: sessionId, p_program_id: programId });
      if (error) throw new Error(error.message);
      closeFinalDialog();
      await reloadPortalData();
      showNotice("success", "La persona ha quedado inscrita en la sesión final.");
      setActiveSection("registrationsSection");
    } catch (error) {
      showNotice("error", error.message || "No se pudo completar la inscripción final.", elements.finalRegistrationNotice);
    } finally {
      elements.submitFinalRegistration.disabled = false;
    }
  }

  function openCancelDialog(registrationId) {
    registrationToCancel = registrations.find((item) => item.id === registrationId) ?? null;
    if (!registrationToCancel) return;
    const participant = registrationToCancel.participant ?? {};
    const session = registrationToCancel.session ?? {};
    elements.cancelDialogText.textContent = `Se cancelará la inscripción de ${participant.display_name || "la persona"} en “${session.title || "la sesión"}” y se liberará su plaza.`;
    elements.cancelDialog.showModal();
  }

  function closeCancelDialog() {
    registrationToCancel = null;
    elements.cancelDialog.close();
  }

  async function confirmCancellation() {
    if (!registrationToCancel) return;
    elements.confirmCancelButton.disabled = true;
    try {
      const { data, error } = await client.rpc("cancel_registration", { p_registration_id: registrationToCancel.id });
      if (error) throw new Error(error.message);
      if (!data) throw new Error("La inscripción ya no estaba disponible para cancelar.");
      closeCancelDialog();
      await reloadPortalData();
      showNotice("success", "La inscripción se ha cancelado y la plaza ha quedado libre.");
    } catch (error) {
      closeCancelDialog();
      showNotice("error", error.message || "No se pudo cancelar la inscripción.");
    } finally {
      elements.confirmCancelButton.disabled = false;
    }
  }

  async function enterPortal(user) {
    clearNotice();
    currentUser = user;
    setPortalVisible(true);
    try {
      await loadProfile();
      await loadEncryptionKey();
      await reloadPortalData();
    } catch (error) {
      setPortalVisible(false);
      showNotice("error", error instanceof Error ? error.message : "No se pudo abrir el portal.");
    }
  }

  async function restoreSession() {
    const { data, error } = await client.auth.getSession();
    if (error) {
      showNotice("error", `No se pudo recuperar la sesión: ${error.message}`);
      return;
    }
    const user = data.session?.user;
    if (user) await enterPortal(user);
    else setPortalVisible(false);
  }

  async function handleLogin(event) {
    event.preventDefault();
    clearNotice();
    const email = elements.email.value.trim().toLowerCase();
    const password = elements.password.value;
    if (!email || !password) {
      showNotice("warning", "Introduce el correo y la contraseña.");
      return;
    }
    setLoginBusy(true);
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error("No se ha podido iniciar sesión. Revisa las credenciales.");
      if (!data.user) throw new Error("Supabase no devolvió un usuario autenticado.");
      elements.password.value = "";
      await enterPortal(data.user);
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    clearNotice();
    elements.logoutButton.disabled = true;
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      currentUser = null;
      currentProfile = null;
      elements.password.value = "";
      setPortalVisible(false);
      showNotice("success", "La sesión se ha cerrado correctamente.");
    } catch (error) {
      showNotice("error", `No se pudo cerrar la sesión: ${error.message}`);
    } finally {
      elements.logoutButton.disabled = false;
    }
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", handleLogin);
    elements.logoutButton.addEventListener("click", handleLogout);
    elements.refreshButton.addEventListener("click", async () => {
      clearNotice();
      try { await reloadPortalData(); showNotice("success", "La información se ha actualizado."); }
      catch (error) { showNotice("error", `No se pudo actualizar: ${error.message}`); }
    });
    elements.refreshRegistrationsButton.addEventListener("click", async () => {
      clearNotice();
      try { await reloadPortalData(); showNotice("success", "Las inscripciones se han actualizado."); }
      catch (error) { showNotice("error", `No se pudieron actualizar las inscripciones: ${error.message}`); }
    });
    elements.refreshDocumentsButton.addEventListener("click", async () => {
      clearNotice();
      try { await loadDocuments(); showNotice("success", "La documentación se ha actualizado."); }
      catch (error) { showNotice("error", `No se pudo actualizar la documentación: ${error.message}`); }
    });
    document.querySelectorAll(".tab-button").forEach((button) => button.addEventListener("click", () => setActiveSection(button.dataset.view)));
    elements.sessionsGrid.addEventListener("click", (event) => {
      const initialButton = event.target.closest(".js-register-initial");
      const finalButton = event.target.closest(".js-register-final");
      if (initialButton) openInitialDialog(initialButton.dataset.sessionId);
      if (finalButton) openFinalDialog(finalButton.dataset.sessionId);
    });
    elements.registrationsList.addEventListener("click", (event) => {
      const button = event.target.closest(".js-cancel-registration");
      if (button && !button.disabled) openCancelDialog(button.dataset.registrationId);
    });
    elements.documentsList.addEventListener("click", (event) => {
      const uploadButton = event.target.closest(".js-upload-document");
      const generateButton = event.target.closest(".js-generate-annex");
      const downloadButton = event.target.closest(".js-download-generated");
      if (uploadButton && !uploadButton.disabled) openDocumentUploadDialog(uploadButton.dataset.sessionId);
      if (generateButton && !generateButton.disabled) openAnnexGenerationDialog(generateButton.dataset.sessionId);
      if (downloadButton && !downloadButton.disabled) void downloadGeneratedAnnex(downloadButton.dataset.requestId);
    });
    [elements.firstName, elements.firstSurname, elements.secondSurname, elements.documentNumber].forEach((input) => input.addEventListener("input", updateSafePreview));
    elements.documentType.addEventListener("change", updateSafePreview);
    elements.initialForm.addEventListener("submit", handleInitialRegistration);
    elements.closeInitialDialog.addEventListener("click", closeInitialDialog);
    elements.cancelInitialRegistration.addEventListener("click", closeInitialDialog);
    elements.finalForm.addEventListener("submit", handleFinalRegistration);
    elements.eligibleParticipant.addEventListener("change", () => {
      const participant = eligibleParticipants.find((item) => item.id === elements.eligibleParticipant.value);
      const session = findSession(elements.finalSessionId.value);
      elements.finalProgram.innerHTML = programOptions(session, participant?.previous_program_id || "");
    });
    elements.closeFinalDialog.addEventListener("click", closeFinalDialog);
    elements.cancelFinalRegistration.addEventListener("click", closeFinalDialog);
    elements.closeCancelDialog.addEventListener("click", closeCancelDialog);
    elements.keepRegistrationButton.addEventListener("click", closeCancelDialog);
    elements.confirmCancelButton.addEventListener("click", confirmCancellation);
    elements.documentUploadForm.addEventListener("submit", handleDocumentUpload);
    elements.closeDocumentUploadDialog.addEventListener("click", closeDocumentUploadDialog);
    elements.cancelDocumentUpload.addEventListener("click", closeDocumentUploadDialog);
    elements.annexGenerationForm.addEventListener("submit", handleAnnexGeneration);
    elements.closeAnnexGenerationDialog.addEventListener("click", closeAnnexGenerationDialog);
    elements.cancelAnnexGeneration.addEventListener("click", closeAnnexGenerationDialog);
    elements.annexSelectAll.addEventListener("change", () => {
      elements.annexParticipantsList.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = elements.annexSelectAll.checked; });
      updateAnnexParticipantCount();
    });
    elements.annexParticipantsList.addEventListener("change", updateAnnexParticipantCount);
  }

  async function initialize() {
    if (!configurationIsValid()) {
      setPortalVisible(false);
      showNotice("warning", "Falta completar config.js con la URL del proyecto y la publishable key de Supabase.");
      elements.loginButton.disabled = true;
      return;
    }
    if (!window.isSecureContext || !window.crypto?.subtle) {
      showNotice("error", "Este portal debe abrirse mediante HTTPS o localhost para poder cifrar los datos.");
      elements.loginButton.disabled = true;
      return;
    }
    if (!window.supabase?.createClient) {
      showNotice("error", "No se pudo cargar la biblioteca de Supabase.");
      elements.loginButton.disabled = true;
      return;
    }
    client = window.supabase.createClient(url, publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    bindEvents();
    client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        currentUser = null;
        currentProfile = null;
        setPortalVisible(false);
      }
    });
    await restoreSession();
  }

  initialize().catch((error) => showNotice("error", `Error al iniciar el portal: ${error.message}`));
})();
