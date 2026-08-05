(() => {
  "use strict";

  const config = window.INCENTIVOS_CONFIG ?? {};
  const url = String(config.SUPABASE_URL ?? "").trim();
  const publishableKey = String(config.SUPABASE_PUBLISHABLE_KEY ?? "").trim();

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
    municipalityName: document.querySelector("#municipalityName"),
    userSummary: document.querySelector("#userSummary"),
    sessionCount: document.querySelector("#sessionCount"),
    initialCount: document.querySelector("#initialCount"),
    finalCount: document.querySelector("#finalCount"),
    sessionsLoading: document.querySelector("#sessionsLoading"),
    sessionsEmpty: document.querySelector("#sessionsEmpty"),
    sessionsGrid: document.querySelector("#sessionsGrid")
  };

  let client = null;
  let currentUser = null;

  function showNotice(type, message) {
    elements.notice.className = `notice ${type}`;
    elements.notice.textContent = message;
    elements.notice.hidden = false;
    elements.notice.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearNotice() {
    elements.notice.hidden = true;
    elements.notice.textContent = "";
    elements.notice.className = "notice";
  }

  function configurationIsValid() {
    return (
      url.startsWith("https://") &&
      !url.includes("PEGA_AQUI") &&
      publishableKey.length >= 20 &&
      !publishableKey.includes("PEGA_AQUI")
    );
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

  function formatDate(value) {
    if (!value) return "—";
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
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

  function sessionCard(session) {
    const isInitial = session.session_type === "initial";
    const phaseLabel = isInitial ? "Sesión inicial" : "Sesión final";
    const availability = session.registration_open ? "Inscripción abierta" : "Inscripción cerrada";
    const available = Number(session.regular_available ?? 0);

    return `
      <article class="session-card">
        <span class="badge ${isInitial ? "initial" : "final"}">${phaseLabel}</span>
        <h3>${escapeHtml(session.title)}</h3>

        <dl class="session-meta">
          <div>
            <dt>Fecha</dt>
            <dd>${escapeHtml(formatDate(session.session_date))}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd>${escapeHtml(formatTime(session.start_time))}–${escapeHtml(formatTime(session.end_time))}</dd>
          </div>
          <div>
            <dt>Personal formador</dt>
            <dd>${escapeHtml(session.trainer || "Pendiente")}</dd>
          </div>
          <div>
            <dt>Plazas ordinarias libres</dt>
            <dd>${available}</dd>
          </div>
        </dl>

        <div class="session-footer">
          <span class="badge ${session.registration_open ? "open" : "closed"}">
            ${availability}
          </span>
          <button class="button secondary small" type="button" disabled>
            Inscripción próximamente
          </button>
        </div>
      </article>
    `;
  }

  async function loadProfile() {
    const { data, error } = await client
      .from("profiles")
      .select(`
        user_id,
        full_name,
        email,
        role,
        active,
        municipality:municipalities (
          id,
          code,
          name
        )
      `)
      .eq("user_id", currentUser.id)
      .single();

    if (error) {
      throw new Error(`No se pudo consultar el perfil: ${error.message}`);
    }

    if (!data.active) {
      await client.auth.signOut();
      throw new Error("El usuario existe, pero su acceso municipal está desactivado.");
    }

    if (!data.municipality) {
      await client.auth.signOut();
      throw new Error("El usuario no está asociado a ningún ayuntamiento.");
    }

    elements.municipalityName.textContent = data.municipality.name;
    elements.userSummary.textContent =
      `${data.full_name || data.email || "Usuario municipal"} · ${data.role}`;
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
        .select(`
          id,
          session_type,
          title,
          session_date,
          start_time,
          end_time,
          trainer,
          capacity_regular,
          regular_available,
          maximum_available,
          registration_open,
          published,
          status
        `)
        .eq("published", true)
        .eq("status", "scheduled")
        .gte("session_date", today)
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const sessions = Array.isArray(data) ? data : [];
      const initial = sessions.filter((item) => item.session_type === "initial").length;
      const final = sessions.filter((item) => item.session_type === "final").length;

      elements.sessionCount.textContent = String(sessions.length);
      elements.initialCount.textContent = String(initial);
      elements.finalCount.textContent = String(final);

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

  async function enterPortal(user) {
    clearNotice();
    currentUser = user;
    setPortalVisible(true);

    try {
      await loadProfile();
      await loadSessions();
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
    if (user) {
      await enterPortal(user);
    } else {
      setPortalVisible(false);
    }
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
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error("No se ha podido iniciar sesión. Revisa las credenciales.");
      }

      if (!data.user) {
        throw new Error("Supabase no devolvió un usuario autenticado.");
      }

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
      elements.password.value = "";
      setPortalVisible(false);
      showNotice("success", "La sesión se ha cerrado correctamente.");
    } catch (error) {
      showNotice("error", `No se pudo cerrar la sesión: ${error.message}`);
    } finally {
      elements.logoutButton.disabled = false;
    }
  }

  async function initialize() {
    if (!configurationIsValid()) {
      setPortalVisible(false);
      showNotice(
        "warning",
        "Falta completar config.js con la URL del proyecto y la publishable key de Supabase."
      );
      elements.loginButton.disabled = true;
      return;
    }

    if (!window.supabase?.createClient) {
      showNotice("error", "No se pudo cargar la biblioteca de Supabase.");
      elements.loginButton.disabled = true;
      return;
    }

    client = window.supabase.createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    elements.loginForm.addEventListener("submit", handleLogin);
    elements.logoutButton.addEventListener("click", handleLogout);
    elements.refreshButton.addEventListener("click", async () => {
      clearNotice();
      try {
        await loadSessions();
        showNotice("success", "Las sesiones se han actualizado.");
      } catch (error) {
        showNotice("error", `No se pudieron actualizar las sesiones: ${error.message}`);
      }
    });

    client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        currentUser = null;
        setPortalVisible(false);
      }
    });

    await restoreSession();
  }

  initialize().catch((error) => {
    showNotice("error", `Error al iniciar el portal: ${error.message}`);
  });
})();
