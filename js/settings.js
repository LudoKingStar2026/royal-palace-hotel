/* =========================================================
   ROYAL PALACE HOTEL
   SETTINGS MODULE
========================================================= */

(function () {

    "use strict";

    const SETTINGS_KEY = "royal_palace_settings";

    const defaultSettings = {
        adminName: "Admin",
        adminRole: "Administrator",
        hotelName: "Royal Palace Hotel",
        phone: "",
        email: "",
        address: "",
        notifications: true
    };


    /* =====================================================
       LOAD SETTINGS
    ===================================================== */

    function loadSettings() {

        try {

            const saved =
                localStorage.getItem(SETTINGS_KEY);

            if (saved) {

                return {
                    ...defaultSettings,
                    ...JSON.parse(saved)
                };

            }

        } catch (error) {

            console.error(
                "Settings load error:",
                error
            );

        }

        return {
            ...defaultSettings
        };

    }


    /* =====================================================
       SAVE SETTINGS
    ===================================================== */

    function saveSettingsData(settings) {

        try {

            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

            return true;

        } catch (error) {

            console.error(
                "Settings save error:",
                error
            );

            return false;

        }

    }


    /* =====================================================
       ESCAPE HTML
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
       RENDER SETTINGS
    ===================================================== */

    function renderSettings() {

        const container =
            document.querySelector(
                "#settingsView .settings-placeholder"
            );

        if (!container) {
            return;
        }


        const settings = loadSettings();


        container.innerHTML = `

            <div class="settings-form">

                <!-- ADMIN PROFILE -->

                <div class="settings-section">

                    <div class="settings-section-header">

                        <div class="settings-section-icon">
                            👤
                        </div>

                        <div>

                            <h3>
                                Admin Profile
                            </h3>

                            <p>
                                Manage administrator information.
                            </p>

                        </div>

                    </div>


                    <div class="settings-grid">

                        <div class="settings-field">

                            <label for="settingsAdminName">
                                Admin Name
                            </label>

                            <input
                                type="text"
                                id="settingsAdminName"
                                value="${escapeHTML(settings.adminName)}"
                                placeholder="Admin"
                            >

                        </div>


                        <div class="settings-field">

                            <label for="settingsAdminRole">
                                Role
                            </label>

                            <input
                                type="text"
                                id="settingsAdminRole"
                                value="${escapeHTML(settings.adminRole)}"
                                placeholder="Administrator"
                            >

                        </div>

                    </div>

                </div>


                <!-- HOTEL INFORMATION -->

                <div class="settings-section">

                    <div class="settings-section-header">

                        <div class="settings-section-icon">
                            🏨
                        </div>

                        <div>

                            <h3>
                                Hotel Information
                            </h3>

                            <p>
                                Manage your hotel contact information.
                            </p>

                        </div>

                    </div>


                    <div class="settings-grid">

                        <div class="settings-field">

                            <label for="settingsHotelName">
                                Hotel Name
                            </label>

                            <input
                                type="text"
                                id="settingsHotelName"
                                value="${escapeHTML(settings.hotelName)}"
                                placeholder="Royal Palace Hotel"
                            >

                        </div>


                        <div class="settings-field">

                            <label for="settingsPhone">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                id="settingsPhone"
                                value="${escapeHTML(settings.phone)}"
                                placeholder="+91 XXXXX XXXXX"
                            >

                        </div>


                        <div class="settings-field">

                            <label for="settingsEmail">
                                Email Address
                            </label>

                            <input
                                type="email"
                                id="settingsEmail"
                                value="${escapeHTML(settings.email)}"
                                placeholder="hotel@example.com"
                            >

                        </div>


                        <div class="settings-field">

                            <label for="settingsAddress">
                                Address
                            </label>

                            <input
                                type="text"
                                id="settingsAddress"
                                value="${escapeHTML(settings.address)}"
                                placeholder="Hotel address"
                            >

                        </div>

                    </div>

                </div>


                <!-- NOTIFICATIONS -->

                <div class="settings-section">

                    <div class="settings-section-header">

                        <div class="settings-section-icon">
                            🔔
                        </div>

                        <div>

                            <h3>
                                Notifications
                            </h3>

                            <p>
                                Control admin notification preferences.
                            </p>

                        </div>

                    </div>


                    <label class="settings-toggle">

                        <input
                            type="checkbox"
                            id="settingsNotifications"
                            ${settings.notifications ? "checked" : ""}
                        >

                        <span class="settings-toggle-slider"></span>

                        <span class="settings-toggle-text">

                            <strong>
                                Booking Notifications
                            </strong>

                            <small>
                                Receive notifications for new bookings.
                            </small>

                        </span>

                    </label>

                </div>


                <!-- SECURITY -->

                <div class="settings-section">

                    <div class="settings-section-header">

                        <div class="settings-section-icon">
                            🔐
                        </div>

                        <div>

                            <h3>
                                Security
                            </h3>

                            <p>
                                Manage admin security settings.
                            </p>

                        </div>

                    </div>


                    <div class="security-info">

                        <div>

                            <strong>
                                Administrator Account
                            </strong>

                            <span>
                                Your admin panel account is active.
                            </span>

                        </div>

                        <button
                            type="button"
                            class="secondary-button"
                            onclick="showPasswordMessage()"
                        >
                            Change Password
                        </button>

                    </div>

                </div>


                <!-- ACTIONS -->

                <div class="settings-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="resetSettings()"
                    >
                        Reset
                    </button>


                    <button
                        type="button"
                        class="primary-button"
                        onclick="saveSettings()"
                    >
                        Save Settings
                    </button>

                </div>

            </div>

        `;

    }


    /* =====================================================
       SAVE SETTINGS
    ===================================================== */

    function saveSettings() {

        const adminName =
            document.getElementById(
                "settingsAdminName"
            );

        const adminRole =
            document.getElementById(
                "settingsAdminRole"
            );

        const hotelName =
            document.getElementById(
                "settingsHotelName"
            );

        const phone =
            document.getElementById(
                "settingsPhone"
            );

        const email =
            document.getElementById(
                "settingsEmail"
            );

        const address =
            document.getElementById(
                "settingsAddress"
            );

        const notifications =
            document.getElementById(
                "settingsNotifications"
            );


        if (!adminName ||
            !adminRole ||
            !hotelName) {

            return;

        }


        const settings = {

            adminName:
                adminName.value.trim(),

            adminRole:
                adminRole.value.trim(),

            hotelName:
                hotelName.value.trim(),

            phone:
                phone ? phone.value.trim() : "",

            email:
                email ? email.value.trim() : "",

            address:
                address ? address.value.trim() : "",

            notifications:
                notifications
                    ? notifications.checked
                    : true

        };


        if (!settings.adminName) {

            alert(
                "Please enter admin name."
            );

            return;

        }


        if (!settings.hotelName) {

            alert(
                "Please enter hotel name."
            );

            return;

        }


        if (saveSettingsData(settings)) {

            updateTopbarProfile(settings);

            alert(
                "Settings saved successfully."
            );

        }

    }


    /* =====================================================
       RESET SETTINGS
    ===================================================== */

    function resetSettings() {

        const confirmed =
            confirm(
                "Are you sure you want to reset all settings?"
            );


        if (!confirmed) {
            return;
        }


        localStorage.removeItem(
            SETTINGS_KEY
        );


        renderSettings();


        updateTopbarProfile(
            defaultSettings
        );


        alert(
            "Settings have been reset."
        );

    }


    /* =====================================================
       UPDATE TOPBAR PROFILE
    ===================================================== */

    function updateTopbarProfile(settings) {

        const profileName =
            document.querySelector(
                ".profile-info strong"
            );

        const profileRole =
            document.querySelector(
                ".profile-info span"
            );

        const avatar =
            document.querySelector(
                ".profile-avatar"
            );


        if (profileName) {

            profileName.textContent =
                settings.adminName ||
                "Admin";

        }


        if (profileRole) {

            profileRole.textContent =
                settings.adminRole ||
                "Administrator";

        }


        if (avatar) {

            const name =
                settings.adminName ||
                "Admin";

            avatar.textContent =
                name
                    .trim()
                    .charAt(0)
                    .toUpperCase();

        }

    }


    /* =====================================================
       PASSWORD MESSAGE
    ===================================================== */

    function showPasswordMessage() {

        alert(
            "Password change can be connected to your authentication system in the next security module."
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initSettings() {

        const settings =
            loadSettings();

        updateTopbarProfile(
            settings
        );

        renderSettings();

    }


    /* =====================================================
       WHEN SETTINGS VIEW OPENS
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            initSettings();

        }
    );


    /* =====================================================
       GLOBAL FUNCTIONS
    ===================================================== */

    window.renderSettings =
        renderSettings;

    window.saveSettings =
        saveSettings;

    window.resetSettings =
        resetSettings;

    window.showPasswordMessage =
        showPasswordMessage;


})();
