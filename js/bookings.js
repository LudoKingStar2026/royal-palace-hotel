(function () {
    "use strict";

    /* =========================================================
       ROYAL PALACE HOTEL
       BOOKING MANAGEMENT MODULE V8.0
       ========================================================= */

    const VERSION = "8.0";

    const SUPABASE_URL =
        "https://mvvfqkcgaxcipjkiyuae.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_YbyO8KHdQxXyv6afqJZfWg_Eu2aw57x";

    const TABLE_NAME = "bookings";
    const STORAGE_KEY = "royal_palace_bookings";
    const REQUEST_TIMEOUT = 10000;

    const state = {
        bookings: [],
        search: "",
        status: "all",
        loading: false,
        loaded: false
    };

    window.__ROYAL_BOOKINGS_SCRIPT_LOADED__ = true;
    window.__ROYAL_BOOKINGS_VERSION__ = VERSION;

    /* =========================================================
       HELPERS
       ========================================================= */

    function escapeHTML(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function money(value) {
        const number = Number(value) || 0;

        try {
            return "₹" +
                number.toLocaleString("en-IN");
        } catch (error) {
            return "₹" + number;
        }
    }

    function formatDate(value) {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    function getBookingId(booking) {
        return String(
            booking.booking_id ||
            booking.bookingId ||
            booking.id ||
            ""
        );
    }

    function getGuestName(booking) {
        return (
            booking.guest_name ||
            booking.guestName ||
            booking.guest ||
            booking.name ||
            "Guest"
        );
    }

    function getPhone(booking) {
        return (
            booking.phone ||
            booking.mobile ||
            booking.phone_number ||
            "-"
        );
    }

    function getRoom(booking) {
        return (
            booking.room ||
            booking.room_name ||
            booking.roomName ||
            "-"
        );
    }

    function getTotal(booking) {
        return Number(
            booking.total ||
            booking.amount ||
            booking.price ||
            0
        ) || 0;
    }

    function getStatus(booking) {
        return String(
            booking.status ||
            "Pending"
        );
    }

    function statusClass(status) {
        const value =
            String(status || "")
                .toLowerCase();

        if (value === "confirmed") {
            return "confirmed";
        }

        if (value === "cancelled") {
            return "cancelled";
        }

        return "pending";
    }

    function reportError(type, message, extra) {
        console.error(
            "[ROYAL BOOKINGS]",
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
                    "js/bookings.js",
                    extra || {}
                );
            }
        } catch (ignored) {}
    }

    function getHistoryBox() {
        return document.getElementById(
            "bookingHistory"
        );
    }

    function showToast(message) {
        let toast =
            document.getElementById(
                "royalBookingToast"
            );

        if (!toast) {
            toast =
                document.createElement(
                    "div"
                );

            toast.id =
                "royalBookingToast";

            toast.style.cssText = `
                position:fixed;
                left:50%;
                bottom:25px;
                transform:translateX(-50%);
                background:#111827;
                color:#fff;
                padding:13px 20px;
                border-radius:12px;
                z-index:99999;
                font-size:14px;
                font-weight:600;
                box-shadow:0 12px 35px rgba(0,0,0,.25);
            `;

            document.body.appendChild(
                toast
            );
        }

        toast.textContent = message;
        toast.style.display = "block";

        clearTimeout(
            toast.__timer
        );

        toast.__timer =
            setTimeout(
                function () {
                    toast.style.display =
                        "none";
                },
                2500
            );
    }

    /* =========================================================
       SUPABASE REQUEST
       ========================================================= */

    async function supabaseFetch(
        url,
        options
    ) {
        const controller =
            new AbortController();

        const timer =
            setTimeout(
                function () {
                    controller.abort();
                },
                REQUEST_TIMEOUT
            );

        try {
            const response =
                await fetch(
                    url,
                    Object.assign(
                        {},
                        options || {},
                        {
                            signal:
                                controller.signal
                        }
                    )
                );

            const text =
                await response.text();

            if (!response.ok) {
                let message = text;

                try {
                    const json =
                        JSON.parse(text);

                    message =
                        json.message ||
                        json.error_description ||
                        json.error ||
                        text;
                } catch (ignored) {}

                throw new Error(
                    "HTTP " +
                    response.status +
                    " — " +
                    message
                );
            }

            if (!text) {
                return [];
            }

            try {
                return JSON.parse(text);
            } catch (error) {
                throw new Error(
                    "Invalid JSON response."
                );
            }
        } finally {
            clearTimeout(timer);
        }
    }

    function supabaseHeaders(
        extra
    ) {
        return Object.assign(
            {
                apikey:
                    SUPABASE_KEY,

                Authorization:
                    "Bearer " +
                    SUPABASE_KEY,

                Accept:
                    "application/json",

                "Content-Type":
                    "application/json"
            },
            extra || {}
        );
    }

    /* =========================================================
       LOCAL STORAGE FALLBACK
       ========================================================= */

    function loadLocalBookings() {
        try {
            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!saved) {
                return [];
            }

            const parsed =
                JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [];
        } catch (error) {
            reportError(
                "LOCAL_BOOKING_ERROR",
                error.message
            );

            return [];
        }
    }

    function saveLocalBookings() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    state.bookings
                )
            );
        } catch (error) {
            reportError(
                "LOCAL_SAVE_ERROR",
                error.message
            );
        }
    }
    /* =========================================================
   BOOKING CHANGE NOTIFICATION
   ========================================================= */

