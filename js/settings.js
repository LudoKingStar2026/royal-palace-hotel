/* =========================================================
   ROYAL PALACE HOTEL
   SETTINGS MANAGEMENT SYSTEM
   VERSION: 8.0
   ========================================================= */

(function () {
    "use strict";

    const SETTINGS_KEY = "royal_palace_settings";
    const VERSION = "8.0";

    const DEFAULT_SETTINGS = {
        adminName: "Admin",
        adminRole: "Administrator",
        hotelName: "Royal Palace Hotel",
        phone: "",
        email: "",
        address: "",
        notifications: true
    };

    let settings = {};

    /* =====================================================
       ERROR REPORTING
    ===================================================== */

    function reportError(type, message, extra) {
        console.error(
            "[ROYAL SETTINGS]",
            type,
            message,
            extra || ""
        );

        try {
            if (
                typeof window.reportAppError ===
                "function"
            ) {
                window.reportAppError(
                    type,
                    message,
                    "js/settings.js",
                    extra || {}
                );
            }
        } catch (error) {
            console.warn(
                "Settings error reporting failed:",
                error
            );
        }
    }

    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       LOAD SETTINGS
    ===================================================== */

    function loadSettings() {
        try {
            const saved =
                localStorage.getItem(
                    SETTINGS_KEY
                );

            if (!saved) {
                settings = {
                    ...DEFAULT_SETTINGS
                };

                saveSettingsToStorage();
                return settings;
            }

            const parsed =
                JSON.parse(saved);

            if (
                parsed &&
                typeof parsed === "object"
            ) {
                settings = {
                    ...DEFAULT_SETTINGS,
                    ...parsed
                };
            } else {
                settings = {
                    ...DEFAULT_SETTINGS
                };

                saveSettingsToStorage();
            }

            return settings;

        } catch (error) {
            reportError(
                "SETTINGS_LOAD_ERROR",
                error?.message ||
                "Settings could not be loaded."
            );

            settings = {
                ...DEFAULT_SETTINGS
            };

            return settings;
        }
    }

    /* =====================================================
       SAVE TO LOCAL STORAGE
    ===================================================== */

    function saveSettingsToStorage() {
        try {
            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

            document.dispatchEvent(
                new CustomEvent(
                    "royalSettingsUpdated"
                )
            );

        } catch (error) {
            reportError(
                "SETTINGS_STORAGE_ERROR",
                error?.message ||
                "Settings could not be saved."
            );
        }
    }

    /* =====================================================
       RENDER SETTINGS
    ===================================================== */

    function renderSettings() {

        loadSettings();

        const container =
            document.getElementById(
                "settingsContainer"
            );

        const content =
            document.getElementById(
                "settingsContent"
            );

        const target =
            content || container;

        if (!target) {
            return;
        }

        target.innerHTML = `
            <div class="settings-grid">

                <!-- ADMIN PROFILE -->
                <div class="settings-card">

                    <div class="settings-card-header">

                        <div class="settings-icon">
                            👤
                        </div>

                        <div>
                            <h3>Admin Profile</h3>

                            <p>
                                Manage administrator information
                            </p>
                        </div>

                    </div>

                    <div class="settings-form">

                        <div class="form-group">

                            <label>
                                Admin Name
                            </label>

                            <input
                                type="text"
                                id="settingAdminName"
                                value="${escapeHTML(
                                    settings.adminName
                                )}"
                                placeholder="Admin Name"
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Admin Role
                            </label>

                            <input
                                type="text"
                                id="settingAdminRole"
                                value="${escapeHTML(
                                    settings.adminRole
                                )}"
                                placeholder="Administrator"
                            >

                        </div>

                    </div>

                </div>


                <!-- HOTEL INFORMATION -->
                <div class="settings-card">

                    <div class="settings-card-header">

                        <div class="settings-icon">
                            🏨
                        </div>

                        <div>
                            <h3>Hotel Information</h3>

                            <p>
                                Manage hotel details
                            </p>
                        </div>

                    </div>

                    <div class="settings-form">

                        <div class="form-group">

                            <label>
                                Hotel Name
                            </label>

                            <input
                                type="text"
                                id="settingHotelName"
                                value="${escapeHTML(
                                    settings.hotelName
                                )}"
                                placeholder="Royal Palace Hotel"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                type="text"
                                id="settingPhone"
                                value="${escapeHTML(
                                    settings.phone
                                )}"
                                placeholder="+91 XXXXX XXXXX"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                id="settingEmail"
                                value="${escapeHTML(
                                    settings.email
                                )}"
                                placeholder="hotel@example.com"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Address
                            </label>

                            <textarea
                                id="settingAddress"
                                rows="3"
                                placeholder="Hotel Address"
                            >${escapeHTML(
                                settings.address
                            )}</textarea>

                        </div>

                    </div>

                </div>


                <!-- NOTIFICATIONS -->
                <div class="settings-card">

                    <div class="settings-card-header">

                        <div class="settings-icon">
                            🔔
                        </div>

                        <div>
                            <h3>Notifications</h3>

                            <p>
                                Control admin notifications
                            </p>
                        </div>

                    </div>


                    <div
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:space-between;
                            gap:15px;
                            padding:15px 0;
                        "
                    >

                        <div>

                            <strong>
                                Booking Notifications
                            </strong>

                            <div
                                style="
                                    font-size:13px;
                                    color:#777;
                                    margin-top:5px;
                                "
                            >
                                Receive notifications for
                                new bookings
                            </div>

                        </div>


                        <label
                            style="
                                position:relative;
                                display:inline-block;
                                width:52px;
                                height:28px;
                                flex-shrink:0;
                            "
                        >

                            <input
                                type="checkbox"
                                id="settingNotifications"
                                ${
                                    settings.notifications
                                    ? "checked"
                                    : ""
                                }
                                style="
                                    opacity:0;
                                    width:0;
                                    height:0;
                                "
                            >

                            <span
                                id="notificationSwitch"
                                style="
                                    position:absolute;
                                    cursor:pointer;
                                    inset:0;
                                    border-radius:30px;
                                    background:${
                                        settings.notifications
                                        ? "#6d28d9"
                                        : "#ccc"
                                    };
                                    transition:.25s;
                                "
                            ></span>

                        </label>

                    </div>

                </div>


                <!-- SECURITY -->
                <div class="settings-card">

                    <div class="settings-card-header">

                        <div class="settings-icon">
                            🔐
                        </div>

                        <div>
                            <h3>Security</h3>

                            <p>
                                Administrator security
                            </p>
                        </div>

                    </div>


                    <div
                        style="
                            padding:10px 0;
                        "
                    >

                        <button
                            type="button"
                            class="secondary-btn"
                            onclick="showPasswordMessage()"
                        >
                            🔑 Change Password
                        </button>

                        <p
                            style="
                                margin:12px 0 0;
                                font-size:13px;
                                color:#777;
                            "
                        >
                            Password management can be
                            connected to your authentication
                            system when enabled.
                        </p>

                    </div>

                </div>


                <!-- ACTIONS -->
                <div
                    class="settings-card"
                    style="
                        grid-column:1/-1;
                    "
                >

                    <div
                        style="
                            display:flex;
                            flex-wrap:wrap;
                            gap:10px;
                            justify-content:flex-end;
                        "
                    >

                        <button
                            type="button"
                            class="secondary-btn"
                            onclick="resetSettings()"
                        >
                            ↩️ Reset
                        </button>

                        <button
                            type="button"
                            class="primary-btn"
                            onclick="saveSettings()"
                        >
                            💾 Save Settings
                        </button>

                    </div>

                </div>

            </div>
        `;

        setupNotificationSwitch();
        updateProfileUI();
    }

    /* =====================================================
       NOTIFICATION SWITCH
    ===================================================== */

    function setupNotificationSwitch() {

        const checkbox =
            document.getElementById(
                "settingNotifications"
            );

        const switchEl =
            document.getElementById(
                "notificationSwitch"
            );

        if (!checkbox || !switchEl) {
            return;
        }

        checkbox.addEventListener(
            "change",
            function () {

                switchEl.style.background =
                    checkbox.checked
                    ? "#6d28d9"
                    : "#ccc";

            }
        );
    }

    /* =====================================================
       SAVE SETTINGS
    ===================================================== */

    function saveSettings() {

        try {

            const adminName =
                document.getElementById(
                    "settingAdminName"
                )?.value.trim() || "";

            const adminRole =
                document.getElementById(
                    "settingAdminRole"
                )?.value.trim() || "";

            const hotelName =
                document.getElementById(
                    "settingHotelName"
                )?.value.trim() || "";

            const phone =
                document.getElementById(
                    "settingPhone"
                )?.value.trim() || "";

            const email =
                document.getElementById(
                    "settingEmail"
                )?.value.trim() || "";

            const address =
                document.getElementById(
                    "settingAddress"
                )?.value.trim() || "";

            const notificationElement =
                document.getElementById(
                    "settingNotifications"
                );

            const notifications =
                Boolean(
                    notificationElement?.checked
                );


            if (!adminName) {

                alert(
                    "Please enter Admin Name."
                );

                return;
            }


            if (!hotelName) {

                alert(
                    "Please enter Hotel Name."
                );

                return;
            }


            settings = {

                adminName:
                    adminName,

                adminRole:
                    adminRole ||
                    "Administrator",

                hotelName:
                    hotelName,

                phone:
                    phone,

                email:
                    email,

                address:
                    address,

                notifications:
                    notifications
            };


            saveSettingsToStorage();

            updateProfileUI();


            if (
                typeof window.updateDashboard ===
                "function"
            ) {
                window.updateDashboard();
            }


            document.dispatchEvent(
                new CustomEvent(
                    "royalSettingsChanged"
                )
            );


            alert(
                "Settings saved successfully. ✅"
            );

        } catch (error) {

            reportError(
                "SETTINGS_SAVE_ERROR",
                error?.message ||
                "Settings could not be saved."
            );

            alert(
                "Settings could not be saved."
            );
        }
    }

    /* =====================================================
       RESET SETTINGS
    ===================================================== */

    function resetSettings() {

        const yes =
            confirm(
                "Reset all settings to default values?"
            );

        if (!yes) {
            return;
        }

        settings = {
            ...DEFAULT_SETTINGS
        };

        saveSettingsToStorage();

        renderSettings();

        if (
            typeof window.updateDashboard ===
            "function"
        ) {
            window.updateDashboard();
        }

        document.dispatchEvent(
            new CustomEvent(
                "royalSettingsChanged"
            )
        );

        alert(
            "Settings reset successfully. ✅"
        );
    }

    /* =====================================================
       UPDATE TOP PROFILE / HOTEL UI
    ===================================================== */

    function updateProfileUI() {

        const name =
            settings.adminName ||
            "Admin";

        const role =
            settings.adminRole ||
            "Administrator";

        const hotel =
            settings.hotelName ||
            "Royal Palace Hotel";


        /* PROFILE AVATAR */

        document
            .querySelectorAll(
                ".profile-avatar"
            )
            .forEach(
                function (element) {

                    element.textContent
                  =
    name
        .charAt(0)
        .toUpperCase();

                }
            );


        /* PROFILE NAME */

        document
            .querySelectorAll(
                ".profile-name"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        name;

                }
            );


        /* PROFILE ROLE */

        document
            .querySelectorAll(
                ".profile-role"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        role;

                }
            );


        /* TOP ADMIN NAME */

        const topAdminName =
            document.getElementById(
                "topAdminName"
            );

        if (topAdminName) {

            topAdminName.textContent =
                name;
        }


        /* TOP ADMIN ROLE */

        const topAdminRole =
            document.getElementById(
                "topAdminRole"
            );

        if (topAdminRole) {

            topAdminRole.textContent =
                role;
        }


        /* WELCOME ADMIN */

        const welcomeAdminName =
            document.getElementById(
                "welcomeAdminName"
            );

        if (welcomeAdminName) {

            welcomeAdminName.textContent =
                name;
        }


        /* WELCOME HOTEL */

        const welcomeHotelName =
            document.getElementById(
                "welcomeHotelName"
            );

        if (welcomeHotelName) {

            welcomeHotelName.textContent =
                hotel;
        }


        /* HOTEL NAME ELEMENTS */

        document
            .querySelectorAll(
                ".hotel-name"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        hotel;

                }
            );


        document
            .querySelectorAll(
                ".profile-hotel"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        hotel;

                }
            );
    }


    /* =====================================================
       PASSWORD MESSAGE
    ===================================================== */

    function showPasswordMessage() {

        alert(
            "Password management will be connected to the authentication system."
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.renderSettings =
        renderSettings;

    window.loadSettings =
        loadSettings;

    window.saveSettings =
        saveSettings;

    window.resetSettings =
        resetSettings;

    window.updateProfileUI =
        updateProfileUI;

    window.setupNotificationSwitch =
        setupNotificationSwitch;

    window.showPasswordMessage =
        showPasswordMessage;


    window.getSettings =
        function () {
            return {
                ...settings
            };
        };


    window.setSettings =
        function (newSettings) {

            if (
                !newSettings ||
                typeof newSettings !==
                "object"
            ) {
                return false;
            }

            settings = {
                ...DEFAULT_SETTINGS,
                ...settings,
                ...newSettings
            };

            saveSettingsToStorage();
            updateProfileUI();

            return true;
        };


    window.ROYAL_SETTINGS =
        window.ROYAL_SETTINGS || {};


    window.ROYAL_SETTINGS.version =
        VERSION;


    window.ROYAL_SETTINGS.get =
        function () {
            return {
                ...settings
            };
        };


    window.ROYAL_SETTINGS.save =
        function () {
            saveSettingsToStorage();
            return true;
        };


    /* =====================================================
       START
    ===================================================== */

    function startSettings() {

        loadSettings();

        updateProfileUI();

        if (
            document.getElementById(
                "settingsContainer"
            ) ||
            document.getElementById(
                "settingsContent"
            )
        ) {
            renderSettings();
        }
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startSettings,
            {
                once: true
            }
        );

    } else {

        startSettings();
    }


    document.addEventListener(
        "royalAppReady",
        function () {

            try {

                if (
                    document.getElementById(
                        "settingsContainer"
                    ) ||
                    document.getElementById(
                        "settingsContent"
                    )
                ) {
                    renderSettings();
                }

            } catch (error) {

                reportError(
                    "SETTINGS_RENDER_ERROR",
                    error?.message ||
                    "Settings render failed."
                );
            }
        }
    );


    document.addEventListener(
        "royalSettingsUpdated",
        function () {

            try {

                loadSettings();
                updateProfileUI();

            } catch (error) {

                reportError(
                    "SETTINGS_UPDATE_ERROR",
                    error?.message ||
                    "Settings update failed."
                );
            }
        }
    );


    console.log(
        "Royal Palace Settings V" +
        VERSION +
        " loaded successfully."
    );


})();
