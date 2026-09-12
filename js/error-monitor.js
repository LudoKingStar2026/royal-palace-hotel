/* =========================================================
   ROYAL PALACE HOTEL
   ERROR MONITOR + SYSTEM HEALTH CENTER
   VERSION: 1.0
   ========================================================= */

(function () {
    "use strict";

    const VERSION = "1.0";

    window.ROYAL_ERROR_MONITOR = {
        version: VERSION,
        started: false,
        panelOpen: false
    };

    /* =====================================================
       BASIC HELPERS
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getCore() {
        return window.ROYAL_APP &&
               window.ROYAL_APP.core
            ? window.ROYAL_APP.core
            : null;
    }

    function getHealth() {

        if (
            typeof window.getAppHealth ===
            "function"
        ) {
            return window.getAppHealth();
        }

        return {
            version: "Unknown",
            supabase: false,
            modules: {},
            totalModules: 0,
            failedModules: 0,
            errors: []
        };
    }

    /* =====================================================
       CREATE ERROR CENTER
    ===================================================== */

    function createErrorCenter() {

        if (
            document.getElementById(
                "royalErrorCenter"
            )
        ) {
            return;
        }

        const panel =
            document.createElement("div");

        panel.id =
            "royalErrorCenter";

        panel.innerHTML = `

            <div
                id="royalErrorButton"
                title="System Health"
                style="
                    position:fixed;
                    right:18px;
                    bottom:18px;
                    width:54px;
                    height:54px;
                    border-radius:50%;
                    background:#6d28d9;
                    color:#fff;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:23px;
                    cursor:pointer;
                    box-shadow:0 8px 25px rgba(0,0,0,.25);
                    z-index:99999;
                    user-select:none;
                "
            >
                🛠️
            </div>

            <div
                id="royalErrorPanel"
                style="
                    display:none;
                    position:fixed;
                    right:18px;
                    bottom:84px;
                    width:min(440px,calc(100vw - 36px));
                    max-height:75vh;
                    overflow:auto;
                    background:#fff;
                    border-radius:18px;
                    box-shadow:0 20px 60px rgba(0,0,0,.25);
                    border:1px solid #e5e7eb;
                    z-index:99998;
                    font-family:Arial,sans-serif;
                "
            >

                <div style="
                    padding:17px 18px;
                    background:#111827;
                    color:#fff;
                    border-radius:18px 18px 0 0;
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:10px;
                ">

                    <div>
                        <div style="
                            font-size:17px;
                            font-weight:800;
                        ">
                            🛠️ System Health
                        </div>

                        <div style="
                            font-size:11px;
                            opacity:.7;
                            margin-top:3px;
                        ">
                            Royal Palace Control Center
                        </div>
                    </div>

                    <button
                        id="royalErrorClose"
                        type="button"
                        style="
                            width:32px;
                            height:32px;
                            border:0;
                            border-radius:8px;
                            background:rgba(255,255,255,.12);
                            color:#fff;
                            font-size:18px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>

                </div>

                <div
                    id="royalHealthContent"
                    style="
                        padding:16px;
                    "
                >
                    Loading system health...
                </div>

                <div style="
                    padding:12px 16px 16px;
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                ">

                    <button
                        id="royalRetryButton"
                        type="button"
                        style="
                            flex:1;
                            min-width:110px;
                            padding:10px;
                            border:0;
                            border-radius:9px;
                            background:#6d28d9;
                            color:#fff;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        🔄 Retry
                    </button>

                    <button
                        id="royalCopyButton"
                        type="button"
                        style="
                            flex:1;
                            min-width:110px;
                            padding:10px;
                            border:0;
                            border-radius:9px;
                            background:#f3f4f6;
                            color:#111827;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        📋 Copy
                    </button>

                    <button
                        id="royalClearButton"
                        type="button"
                        style="
                            flex:1;
                            min-width:110px;
                            padding:10px;
                            border:0;
                            border-radius:9px;
                            background:#fee2e2;
                            color:#991b1b;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        🧹 Clear
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(panel);

        /* =================================================
           EVENTS
        ================================================= */

        document
            .getElementById(
                "royalErrorButton"
            )
            .addEventListener(
                "click",
                function () {

                    togglePanel();
                }
            );

        document
            .getElementById(
                "royalErrorClose"
            )
            .addEventListener(
                "click",
                function () {

                    closePanel();
                }
            );

        document
            .getElementById(
                "royalRetryButton"
            )
            .addEventListener(
                "click",
                function () {

                    retrySystem();
                }
            );

        document
            .getElementById(
                "royalCopyButton"
            )
            .addEventListener(
                "click",
                function () {

                    copyErrors();
                }
            );

        document
            .getElementById(
                "royalClearButton"
            )
            .addEventListener(
                "click",
                function () {

                    clearErrors();
                }
            );

        updateHealthUI();
    }

    /* =====================================================
       OPEN / CLOSE
    ===================================================== */

    function togglePanel() {

        const panel =
            document.getElementById(
                "royalErrorPanel"
            );

        if (!panel) return;

        const visible =
            panel.style.display === "block";

        panel.style.display =
            visible ? "none" : "block";

        window.ROYAL_ERROR_MONITOR.panelOpen =
            !visible;

        updateHealthUI();
    }

    function closePanel() {

        const panel =
            document.getElementById(
                "royalErrorPanel"
            );

        if (panel) {
            panel.style.display =
                "none";
        }

        window.ROYAL_ERROR_MONITOR.panelOpen =
            false;
    }

    /* =====================================================
       STATUS COLOR
    ===================================================== */

    function statusColor(status) {

        if (
            status === "ready" ||
            status === "connected" ||
            status === "ok"
        ) {
            return "#16a34a";
        }

        if (
            status === "checking"
        ) {
            return "#d97706";
        }

        if (
            status === "error" ||
            status === "failed"
        ) {
            return "#dc2626";
        }

        return "#6b7280";
    }

    /* =====================================================
       HEALTH UI
    ===================================================== */

    function updateHealthUI() {

        const content =
            document.getElementById(
                "royalHealthContent"
            );

        if (!content) return;

        const health =
            getHealth();

        const errors =
            health.errors || [];

        const modules =
            health.modules || {};

        const moduleNames =
            Object.keys(modules);

        const hasErrors =
            errors.length > 0 ||
            health.failedModules > 0;

        const overall =
            hasErrors
                ? "ERRORS FOUND"
                : "SYSTEM HEALTHY";

        const overallIcon =
            hasErrors
                ? "🔴"
                : "🟢";

        let html = `

            <div style="
                padding:14px;
                border-radius:12px;
                background:${
                    hasErrors
                        ? "#fff1f2"
                        : "#f0fdf4"
                };
                border:1px solid ${
                    hasErrors
                        ? "#fecdd3"
                        : "#bbf7d0"
                };
                margin-bottom:14px;
            ">

                <div style="
                    font-size:17px;
                    font-weight:800;
                    color:${
                        hasErrors
                            ? "#991b1b"
                            : "#166534"
                    };
                ">
                    ${overallIcon}
                    ${overall}
                </div>

                <div style="
                    margin-top:6px;
                    font-size:12px;
                    color:#6b7280;
                ">
                    App Version:
                    ${escapeHTML(
                        health.version
                    )}
                </div>

            </div>

            <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-bottom:15px;
            ">

                <div style="
                    padding:11px;
                    border:1px solid #e5e7eb;
                    border-radius:10px;
                ">

                    <div style="
                        font-size:11px;
                        color:#6b7280;
                    ">
                        Supabase
                    </div>

                    <strong style="
                        color:${
                            health.supabase
                                ? "#16a34a"
                                : "#dc2626"
                        };
                    ">
                        ${
                            health.supabase
                                ? "🟢 Connected"
                                : "🔴 Error"
                        }
                    </strong>

                </div>

                <div style="
                    padding:11px;
                    border:1px solid #e5e7eb;
                    border-radius:10px;
                ">

                    <div style="
                        font-size:11px;
                        color:#6b7280;
                    ">
                        Errors
                    </div>

                    <strong style="
                        color:${
                            errors.length
                                ? "#dc2626"
                                : "#16a34a"
                        };
                    ">
                        ${errors.length}
                    </strong>

                </div>

            </div>

            <div style="
                font-size:14px;
                font-weight:800;
                margin-bottom:8px;
            ">
                📦 Modules
            </div>
        `;

        if (!moduleNames.length) {

            html += `
                <div style="
                    padding:12px;
                    border-radius:10px;
                    background:#f9fafb;
                    color:#6b7280;
                    font-size:13px;
                ">
                    Modules अभी register नहीं हुए हैं।
                </div>
            `;

        } else {

            moduleNames.forEach(
                function (name) {

                    const module =
                        modules[name];

                    const color =
                        statusColor(
                            module.status
                        );

                    html += `

                        <div style="
                            padding:10px 11px;
                            margin-bottom:7px;
                            border:1px solid #e5e7eb;
                            border-radius:10px;
                        ">

                            <div style="
                                display:flex;
                                justify-content:space-between;
                                gap:8px;
                            ">

                                <strong style="
                                    font-size:13px;
                                ">
                                    ${escapeHTML(
                                        name
                                    )}
                                </strong>

                                <strong style="
                                    color:${color};
                                    font-size:12px;
                                ">
                                    ${escapeHTML(
                                        module.status
                                    )}
                                </strong>

                            </div>

                            ${
                                module.details
                                    ? `
                                    <div style="
                                        margin-top:5px;
                                        color:#6b7280;
                                        font-size:11px;
                                        word-break:break-word;
                                    ">
                                        ${escapeHTML(
                                            module.details
                                        )}
                                    </div>
                                    `
                                    : ""
                            }

                        </div>
                    `;
                }
            );
        }

        /* =================================================
           ERRORS
        ================================================= */

        html += `

            <div style="
                margin-top:16px;
                font-size:14px;
                font-weight:800;
                margin-bottom:8px;
            ">
                🚨 Error Log
            </div>
        `;

        if (!errors.length) {

            html += `
                <div style="
                    padding:13px;
                    border-radius:10px;
                    background:#f0fdf4;
                    color:#166534;
                    font-size:13px;
                ">
                    🟢 कोई error नहीं है।
                </div>
            `;

        } else {

            errors
                .slice()
                .reverse()
                .forEach(
                    function (error) {

                        html += `

                            <div style="
                                padding:12px;
                                margin-bottom:8px;
                                border-radius:10px;
                                background:#fff1f2;
                                border:1px solid #fecdd3;
                            ">

                                <div style="
                                    font-weight:800;
                                    color:#991b1b;
                                    font-size:13px;
                                ">
                                    ❌ ${escapeHTML(
                                        error.type
                                    )}
                                </div>

                                <div style="
                                    margin-top:5px;
                                    font-size:12px;
                                    line-height:1.5;
                                    color:#374151;
                                    word-break:break-word;
                                ">
                                    ${escapeHTML(
                                        error.message
                                    )}
                                </div>

                                <div style="
                                    margin-top:6px;
                                    font-size:10px;
                                    color:#6b7280;
                                ">
                                    File:
                                    ${escapeHTML(
                                        error.source
                                    )}
                                    <br>
                                    Time:
                                    ${escapeHTML(
                                        error.time
                                    )}
                                </div>

                            </div>
                        `;
                    }
                );
        }

        content.innerHTML =
            html;
    }

    /* ================
