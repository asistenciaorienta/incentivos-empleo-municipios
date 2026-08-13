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
  const ANNEX_DOCUMENT_DOWNLOAD_SCHEMA = "incentivos-empleo.annex-document-download.v1";
  const ANNEX_DOCUMENT_DOWNLOAD_KEY_PREFIX = "incentivos-annex-document-download-key";

  const elements = {
    notice: document.querySelector("#appNotice"),
    portalToast: document.querySelector("#portalToast"),
    municipalNoticesDialog: document.querySelector("#municipalNoticesDialog"),
    municipalNoticesList: document.querySelector("#municipalNoticesList"),
    municipalNoticesRemember: document.querySelector("#municipalNoticesRemember"),
    closeMunicipalNoticesDialog: document.querySelector("#closeMunicipalNoticesDialog"),
    acceptMunicipalNotices: document.querySelector("#acceptMunicipalNotices"),
    loginView: document.querySelector("#loginView"),
    portalView: document.querySelector("#portalView"),
    loginForm: document.querySelector("#loginForm"),
    loginButton: document.querySelector("#loginButton"),
    email: document.querySelector("#email"),
    password: document.querySelector("#password"),
    logoutButton: document.querySelector("#logoutButton"),
    globalBackToMenu: document.querySelector("#globalBackToMenu"),
    refreshButton: document.querySelector("#refreshButton"),
    refreshRegistrationsButton: document.querySelector("#refreshRegistrationsButton"),
    municipalityName: document.querySelector("#municipalityName"),
    userSummary: document.querySelector("#userSummary"),
    sessionCount: document.querySelector("#sessionCount"),
    initialCount: document.querySelector("#initialCount"),
    finalCount: document.querySelector("#finalCount"),
    sessionSearch: document.querySelector("#sessionSearch"),
    sessionsTitle: document.querySelector("#sessionsTitle"),
    sessionBrowserPanel: document.querySelector("#sessionBrowserPanel"),
    sessionsDescription: document.querySelector("#sessionsDescription"),
    sessionDateFromFilter: document.querySelector("#sessionDateFromFilter"),
    sessionDateToFilter: document.querySelector("#sessionDateToFilter"),
    clearSessionFilters: document.querySelector("#clearSessionFilters"),
    sessionsFilterResult: document.querySelector("#sessionsFilterResult"),
    registrationsTotalCount: document.querySelector("#registrationsTotalCount"),
    registrationsWaitingCount: document.querySelector("#registrationsWaitingCount"),
    registrationsAttendedCount: document.querySelector("#registrationsAttendedCount"),
    registrationsReviewCount: document.querySelector("#registrationsReviewCount"),
    registrationSearch: document.querySelector("#registrationSearch"),
    registrationDateFilter: document.querySelector("#registrationDateFilter"),
    registrationPhaseFilter: document.querySelector("#registrationPhaseFilter"),
    registrationStatusFilter: document.querySelector("#registrationStatusFilter"),
    clearRegistrationFilters: document.querySelector("#clearRegistrationFilters"),
    registrationsFilterResult: document.querySelector("#registrationsFilterResult"),
    registrationTabCount: document.querySelector("#registrationTabCount"),
    incidentMenuCount: document.querySelector("#incidentMenuCount"),
    incidentTotalCount: document.querySelector("#incidentTotalCount"),
    incidentRegistrationCount: document.querySelector("#incidentRegistrationCount"),
    incidentAnnexCount: document.querySelector("#incidentAnnexCount"),
    refreshIncidentsButton: document.querySelector("#refreshIncidentsButton"),
    incidentsLoading: document.querySelector("#incidentsLoading"),
    incidentsEmpty: document.querySelector("#incidentsEmpty"),
    incidentsList: document.querySelector("#incidentsList"),
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
    changeSessionDialog: document.querySelector("#changeSessionDialog"),
    changeSessionForm: document.querySelector("#changeSessionForm"),
    changeSessionNotice: document.querySelector("#changeSessionNotice"),
    changeRegistrationId: document.querySelector("#changeRegistrationId"),
    changeParticipantSummary: document.querySelector("#changeParticipantSummary"),
    changeProgramSummary: document.querySelector("#changeProgramSummary"),
    changeCurrentSessionSummary: document.querySelector("#changeCurrentSessionSummary"),
    changeTargetSession: document.querySelector("#changeTargetSession"),
    closeChangeSessionDialog: document.querySelector("#closeChangeSessionDialog"),
    cancelChangeSession: document.querySelector("#cancelChangeSession"),
    confirmChangeSession: document.querySelector("#confirmChangeSession"),
    cancelDialog: document.querySelector("#cancelDialog"),
    cancelDialogText: document.querySelector("#cancelDialogText"),
    closeCancelDialog: document.querySelector("#closeCancelDialog"),
    keepRegistrationButton: document.querySelector("#keepRegistrationButton"),
    confirmCancelButton: document.querySelector("#confirmCancelButton"),
    documentTabCount: document.querySelector("#documentTabCount"),
    refreshDocumentsButton: document.querySelector("#refreshDocumentsButton"),
    documentsSection: document.querySelector("#documentsSection"),
    documentsModeHeading: document.querySelector("#documentsModeHeading"),
    documentsKicker: document.querySelector("#documentsKicker"),
    documentsTitle: document.querySelector("#documentsTitle"),
    documentsDescription: document.querySelector("#documentsDescription"),
    documentsLoading: document.querySelector("#documentsLoading"),
    documentsEmpty: document.querySelector("#documentsEmpty"),
    documentsList: document.querySelector("#documentsList"),
    documentQuickFilters: document.querySelector("#documentQuickFilters"),
    documentPhaseFilter: document.querySelector("#documentPhaseFilter"),
    documentDateFilter: document.querySelector("#documentDateFilter"),
    clearDocumentFilters: document.querySelector("#clearDocumentFilters"),
    documentsFilterResult: document.querySelector("#documentsFilterResult"),
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
  let registrationToChange = null;
  let municipalDocuments = [];
  let annexGenerationRequests = [];
  let annexDocumentDownloadRequests = [];
  let documentViewMode = "create";
  let incidentFilter = "all";
  let sessionSummaryFilter = null;
  let registrationSummaryFilter = "all";
  let documentQuickFilter = "all";
  let portalToastTimer = null;

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

  function showPortalToast(message, type = "success") {
    if (!elements.portalToast) return;
    if (portalToastTimer) window.clearTimeout(portalToastTimer);
    elements.portalToast.className = `portal-toast ${type}`;
    elements.portalToast.textContent = message;
    elements.portalToast.hidden = false;
    portalToastTimer = window.setTimeout(() => {
      elements.portalToast.hidden = true;
      elements.portalToast.textContent = "";
      elements.portalToast.className = "portal-toast";
    }, 2600);
  }

  function normalizeSearchText(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function localToday() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function activeMunicipalNotices() {
    const today = localToday();
    const municipalityCode = String(currentProfile?.municipality?.code || "").trim();
    const notices = Array.isArray(window.SAE_MUNICIPAL_NOTICES)
      ? window.SAE_MUNICIPAL_NOTICES
      : [];

    return notices
      .filter((notice) => {
        if (!notice || notice.active === false) return false;
        if (!notice.id || !notice.title || !notice.message) return false;
        if (notice.startDate && String(notice.startDate) > today) return false;
        if (notice.endDate && String(notice.endDate) < today) return false;

        const municipalities = Array.isArray(notice.municipalities)
          ? notice.municipalities.map((value) => String(value).trim()).filter(Boolean)
          : [];
        if (municipalities.length > 0 && !municipalities.includes(municipalityCode)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priority = { important: 0, warning: 1, info: 2 };
        const byPriority = (priority[a.level] ?? 3) - (priority[b.level] ?? 3);
        if (byPriority !== 0) return byPriority;
        return String(b.startDate || "").localeCompare(String(a.startDate || ""));
      });
  }

  function municipalNoticesStorageKey() {
    const municipalityId = currentProfile?.municipality?.id || "general";
    return `incentivos-empleo:avisos:${municipalityId}`;
  }

  function municipalNoticesSignature(notices) {
    return notices
      .map((notice) => `${String(notice.id)}:${String(notice.version ?? 1)}`)
      .sort()
      .join("|");
  }

  function noticeLevelLabel(level) {
    if (level === "important") return "IMPORTANTE";
    if (level === "warning") return "ATENCIÓN";
    return "INFORMACIÓN";
  }

  function renderMunicipalNotices(notices) {
    if (!elements.municipalNoticesList) return;
    elements.municipalNoticesList.innerHTML = notices.map((notice) => `
      <article class="municipal-notice-item ${escapeHtml(notice.level || "info")}">
        <div class="municipal-notice-meta">
          <span class="municipal-notice-level">${escapeHtml(noticeLevelLabel(notice.level))}</span>
          ${notice.startDate ? `<time datetime="${escapeHtml(notice.startDate)}">${escapeHtml(formatDate(notice.startDate))}</time>` : ""}
        </div>
        <h3>${escapeHtml(notice.title)}</h3>
        <p>${escapeHtml(notice.message)}</p>
      </article>
    `).join("");
  }

  function maybeShowMunicipalNotices() {
    const notices = activeMunicipalNotices();
    if (!elements.municipalNoticesDialog || notices.length === 0) return;

    const signature = municipalNoticesSignature(notices);
    let acknowledgedSignature = "";
    try {
      acknowledgedSignature = window.localStorage.getItem(municipalNoticesStorageKey()) || "";
    } catch {
      acknowledgedSignature = "";
    }
    if (acknowledgedSignature === signature) return;

    renderMunicipalNotices(notices);
    if (elements.municipalNoticesRemember) {
      elements.municipalNoticesRemember.checked = true;
      elements.municipalNoticesRemember.dataset.signature = signature;
    }
    elements.municipalNoticesDialog.showModal();
  }

  function closeMunicipalNoticesDialog() {
    if (elements.municipalNoticesDialog?.open) {
      elements.municipalNoticesDialog.close();
    }
  }

  function acceptMunicipalNotices() {
    const signature = elements.municipalNoticesRemember?.dataset.signature || "";
    if (elements.municipalNoticesRemember?.checked && signature) {
      try {
        window.localStorage.setItem(municipalNoticesStorageKey(), signature);
      } catch {
        // Si el navegador bloquea localStorage, los avisos volverán a mostrarse.
      }
    }
    closeMunicipalNoticesDialog();
  }

  function updateSummaryButtons(selector, activeValue, dataKey) {
    document.querySelectorAll(selector).forEach((button) => {
      button.classList.toggle("active", button.dataset[dataKey] === activeValue);
    });
  }

  function registrationNeedsReview(registration) {
    return registration.sync_status === "error"
      || registration.status === "incident"
      || Boolean(registration.incident_message);
  }

  function registrationIsWaiting(registration) {
    const sessionDate = registration.session?.session_date || "";
    return ["pending", "confirmed"].includes(registration.status)
      && sessionDate >= localToday();
  }

  function registrationMatchesStatus(registration, filter) {
    if (filter === "all") return true;
    if (filter === "waiting") return registrationIsWaiting(registration);
    if (filter === "attended") return registration.status === "attended";
    if (filter === "absent") return registration.status === "absent";
    if (filter === "cancelled") return registration.status === "cancelled";
    if (filter === "review") return registrationNeedsReview(registration);
    return true;
  }

  function registrationsForSession(sessionId) {
    return registrations.filter((registration) =>
      String(registration.session?.id || "") === String(sessionId)
      && registration.status !== "cancelled"
    );
  }

  function sessionParticipantRow(registration) {
    const participant = registration.participant ?? {};
    const session = registration.session ?? {};
    const today = localToday();
    const canChange = ["pending", "confirmed"].includes(registration.status)
      && registration.sync_status !== "processing"
      && session.session_date >= today;
    const canCancel = ["pending", "confirmed", "incident"].includes(registration.status);
    const statusText = statusLabel(registration.status);
    const incident = registration.incident_message || participant.incident_message || "";
    return `
      <div class="session-participant-row">
        <div class="session-participant-identity">
          <strong>${escapeHtml(participant.display_name || "Persona")}</strong>
          <small>${escapeHtml(participant.masked_document || "Documento protegido")}</small>
          ${incident ? `<small class="danger-text">${escapeHtml(incident)}</small>` : ""}
        </div>
        <div class="session-participant-status">
          <span class="badge ${registration.status}">${escapeHtml(statusText)}</span>
          <small>${escapeHtml(registration.program_name_snapshot || "Sin programa")}</small>
        </div>
        <div class="session-participant-actions">
          <button class="button secondary small js-change-session" type="button" data-registration-id="${registration.id}" ${canChange ? "" : "disabled"}>Cambiar sesión</button>
          <button class="button danger-outline small js-cancel-registration" type="button" data-registration-id="${registration.id}" ${canCancel ? "" : "disabled"}>Cancelar</button>
        </div>
      </div>`;
  }

  function resetSessionTypeSelection() {
    sessionSummaryFilter = null;
    document.querySelectorAll("[data-session-type]").forEach((button) => button.classList.remove("active"));
    if (elements.sessionBrowserPanel) elements.sessionBrowserPanel.hidden = true;
    if (elements.sessionSearch) elements.sessionSearch.value = "";
    if (elements.sessionDateFromFilter) elements.sessionDateFromFilter.value = "";
    if (elements.sessionDateToFilter) elements.sessionDateToFilter.value = "";
  }

  function setSessionType(type) {
    sessionSummaryFilter = type === "final" ? "final" : "initial";
    document.querySelectorAll("[data-session-type]").forEach((button) => {
      button.classList.toggle("active", button.dataset.sessionType === sessionSummaryFilter);
    });
    if (elements.sessionBrowserPanel) elements.sessionBrowserPanel.hidden = false;
    if (elements.sessionsTitle) elements.sessionsTitle.textContent = sessionSummaryFilter === "initial" ? "Sesiones iniciales" : "Sesiones finales";
    if (elements.sessionsDescription) {
      elements.sessionsDescription.textContent = sessionSummaryFilter === "initial"
        ? "Consulta las sesiones iniciales, inscribe personas y accede al enlace de conexión."
        : "Consulta las sesiones finales, inscribe personas habilitadas y accede al enlace de conexión.";
    }
    renderSessions();
    elements.sessionBrowserPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderSessions() {
    if (!sessionSummaryFilter) {
      if (elements.sessionBrowserPanel) elements.sessionBrowserPanel.hidden = true;
      return;
    }

    const rawSearch = String(elements.sessionSearch?.value ?? "").trim();
    const search = normalizeSearchText(rawSearch);
    const dateFrom = elements.sessionDateFromFilter?.value || "";
    const dateTo = elements.sessionDateToFilter?.value || "";

    // Si el texto coincide con una persona inscrita, el buscador pasa
    // automáticamente a modo persona y muestra sus sesiones iniciales y finales.
    const matchingPersonSessionIds = new Set();
    if (search) {
      registrations.forEach((registration) => {
        if (registration.status === "cancelled") return;
        const participant = registration.participant ?? {};
        const personSearchable = normalizeSearchText([
          participant.display_name,
          participant.masked_document,
        ].join(" "));
        if (personSearchable.includes(search) && registration.session?.id) {
          matchingPersonSessionIds.add(String(registration.session.id));
        }
      });
    }

    const personSearchActive = matchingPersonSessionIds.size > 0;
    const phaseSessions = sessions.filter((session) => session.session_type === sessionSummaryFilter);
    const sourceSessions = personSearchActive
      ? sessions.filter((session) => matchingPersonSessionIds.has(String(session.id)))
      : phaseSessions;

    const visible = sourceSessions.filter((session) => {
      if (dateFrom && session.session_date < dateFrom) return false;
      if (dateTo && session.session_date > dateTo) return false;

      if (search && !personSearchActive) {
        const sessionRegistrations = registrationsForSession(session.id);
        const participantSearchText = sessionRegistrations.flatMap((registration) => {
          const participant = registration.participant ?? {};
          return [
            participant.display_name,
            participant.masked_document,
            registration.program_name_snapshot,
          ];
        });

        const searchable = normalizeSearchText([
          session.title,
          session.session_date,
          formatDate(session.session_date),
          session.trainer,
          formatTime(session.start_time),
          formatTime(session.end_time),
          ...participantSearchText,
        ].join(" "));

        if (!searchable.includes(search)) return false;
      }
      return true;
    }).sort((a, b) =>
      String(a.session_date).localeCompare(String(b.session_date))
      || String(a.start_time).localeCompare(String(b.start_time))
    );

    document.querySelectorAll("[data-session-type]").forEach((button) => {
      button.classList.toggle(
        "active",
        personSearchActive || button.dataset.sessionType === sessionSummaryFilter
      );
    });

    if (personSearchActive) {
      if (elements.sessionsTitle) {
        elements.sessionsTitle.textContent = "Resultados en sesiones iniciales y finales";
      }
      if (elements.sessionsDescription) {
        elements.sessionsDescription.textContent =
          `Se muestran todas las sesiones en las que hay una persona inscrita que coincide con «${rawSearch}».`;
      }
      if (elements.sessionsFilterResult) {
        const initialMatches = visible.filter((session) => session.session_type === "initial").length;
        const finalMatches = visible.filter((session) => session.session_type === "final").length;
        elements.sessionsFilterResult.textContent =
          `${visible.length} sesiones encontradas · ${initialMatches} iniciales · ${finalMatches} finales`;
      }
    } else {
      if (elements.sessionsTitle) {
        elements.sessionsTitle.textContent =
          sessionSummaryFilter === "initial" ? "Sesiones iniciales" : "Sesiones finales";
      }
      if (elements.sessionsDescription) {
        elements.sessionsDescription.textContent = sessionSummaryFilter === "initial"
          ? "Consulta las sesiones iniciales, inscribe personas y accede al enlace de conexión."
          : "Consulta las sesiones finales, inscribe personas habilitadas y accede al enlace de conexión.";
      }
      if (elements.sessionsFilterResult) {
        elements.sessionsFilterResult.textContent =
          `${visible.length} de ${phaseSessions.length} sesiones ${sessionSummaryFilter === "initial" ? "iniciales" : "finales"}`;
      }
    }

    elements.sessionsEmpty.hidden = visible.length > 0;
    elements.sessionsGrid.hidden = visible.length === 0;
    elements.sessionsEmpty.textContent = personSearchActive
      ? `No hay sesiones dentro del intervalo de fechas seleccionado para «${rawSearch}».`
      : phaseSessions.length === 0
        ? `No hay sesiones ${sessionSummaryFilter === "initial" ? "iniciales" : "finales"} disponibles actualmente.`
        : "No hay sesiones que coincidan con los filtros seleccionados.";
    elements.sessionsGrid.innerHTML = visible.map(sessionCard).join("");
  }

  function updateRegistrationSummary() {
    const waiting = registrations.filter(registrationIsWaiting).length;
    const attended = registrations.filter((item) => item.status === "attended").length;
    const review = registrations.filter(registrationNeedsReview).length;
    elements.registrationsTotalCount.textContent = String(registrations.length);
    elements.registrationsWaitingCount.textContent = String(waiting);
    elements.registrationsAttendedCount.textContent = String(attended);
    elements.registrationsReviewCount.textContent = String(review);
  }

  function renderRegistrations() {
    updateRegistrationSummary();
    const search = normalizeSearchText(elements.registrationSearch?.value);
    const date = elements.registrationDateFilter?.value || "";
    const phase = elements.registrationPhaseFilter?.value || "all";
    const selectStatus = elements.registrationStatusFilter?.value || "all";
    const effectiveStatus = selectStatus !== "all" ? selectStatus : registrationSummaryFilter;

    const visible = registrations.filter((registration) => {
      const participant = registration.participant ?? {};
      const session = registration.session ?? {};
      if (search && !normalizeSearchText(participant.display_name).includes(search)) return false;
      if (date && session.session_date !== date) return false;
      if (phase !== "all" && registration.phase !== phase) return false;
      if (!registrationMatchesStatus(registration, effectiveStatus)) return false;
      return true;
    });

    updateSummaryButtons("[data-registration-summary-filter]", registrationSummaryFilter, "registrationSummaryFilter");
    elements.registrationsFilterResult.textContent = `${visible.length} de ${registrations.length} inscripciones`;
    elements.registrationsEmpty.hidden = visible.length > 0;
    elements.registrationsList.hidden = visible.length === 0;
    elements.registrationsEmpty.textContent = registrations.length === 0
      ? "No hay inscripciones realizadas por este ayuntamiento."
      : "No hay inscripciones que coincidan con los filtros seleccionados.";
    elements.registrationsList.innerHTML = visible.map(registrationItem).join("");
  }

  function documentFilterOptions() {
    if (documentViewMode === "create") {
      return [
        ["all", "Todas"],
        ["ready", "Listas para crear"],
        ["attendance", "Pendientes de asistencia"],
        ["submitted", "Ya generadas / remitidas"],
      ];
    }
    if (documentViewMode === "upload") {
      return [
        ["all", "Todas"],
        ["ready", "Listas para subir"],
        ["review", "En revisión DP"],
        ["incident", "Con incidencia"],
        ["validated", "Validadas"],
      ];
    }
    return [
      ["all", "Todas"],
      ["available", "Disponibles para descargar"],
      ["pending", "Pendientes de validación"],
      ["missing", "Sin Anexo I firmado"],
    ];
  }

  function renderDocumentQuickFilters() {
    const options = documentFilterOptions();
    if (!options.some(([key]) => key === documentQuickFilter)) documentQuickFilter = "all";
    elements.documentQuickFilters.innerHTML = options.map(([key, label]) =>
      `<button class="quick-filter-button ${key === documentQuickFilter ? "active" : ""}" type="button" data-document-quick-filter="${key}">${escapeHtml(label)}</button>`
    ).join("");
  }

  function documentMatchesQuickFilter(group, filter) {
    if (filter === "all") return true;
    const document = latestDocumentForSession(group.session.id);
    const generation = latestGenerationForSession(group.session.id);
    const finished = sessionHasFinished(group.session);
    const attendanceClosed = group.pendingAttendance === 0;
    const canCreate = finished && attendanceClosed && group.attended > 0;
    const downloadedForSignatures = hasDownloadedGeneration(group.session.id);
    const correction = document?.validation_status === "incident" || document?.sync_status === "error";
    const canUpload = correction || (finished && attendanceClosed && group.attended > 0 && downloadedForSignatures && !document);

    if (documentViewMode === "create") {
      if (filter === "ready") return !document && canCreate;
      if (filter === "attendance") return !document && finished && !attendanceClosed;
      if (filter === "submitted") return Boolean(document) || ["ready", "downloaded"].includes(generation?.status);
    } else if (documentViewMode === "upload") {
      if (filter === "ready") return canUpload;
      if (filter === "review") return document?.validation_status === "pending_validation";
      if (filter === "incident") return correction;
      if (filter === "validated") return document?.validation_status === "validated";
    } else {
      if (filter === "available") return document?.validation_status === "validated";
      if (filter === "pending") return Boolean(document) && document.validation_status !== "validated";
      if (filter === "missing") return !document;
    }
    return true;
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
    if (elements.globalBackToMenu) {
      elements.globalBackToMenu.hidden = sectionId === "dashboardSection";
    }
  }

  function openDashboard() {
    clearNotice();
    setActiveSection("dashboardSection");
  }

  function configureDocumentView(mode) {
    documentViewMode = ["create", "upload", "download"].includes(mode) ? mode : "create";
    elements.documentsSection.dataset.mode = documentViewMode;
    const copy = {
      create: {
        heading: "Generación de Anexos I",
        kicker: "Preparación para firmas",
        title: "Generar Anexo I",
        description: "Después de finalizar la sesión y cerrar la asistencia, genera el Anexo I con todas las personas que hayan asistido y descárgalo para recoger sus firmas manuscritas.",
        empty: "No hay sesiones con inscripciones disponibles para generar el Anexo I."
      },
      upload: {
        heading: "Subida de Anexos I",
        kicker: "Entrega segura",
        title: "Subir Anexo I firmado",
        description: "Incorpora el PDF con las firmas manuscritas de las personas asistentes y la firma digital de la persona responsable del ayuntamiento.",
        empty: "No hay sesiones disponibles para incorporar documentación firmada."
      },
      download: {
        heading: "Descarga de Anexos I",
        kicker: "Documentos generados",
        title: "Descargar Anexo I",
        description: "Tras la validación provincial, descarga el PDF firmado por el ayuntamiento y el PDF final validado por la Dirección Provincial. No se ofrece opción de impresión desde el portal.",
        empty: "No hay sesiones con Anexos I disponibles para descargar."
      }
    }[documentViewMode];
    elements.documentsModeHeading.textContent = copy.heading;
    elements.documentsKicker.textContent = copy.kicker;
    elements.documentsTitle.textContent = copy.title;
    elements.documentsDescription.textContent = copy.description;
    elements.documentsEmpty.textContent = copy.empty;
    documentQuickFilter = "all";
    if (elements.documentPhaseFilter) elements.documentPhaseFilter.value = "all";
    if (elements.documentDateFilter) elements.documentDateFilter.value = "";
    renderDocumentQuickFilters();
  }

  function openDocumentSection(mode) {
    clearNotice();
    configureDocumentView(mode);
    renderDocuments();
    setActiveSection("documentsSection");
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


  function annexDocumentDownloadKeyStorageName(requestId) {
    return `${ANNEX_DOCUMENT_DOWNLOAD_KEY_PREFIX}:${currentUser?.id || "user"}:${requestId}`;
  }

  function annexDocumentDownloadAdditionalData(request) {
    return JSON.stringify({
      schema: ANNEX_DOCUMENT_DOWNLOAD_SCHEMA,
      version: 1,
      request_id: String(request.id),
      municipality_id: String(request.municipality_id),
      session_id: String(request.session_id),
      document_id: String(request.municipal_document_id),
      variant: String(request.variant),
    });
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
    return ({ pending: "Pendiente de incorporar al SAE", processing: "Procesando", synced: "Incorporada al SAE", error: "Requiere revisión" })[status] ?? status;
  }

  function sessionCard(session) {
    const isInitial = session.session_type === "initial";
    const phaseLabel = isInitial ? "Inicial" : "Final";
    const available = Number(session.regular_available ?? 0);
    const sessionRegistrations = registrationsForSession(session.id);
    const participantCount = sessionRegistrations.length;
    const canRegisterInitial = isInitial && session.registration_open && available > 0;
    const canRegisterFinal = !isInitial && session.registration_open && available > 0 && eligibleParticipants.length > 0;
    let actionLabel = "Inscripción cerrada";
    let actionClass = "";
    let registrationNote = "";

    if (canRegisterInitial) {
      actionLabel = "Inscribir";
      actionClass = "js-register-initial";
    } else if (canRegisterFinal) {
      actionLabel = "Inscribir";
      actionClass = "js-register-final";
    } else if (!isInitial && session.registration_open && eligibleParticipants.length === 0) {
      actionLabel = "Sin personas disponibles";
      registrationNote = "La inscripción final se habilita para las personas cuya sesión inicial conste como realizada.";
    }

    const meetingUrl = String(session.meeting_url || "").trim();
    const hasMeetingUrl = Boolean(meetingUrl);
    const participantsHtml = participantCount
      ? sessionRegistrations.map(sessionParticipantRow).join("")
      : '<p class="session-panel-empty">Todavía no hay participantes inscritos en esta sesión.</p>';

    return `
      <article class="session-browser-row" data-session-id="${session.id}">
        <div class="session-browser-main">
          <div class="session-date-block ${isInitial ? "initial" : "final"}">
            <span>${phaseLabel}</span>
            <strong>${escapeHtml(formatDate(session.session_date))}</strong>
          </div>
          <div class="session-browser-copy">
            <h3>${escapeHtml(session.title)}</h3>
            <p>${escapeHtml(formatTime(session.start_time))}–${escapeHtml(formatTime(session.end_time))} · ${escapeHtml(session.trainer || "Personal formador pendiente")}</p>
            <div class="session-browser-meta">
              <span class="badge ${session.registration_open ? "open" : "closed"}">${session.registration_open ? "Inscripción abierta" : "Inscripción cerrada"}</span>
              <span>${available} plazas disponibles</span>
              <span>${participantCount} participante${participantCount === 1 ? "" : "s"}</span>
            </div>
          </div>
        </div>
        <div class="session-browser-actions">
          <button class="button ${actionClass ? "primary" : "secondary"} small ${actionClass}" type="button" data-session-id="${session.id}" ${actionClass ? "" : "disabled"}>${actionLabel}</button>
          <button class="button secondary small js-toggle-link" type="button" data-session-id="${session.id}" ${hasMeetingUrl ? "" : "disabled"}>${hasMeetingUrl ? "Ver enlace" : "Sin enlace"}</button>
          <button class="button secondary small js-toggle-participants" type="button" data-session-id="${session.id}" ${participantCount ? "" : "disabled"}>Participantes (${participantCount})</button>
        </div>
        ${registrationNote ? `<p class="session-row-note">${escapeHtml(registrationNote)}</p>` : ""}
        <div class="session-link-panel" data-session-link-panel="${session.id}" hidden>
          <span>Enlace de la sesión</span>
          <div class="session-link-value">
            <a href="${escapeHtml(meetingUrl)}" target="_blank" rel="noreferrer">${escapeHtml(meetingUrl)}</a>
            <button class="button secondary small js-copy-link" type="button" data-link="${escapeHtml(meetingUrl)}">Copiar</button>
          </div>
        </div>
        <div class="session-participants-panel" data-session-participants-panel="${session.id}" hidden>
          <div class="session-panel-heading"><strong>Participantes inscritos</strong><span>${participantCount}</span></div>
          ${participantsHtml}
        </div>
      </article>`;
  }

  function registrationItem(registration) {
    const participant = registration.participant ?? {};
    const session = registration.session ?? {};
    const transferred = registration.status === "cancelled" && Boolean(registration.transferred_to_session_id);
    const today = new Date().toISOString().slice(0, 10);
    const canChange = ["pending", "confirmed"].includes(registration.status)
      && registration.sync_status !== "processing"
      && session.session_date >= today
      && !transferred;
    const canCancel = ["pending", "confirmed", "incident"].includes(registration.status) && !transferred;
    const statusText = transferred ? "Trasladada" : statusLabel(registration.status);
    const statusClass = transferred ? "transferred" : registration.status;
    const transferredTo = registration.transferred_to_session;
    const registrationIncident =
      registration.incident_message
      || (
        ["error"].includes(registration.sync_status)
        || ["incident"].includes(registration.status)
          ? participant.incident_message
          : ""
      );

    return `
      <article class="registration-item" data-registration-id="${registration.id}">
        <div class="registration-person">
          <strong>${escapeHtml(participant.display_name || "Persona")}</strong>
          <small>${escapeHtml(participant.masked_document || "Documento protegido")}</small>
          ${registrationIncident ? `<small class="danger-text">${escapeHtml(registrationIncident)}</small>` : ""}
        </div>
        <div class="registration-session">
          <strong>${escapeHtml(session.title || "Sesión")}</strong>
          <small>${escapeHtml(formatDate(session.session_date))} · ${registration.phase === "initial" ? "Inicial" : "Final"}</small>
          <small>Programa: ${escapeHtml(registration.program_name_snapshot || "Sin programa")}</small>
          ${transferred && transferredTo
            ? `<small class="transfer-note">Trasladada a: ${escapeHtml(transferredTo.title)} · ${escapeHtml(formatDate(transferredTo.session_date))}</small>`
            : ""}
          <div class="status-row">
            <span class="badge ${statusClass}">${escapeHtml(statusText)}</span>
            <span class="badge ${registration.sync_status}">${escapeHtml(syncLabel(registration.sync_status))}</span>
          </div>
        </div>
        <div class="registration-actions">
          <button class="button primary small js-change-session" type="button" data-registration-id="${registration.id}" ${canChange ? "" : "disabled"}>${canChange ? "Cambiar de sesión" : "Cambio no disponible"}</button>
          <button class="button secondary small js-cancel-registration" type="button" data-registration-id="${registration.id}" ${canCancel ? "" : "disabled"}>${canCancel ? "Cancelar inscripción" : "Sin cancelación"}</button>
        </div>
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

  function hasDownloadedGeneration(sessionId) {
    return annexGenerationRequests.some(
      (item) => item.session_id === sessionId && item.status === "downloaded",
    );
  }

  function latestAnnexDocumentDownload(documentId, variant) {
    return annexDocumentDownloadRequests
      .filter((item) => item.municipal_document_id === documentId && item.variant === variant)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0] ?? null;
  }

  function madridNowParts() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
  }

  function sessionHasFinished(session) {
    if (!session?.session_date || !session?.end_time) return false;
    const now = madridNowParts();
    const today = `${now.year}-${now.month}-${now.day}`;
    if (session.session_date < today) return true;
    if (session.session_date > today) return false;
    const currentTime = `${now.hour}:${now.minute}:${now.second}`;
    return String(session.end_time).slice(0, 8).padEnd(8, "0") <= currentTime;
  }

  function documentGroups() {
    const grouped = new Map();
    for (const registration of registrations) {
      if (!registration.session || registration.status === "cancelled") continue;
      const key = registration.session.id;
      const current = grouped.get(key) ?? {
        session: registration.session,
        total: 0,
        attended: 0,
        absent: 0,
        pendingAttendance: 0,
      };
      current.total += 1;
      if (registration.status === "attended") current.attended += 1;
      else if (registration.status === "absent") current.absent += 1;
      else current.pendingAttendance += 1;
      grouped.set(key, current);
    }
    return [...grouped.values()].sort((a, b) =>
      b.session.session_date.localeCompare(a.session.session_date)
    );
  }

  function annexDocumentDownloadAction(document, variant) {
    const isProvincialValidated = variant === "provincial_validated";
    const label = isProvincialValidated
      ? "Validado por Dirección Provincial"
      : "Firmado por asistentes + responsable";
    const available = variant === "municipal_signed"
      ? Boolean(document.internal_document_id)
      : Boolean(document.validated_internal_document_id);

    const variantClass = isProvincialValidated
      ? "download-variant provincial-final-download"
      : "download-variant municipal-source-download";

    const helperText = isProvincialValidated
      ? `<span class="download-variant-help">Documento final validado por la Dirección Provincial.</span>`
      : `<span class="download-variant-help">Documento remitido inicialmente por el ayuntamiento.</span>`;

    if (!available) {
      return `<div class="${variantClass}"><div class="download-variant-heading"><strong>${escapeHtml(label)}</strong>${isProvincialValidated ? '<span class="final-document-badge">Documento final</span>' : ''}</div>${helperText}<button class="button secondary small" type="button" disabled>No disponible</button></div>`;
    }

    const request = latestAnnexDocumentDownload(document.id, variant);
    const localKey = request
      ? localStorage.getItem(annexDocumentDownloadKeyStorageName(request.id))
      : null;

    let action = "";
    if (request?.status === "pending" || request?.status === "processing") {
      action = `<button class="button ${isProvincialValidated ? "primary" : "secondary"} ${isProvincialValidated ? "important-download-button" : ""} small" type="button" disabled>Preparando…</button>`;
    } else if (request?.status === "ready" && localKey && request.storage_path) {
      action = `<button class="button ${isProvincialValidated ? "primary important-download-button" : "secondary"} small js-download-annex-document" type="button" data-request-id="${request.id}">${isProvincialValidated ? "Descargar validado por DP" : "Descargar PDF municipal"}</button>`;
    } else {
      action = `<button class="button ${isProvincialValidated ? "primary important-download-button" : "secondary"} small js-prepare-annex-document-download" type="button" data-document-id="${document.id}" data-session-id="${document.session_id}" data-variant="${variant}">${isProvincialValidated ? "Preparar descarga del validado por DP" : "Preparar descarga"}</button>`;
    }

    const incident = request?.status === "error" && request.incident_message
      ? `<small class="danger-text">${escapeHtml(request.incident_message)}</small>`
      : "";

    return `<div class="${variantClass}"><div class="download-variant-heading"><strong>${escapeHtml(label)}</strong>${isProvincialValidated ? '<span class="final-document-badge">Documento final</span>' : ''}</div>${helperText}${action}${incident}</div>`;
  }

  function documentSessionItem(group) {
    const document = latestDocumentForSession(group.session.id);
    const generation = latestGenerationForSession(group.session.id);
    const finished = sessionHasFinished(group.session);
    const attendanceClosed = group.pendingAttendance === 0;
    const canCreate = finished && attendanceClosed && group.attended > 0;
    const downloadedForSignatures = hasDownloadedGeneration(group.session.id);

    const generationStatusClass = generation
      ? (["ready", "downloaded"].includes(generation.status)
          ? "synced"
          : generation.status === "error"
            ? "incident"
            : "pending")
      : "pending";

    const generationStateClass = !generation
      ? "annex-not-generated"
      : ["ready", "downloaded"].includes(generation.status)
        ? "annex-generated"
        : ["pending", "processing"].includes(generation.status)
          ? "annex-generating"
          : generation.status === "error"
            ? "annex-generation-error"
            : "annex-not-generated";

    const generationStatusHtml = generation
      ? `<div class="status-row"><span class="badge ${generationStatusClass}">${escapeHtml(annexGenerationStatusLabel(generation.status))}</span></div><small>${generation.page_count ? `${generation.page_count} página${generation.page_count === 1 ? "" : "s"} · ` : ""}${generation.generated_at ? "generado por el SAE" : "solicitud en curso"}</small>${generation.incident_message ? `<small class="danger-text">${escapeHtml(generation.incident_message)}</small>` : ""}`
      : `<span class="badge pending">No generado</span>`;

    const localGenerationKey = generation
      ? Boolean(localStorage.getItem(annexKeyStorageName(generation.id)))
      : false;

    let contentHtml = "";
    let actionHtml = "";

    if (documentViewMode === "create") {
      if (document) {
        let documentStateClass = "validation-pending";
        let documentStateLabel = "Pendiente de validación";
        let documentStateText = "El Anexo I firmado ya fue remitido. No es necesario volver a generarlo.";

        if (document.validation_status === "validated") {
          documentStateClass = "synced";
          documentStateLabel = "Validado por Dirección Provincial";
          documentStateText = "El circuito documental de esta sesión ya está finalizado.";
        } else if (document.validation_status === "incident") {
          documentStateClass = "incident";
          documentStateLabel = "Con incidencia";
          documentStateText = "La corrección debe realizarse desde Subida de Anexos I; no es necesario regenerar el listado.";
        } else if (document.sync_status === "error") {
          documentStateClass = "incident";
          documentStateLabel = "Error en el envío";
          documentStateText = "Revisa la incidencia desde Subida de Anexos I.";
        }

        contentHtml = `<div class="document-status-column"><strong>Anexo I firmado</strong><div class="status-row"><span class="badge ${documentStateClass}">${escapeHtml(documentStateLabel)}</span></div><small>Versión ${document.version}</small></div><div class="document-status-column"><strong>Situación</strong><span>${escapeHtml(documentStateText)}</span></div>`;
        actionHtml = `<span class="creation-already-submitted">Anexo I ya remitido</span>`;
      } else {
        let availability = "";
        if (!finished) {
          availability = group.session.end_time
            ? `Disponible después de las ${formatTime(group.session.end_time)} del ${formatDate(group.session.session_date)}.`
            : "La sesión no tiene hora de finalización definida.";
        } else if (!attendanceClosed) {
          availability = `Falta registrar asistencia o ausencia de ${group.pendingAttendance} persona${group.pendingAttendance === 1 ? "" : "s"}.`;
        } else if (group.attended < 1) {
          availability = "No consta ninguna persona asistente.";
        } else {
          availability = `${group.attended} persona${group.attended === 1 ? "" : "s"} asistente${group.attended === 1 ? "" : "s"} se incluirán automáticamente.`;
        }

        contentHtml = `<div class="document-status-column"><strong>Asistencia</strong><span>${escapeHtml(availability)}</span></div><div class="document-status-column"><strong>Listado para firmas</strong>${generationStatusHtml}</div>`;

        if (generation?.status === "pending" || generation?.status === "processing") {
          actionHtml = `<button class="button secondary small" type="button" disabled>Generando…</button>`;
        } else if (generation?.status === "ready" && localGenerationKey && generation.storage_path) {
          actionHtml = `<button class="button small download-signatures-button js-download-generated" type="button" data-request-id="${generation.id}">Descargar para firmas</button>`;
        } else if (canCreate) {
          const generateLabel = generation?.status === "downloaded"
            ? "Volver a generar Anexo I"
            : generation?.status === "error"
              ? "Volver a generar Anexo I"
              : generation?.status === "ready" && !localGenerationKey
                ? "Generar nueva copia en este dispositivo"
                : "Generar Anexo I";

          const generateButtonClass = generation?.status === "downloaded"
            ? "button secondary small regenerate-annex-button"
            : "button primary small";

          actionHtml = `<button class="${generateButtonClass} js-generate-annex" type="button" data-session-id="${group.session.id}">${generateLabel}</button>`;
        } else {
          actionHtml = `<button class="button secondary small" type="button" disabled>No disponible todavía</button>`;
        }
      }
    } else if (documentViewMode === "upload") {
      const isCorrection =
        document?.validation_status === "incident"
        || document?.sync_status === "error";

      const canUpload = isCorrection
        || (
          finished
          && attendanceClosed
          && group.attended > 0
          && downloadedForSignatures
          && !document
        );
      let uploadStatus = `<span class="badge upload-pending">Pendiente de subida</span>`;

      if (document) {
        let visibleStatusClass = "validation-pending";
        let visibleStatusLabel = "Pendiente de validación";

        if (document.validation_status === "validated") {
          visibleStatusClass = "synced";
          visibleStatusLabel = "Validado";
        } else if (document.validation_status === "incident") {
          visibleStatusClass = "incident";
          visibleStatusLabel = "Con incidencia";
        } else if (document.sync_status === "error") {
          visibleStatusClass = "incident";
          visibleStatusLabel = "Error en el envío";
        }

        uploadStatus = `<div class="status-row"><span class="badge ${visibleStatusClass}">${escapeHtml(visibleStatusLabel)}</span></div><small>Versión ${document.version}</small>${document.incident_message ? `<small class="danger-text">${escapeHtml(document.incident_message)}</small>` : ""}`;
      }

      let secondaryTitle = "Requisito";
      let secondaryText = downloadedForSignatures
        ? "Listado para firmas descargado."
        : "Primero debes generar y descargar el listado para firmas.";

      if (isCorrection) {
        secondaryTitle = "Subsanación";
        secondaryText = "La Dirección Provincial ha solicitado una corrección. Puedes enviar directamente una nueva versión.";
      } else if (document?.validation_status === "pending_validation") {
        secondaryTitle = "Siguiente paso";
        secondaryText = "Documento enviado. No tienes que realizar ninguna actuación mientras la Dirección Provincial lo revisa.";
      } else if (document?.validation_status === "validated") {
        secondaryTitle = "Proceso";
        secondaryText = "Documento validado por la Dirección Provincial.";
      }

      contentHtml = `<div class="document-status-column"><strong>PDF firmado por asistentes + responsable</strong>${uploadStatus}</div><div class="document-status-column"><strong>${escapeHtml(secondaryTitle)}</strong><span>${escapeHtml(secondaryText)}</span></div>`;

      if (canUpload) {
        actionHtml = `<button class="button primary small js-upload-document" type="button" data-session-id="${group.session.id}">${isCorrection ? "Enviar versión corregida" : "Subir Anexo I firmado"}</button>`;
      } else if (document?.validation_status === "validated") {
        actionHtml = `<button class="button secondary small" type="button" disabled>Validado</button>`;
      } else if (document?.validation_status === "pending_validation") {
        actionHtml = `<span class="workflow-waiting-note">En revisión por la Dirección Provincial</span>`;
      } else {
        actionHtml = `<button class="button secondary small" type="button" disabled>No disponible todavía</button>`;
      }
    } else {
      const validated = document?.validation_status === "validated";
      contentHtml = validated
        ? `<div class="download-status-summary"><div class="document-status-column"><strong>Estado</strong><span class="badge synced">Validado por Dirección Provincial</span><small>Versión ${document.version}</small></div><div class="signed-file-warning"><strong>Documento con firma digital</strong><span>Conserva el archivo PDF electrónico. La impresión no permite verificar las firmas digitales.</span></div></div>`
        : `<div class="download-status-summary"><div class="document-status-column"><strong>Estado</strong><span class="badge ${document ? "validation-pending" : "upload-pending"}">${document ? "Pendiente de validación" : "Pendiente de subida"}</span><small>${document ? "El documento está pendiente de revisión por la Dirección Provincial." : "Todavía no se ha recibido el Anexo I firmado."}</small></div></div>`;

      actionHtml = validated
        ? `<div class="download-actions">${annexDocumentDownloadAction(document, "provincial_validated")}${annexDocumentDownloadAction(document, "municipal_signed")}</div>`
        : `<button class="button secondary small" type="button" disabled>No disponible para descarga</button>`;
    }

    const visualStateClass = documentViewMode === "create"
      ? (document
          ? document.validation_status === "validated"
            ? "annex-already-validated"
            : document.validation_status === "incident" || document.sync_status === "error"
              ? "annex-already-incident"
              : "annex-already-submitted"
          : generationStateClass)
      : "";

    const viewStateClass = documentViewMode === "download"
      ? "document-download-item"
      : "";

    return `<article class="document-item document-mode-item ${visualStateClass} ${viewStateClass}" data-session-id="${group.session.id}">
      <div>
        <h3>${escapeHtml(group.session.title || "Sesión")}</h3>
        <p>${escapeHtml(formatDate(group.session.session_date))} · ${group.session.session_type === "initial" ? "Inicial" : "Final"}</p>
        <small>${group.attended} asistieron · ${group.absent} no asistieron${group.pendingAttendance ? ` · ${group.pendingAttendance} pendientes de asistencia` : ""}</small>
      </div>
      ${contentHtml}
      <div class="document-actions-stack">${actionHtml}</div>
    </article>`;
  }

  function renderDocuments() {
    const groups = documentGroups();
    const phase = elements.documentPhaseFilter?.value || "all";
    const date = elements.documentDateFilter?.value || "";
    const visible = groups.filter((group) => {
      if (phase !== "all" && group.session.session_type !== phase) return false;
      if (date && group.session.session_date !== date) return false;
      return documentMatchesQuickFilter(group, documentQuickFilter);
    });
    renderDocumentQuickFilters();
    elements.documentsFilterResult.textContent = `${visible.length} de ${groups.length} sesiones`;
    elements.documentsEmpty.hidden = visible.length > 0;
    elements.documentsList.hidden = visible.length === 0;
    if (visible.length > 0) {
      elements.documentsList.innerHTML = visible.map(documentSessionItem).join("");
    } else {
      elements.documentsList.innerHTML = "";
      elements.documentsEmpty.textContent = groups.length === 0
        ? "No hay sesiones con inscripciones disponibles."
        : "No hay sesiones que coincidan con los filtros seleccionados.";
    }
  }

  function incidentItems() {
    const items = [];

    for (const registration of registrations) {
      const participant = registration.participant ?? {};
      const registrationHasIncident =
        registration.status === "incident"
        || registration.sync_status === "error";

      const message =
        registration.incident_message
        || (
          registrationHasIncident
            ? participant.incident_message
            : ""
        )
        || (registration.sync_status === "error"
          ? "La inscripción requiere revisión."
          : "");

      if (registrationHasIncident || registration.incident_message) {
        items.push({
          group: "registration",
          scope: "PERSONA",
          scopeClass: "person",
          type: "Inscripción",
          title: participant.display_name || "Persona participante",
          subtitle:
            `${registration.session?.title || "Sesión"} · `
            + `${participant.masked_document || "Documento protegido"}`,
          message: message || "La inscripción requiere revisión.",
          actionLabel: "Ver inscripción",
          action: "registration",
          registrationId: registration.id,
          sessionId: registration.session?.id || "",
        });
      }
    }

    for (const document of municipalDocuments) {
      if (
        document.validation_status !== "incident"
        && document.sync_status !== "error"
        && !document.incident_message
      ) continue;

      const session = findRegistrationSession(document.session_id);
      items.push({
        group: "annex",
        scope: "ANEXO I",
        scopeClass: "annex",
        type: "Anexo I firmado",
        title: session?.title || "Sesión",
        subtitle: `Versión ${document.version}`,
        message:
          document.incident_message
          || (document.sync_status === "error"
            ? "Error al incorporar el documento al SAE."
            : "El SAE ha indicado que debe enviarse una nueva versión."),
        actionLabel: "Ir a subida de Anexos I",
        action: "annex-upload",
        sessionId: document.session_id,
      });
    }

    for (const generation of annexGenerationRequests) {
      if (generation.status !== "error" && !generation.incident_message) continue;

      const session = findRegistrationSession(generation.session_id);
      items.push({
        group: "annex",
        scope: "ANEXO I",
        scopeClass: "annex",
        type: "Generación de Anexo I",
        title: session?.title || "Sesión",
        subtitle: "Listado para firmas",
        message:
          generation.incident_message
          || "No se pudo generar el Anexo I.",
        actionLabel: "Volver a generación",
        action: "annex-create",
        sessionId: generation.session_id,
      });
    }

    return items;
  }

  function updateIncidentFilterButtons() {
    document.querySelectorAll("[data-incident-filter]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.incidentFilter === incidentFilter,
      );
    });
  }

  function renderIncidents() {
    const allItems = incidentItems();
    const registrationCount =
      allItems.filter((item) => item.group === "registration").length;
    const annexCount =
      allItems.filter((item) => item.group === "annex").length;

    if (elements.incidentMenuCount) elements.incidentMenuCount.textContent = String(allItems.length);
    elements.incidentTotalCount.textContent = String(allItems.length);
    elements.incidentRegistrationCount.textContent =
      String(registrationCount);
    elements.incidentAnnexCount.textContent = String(annexCount);

    const items = incidentFilter === "all"
      ? allItems
      : allItems.filter((item) => item.group === incidentFilter);

    updateIncidentFilterButtons();

    elements.incidentsEmpty.hidden = items.length > 0;
    elements.incidentsList.hidden = items.length === 0;

    if (items.length === 0) {
      elements.incidentsEmpty.textContent =
        allItems.length === 0
          ? "No hay incidencias pendientes."
          : "No hay incidencias en este filtro.";
      elements.incidentsList.innerHTML = "";
      return;
    }

    elements.incidentsList.innerHTML = items.map((item) => `
      <article class="incident-item">
        <div class="incident-identity">
          <div class="incident-badges">
            <span class="incident-scope ${escapeHtml(item.scopeClass || "session")}">${escapeHtml(item.scope || "SESIÓN")}</span>
            <span class="badge incident">${escapeHtml(item.type)}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <small>${escapeHtml(item.subtitle)}</small>
        </div>
        <div class="incident-message">
          <strong>Qué ocurre</strong>
          <p>${escapeHtml(item.message)}</p>
        </div>
        <div class="incident-actions">
          <button
            class="button primary small js-resolve-incident"
            type="button"
            data-incident-action="${escapeHtml(item.action)}"
            data-registration-id="${escapeHtml(item.registrationId || "")}"
            data-session-id="${escapeHtml(item.sessionId || "")}"
          >${escapeHtml(item.actionLabel)}</button>
        </div>
      </article>
    `).join("");
  }

  function highlightPortalItem(selector) {
    window.setTimeout(() => {
      const target = document.querySelector(selector);
      if (!target) return;
      target.classList.add("attention-highlight");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(
        () => target.classList.remove("attention-highlight"),
        2600,
      );
    }, 80);
  }

  function resolveIncidentNavigation(button) {
    const action = button.dataset.incidentAction;
    const registrationId = button.dataset.registrationId;
    const sessionId = button.dataset.sessionId;

    clearNotice();

    if (action === "registration") {
      setActiveSection("registrationsSection");
      if (registrationId) {
        highlightPortalItem(
          `.registration-item[data-registration-id="${CSS.escape(registrationId)}"]`,
        );
      }
      showNotice(
        "warning",
        "Revisa la inscripción señalada. Si la incidencia no permite una acción municipal, el SAE deberá resolverla.",
      );
      return;
    }

    if (action === "annex-upload") {
      openDocumentSection("upload");
      if (sessionId) {
        highlightPortalItem(
          `.document-item[data-session-id="${CSS.escape(sessionId)}"]`,
        );
      }
      showNotice(
        "warning",
        "Revisa el motivo indicado y, cuando proceda, incorpora una nueva versión del Anexo I firmado.",
      );
      return;
    }

    if (action === "annex-create") {
      openDocumentSection("create");
      if (sessionId) {
        highlightPortalItem(
          `.document-item[data-session-id="${CSS.escape(sessionId)}"]`,
        );
      }
      showNotice(
        "warning",
        "La generación anterior tuvo una incidencia. Puedes solicitar una nueva copia del Anexo I.",
      );
    }
  }


  async function loadDocuments() {
    elements.documentsLoading.hidden = false;
    elements.documentsEmpty.hidden = true;
    elements.documentsList.hidden = true;
    elements.refreshDocumentsButton.disabled = true;
    try {
      const [documentsResult, generationsResult, downloadsResult] = await Promise.all([
        client
          .from("municipal_documents")
          .select("id, session_id, version, sync_status, validation_status, incident_message, upload_status, created_at, processed_at, internal_document_id, validated_internal_document_id, provincial_validated_at, provincial_validated_by")
          .order("version", { ascending: false }),
        client
          .from("annex_generation_requests")
          .select("id, municipality_id, session_id, status, storage_bucket, storage_path, output_iv, plain_size_bytes, plain_sha256, encrypted_size_bytes, page_count, file_name, incident_message, created_at, generated_at, downloaded_at, expires_at")
          .order("created_at", { ascending: false }),
        client
          .from("annex_document_download_requests")
          .select("id, municipality_id, session_id, municipal_document_id, variant, status, storage_bucket, storage_path, output_iv, plain_size_bytes, plain_sha256, encrypted_size_bytes, file_name, incident_message, created_at, prepared_at, downloaded_at, expires_at")
          .order("created_at", { ascending: false }),
      ]);
      if (documentsResult.error) throw new Error(documentsResult.error.message);
      if (generationsResult.error) throw new Error(generationsResult.error.message);
      if (downloadsResult.error) throw new Error(downloadsResult.error.message);
      municipalDocuments = Array.isArray(documentsResult.data) ? documentsResult.data : [];
      annexGenerationRequests = Array.isArray(generationsResult.data) ? generationsResult.data : [];
      annexDocumentDownloadRequests = Array.isArray(downloadsResult.data) ? downloadsResult.data : [];
      elements.documentTabCount.textContent = String(
        municipalDocuments.filter((item) => item.validation_status !== "superseded").length,
      );
      renderDocuments();
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
      && registration.status === "attended"
      && registration.program_id
      && registration.program_name_snapshot
    );
  }

  function openAnnexGenerationDialog(sessionId) {
    const session = findRegistrationSession(sessionId);
    if (!session) return;
    const group = documentGroups().find((item) => item.session.id === sessionId);
    if (!group || !sessionHasFinished(session)) {
      showNotice("warning", `El Anexo I estará disponible después de la hora de finalización de la sesión (${formatTime(session.end_time)}).`);
      return;
    }
    if (group.pendingAttendance > 0) {
      showNotice("warning", "Antes de generar el Anexo I debe registrarse la asistencia o ausencia de todas las personas inscritas.");
      return;
    }

    const attended = registrationsForAnnex(sessionId);
    if (attended.length === 0) {
      showNotice("warning", "No hay personas con asistencia confirmada para generar el Anexo I.");
      return;
    }

    clearNotice(elements.annexGenerationNotice);
    elements.annexGenerationForm.reset();
    elements.annexGenerationSessionId.value = session.id;
    elements.annexGenerationSummary.textContent = `${session.title} · ${formatDate(session.session_date)} · ${formatTime(session.start_time)}–${formatTime(session.end_time)}`;
    elements.annexModality.value = "online";
    elements.annexRepresentativeName.value = "";
    elements.annexRepresentativePosition.value = "";
    elements.annexParticipantCount.textContent = `${attended.length} persona${attended.length === 1 ? "" : "s"} asistente${attended.length === 1 ? "" : "s"} incluida${attended.length === 1 ? "" : "s"} automáticamente`;
    elements.annexParticipantsList.innerHTML = attended.map((registration) => `
      <div class="annex-participant-row annex-participant-readonly">
        <span><strong>${escapeHtml(registration.participant?.display_name || "Persona")}</strong><small>${escapeHtml(registration.participant?.masked_document || "Documento protegido")} · ${escapeHtml(registration.program_name_snapshot)}</small></span>
      </div>
    `).join("");
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
    const registrationIds = registrationsForAnnex(sessionId).map((item) => item.id);
    const representativeName = normalizePersonText(elements.annexRepresentativeName.value);
    const representativePosition = normalizePersonText(elements.annexRepresentativePosition.value);

    if (registrationIds.length < 1) {
      showNotice("warning", "No hay personas asistentes para incluir.", elements.annexGenerationNotice);
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
      showNotice("success", "El SAE está generando el Anexo I. Estará disponible en aproximadamente un minuto. Pulsa el botón Actualizar para comprobar si ya está disponible.");
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
      showNotice("success", "Anexo I descargado. Imprímelo para recoger las firmas manuscritas de las personas asistentes y, después, obtén la firma digital de la persona responsable del ayuntamiento.");
    } catch (error) {
      showNotice("error", `No se pudo descargar y descifrar el Anexo I: ${error.message}`);
    }
  }

  async function prepareAnnexDocumentDownload(documentId, sessionId, variant) {
    if (!activeEncryptionKey) {
      showNotice("error", "No está disponible la clave pública de cifrado.");
      return;
    }
    clearNotice();
    try {
      const key = await createAnnexDownloadKey(activeEncryptionKey.public_key_pem);
      const { data, error } = await client.rpc("begin_annex_document_download", {
        p_document_id: documentId,
        p_variant: variant,
        p_key_id: activeEncryptionKey.id,
        p_encrypted_download_key: key.encryptedKey,
      });
      if (error) throw new Error(error.message);
      const response = Array.isArray(data) ? data[0] : data;
      if (!response?.request_id) throw new Error("Supabase no devolvió la solicitud de descarga.");
      localStorage.setItem(
        annexDocumentDownloadKeyStorageName(response.request_id),
        key.rawKey,
      );
      await loadDocuments();
      showNotice("success", "El SAE está preparando la descarga cifrada. Pulsa Actualizar dentro de aproximadamente un minuto.");
    } catch (error) {
      showNotice("error", `No se pudo preparar la descarga: ${error.message}`);
    }
  }

  async function downloadAnnexDocument(requestId) {
    const request = annexDocumentDownloadRequests.find((item) => item.id === requestId);
    if (!request || request.status !== "ready" || !request.storage_path) return;
    const rawKeyBase64 = localStorage.getItem(
      annexDocumentDownloadKeyStorageName(request.id),
    );
    if (!rawKeyBase64) {
      showNotice("warning", "Esta descarga se preparó desde otro navegador o se eliminó su clave local. Pulsa Preparar descarga para obtener una nueva copia.");
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
        ["decrypt"],
      );
      const plain = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: base64ToBytes(request.output_iv),
          additionalData: new TextEncoder().encode(
            annexDocumentDownloadAdditionalData(request),
          ),
          tagLength: 128,
        },
        key,
        encrypted,
      );
      const bytes = new Uint8Array(plain);
      if (new TextDecoder("ascii").decode(bytes.slice(0, 5)) !== "%PDF-") {
        throw new Error("El contenido descifrado no es un PDF válido.");
      }
      const digest = bytesToHex(await crypto.subtle.digest("SHA-256", bytes));
      if (digest !== request.plain_sha256) {
        throw new Error("La huella del PDF no coincide.");
      }

      const blobUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = request.file_name || "Anexo_I_firmado.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);

      const { error: markError } = await client.rpc(
        "mark_annex_document_downloaded",
        { p_request_id: request.id },
      );
      if (markError) throw new Error(markError.message);
      await client.storage.from(request.storage_bucket).remove([request.storage_path]);
      localStorage.removeItem(annexDocumentDownloadKeyStorageName(request.id));
      await loadDocuments();
      showNotice("success", "PDF descargado. Conserva el archivo electrónico original para poder verificar sus firmas digitales; el portal no ofrece opción de impresión para estas versiones firmadas.");
    } catch (error) {
      showNotice("error", `No se pudo descargar y descifrar el PDF: ${error.message}`);
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
      openDocumentSection("upload");
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
          transferred_from_registration_id, transferred_to_session_id, transferred_at,
          participant:participants (id, display_name, masked_document, progress_status, sync_status, incident_message),
          session:sessions!session_id
            (id, title, session_type, session_date, start_time, end_time, trainer, status),
          transferred_to_session:sessions!transferred_to_session_id
            (id, title, session_type, session_date, start_time, end_time, status)
        `)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      registrations = Array.isArray(data) ? data : [];
      const activeFinalParticipantIds = new Set(
        registrations
          .filter((item) =>
            item.phase === "final"
            && ["pending", "confirmed", "incident", "attended"].includes(item.status)
          )
          .map((item) => item.participant?.id)
          .filter(Boolean)
      );

      eligibleParticipants = registrations
        .filter((item) =>
          item.phase === "initial"
          && item.status === "attended"
          && item.participant?.id
          && !activeFinalParticipantIds.has(item.participant.id)
        )
        .map((item) => ({
          ...item.participant,
          previous_program_id: item.program_id,
          previous_program_name: item.program_name_snapshot
        }))
        .filter((participant, index, all) =>
          all.findIndex((other) => other?.id === participant.id) === index
        );
      if (elements.registrationTabCount) elements.registrationTabCount.textContent = String(registrations.length);
      renderIncidents();
      renderRegistrations();
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
        .select(`id, session_type, title, session_date, start_time, end_time, trainer, meeting_url, capacity_regular, regular_available, maximum_available, registration_open, published, status`)
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
      renderSessions();
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
      setActiveSection("sessionsSection");
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
      setActiveSection("sessionsSection");
    } catch (error) {
      const message = String(error?.message || "No se pudo completar la inscripción final.");
      const friendly = message.includes("session_registrations_one_active_phase")
        || message.includes("duplicate key")
        ? "Esta persona ya tiene una inscripción activa en una sesión final. Pulsa Actualizar para refrescar la lista."
        : message;
      showNotice("error", friendly, elements.finalRegistrationNotice);
    } finally {
      elements.submitFinalRegistration.disabled = false;
    }
  }


  function closeChangeSessionDialog() {
    registrationToChange = null;
    elements.changeSessionForm.reset();
    clearNotice(elements.changeSessionNotice);
    elements.changeSessionDialog.close();
  }

  function changeSessionCandidates(registration) {
    const participantId = registration?.participant?.id;
    const currentSessionId = registration?.session?.id;

    return sessions.filter((session) => {
      if (!session.registration_open || Number(session.regular_available ?? 0) < 1) return false;
      if (session.session_type !== registration.phase) return false;
      if (session.id === currentSessionId) return false;

      const alreadyUsed = registrations.some((item) =>
        item.participant?.id === participantId
        && item.session?.id === session.id
      );

      return !alreadyUsed;
    });
  }

  function openChangeSessionDialog(registrationId) {
    const registration = registrations.find((item) => item.id === registrationId);
    if (!registration) return;

    const today = new Date().toISOString().slice(0, 10);
    if (!["pending", "confirmed"].includes(registration.status)) {
      showNotice("warning", "Esta inscripción no puede cambiarse mientras tenga ese estado.");
      return;
    }
    if (registration.sync_status === "processing") {
      showNotice("warning", "La inscripción se está sincronizando. Pulsa Actualizar dentro de unos segundos.");
      return;
    }
    if (!registration.session || registration.session.session_date < today) {
      showNotice("warning", "No se puede trasladar una inscripción de una sesión ya celebrada.");
      return;
    }

    registrationToChange = registration;
    const participant = registration.participant ?? {};
    const candidates = changeSessionCandidates(registration);

    elements.changeRegistrationId.value = registration.id;
    elements.changeParticipantSummary.textContent =
      `${participant.display_name || "Persona"} · ${participant.masked_document || "Documento protegido"}`;
    elements.changeProgramSummary.textContent = registration.program_name_snapshot || "Sin programa";
    elements.changeCurrentSessionSummary.textContent =
      `${registration.session.title} · ${formatDate(registration.session.session_date)} · ${formatTime(registration.session.start_time)}`;

    if (candidates.length === 0) {
      elements.changeTargetSession.innerHTML = '<option value="">No hay otra sesión disponible</option>';
      elements.changeTargetSession.disabled = true;
      elements.confirmChangeSession.disabled = true;
      showNotice(
        "warning",
        "No hay otra sesión del mismo tipo, abierta y con plazas disponibles para esta persona.",
        elements.changeSessionNotice,
      );
    } else {
      elements.changeTargetSession.disabled = false;
      elements.confirmChangeSession.disabled = false;
      elements.changeTargetSession.innerHTML =
        '<option value="">Selecciona la nueva sesión</option>'
        + candidates.map((session) => `
          <option value="${session.id}">
            ${escapeHtml(session.title)} · ${escapeHtml(formatDate(session.session_date))} · ${escapeHtml(formatTime(session.start_time))} · ${Number(session.regular_available ?? 0)} plazas
          </option>
        `).join("");
    }

    elements.changeSessionDialog.showModal();
  }

  async function handleChangeSession(event) {
    event.preventDefault();
    clearNotice(elements.changeSessionNotice);

    if (!registrationToChange) {
      showNotice("error", "No se ha localizado la inscripción que quieres trasladar.", elements.changeSessionNotice);
      return;
    }

    const targetSessionId = elements.changeTargetSession.value;
    if (!targetSessionId) {
      showNotice("warning", "Selecciona la nueva sesión.", elements.changeSessionNotice);
      return;
    }

    elements.confirmChangeSession.disabled = true;
    elements.confirmChangeSession.textContent = "Cambiando…";

    try {
      const { data, error } = await client.rpc("change_registration_session", {
        p_registration_id: registrationToChange.id,
        p_new_session_id: targetSessionId,
      });
      if (error) throw new Error(error.message);
      if (!data) throw new Error("No se pudo crear la nueva inscripción.");

      closeChangeSessionDialog();
      await reloadPortalData();
      setActiveSection("registrationsSection");
      showNotice(
        "success",
        "Cambio realizado. La plaza anterior se ha liberado y la persona ha quedado inscrita en la nueva sesión.",
      );
    } catch (error) {
      showNotice(
        "error",
        error.message || "No se pudo realizar el cambio de sesión.",
        elements.changeSessionNotice,
      );
    } finally {
      elements.confirmChangeSession.disabled = false;
      elements.confirmChangeSession.textContent = "Confirmar cambio de sesión";
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
    setActiveSection("dashboardSection");
    try {
      await loadProfile();
      await loadEncryptionKey();
      await reloadPortalData();
      maybeShowMunicipalNotices();
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
    elements.closeMunicipalNoticesDialog?.addEventListener("click", closeMunicipalNoticesDialog);
    elements.acceptMunicipalNotices?.addEventListener("click", acceptMunicipalNotices);
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
    document.querySelectorAll("[data-session-type]").forEach((button) => {
      button.addEventListener("click", () => setSessionType(button.dataset.sessionType));
    });
    elements.sessionSearch?.addEventListener("input", renderSessions);
    elements.sessionDateFromFilter?.addEventListener("change", renderSessions);
    elements.sessionDateToFilter?.addEventListener("change", renderSessions);
    elements.clearSessionFilters?.addEventListener("click", () => {
      if (elements.sessionSearch) elements.sessionSearch.value = "";
      elements.sessionDateFromFilter.value = "";
      elements.sessionDateToFilter.value = "";
      renderSessions();
    });
    document.querySelectorAll("[data-registration-summary-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        registrationSummaryFilter = button.dataset.registrationSummaryFilter || "all";
        elements.registrationStatusFilter.value = "all";
        renderRegistrations();
      });
    });
    elements.registrationSearch.addEventListener("input", renderRegistrations);
    elements.registrationDateFilter.addEventListener("change", renderRegistrations);
    elements.registrationPhaseFilter.addEventListener("change", renderRegistrations);
    elements.registrationStatusFilter.addEventListener("change", () => {
      registrationSummaryFilter = "all";
      renderRegistrations();
    });
    elements.clearRegistrationFilters.addEventListener("click", () => {
      elements.registrationSearch.value = "";
      elements.registrationDateFilter.value = "";
      elements.registrationPhaseFilter.value = "all";
      elements.registrationStatusFilter.value = "all";
      registrationSummaryFilter = "all";
      renderRegistrations();
    });
    elements.documentQuickFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-document-quick-filter]");
      if (!button) return;
      documentQuickFilter = button.dataset.documentQuickFilter || "all";
      renderDocuments();
    });
    elements.documentPhaseFilter.addEventListener("change", renderDocuments);
    elements.documentDateFilter.addEventListener("change", renderDocuments);
    elements.clearDocumentFilters.addEventListener("click", () => {
      documentQuickFilter = "all";
      elements.documentPhaseFilter.value = "all";
      elements.documentDateFilter.value = "";
      renderDocuments();
    });
    elements.refreshDocumentsButton.addEventListener("click", async () => {
      clearNotice();
      try { await loadDocuments(); showNotice("success", "La documentación se ha actualizado."); }
      catch (error) { showNotice("error", `No se pudo actualizar la documentación: ${error.message}`); }
    });
    document.querySelectorAll(".js-dashboard-action").forEach((button) => button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "sessions-hub") { resetSessionTypeSelection(); setActiveSection("sessionsSection"); }
      else if (action === "participants") { setSessionType("initial"); setActiveSection("sessionsSection"); }
      else if (action === "changes") setActiveSection("registrationsSection");
      else if (action === "incidents") { renderIncidents(); setActiveSection("incidentsSection"); }
      else if (action === "annex-create") openDocumentSection("create");
      else if (action === "annex-upload") openDocumentSection("upload");
      else if (action === "annex-download") openDocumentSection("download");
    }));
    document.querySelectorAll(".js-back-dashboard").forEach((button) => button.addEventListener("click", openDashboard));
    document.querySelectorAll("[data-incident-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        incidentFilter = button.dataset.incidentFilter || "all";
        renderIncidents();
      });
    });
    elements.incidentsList.addEventListener("click", (event) => {
      const button = event.target.closest(".js-resolve-incident");
      if (button) resolveIncidentNavigation(button);
    });
    elements.refreshIncidentsButton.addEventListener("click", async () => {
      clearNotice();
      elements.refreshIncidentsButton.disabled = true;
      elements.incidentsLoading.hidden = false;
      try { await reloadPortalData(); renderIncidents(); showNotice("success", "Las incidencias se han actualizado."); }
      catch (error) { showNotice("error", `No se pudieron actualizar las incidencias: ${error.message}`); }
      finally { elements.refreshIncidentsButton.disabled = false; elements.incidentsLoading.hidden = true; }
    });
    elements.sessionsGrid.addEventListener("click", async (event) => {
      const initialButton = event.target.closest(".js-register-initial");
      const finalButton = event.target.closest(".js-register-final");
      const linkButton = event.target.closest(".js-toggle-link");
      const copyButton = event.target.closest(".js-copy-link");
      const participantsButton = event.target.closest(".js-toggle-participants");
      const changeButton = event.target.closest(".js-change-session");
      const cancelButton = event.target.closest(".js-cancel-registration");
      if (initialButton) openInitialDialog(initialButton.dataset.sessionId);
      if (finalButton) openFinalDialog(finalButton.dataset.sessionId);
      if (linkButton) {
        const panel = elements.sessionsGrid.querySelector(`[data-session-link-panel="${linkButton.dataset.sessionId}"]`);
        if (panel) {
          panel.hidden = !panel.hidden;
          linkButton.textContent = panel.hidden ? "Ver enlace" : "Ocultar enlace";
        }
      }
      if (participantsButton) {
        const panel = elements.sessionsGrid.querySelector(`[data-session-participants-panel="${participantsButton.dataset.sessionId}"]`);
        if (panel) {
          panel.hidden = !panel.hidden;
          participantsButton.textContent = panel.hidden
            ? `Participantes (${registrationsForSession(participantsButton.dataset.sessionId).length})`
            : "Ocultar participantes";
        }
      }
      if (copyButton) {
        const text = copyButton.dataset.link || "";
        if (text) {
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            const area = document.createElement("textarea");
            area.value = text;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            area.remove();
          }
          const previous = copyButton.textContent;
          copyButton.textContent = "Copiado ✓";
          showPortalToast("✓ Enlace copiado al portapapeles.");
          setTimeout(() => { copyButton.textContent = previous; }, 1400);
        }
      }
      if (changeButton && !changeButton.disabled) openChangeSessionDialog(changeButton.dataset.registrationId);
      if (cancelButton && !cancelButton.disabled) openCancelDialog(cancelButton.dataset.registrationId);
    });
    elements.registrationsList.addEventListener("click", (event) => {
      const changeButton = event.target.closest(".js-change-session");
      const cancelButton = event.target.closest(".js-cancel-registration");
      if (changeButton && !changeButton.disabled) openChangeSessionDialog(changeButton.dataset.registrationId);
      if (cancelButton && !cancelButton.disabled) openCancelDialog(cancelButton.dataset.registrationId);
    });
    elements.documentsList.addEventListener("click", (event) => {
      const uploadButton = event.target.closest(".js-upload-document");
      const generateButton = event.target.closest(".js-generate-annex");
      const downloadButton = event.target.closest(".js-download-generated");
      const prepareSignedButton = event.target.closest(".js-prepare-annex-document-download");
      const signedDownloadButton = event.target.closest(".js-download-annex-document");
      if (uploadButton && !uploadButton.disabled) openDocumentUploadDialog(uploadButton.dataset.sessionId);
      if (generateButton && !generateButton.disabled) openAnnexGenerationDialog(generateButton.dataset.sessionId);
      if (downloadButton && !downloadButton.disabled) void downloadGeneratedAnnex(downloadButton.dataset.requestId);
      if (prepareSignedButton && !prepareSignedButton.disabled) void prepareAnnexDocumentDownload(prepareSignedButton.dataset.documentId, prepareSignedButton.dataset.sessionId, prepareSignedButton.dataset.variant);
      if (signedDownloadButton && !signedDownloadButton.disabled) void downloadAnnexDocument(signedDownloadButton.dataset.requestId);
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
    elements.changeSessionForm.addEventListener("submit", handleChangeSession);
    elements.closeChangeSessionDialog.addEventListener("click", closeChangeSessionDialog);
    elements.cancelChangeSession.addEventListener("click", closeChangeSessionDialog);
    elements.closeCancelDialog.addEventListener("click", closeCancelDialog);
    elements.keepRegistrationButton.addEventListener("click", closeCancelDialog);
    elements.confirmCancelButton.addEventListener("click", confirmCancellation);
    elements.documentUploadForm.addEventListener("submit", handleDocumentUpload);
    elements.closeDocumentUploadDialog.addEventListener("click", closeDocumentUploadDialog);
    elements.cancelDocumentUpload.addEventListener("click", closeDocumentUploadDialog);
    elements.annexGenerationForm.addEventListener("submit", handleAnnexGeneration);
    elements.closeAnnexGenerationDialog.addEventListener("click", closeAnnexGenerationDialog);
    elements.cancelAnnexGeneration.addEventListener("click", closeAnnexGenerationDialog);
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
