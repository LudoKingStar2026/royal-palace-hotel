/* =========================================================
   ROYAL PALACE HOTEL
   ERROR MONITOR / HEALTH CENTER
   VERSION: 3.0
   ========================================================= */

(function () {
    "use strict";

    const VERSION = "3.0";

    let started = false;
    let panel = null;
    let button = null;

    /* =====================================================
       START ERROR MONITOR
       ===================================================== */

    function startErrorMonitor() {

        if (started) {
            return;
        }

        started = true;

        if (document.readyState === "loading") {
            document.addEventListener(
                "DOMContentLoaded",
                initialize,
                { once: true }
            );
        } else {
            initialize();
        }
    }

    /* =====================================================
       INITIALIZE
       ===================================================== */

    function initialize() {

        if (document.getElementById("royalErrorCenterButton")) {
            button = document.getElementById("royalErrorCenterButton");
            panel = document.getElementById("royalHealthPanel");
            renderPanel();
            return;
        }

        createStyles();
        createButton();
        createPanel();
        renderPanel();

        window.addEventListener(
            "royalAppHealthChanged",
            renderPanel
        );

        window.addEventListener(
            "royalAppReady",
            renderPanel
        );

        window.addEventListener(
            "royalSupabaseStatus",
            renderPanel
        );

        window.addEventListener(
            "royalAppError",
            renderPanel
        );
    }

    /* =====================================================
       STYLES
       ===================================================== */

    function createStyles() {

        if (document.getElementById("royalErrorMonitorStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "royalErrorMonitorStyles";

        style.textContent = `
            #royalErrorCenterButton{
                position:fixed;
                right:18px;
                bottom:18px;
                z-index:999999;
                border:0;
                border-radius:50px;
                padding:13px 18px;
                background:#6d28d9;
                color:#fff;
                font-size:14px;
                font-weight:700;
                box-shadow:0 8px 25px rgba(0,0,0,.25);
                cursor:pointer;
                font-family:Arial,sans-serif;
            }

            #royalErrorCenterButton:hover{
                opacity:.92;
            }

            #royalHealthPanel{
                position:fixed;
                right:18px;
                bottom:75px;
                width:350px;
                max-width:calc(100vw - 36px);
                max-height:75vh;
                overflow:auto;
                z-index:999998;
                display:none;
                background:#fff;
                color:#111827;
                border-radius:18px;
                box-shadow:0 15px 50px rgba(0,0,0,.30);
                border:1px solid #e5e7eb;
                font-family:Arial,sans-serif;
            }

            #royalHealthPanel.royal-health-open{
                display:block;
            }

            .royal-health-header{
                padding:17px 18px;
                background:#111827;
                color:#fff;
                border-radius:18px 18px 0 0;
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
            }

            .royal-health-title{
                font-size:16px;
                font-weight:800;
            }

            .royal-health-version{
                font-size:11px;
                opacity:.7;
                margin-top:3px;
            }

            .royal-health-close{
                width:32px;
                height:32px;
                border:0;
                border-radius:50%;
                background:rgba(255,255,255,.12);
                color:#fff;
                font-size:18px;
                cursor:pointer;
            }

            .royal-health-body{
                padding:16px;
            }

            .royal-health-status{
                padding:13px;
                border-radius:12px;
                margin-bottom:12px;
                font-weight:700;
            }

            .royal-health-good{
                background:#ecfdf5;
                color:#047857;
                border:1px solid #a7f3d0;
            }

            .royal-health-warn{
                background:#fffbeb;
                color:#b45309;
                border:1px solid #fde68a;
            }

            .royal-health-bad{
                background:#fef2f2;
                color:#b91c1c;
                border:1px solid #fecaca;
            }

            .royal-health-section{
                margin-top:14px;
            }

            .royal-health-section-title{
                font-size:12px;
                font-weight:800;
                text-transform:uppercase;
                letter-spacing:.5px;
                color:#6b7280;
                margin-bottom:8px;
            }

            .royal-health-row{
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                padding:9px 10px;
                border:1px solid #e5e7eb;
                border-radius:10px;
                margin-bottom:6px;
                font-size:13px;
            }

            .royal-health-module-name{
                font-weight:600;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
            }

            .royal-health-ok{
                color:#059669;
                font-weight:800;
            }

            .royal-health-fail{
                color:#dc2626;
                font-weight:800;
            }

            .royal-health-neutral{
                color:#6b7280;
                font-weight:700;
            }

            .royal-health-buttons{
                display:grid;
                grid-template-columns:1fr 1fr 1fr;
                gap:7px;
                margin-top:14px;
            }

            .royal-health-action{
                border:0;
                border-radius:9px;
                padding:10px 7px;
                font-size:12px;
                font-weight:700;
                cursor:pointer;
            }

            .royal-health-retry{
                background:#6d28d9;
                color:#fff;
            }

            .royal-health-copy{
                background:#eef2ff;
                color:#3730a3;
            }

            .royal-health-clear{
                background:#fee2e2;
                color:#b91c1c;
            }

            .royal-health-errors{
                font-size:11px;
                line-height:1.5;
                background:#111827;
                color:#d1d5db;
                border-radius:10px;
                padding:10px;
                max-height:180px;
                overflow:auto;
                white-space:pre-wrap;
                word-break:break-word;
            }

            @media(max-width:600px){

                #royalErrorCenterButton{
                    right:12px;
                    bottom:12px;
                    padding:12px 15px;
                    font-size:13px;
                }

                #royalHealthPanel{
                    right:10px;
                    bottom:65px;
                    width:calc(100vw - 20px);
                    max-width:none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       CREATE BUTTON
       ===================================================== */

    function createButton() {

        button = document.createElement("button");

        button.id = "royalErrorCenterButton";
        button.type = "button";
        button.innerText = "🛠️ Error Center";

        button.onclick = function () {

            if (!panel) {
                return;
            }

            panel.classList.toggle("royal-health-open");

            renderPanel();
        };

        document.body.appendChild(button);
    }

    /* =====================================================
       CREATE PANEL
       ===================================================== */

    function createPanel() {

        panel = document.createElement("div");

        panel.id = "royalHealthPanel";

        panel.innerHTML = `
            <div class="royal-health-header">

                <div>
                    <div class="royal-health-title">
                        🛠️ Royal Palace Health
                    </div>

                    <div class="royal-health-version">
                        Error Monitor v${VERSION}
                    </div>
                </div>

                <button
                    type="button"
                    class="royal-health-close"
                    id="royalHealthClose"
                >
                    ×
                </button>

            </div>

            <div class="royal-health-body">

                <div id="royalHealthOverall">
                    Checking application...
                </div>

                <div class="royal-health-section">

                    <div class="royal-health-section-title">
                        Application Modules
                    </div>

                    <div id="royalHealthModules">
                        Checking modules...
                    </div>

                </div>

                <div class="royal-health-section">

                    <div class="royal-health-section-title">
                        Error Log
                    </div>

                    <div id="royalHealthErrors">
                        No errors found.
                    </div>

                </div>

                <div class="royal-health-buttons">

                    <button
                        type="button"
                        class="royal-health-action royal-health-retry"
                        id="royalHealthRetry"
                    >
                        🔄 Retry
                    </button>

                    <button
                        type="button"
                        class="royal-health-action royal-health-copy"
                        id="royalHealthCopy"
                    >
                        📋 Copy
                    </button>

                    <button
                        type="button"
                        class="royal-health-action royal-health-clear"
                        id="royalHealthClear"
                    >
                        🗑️ Clear
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(panel);

        document
            .getElementById("royalHealthClose")
            .onclick = function () {
                panel.classList.remove(
                    "royal-health-open"
                );
            };

        document
            .getElementById("royalHealthRetry")
            .onclick = retryHealth;

        document
            .getElementById("royalHealthCopy")
            .onclick = copyHealth;

        document
            .getElementById("royalHealthClear")
            .onclick = clearErrors;
    }

    /* =====================================================
       GET HEALTH
       ===================================================== */

    function getHealth() {

        try {

            if (
                window.ROYAL_APP &&
                window.ROYAL_APP.health
            ) {
                return window.ROYAL_APP.health;
            }

        } catch (error) {}

        return null;
    }

    /* =====================================================
       RENDER PANEL
       ===================================================== */

    function renderPanel() {

        if (!panel) {
            return;
        }

        const overall =
            document.getElementById(
                "royalHealthOverall"
            );

        const modules =
            document.getElementById(
                "royalHealthModules"
            );

        const errors =
            document.getElementById(
                "royalHealthErrors"
            );

        const health = getHealth();

        /* ---------------------------------------------
           OVERALL STATUS
        --------------------------------------------- */

        let overallClass =
            "royal-health-warn";

        let overallText =
            "🟡 Application is starting...";

        if (health) {

            if (
                health.overall === "healthy" ||
                health.status === "healthy"
            ) {

                overallClass =
                    "royal-health-good";

                overallText =
                    "🟢 Application is healthy";

            } else if (
                health.overall === "error" ||
                health.status === "error"
            ) {

                overallClass =
                    "royal-health-bad";

                overallText =
                    "🔴 Application has errors";

            } else {

                overallClass =
                    "royal-health-warn";

                overallText =
                    "🟡 Application needs attention";
            }

        } else if (
            window.ROYAL_APP &&
            window.ROYAL_APP.ready
        ) {

            overallClass =
                "royal-health-good";

            overallText =
                "🟢 Application loaded";

        }

        overall.className =
            "royal-health-status " +
            overallClass;

        overall.innerText =
            overallText;

        /* ---------------------------------------------
           MODULES
        --------------------------------------------- */

        let html = "";

        let loader =
            window.ROYAL_APP &&
            window.ROYAL_APP.loader;

        if (
            loader &&
            Array.isArray(loader.modules)
        ) {

            loader.modules.forEach(function (module) {

                const loaded =
                    Array.isArray(loader.loaded) &&
                    loader.loaded.some(function (item) {

                        return (
                            item === module.file ||
                            item === module.name
                        );

                    });

                const failed =
                    Array.isArray(loader.failed) &&
                    loader.failed.some(function (item) {

                        return (
                            item === module.file ||
                            item === module.name
                        );

                    });

                let status =
                    "⏳ Waiting";

                let statusClass =
                    "royal-health-neutral";

                if (loaded) {

                    status =
                        "✅ Loaded";

                    statusClass =
                        "royal-health-ok";

                } else if (failed) {

                    status =
                        "❌ Failed";

                    statusClass =
                        "royal-health-fail";
                }

                html += `
                    <div class="royal-health-row">

                        <span class="royal-health-module-name">
                            ${escapeHtml(module.name)}
                        </span>

                        <span class="${statusClass}">
                            ${status}
                        </span>

                    </div>
                `;
            });

        } else {

            html = `
                <div class="royal-health-row">
                    <span>
                        Error Monitor
                    </span>

                    <span class="royal-health-ok">
                        ✅ Active
                    </span>
                </div>
            `;
        }

        modules.innerHTML = html;

        /* ---------------------------------------------
           ERRORS
        --------------------------------------------- */

        let appErrors = [];

        try {

            if (
                typeof window.getAppErrors ===
                "function"
            ) {
                appErrors =
                    window.getAppErrors() || [];
            }

        } catch (error) {

            appErrors = [];
        }

        if (
            Array.isArray(appErrors) &&
            appErrors.length > 0
        ) {

            const latest =
                appErrors.slice(-20).reverse();

            errors.innerText =
                latest
                    .map(function (item) {

                        if (
                            typeof item ===
                            "string"
                        ) {
                            return item;
                        }

                        return (
                            "[" +
                            (
                                item.time ||
                                item.timestamp ||
                                "Unknown time"
                            ) +
                            "] " +
                            (
                                item.message ||
                                item.error ||
                                JSON.stringify(item)
                            )
                        );

                    })
                    .join("\n\n");

        } else {

            errors.innerText =
                "No application errors recorded.";
        }
    }

    /* =====================================================
       RETRY
       ===================================================== */

    async function retryHealth() {

        const retryButton =
            document.getElementById(
                "royalHealthRetry"
            );

        if (retryButton) {

            retryButton.disabled = true;

            retryButton.innerText =
                "⏳ Checking...";
        }

        try {

            if (
                typeof window.testSupabase ===
                "function"
            ) {

                await window.testSupabase();
            }

            if (
                typeof window.loadBookings ===
                "function"
            ) {

                await window.loadBookings();
            }

            if (
                typeof window.updateDashboard ===
                "function"
            ) {

                window.updateDashboard();
            }

            if (
                typeof window.renderSettings ===
                "function"
            ) {

                window.renderSettings();
            }

            if (
                typeof window.updateRoomsPage ===
                "function"
            ) {

                window.updateRoomsPage();
            }

        } catch (error) {

            if (
                typeof window.reportAppError ===
                "function"
            ) {

                window.reportAppError(
                    "HEALTH_RETRY_ERROR",
                    error.message ||
                    "Retry failed.",
                    "error-monitor.js"
                );
            }
        }

        if (retryButton) {

            retryButton.disabled
