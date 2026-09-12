/* =========================================================
   ROYAL PALACE HOTEL
   CENTRAL ERROR MONITOR
   VERSION: 2.0
   ========================================================= */

(function () {
    "use strict";

    const VERSION = "2.0";

    let panel = null;
    let button = null;

    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getHealth() {
        if (typeof window.getAppHealth === "function") {
            return window.getAppHealth();
        }

        return {
            status: "unknown",
            supabase: false,
            loadedModules: [],
            failedModules: [],
            errors: []
        };
    }

    function statusColor(status) {
        if (status === "healthy") return "#16a34a";
        if (status === "error") return "#dc2626";
        if (status === "warning") return "#d97706";
        return "#64748b";
    }

    function statusText(status) {
        if (status === "healthy") return "HEALTHY";
        if (status === "error") return "ERROR";
        if (status === "warning") return "WARNING";
        return "UNKNOWN";
    }

    function moduleLoaded(name, health) {
        return (health.loadedModules || [])
            .includes(name);
    }

    /* =====================================================
       CREATE BUTTON
    ===================================================== */

    function createButton() {

        if (document.getElementById(
            "royalSystemHealthButton"
        )) {
            button =
                document.getElementById(
                    "royalSystemHealthButton"
                );
            return;
        }

        button =
            document.createElement("button");

        button.id =
            "royalSystemHealthButton";

        button.innerHTML = "🛠️";

        button.title =
            "Royal Palace System Health";

        button.style.cssText = `
            position:fixed;
            right:18px;
            bottom:18px;
            width:52px;
            height:52px;
            border:0;
            border-radius:50%;
            background:#5b21b6;
            color:#fff;
            font-size:23px;
            cursor:pointer;
            z-index:99998;
            box-shadow:0 8px 25px rgba(0,0,0,.20);
            display:flex;
            align-items:center;
            justify-content:center;
        `;

        button.addEventListener(
            "click",
            function () {

                if (!panel) {
                    createPanel();
                }

                togglePanel();
            }
        );

        document.body.appendChild(button);
    }

    /* =====================================================
       CREATE PANEL
    ===================================================== */

    function createPanel() {

        if (
            document.getElementById(
                "royalSystemHealthPanel"
            )
        ) {

            panel =
                document.getElementById(
                    "royalSystemHealthPanel"
                );

            return;
        }

        panel =
            document.createElement("div");

        panel.id =
            "royalSystemHealthPanel";

        panel.style.cssText = `
            position:fixed;
            right:18px;
            bottom:82px;
            width:min(430px,calc(100vw - 36px));
            max-height:calc(100vh - 110px);
            overflow:auto;
            background:#ffffff;
            border:1px solid #e5e7eb;
            border-radius:20px;
            box-shadow:0 20px 60px rgba(15,23,42,.25);
            z-index:99999;
            display:none;
            color:#111827;
            font-family:Arial,sans-serif;
        `;

        document.body.appendChild(panel);

        renderPanel();
    }

    /* =====================================================
       TOGGLE
    ===================================================== */

    function togglePanel() {

        if (!panel) return;

        if (
            panel.style.display === "none" ||
            !panel.style.display
        ) {

            panel.style.display = "block";
            renderPanel();

        } else {

            panel.style.display = "none";

        }
    }

    /* =====================================================
       RENDER PANEL
    ===================================================== */

    function renderPanel() {

        if (!panel) return;

        const health =
            getHealth();

        const color =
            statusColor(
                health.status
            );

        const text =
            statusText(
                health.status
            );

        const modules = [
            "App Core",
            "Error Monitor",
            "Mobile Menu",
            "Dashboard",
            "Rooms",
            "Bookings",
            "Settings"
        ];

        let moduleHTML = "";

        modules.forEach(function (name) {

            const loaded =
                moduleLoaded(
                    name,
                    health
                );

            moduleHTML += `
                <div style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    padding:10px 0;
                    border-bottom:1px solid #f1f5f9;
                ">
                    <span style="
                        font-size:14px;
                        color:#334155;
                    ">
                        ${escapeHTML(name)}
                    </span>

                    <span style="
                        font-size:12px;
                        font-weight:700;
                        color:${loaded ? "#16a34a" : "#dc2626"};
                    ">
                        ${loaded ? "● LOADED" : "● NOT LOADED"}
                    </span>
                </div>
            `;
        });

        let errorHTML = "";

        const errors =
            health.errors || [];

        if (!errors.length) {

            errorHTML = `
                <div style="
                    padding:14px;
                    border-radius:12px;
                    background:#f0fdf4;
                    color:#166534;
                    font-size:13px;
                ">
                    ✅ No errors recorded.
                </div>
            `;

        } else {

            errors
                .slice()
                .reverse()
                .slice(0, 20)
                .forEach(function (error) {

                    errorHTML += `
                        <div style="
                            padding:12px;
                            margin-bottom:8px;
                            border-radius:12px;
                            background:#fff1f2;
                            border:1px solid #fecdd3;
                        ">

                            <strong style="
                                display:block;
                                color:#991b1b;
                                font-size:13px;
                            ">
                                ${escapeHTML(error.type)}
                            </strong>

                            <div style="
                                margin-top:4px;
                                color:#7f1d1d;
                                font-size:12px;
                                line-height:1.5;
                            ">
                                ${escapeHTML(error.message)}
                            </div>

                            <div style="
                                margin-top:5px;
                                color:#9f1239;
                                font-size:11px;
                            ">
                                Source:
                                ${escapeHTML(error.source)}
                            </div>

                        </div>
                    `;
                });
        }

        panel.innerHTML = `

            <div style="
                padding:18px;
                border-bottom:1px solid #e5e7eb;
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <div>

                    <div style="
                        font-size:17px;
                        font-weight:800;
                        color:#111827;
                    ">
                        🛠️ System Health
                    </div>

                    <div style="
                        margin-top:4px;
                        font-size:11px;
                        color:#64748b;
                    ">
                        Royal Palace Hotel • v${VERSION}
                    </div>

                </div>

                <button
                    id="royalHealthClose"
                    style="
                        border:0;
                        background:#f1f5f9;
                        width:34px;
                        height:34px;
                        border-radius:10px;
                        font-size:20px;
                        cursor:pointer;
                    "
                >
                    ×
                </button>

            </div>


            <div style="padding:18px;">

                <!-- OVERALL STATUS -->

                <div style="
                    padding:15px;
                    border-radius:15px;
                    background:#f8fafc;
                    border:1px solid #e2e8f0;
                    margin-bottom:15px;
                ">

                    <div style="
                        font-size:11px;
                        color:#64748b;
                        text-transform:uppercase;
                        font-weight:700;
                    ">
                        Overall Status
                    </div>

                    <div style="
                        margin-top:5px;
                        font-size:20px;
                        font-weight:800;
                        color:${color};
                    ">
                        ● ${text}
                    </div>

                </div>


                <!-- SUPABASE -->

                <div style="
                    padding:15px;
                    border-radius:15px;
                    background:#f8fafc;
                    border:1px solid #e2e8f0;
                    margin-bottom:15px;
                ">

                    <div style="
                        font-size:11px;
                        color:#64748b;
                        text-transform:uppercase;
                        font-weight:700;
                    ">
                        Supabase
                    </div>

                    <div style="
                        margin-top:6px;
                        font-weight:800;
                        color:${health.supabase
                            ? "#16a34a"
                            : "#dc2626"};
                    ">
                        ${health.supabase
                            ? "🟢 Connected"
                            : "🔴 Not Connected"}
                    </div>

                </div>


                <!-- MODULES -->

                <div style="
                    padding:15px;
                    border-radius:15px;
                    background:#f8fafc;
                    border:1px solid #e2e8f0;
                    margin-bottom:15px;
                ">

                    <div style="
                        font-size:11px;
                        color:#64748b;
                        text-transform:uppercase;
                        font-weight:700;
                        margin-bottom:5px;
                    ">
                        Modules
                    </div>

                    ${moduleHTML}

                </div>


                <!-- ERRORS -->

                <div style="
                    padding:15px;
                    border-radius:15px;
                    background:#f8fafc;
                    border:1px solid #e2e8f0;
                ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:10px;
                    ">

                        <div style="
                            font-size:11px;
                            color:#64748b;
                            text-transform:uppercase;
                            font-weight:700;
                        ">
                            Error Log
                        </div>

                        <div style="
                            font-size:11px;
                            color:#64748b;
                        ">
                            ${errors.length} error(s)
                        </div>

                    </div>

                    ${errorHTML}

                </div>


                <!-- ACTIONS -->

                <div style="
                    display:grid;
                    grid-template-columns:
                        repeat(3,1fr);
                    gap:8px;
                    margin-top:15px;
                ">

                    <button
                        id="royalHealthRetry"
                        style="
                            border:0;
                            border-radius:11px;
                            padding:11px 5px;
                            background:#5b21b6;
                            color:white;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        🔄 Retry
                    </button>

                    <button
                        id="royalHealthCopy"
                        style="
                            border:0;
                            border-radius:11px;
                            padding:11px 5px;
                            background:#e2e8f0;
                            color:#334155;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        📋 Copy
                    </button>

                    <button
                        id="royalHealthClear"
                        style="
                            border:0;
                            border-radius:11px;
                            padding:11px 5px;
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


        /* =================================================
           CLOSE
        ================================================= */

        const closeButton =
            document.getElementById(
                "royalHealthClose"
            );

        if (closeButton) {

            closeButton.onclick =
                function () {

                    panel.style.display =
                        "none";

                };
        }


        /* =================================================
           RETRY
        ================================================= */

        const retryButton =
            document.getElementById(
                "royalHealthRetry"
            );

        if (retryButton) {

            retryButton.onclick =
                async function () {

                    retryButton.disabled =
                        true;

                    retryButton.innerText =
                        "⏳ Checking...";


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


                    retryButton.disabled =
                        false;

                    retryButton.innerText =
                        "🔄 Retry";

                    renderPanel();
                };
        }


        /* =================================================
           COPY
        ================================================= */

        const copyButton =
            document.getElementById(
                "royalHealthCopy"
            );

        if (copyButton) {

            copyButton.onclick =
                async function () {

                    const currentHealth =
                        getHealth();

                    const text =
                        JSON.stringify(
                            currentHealth,
                            null,
                            2
                        );

                    try {

                        await navigator.clipboard
                            .writeText(text);

                        copyButton.innerText =
                            "✅ Copied!";

                        setTimeout(
                            function () {

                                if (copyButton) {
                                    copyButton.innerText =
                                        "📋 Copy";
                                }

                            },
                            1500
                        );

                    } catch (error) {

                        alert(
                            "Copy नहीं हो पाया।"
                        );
                    }
                };
        }


        /* =================================================
           CLEAR
        ================================================= */

        const clearButton =
            document.getElementById(
                "royalHealthClear"
            );

        if (clearButton) {

            clearButton.onclick =
                function () {

                    if (
                        typeof window.clearAppErrors ===
                        "function"
                    ) {

                        window.clearAppErrors();

                    }

                    renderPanel();
                };
        }
    }


    /* =====================================================
       APP ERROR CALLBACK
    ===================================================== */
 
