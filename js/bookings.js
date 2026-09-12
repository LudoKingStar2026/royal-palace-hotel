/* =========================================================
   ROYAL PALACE HOTEL
   BOOKING SYSTEM — FULL DIAGNOSTIC VERSION
   ========================================================= */

(function () {
    "use strict";

    /* =========================
       CONFIG
    ========================= */

    const SUPABASE_URL =
        "https://mvvfqkcgaxcipjkiyuae.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_YbyO8KHdQxXyv6afqJZfWg_Eu2aw57x";

    const TABLE_NAME = "bookings";
    const REQUEST_TIMEOUT = 10000;

    const state = {
        bookings: [],
        search: "",
        status: "all",
        started: false,
        loaded: false
    };

    /* =========================
       SCRIPT LOADED MARKER
    ========================= */

    window.__ROYAL_BOOKINGS_SCRIPT_LOADED__ = true;
    window.__ROYAL_BOOKINGS_VERSION__ = "DIAGNOSTIC-V6";

    /* =========================
       HELPERS
    ========================= */

    function getHistoryBox() {
        return document.getElementById("bookingHistory");
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function money(value) {
        const number = Number(value || 0);

        return "₹" + number.toLocaleString("en-IN");
    }

    function formatDate(value) {
        if (!value) return "-";

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return escapeHTML(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function safeId(value) {
        return String(value || "")
            .replace(/[^a-zA-Z0-9_-]/g, "_");
    }

    function getStatusClass(status) {
        const value = String(status || "").toLowerCase();

        if (value === "confirmed") return "confirmed";
        if (value === "cancelled") return "cancelled";
        if (value === "pending") return "pending";

        return "pending";
    }

    function getBookingId(booking) {
        return (
            booking.booking_id ||
            booking.id ||
            booking.bookingId ||
            ""
        );
    }

    /* =========================
       DIAGNOSTIC DISPLAY
    ========================= */

    function showDiagnostic(title, message, details) {

        const box = getHistoryBox();

        if (!box) {
            console.error(
                "ROYAL PALACE BOOKING ERROR:",
                title,
                message,
                details
            );
            return;
        }

        box.innerHTML = `
            <div style="
                margin:20px 0;
                padding:22px;
                border-radius:16px;
                background:#fff1f2;
                border:1px solid #fecdd3;
                color:#7f1d1d;
                font-family:Arial,sans-serif;
            ">

                <div style="
                    font-size:22px;
                    font-weight:800;
                    margin-bottom:10px;
                ">
                    ❌ ${escapeHTML(title)}
                </div>

                <div style="
                    font-size:15px;
                    line-height:1.6;
                    margin-bottom:14px;
                ">
                    ${escapeHTML(message)}
                </div>

                ${
                    details
                        ? `
                        <div style="
                            padding:14px;
                            border-radius:10px;
                            background:#ffffff;
                            border:1px solid #fecaca;
                            font-size:13px;
                            line-height:1.6;
                            word-break:break-word;
                        ">
                            <strong>Diagnostic Details:</strong><br>
                            ${escapeHTML(details)}
                        </div>
                        `
                        : ""
                }

                <button
                    type="button"
                    onclick="loadBookings()"
                    style="
                        margin-top:16px;
                        padding:11px 18px;
                        border:0;
                        border-radius:10px;
                        background:#6d28d9;
                        color:#fff;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    🔄 Try Again
                </button>

            </div>
        `;

        console.error(
            "[Royal Palace Booking System]",
            title,
            message,
            details
        );
    }

    function showLoading(message) {

        const box = getHistoryBox();

        if (!box) return;

        box.innerHTML = `
            <div style="
                padding:35px;
                text-align:center;
                font-family:Arial,sans-serif;
            ">
                <div style="
                    font-size:28px;
                    margin-bottom:10px;
                ">
                    ⏳
                </div>

                <div style="
                    font-size:16px;
                    font-weight:700;
                ">
                    ${escapeHTML(message || "Loading bookings...")}
                </div>

                <div style="
                    margin-top:7px;
                    color:#777;
                    font-size:13px;
                ">
                    Please wait...
                </div>
            </div>
        `;
    }

    /* =========================
       SUPABASE REQUEST
    ========================= */

    async function supabaseFetch(url, options = {}) {

        const controller = new AbortController();

        const timer = setTimeout(function () {
            controller.abort();
        }, REQUEST_TIMEOUT);

        try {

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            const text = await response.text();

            if (!response.ok) {

                let errorMessage = text;

                try {
                    const json = JSON.parse(text);

                    errorMessage =
                        json.message ||
                        json.error_description ||
                        json.error ||
                        text;
                } catch (e) {}

                throw new Error(
                    "HTTP " +
                    response.status +
                    " " +
                    response.statusText +
                    " — " +
                    errorMessage
                );
            }

            if (!text) {
                return [];
            }

            try {
                return JSON.parse(text);
            } catch (error) {

                throw new Error(
                    "Supabase returned invalid JSON: " +
                    text.substring(0, 500)
                );
            }

        } finally {

            clearTimeout(timer);
        }
    }

    /* =========================
       LOAD BOOKINGS
    ========================= */

    async function loadBookings() {

        state.started = true;

        console.log(
            "ROYAL PALACE BOOKING SYSTEM STARTED",
            window.__ROYAL_BOOKINGS_VERSION__
        );

        showLoading("Connecting to Supabase...");

        const url =
            SUPABASE_URL +
            "/rest/v1/" +
            TABLE_NAME +
            "?select=*";

        console.log("Supabase URL:", url);

        try {

            const data = await supabaseFetch(url, {

                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization":
                        "Bearer " + SUPABASE_KEY,
                    "Accept": "application/json",
                    "Content-Type":
                        "application/json"
                }
            });

            console.log(
                "Supabase response:",
                data
            );

            if (!Array.isArray(data)) {

                throw new Error(
                    "Supabase response is not an array."
                );
            }

            state.bookings = data;
            state.loaded = true;

            renderBookings();
            updateDashboard();

            console.log(
                "Bookings loaded successfully:",
                data.length
            );

        } catch (error) {

            console.error(
                "Booking loading failed:",
                error
            );

            if (
                error &&
                error.name === "AbortError"
            ) {

                showDiagnostic(
                    "Supabase Request Timeout",
                    "Supabase ने 10 सेकंड के अंदर response नहीं दिया।",
                    "Possible causes: Internet problem, Supabase API problem, RLS policy problem, या project response नहीं कर रहा।"
                );

                return;
            }

            showDiagnostic(
                "Bookings Load Failed",
                error?.message ||
                    "Unknown error occurred.",
                "Supabase URL: " +
                    SUPABASE_URL +
                    " | Table: " +
                    TABLE_NAME
            );
        }
    }

    /* =========================
       FILTER
    ========================= */

    function getFilteredBookings() {

        let result = [...state.bookings];

        if (state.status !== "all") {

            result = result.filter(function (booking) {

                return String(
                    booking.status || ""
                ).toLowerCase() ===
                    String(
                        state.status
                    ).toLowerCase();
            });
        }

        if (state.search) {

            const search =
                state.search.toLowerCase();

            result = result.filter(function (booking) {

                const text = [

                    getBookingId(booking),

                    booking.guest_name,

                    booking.guestName,

                    booking.room,

                    booking.status,

                    booking.checkin,

                    booking.checkout

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return text.includes(search);
            });
        }

        return result;
    }

    /* =========================
       RENDER
    ========================= */

    function renderBookings() {

        const box = getHistoryBox();

        if (!box) {

            console.error(
                "bookingHistory element not found."
            );

            return;
        }

        const bookings =
            getFilteredBookings();

        if (!state.bookings.length) {

            box.innerHTML = `
                <div style="
                    padding:40px;
                    text-align:center;
                    color:#777;
                    font-family:Arial,sans-serif;
                ">
                    <div style="font-size:40px;">
                        📭
                    </div>

                    <h3>
                        No bookings found
                    </h3>

                    <p>
                        Supabase connection successful,
                        but the bookings table is empty.
                    </p>
                </div>
            `;

            return;
        }

        if (!bookings.length) {

            box.innerHTML = `
                <div style="
                    padding:40px;
                    text-align:center;
                    color:#777;
                ">
                    🔍 No matching bookings found.
                </div>
            `;

            return;
        }

        let html = `

            <div style="
                width:100%;
                overflow-x:auto;
            ">

                <table style="
                    width:100%;
                    min-width:850px;
                    border-collapse:collapse;
                ">

                    <thead>
                        <tr>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Booking ID
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Guest
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Room
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Check-in
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Check-out
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Guests
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Total
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Status
                            </th>

                            <th style="
                                text-align:center;
                                padding:14px;
                            ">
                                Action
                            </th>

                        </tr>
                    </thead>

                    <tbody>
        `;

        bookings.forEach(function (booking, index) {

            const bookingId =
                getBookingId(booking);

            const menuId =
                "booking_menu_" +
                index;

            const status =
                booking.status || "Pending";

            html += `

                <tr style="
                    border-top:1px solid #eee;
                ">

                    <td style="padding:14px;">
                        <strong>
                            ${escapeHTML(bookingId)}
                        </strong>
                    </td>

                    <td style="padding:14px;">
                        ${escapeHTML(
                            booking.guest_name ||
                            booking.guestName ||
                            "-"
                        )}
                    </td>

                    <td style="padding:14px;">
                        ${escapeHTML(
                            booking.room || "-"
                        )}
                    </td>

                    <td style="padding:14px;">
                        ${formatDate(
                            booking.checkin
                        )}
                    </td>

                    <td style="padding:14px;">
                        ${formatDate(
                            booking.checkout
                        )}
                    </td>

                    <td style="padding:14px;">
                        ${escapeHTML(
                            booking.guests || "-"
                        )}
                    </td>

                    <td style="padding:14px;">
                        <strong>
                            ${money(
                                booking.total
                            )}
                        </strong>
                    </td>

                    <td style="padding:14px;">

                        <span class="
                            status-badge
                            ${getStatusClass(status)}
                        ">
                            ${escapeHTML(status)}
                        </span>

                    </td>

                    <td style="
                        padding:14px;
                        text-align:center;
                        position:relative;
                    ">

                        <button
                            type="button"
                            onclick="toggleBookingMenu('${menuId}')"
                            style="
                                width:36px;
                                height:36px;
                                border:0;
                                border-radius:9px;
                                background:#f3f4f6;
                                font-size:20px;
                                cursor:pointer;
                            "
                        >
                            ⋮
                        </button>

                        <div
                            id="${menuId}"
                            style="
                                display:none;
                                position:absolute;
                                right:12px;
                                top:52px;
                                width:190px;
                                background:#fff;
                                border:1px solid #e5e7eb;
                                border-radius:12px;
                                box-shadow:0 10px 30px rgba(0,0,0,.15);
                                z-index:100;
                                overflow:hidden;
                                text-align:left;
                            "
                        >

                            <button
                                type="button"
                                onclick="viewBooking('${escapeHTML(bookingId)}')"
                                style="
                                    width:100%;
                                    padding:11px 14px;
                                    border:0;
                                    background:#fff;
                                    text-align:left;
                                    cursor:pointer;
                                "
                            >
                                👁️ View Details
                            </button>

                            <button
                                type="button"
                                onclick="editBooking('${escapeHTML(bookingId)}')"
                                style="
                                    width:100%;
                                    padding:11px 14px;
                                    border:0;
                                    background:#fff;
                                    text-align:left;
                                    cursor:pointer;
                                "
                            >
                                ✏️ E