function notifyBookingChange(eventName) {
    try {
        window.dispatchEvent(
            new CustomEvent(eventName)
        );
    } catch (error) {
        console.warn(
            "Booking event error:",
            error
        );
    }
}
     /* =========================================================
   LOAD BOOKINGS
   ========================================================= */

    /* =========================================================
       LOAD BOOKINGS
       ========================================================= */

    async function loadBookings() {
        if (state.loading) {
            return state.bookings;
        }

        state.loading = true;

        const box =
            getHistoryBox();

        if (box) {
            box.innerHTML = `
                <div style="
                    padding:45px;
                    text-align:center;
                    color:#777;
                ">
                    <div style="
                        font-size:35px;
                        margin-bottom:10px;
                    ">
                        ⏳
                    </div>

                    <strong>
                        Loading bookings...
                    </strong>

                    <div style="
                        margin-top:6px;
                        font-size:12px;
                        color:#999;
                    ">
                        Connecting to database
                    </div>
                </div>
            `;
        }

        try {
            const url =
                SUPABASE_URL +
                "/rest/v1/" +
                TABLE_NAME +
                "?select=*";

            const data =
                await supabaseFetch(
                    url,
                    {
                        method: "GET",
                        headers:
                            supabaseHeaders()
                    }
                );

            if (!Array.isArray(data)) {
                throw new Error(
                    "Supabase returned invalid booking data."
                );
            }

            state.bookings = data;
            state.loaded = true;

            saveLocalBookings();

            renderBookings();
            notifyBookingChange(
                "royalBookingsLoaded"
            );

            console.log(
                "Royal Palace bookings loaded:",
                data.length
            );

            return data;
        } catch (error) {
            reportError(
                "BOOKING_LOAD_ERROR",
                error.message,
                {
                    table:
                        TABLE_NAME
                }
            );

            const local =
                loadLocalBookings();

            if (local.length) {
                state.bookings =
                    local;

                state.loaded = true;

                renderBookings();

                showToast(
                    "Database unavailable. Showing saved bookings."
                );

                notifyBookingChange(
                    "royalBookingsLoaded"
                );

                return local;
            }

            if (box) {
                box.innerHTML = `
                    <div style="
                        padding:35px;
                        text-align:center;
                        color:#7f1d1d;
                        background:#fff1f2;
                        border-radius:14px;
                        margin:15px;
                    ">
                        <div style="
                            font-size:32px;
                            margin-bottom:10px;
                        ">
                            ❌
                        </div>

                        <strong>
                            Bookings Load Failed
                        </strong>

                        <div style="
                            margin:10px 0;
                            font-size:13px;
                        ">
                            ${escapeHTML(
                                error.message
                            )}
                        </div>

                        <button
                            type="button"
                            onclick="loadBookings()"
                            style="
                                border:0;
                                background:#6d28d9;
                                color:#fff;
                                padding:10px 16px;
                                border-radius:9px;
                                font-weight:700;
                            "
                        >
                            🔄 Try Again
                        </button>
                    </div>
                `;
            }

            return [];
        } finally {
            state.loading = false;
        }
    }

    /* =========================================================
       FILTERING
       ========================================================= */

    function getFilteredBookings() {
        let result =
            state.bookings.slice();

        if (
            state.status !== "all"
        ) {
            const wanted =
                state.status
                    .toLowerCase();

            result =
                result.filter(
                    function (booking) {
                        return (
                            getStatus(
                                booking
                            )
                                .toLowerCase() ===
                            wanted
                        );
                    }
                );
        }

        if (state.search) {
            const search =
                state.search
                    .toLowerCase();

            result =
                result.filter(
                    function (booking) {
                        const text =
                            [
                                getBookingId(
                                    booking
                                ),
                                getGuestName(
                                    booking
                                ),
                                getPhone(
                                    booking
                                ),
                                getRoom(
                                    booking
                                ),
                                getStatus(
                                    booking
                                ),
                                booking.checkin,
                                booking.checkout
                            ]
                                .join(" ")
                                .toLowerCase();

                        return text.includes(
                            search
                        );
                    }
                );
        }

        return result;
    }

    /* =========================================================
       SEARCH / FILTER API
       ========================================================= */

    function searchBookings(value) {
        state.search =
            String(value || "")
                .trim();

        renderBookings();
    }

    function filterBookings(value) {
        state.status =
            value || "all";

        renderBookings();
    }

    /* =========================================================
       ACTION MENU
       ========================================================= */

    function toggleBookingMenu(
        menuId
    ) {
        document
            .querySelectorAll(
                ".royal-booking-menu"
            )
            .forEach(
                function (menu) {
                    if (
                        menu.id !== menuId
                    ) {
                        menu.classList.remove(
                            "open"
                        );
                    }
                }
            );

        const menu =
            document.getElementById(
                menuId
            );

        if (!menu) return;

        menu.classList.toggle(
            "open"
        );
    }

    document.addEventListener(
        "click",
        function (event) {
            if (
                !event.target.closest(
                    ".royal-booking-action"
                )
            ) {
                document
                    .querySelectorAll(
                        ".royal-booking-menu"
                    )
                    .forEach(
                        function (menu) {
                            menu.classList.remove(
                                "open"
                            );
                        }
                    );
            }
        }
    );

    /* =========================================================
       RENDER
       ========================================================= */

    function renderBookings() {
        const box =
            getHistoryBox();

        if (!box) {
            return;
        }

        const searchInput =
            document.getElementById(
                "bookingSearch"
            );

        const statusSelect =
            document.getElementById(
                "bookingStatusFilter"
            );

        if (searchInput) {
            state.search =
                searchInput.value
                    .trim();
        }

        if (statusSelect) {
            state.status =
                statusSelect.value ||
                "all";
        }

        const bookings =
            getFilteredBookings();

        if (!state.bookings.length) {
            box.innerHTML = `
                <div style="
                    padding:45px 20px;
                    text-align:center;
                    color:#777;
                ">
                    <div style="
                        font-size:40px;
                    ">
                        📋
                    </div>

                    <h3 style="
                        margin:10px 0 5px;
                        color:#222;
                    ">
                        No Bookings Found
                    </h3>

                    <p style="
                        margin:0;
                        font-size:13px;
                    ">
                        There are no reservations available.
                    </p>
                </div>
            `;

            return;
        }

        if (!bookings.length) {
            box.innerHTML = `
                <div style="
                    padding:45px 20px;
                    text-align:center;
                    color:#777;
                ">
                    <div style="
                        font-size:40px;
                    ">
                        🔍
                    </div>

                    <h3 style="
                        margin:10px 0 5px;
                        color:#222;
                    ">
                        No Matching Bookings
                    </h3>

                    <p style="
                        margin:0;
                        font-size:13px;
                    ">
                        Try another search or status filter.
                    </p>
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
                                padding:13px;
                                       text-align:left;
                            color:#555;
                            font-weight:700;
                        ">
                            Booking ID
                        </th>

                        <th style="
                            padding:13px;
                            text-align:left;
                            color:#555;
                            font-weight:700;
                        ">
                            Guest
                        </th>

                        <th style="
                            padding:13px;
                            text-align:left;
                            color:#555;
                            font-weight:700;
                        ">
                            Room
                        </th>

                        <th style="
                            padding:13px;
                            text-align:left;
                            color:#555;
                            font-weight:700;
                        ">
                            Check-in
                        </th>

                        <th style="
                            padding:13px;
                            text-align:left;
                            color:#555;
                            font-weight:700;
                        ">
                            Check-out
                        </th>

                        <th style="
                            padding:13px;
                            text-align:left;
                            color:#555;
                            font-weight:700;
                        ">
                            Total
                        </th>

                        <th style="
                            padding:13px;
                            text-align:left;
                            color:#555;
                            font-weight:700;
                        ">
                            Status
                        </th>

                        <th style="
                            padding:13px;
                            text-align:center;
                            color:#555;
                            font-weight:700;
                        ">
                            Action
                        </th>

                    </tr>
                </thead>

                <tbody>
        `;

        bookings.forEach(function (booking) {

            const id =
                getBookingId(booking);

            const guest =
                getGuestName(booking);

            const room =
                booking.room || "—";

            const status =
                booking.status || "Pending";

            const statusKey =
                String(status)
                    .toLowerCase();

            let statusBg = "#fff4dc";
            let statusColor = "#a56a00";

            if (statusKey === "confirmed") {
                statusBg = "#e8f7ee";
                statusColor = "#168449";
            }

            if (
                statusKey === "cancelled" ||
                statusKey === "canceled"
            ) {
                statusBg = "#fdeaea";
                statusColor = "#d33b3b";
            }

            html += `
                    <tr style="
                        border-bottom:1px solid #eeeeee;
                    ">

                        <td style="
                            padding:14px 13px;
                            font-weight:700;
                            color:#5b3cc4;
                        ">
                            ${escapeHTML(id)}
                        </td>

                        <td style="
                            padding:14px 13px;
                            color:#222;
                            font-weight:600;
                        ">
                            ${escapeHTML(guest)}
                        </td>

                        <td style="
                            padding:14px 13px;
                            color:#444;
                        ">
                            ${escapeHTML(room)}
                        </td>

                        <td style="
                            padding:14px 13px;
                            color:#555;
                        ">
                            ${formatDate(
                                booking.checkin
                            )}
                        </td>

                        <td style="
                            padding:14px 13px;
                            color:#555;
                        ">
                            ${formatDate(
                                booking.checkout
                            )}
                        </td>

                        <td style="
                            padding:14px 13px;
                            font-weight:700;
                            color:#222;
                        ">
                            ${money(
                                booking.total
                            )}
                        </td>

                        <td style="
                            padding:14px 13px;
                        ">
                            <span style="
                                display:inline-block;
                                padding:6px 10px;
                                border-radius:20px;
                                background:${statusBg};
                                color:${statusColor};
                                font-size:11px;
                                font-weight:700;
                            ">
                                ${escapeHTML(status)}
                            </span>
                        </td>

                        <td style="
                            padding:14px 13px;
                            text-align:center;
                            position:relative;
                        ">

                            <button
                                type="button"
                                onclick="toggleBookingMenu('${escapeHTML(id)}')"
                                style="
                                    width:34px;
                                    height:34px;
                                    border:0;
                                    border-radius:8px;
                                    background:#f4f1fb;
                                    color:#5b3cc4;
                                    font-size:20px;
                                    cursor:pointer;
                                "
                            >
                                ⋮
                            </button>

                            <div
                                id="bookingMenu_${escapeHTML(id)}"
                                style="
                                    display:none;
                                    position:absolute;
                                    right:8px;
                                    top:52px;
                                    width:205px;
                                    background:#fff;
                                    border:1px solid #e6e3ef;
                                    border-radius:10px;
                                    box-shadow:0 12px 30px rgba(0,0,0,.15);
                                    z-index:999;
                                    overflow:hidden;
                                    text-align:left;
                                "
                            >

                                <button
                                    type="button"
                                    onclick="viewBooking('${escapeHTML(id)}')"
                                    style="
                                        width:100%;
                                        padding:12px 14px;
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
                                    onclick="editBooking('${escapeHTML(id)}')"
                                    style="
                                        width:100%;
                                        padding:12px 14px;
                                        border:0;
                                        background:#fff;
                                        text-align:left;
                                        cursor:pointer;
                                    "
                                >
                                    ✏️ Edit / Update
                                </button>

                                <button
                                    type="button"
                                    onclick="confirmBooking('${escapeHTML(id)}')"
                                    style="
                                        width:100%;
                                        padding:12px 14px;
                                        border:0;
                                        background:#fff;
                                        text-align:left;
                                        cursor:pointer;
                                    "
                                >
                                    ✅ Confirm Booking
                                </button>

                                <button
                                    type="button"
                                    onclick="cancelBooking('${escapeHTML(id)}')"
                                    style="
                                        width:100%;
                                        padding:12px 14px;
                                        border:0;
                                        background:#fff;
                                        text-align:left;
                                        cursor:pointer;
                                    "
                                >
                                    ❌ Cancel Booking
                                </button>

                                <button
                                    type="button"
                                    onclick="copyBookingId('${escapeHTML(id)}')"
                                    style="
                                        width:100%;
                                        padding:12px 14px;
                                        border:0;
                                        background:#fff;
                                        text-align:left;
                                        cursor:pointer;
                                    "
                                >
                                    📋 Copy Booking ID
                                </button>

                                <button
                                    type="button"
                                    onclick="deleteBooking('${escapeHTML(id)}')"
                                    style="
                                        width:100%;
                                        padding:12px 14px;
                                        border:0;
                                        background:#fff;
                                        text-align:left;
                                        cursor:pointer;
                                        color:#d33b3b;
                                    "
                                >
                                    🗑️ Delete Booking
                                </button>

                            </div>

                        </td>

                    </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        </div>
        `;

        box.innerHTML = html;
    }

    /* =====================================================
       BOOKING FIND
    ===================================================== */

    function findBooking(id) {

        return state.bookings.find(
            function (booking) {
                return (
                    getBookingId(booking) ===
                    String(id)
                );
            }
        ) || null;
    }

    /* =====================================================
       THREE DOT MENU
    ===================================================== */

    function toggleBookingMenu(id) {

        const menu =
            document.getElementById(
                "bookingMenu_" + id
            );

        if (!menu) return;

        document
            .querySelectorAll(
                '[id^="bookingMenu_"]'
            )
            .forEach(function (item) {

                if (item !== menu) {
                    item.style.display =
                        "none";
                }
            });

        if (
            menu.style.display ===
            "block"
        ) {
            menu.style.display =
                "none";
        } else {
            menu.style.display =
                "block";
        }
    }

    /* =====================================================
       VIEW BOOKING
    ===================================================== */

    function viewBooking(id) {

        const booking =
            findBooking(id);

        if (!booking) {
            alert("Booking not found.");
            return;
        }

        showBookingModal(
            "Booking Details",
            `
                <div style="line-height:1.7">

                    <p>
                        <strong>Booking ID:</strong>
                        ${escapeHTML(
                            getBookingId(booking)
                        )}
                    </p>

                    <p>
                        <strong>Guest:</strong>
                        ${escapeHTML(
                            getGuestName(booking)
                        )}
                    </p>

                    <p>
                        <strong>Room:</strong>
                        ${escapeHTML(
                            booking.room || "—"
                        )}
                    </p>

                    <p>
                        <strong>Check-in:</strong>
                        ${formatDate(
                            booking.checkin
                        )}
                    </p>

                    <p>
                        <strong>Check-out:</strong>
                        ${formatDate(
                            booking.checkout
                        )}
                    </p>

                    <p>
                        <strong>Guests:</strong>
                        ${booking.guests || 1}
                    </p>

                    <p>
                        <strong>Nights:</strong>
                        ${booking.nights || 1}
                    </p>

                    <p>
                        <strong>Total:</strong>
                        ${money(
                            booking.total
                        )}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${escapeHTML(
                            booking.status || "Pending"
                        )}
                    </p>

                </div>

                <div style="
                    text-align:right;
                    margin-top:20px;
                ">
                    <button
                        type="button"
                        onclick="closeBookingModal()"
                        style="
                            border:0;
                            background:#5b3cc4;
                            color:#fff;
                            padding:10px 18px;
                            border-radius:8px;
                            cursor:pointer;
                        "
                    >
                        Close
                    </button>
                </div>
            `
        );
    }

    /* =====================================================
       MODAL
    ===================================================== */

    function showBookingModal(
        title,
        content
    ) {

        closeBookingModal();

        const modal =
            document.createElement("div");

        modal.id =
            "royalBookingModal";

        modal.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.55);
            z-index:99999;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        `;

        modal.innerHTML = `
            <div style="
                width:min(560px,100%);
                max-height:90vh;
                overflow:auto;
                background:#fff;
                border-radius:16px;
                box-shadow:0 25px 70px rgba(0,0,0,.25);
            ">

                <div style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    padding:18px 20px;
                    border-bottom:1px solid #eee;
                ">

                    <h2 style="
                        margin:0;
                        font-size:19px;
                        color:#222;
                    ">
                        ${escapeHTML(title)}
                    </h2>

                    <button
                        type="button"
                        onclick="closeBookingModal()"
                        style="
                            border:0;
                            width:32px;
                            height:32px;
                            border-radius:50%;
                            background:#f1f1f4;
                            font-size:20px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>

                </div>

                <div style="
                    padding:20px;
                ">
                    ${content}
                </div>

            </div>
        `;

        document.body.appendChild(
            modal
        );
    }

    function closeBookingModal() {

        const modal =
            document.getElementById(
                "royalBookingModal"
            );

        if (modal) {
            modal.remove();
        }
    }

    /* =====================================================
       COPY BOOKING ID
    ===================================================== */

    async function copyBookingId(id) {

        try {

            await navigator.clipboard.writeText(
                String(id)
            );

            alert(
                "Booking ID copied: " +
                id
            );

        } catch (error) {

            alert(
                "Booking ID: " +
                id
            );
        }
    }

    /* =====================================================
       CONFIRM BOOKING
    ===================================================== */

    async function confirmBooking(id) {

        if (
            !confirm(
                "Confirm booking " +
                id +
                "?"
            )
        ) {
            return;
        }

        await updateBookingStatus(
            id,
            "Confirmed"
        );
    }

    /* =====================================================
       CANCEL BOOKING
    ===================================================== */

    async function cancelBooking(id)
  {
    if (
        !confirm(
            "Cancel booking " +
            id +
            "?"
        )
    ) {
        return;
    }

    await updateBookingStatus(
        id,
        "Cancelled"
    );
}


/* =====================================================
   UPDATE BOOKING STATUS
===================================================== */

async function updateBookingStatus(
    id,
    newStatus
) {
    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/bookings?booking_id=eq." +
            encodeURIComponent(id),
            {
                method: "PATCH",

                headers: {
                    apikey: SUPABASE_KEY,

                    Authorization:
                        "Bearer " +
                        SUPABASE_KEY,

                    "Content-Type":
                        "application/json",

                    Prefer:
                        "return=minimal"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                "Supabase status update failed"
            );
        }

        const booking =
            findBooking(id);

        if (booking) {
            booking.status =
                newStatus;
        }

        saveLocalBookings();

        renderBookings();

        if (
            typeof window.updateDashboard ===
            "function"
        ) {
            window.updateDashboard();
        }

        window.dispatchEvent(
            new CustomEvent(
                "royalBookingsChanged"
            )
        );

    } catch (error) {

        alert(
            "Booking status update failed.\n\n" +
            error.message
        );
    }
}


/* =====================================================
   DELETE BOOKING
===================================================== */

async function deleteBooking(id) {

    if (
        !confirm(
            "Delete booking " +
            id +
            " permanently?"
        )
    ) {
        return;
    }

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/bookings?booking_id=eq." +
            encodeURIComponent(id),
            {
                method: "DELETE",

                headers: {
                    apikey: SUPABASE_KEY,

                    Authorization:
                        "Bearer " +
                        SUPABASE_KEY,

                    "Content-Type":
                        "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Supabase delete failed"
            );
        }

        state.bookings =
            state.bookings.filter(
                function (booking) {
                    return (
                        getBookingId(
                            booking
                        ) !== String(id)
                    );
                }
            );

        saveLocalBookings();

        renderBookings();

        if (
            typeof window.updateDashboard ===
            "function"
        ) {
            window.updateDashboard();
        }

        window.dispatchEvent(
            new CustomEvent(
                "royalBookingsChanged"
            )
        );

    } catch (error) {

        alert(
            "Booking delete failed.\n\n" +
            error.message
        );
    }
}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveLocalBookings() {

    try {

        localStorage.setItem(
            "royal_palace_bookings",
            JSON.stringify(
                state.bookings
            )
        );

    } catch (error) {

        console.warn(
            "Could not save bookings",
            error
        );
    }
}
/* =========================================================
   EDIT BOOKING
========================================================= */

async function editBooking(id) {

    const booking =
        state.bookings.find(
            function (item) {
                return getBookingId(item) === String(id);
            }
        );

    if (!booking) {
        showToast("Booking not found.");
        return;
    }

    const guestName =
        prompt(
            "Guest Name:",
            getGuestName(booking)
        );

    if (guestName === null) {
        return;
    }

    const room =
        prompt(
            "Room:",
            getRoom(booking)
        );

    if (room === null) {
        return;
    }

    const totalText =
        prompt(
            "Total Amount:",
            String(getTotal(booking))
        );

    if (totalText === null) {
        return;
    }

    const total =
        Number(totalText);

    if (!Number.isFinite(total)) {
        showToast(
            "Please enter a valid amount."
        );
        return;
    }

    try {

        const url =
            SUPABASE_URL +
            "/rest/v1/" +
            TABLE_NAME +
            "?booking_id=eq." +
            encodeURIComponent(id);

        await supabaseFetch(
            url,
            {
                method: "PATCH",

                headers:
                    supabaseHeaders({
                        Prefer:
                            "return=minimal"
                    }),

                body:
                    JSON.stringify({
                        guest_name:
                            guestName.trim(),

                        room:
                            room.trim(),

                        total:
                            total
                    })
            }
        );

        booking.guest_name =
            guestName.trim();

        booking.room =
            room.trim();

        booking.total =
            total;

        saveLocalBookings();

        renderBookings();

        notifyBookingChange(
            "royalBookingsChanged"
        );

        if (
            typeof window.updateDashboard ===
            "function"
        ) {
            window.updateDashboard();
        }

        showToast(
            "Booking updated successfully."
        );

    } catch (error) {

        reportError(
            "BOOKING_EDIT_ERROR",
            error.message,
            {
                booking_id: id
            }
        );

        showToast(
            "Booking update failed."
        );
    }

 /* =====================================================
   BOOKING EVENT NOTIFIER
===================================================== */

function notifyBookingChange(eventName) {
    try {
        window.dispatchEvent(
            new CustomEvent(eventName)
        );
    } catch (error) {
        console.warn(
            "Booking event error:",
            error
        );
    }
 }   
    
/* =====================================================
   PUBLIC API
===================================================== */

window.renderBookings =
    renderBookings;

window.searchBookings =
    searchBookings;

window.filterBookings =
    filterBookings;

window.loadBookings =
    loadBookings;

window.viewBooking =
    viewBooking;

window.editBooking =
    editBooking;

window.confirmBooking =
    confirmBooking;

window.cancelBooking =
    cancelBooking;

window.copyBookingId =
    copyBookingId;

window.deleteBooking =
    deleteBooking;

window.toggleBookingMenu =
    toggleBookingMenu;

window.closeBookingModal =
    closeBookingModal;

window.getBookings =
    function () {
        return state.bookings.slice();
    };


/* =====================================================
   START
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            loadBookings();
        },
        {
            once: true
        }
    );

} else {

    loadBookings();

}

})();
