(function () {
    "use strict";

    /* =========================================================
       ROYAL PALACE HOTEL
       DASHBOARD MODULE V8.0
       ========================================================= */

    const VERSION = "8.0";

    const DEFAULT_ROOMS = [
        {
            id: "ROOM001",
            name: "Premium Room 101",
            type: "Premium",
            price: 2500,
            status: "available"
        },
        {
            id: "ROOM002",
            name: "Premium Room 102",
            type: "Premium",
            price: 2500,
            status: "booked"
        },
        {
            id: "ROOM003",
            name: "Deluxe Room 103",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },
        {
            id: "ROOM004",
            name: "Deluxe Room 104",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },
        {
            id: "ROOM005",
            name: "Royal Suite 201",
            type: "Suite",
            price: 4500,
            status: "booked"
        },
        {
            id: "ROOM006",
            name: "Royal Suite 202",
            type: "Suite",
            price: 4500,
            status: "available"
        },
        {
            id: "ROOM007",
            name: "Royal Palace Suite 301",
            type: "Suite",
            price: 6500,
            status: "available"
        },
        {
            id: "ROOM008",
            name: "Royal Palace Suite 302",
            type: "Suite",
            price: 6500,
            status: "booked"
        }
    ];

    const state = {
        rooms: [],
        bookings: [],
        settings: {}
    };

    /* =========================================================
       HELPERS
       ========================================================= */

    function money(value) {
        const number = Number(value) || 0;

        try {
            return "₹" + number.toLocaleString("en-IN");
        } catch (error) {
            return "₹" + number;
        }
    }

    function escapeHTML(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function getBookingId(booking) {
        return (
            booking.booking_id ||
            booking.bookingId ||
            booking.id ||
            "N/A"
        );
    }

    function getGuestName(booking) {
        return (
            booking.guest_name ||
            booking.guestName ||
            booking.name ||
            "Guest"
        );
    }

    function reportError(error) {
        try {
            if (typeof window.reportAppError === "function") {
                window.reportAppError(
                    error,
                    "Dashboard"
                );
            }
        } catch (ignored) {}

        console.error(
            "[Royal Dashboard]",
            error
        );
    }

    /* =========================================================
       LOAD ROOMS
       ========================================================= */

    function loadRooms() {
        try {
            const saved =
                localStorage.getItem(
                    "royal_palace_rooms"
                );

            if (saved) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    state.rooms = parsed;
                    return state.rooms;
                }
            }
        } catch (error) {
            reportError(error);
        }

        state.rooms = DEFAULT_ROOMS.map(function (room) {
            return Object.assign({}, room);
        });

        return state.rooms;
    }

    /* =========================================================
       LOAD SETTINGS
       ========================================================= */

    function loadSettings() {
        try {
            const saved =
                localStorage.getItem(
                    "royal_palace_settings"
                );

            if (saved) {
                const parsed = JSON.parse(saved);

                if (
                    parsed &&
                    typeof parsed === "object"
                ) {
                    state.settings = parsed;
                    return state.settings;
                }
            }
        } catch (error) {
            reportError(error);
        }

        state.settings = {
            adminName: "Admin",
            adminRole: "Administrator",
            hotelName: "Royal Palace Hotel"
        };

        return state.settings;
    }

    /* =========================================================
       LOAD BOOKINGS
       ========================================================= */

    function loadBookings() {
        try {
            if (
                typeof window.getBookings ===
                "function"
            ) {
                const result =
                    window.getBookings();

                if (Array.isArray(result)) {
                    state.bookings = result;
                    return state.bookings;
                }
            }
        } catch (error) {
            reportError(error);
        }

        try {
            const saved =
                localStorage.getItem(
                    "royal_palace_bookings"
                );

            if (saved) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    state.bookings = parsed;
                    return state.bookings;
                }
            }
        } catch (error) {
            reportError(error);
        }

        state.bookings = [];

        return state.bookings;
    }

    /* =========================================================
       CALCULATE STATS
       ========================================================= */

    function calculateStats() {
        const rooms = state.rooms || [];
        const bookings = state.bookings || [];

        let confirmed = 0;
        let revenue = 0;

        bookings.forEach(function (booking) {
            const status = String(
                booking.status || ""
            ).toLowerCase();

            if (
                status === "confirmed" ||
                status === "confirm"
            ) {
                confirmed++;

                revenue +=
                    Number(
                        booking.total ||
                        booking.amount ||
                        booking.price ||
                        0
                    ) || 0;
            }
        });

        return {
            rooms: rooms.length,
            bookings: bookings.length,
            confirmed: confirmed,
            revenue: revenue
        };
    }

    /* =========================================================
       UPDATE STAT CARDS
       ========================================================= */

    function updateStats() {
        const stats = calculateStats();

        const statRooms =
            document.getElementById(
                "statRooms"
            );

        const statBookings =
            document.getElementById(
                "statBookings"
            );

        const statConfirmed =
            document.getElementById(
                "statConfirmed"
            );

        const statRevenue =
            document.getElementById(
                "statRevenue"
            );

        if (statRooms) {
            statRooms.textContent =
                stats.rooms;
        }

        if (statBookings) {
            statBookings.textContent =
                stats.bookings;
        }

        if (statConfirmed) {
            statConfirmed.textContent =
                stats.confirmed;
        }

        if (statRevenue) {
            statRevenue.textContent =
                money(stats.revenue);
        }
    }

    /* =========================================================
       WELCOME AREA
       ========================================================= */

    function updateWelcome() {
        const settings =
            state.settings || {};

        const adminName =
            settings.adminName ||
            settings.name ||
            "Admin";

        const hotelName =
            settings.hotelName ||
            "Royal Palace Hotel";

        const adminRole =
            settings.adminRole ||
            settings.role ||
            "Administrator";

        const welcomeAdminName =
            document.getElementById(
                "welcomeAdminName"
            );

        const welcomeHotelName =
            document.getElementById(
                "welcomeHotelName"
            );

        const topAdminName =
            document.getElementById(
                "topAdminName"
            );

        const topAdminRole =
            document.getElementById(
                "topAdminRole"
            );

        const topProfileAvatar =
            document.getElementById(
                "topProfileAvatar"
            );

        if (welcomeAdminName) {
            welcomeAdminName.textContent =
                adminName;
        }

        if (welcomeHotelName) {
            welcomeHotelName.textContent =
                hotelName;
        }

        if (topAdminName) {
            topAdminName.textContent =
                adminName;
        }

        if (topAdminRole) {
            topAdminRole.textContent =
                adminRole;
        }

        if (topProfileAvatar) {
            topProfileAvatar.textContent =
                String(adminName)
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "A";
        }
    }

    /* =========================================================
       RECENT BOOKINGS
       ========================================================= */

    function renderRecentBookings() {
        const container =
            document.getElementById(
                "recentBookings"
            );

        if (!container) return;

        const bookings =
            (state.bookings || [])
                .slice()
                .reverse()
                .slice(0, 5);

        if (!bookings.length) {
            container.innerHTML =
                '<div style="padding:25px;text-align:center;color:#777;">No recent bookings found.</div>';

            return;
        }

        let html = "";

        bookings.forEach(function (booking) {
            const id =
                getBookingId(booking);

            const guest =
                getGuestName(booking);

            const room =
                booking.room ||
                booking.room_name ||
                booking.roomName ||
                "Room";

            const status =
                String(
                    booking.status ||
                    "Pending"
                );

            const total =
                booking.total ||
                booking.amount ||
                booking.price ||
                0;

            html += `
                <div style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:15px;
                    padding:14px 0;
                    border-bottom:1px solid #eee;
                ">
                    <div style="min-width:0;flex:1;">
                        <div style="
                            font-weight:700;
                            color:#222;
                            margin-bottom:4px;
                        ">
                            ${escapeHTML(guest)}
                        </div>

                        <div style="
                            font-size:12px;
                            color:#777;
                        ">
                            ${escapeHTML(id)}
                            •
                            ${escapeHTML(room)}
                        </div>
                    </div>

                    <div style="
                        text-align:right;
                        white-space:nowrap;
                    ">
                        <div style="
                            font-weight:700;
                            color:#222;
                        ">
                            ${money(total)}
                        </div>

                        <div style="
                            font-size:12px;
                            margin-top:4px;
                            color:${
                                status.toLowerCase() ===
                                "confirmed"
                                    ? "#16a34a"
                                    : "#d97706"
                            };
                        ">
                            ${escapeHTML(status)}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /* =========================================================
       ROOM OVERVIEW
       ========================================================= */

    function renderRoomOverview() {
        const container =
            document.getElementById(
                "roomOverview"
            );

        if (!container) return;

        const rooms =
            (state.rooms || [])
                .slice(0, 8);

        let available = 0;
        let booked = 0;

        rooms.forEach(function (room) {
            const status =
                String(
                    room.status ||
                    "available"
                ).toLowerCase();

            if (status === "booked") {
                booked++;
            } else {
                available++;
            }
        });

        let html = `
            <div style="
                display:grid;
                grid-template-columns:
                    repeat(2,minmax(0,1fr));
                gap:12px;
                margin-bottom:18px;
            ">
                <div style="
                    padding:15px;
                    background:#f0fdf4;
                    border-radius:12px;
                    text-align:center;
                ">
                    <div style="
                        font-size:12px;
                        color:#777;
                    ">
                        Available
                    </div>

                    <strong style="
                        display:block;
                        margin-top:5px;
                        font-size:22px;
                        color:#15803d;
                    ">
                        ${available}
                    </strong>
                </div>

                <div style="
                    padding:15px;
                    background:#fff7ed;
                    border-radius:12px;
                    text-align:center;
                ">
                    <div style="
                        font-size:12px;
                        color:#777;
                    ">
                        Booked
                    </div>

                    <strong style="
                        display:block;
                        margin-top:5px;
                        font-size:22px;
                        color:#ea580c;
                    ">
                        ${booked}
                    </strong>
                </div>
            </div>

            <div>
        `;

        rooms.forEach(function (room) {
            const status =
                String(
                    room.status ||
                    "available"
                ).toLowerCase();

            const statusText =
                status === "booked"
                    ? "Booked"
                    : "Available";

            const statusBg =
                status === "booked"
                    ? "#fff1f2"
                    : "#ecfdf5";

            const statusColor =
                status === "booked"
                    ? "#e11d48"
                    : "#16a34a";

            html += `
                <div style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:10px;
                    padding:12px 0;
                    border-bottom:1px solid #eee;
                ">
                    <div style="
                        min-width:0;
                        flex:1;
                    ">
                        <div style="
                            font-weight:700;
                            color:#222;
                        ">
                            ${escapeHTML(
                                room.name ||
                                room.room ||
                                room.id ||
                                "Room"
                            )}
                        </div>

                        <div style="
                            margin-top:3px;
                            font-size:12px;
                            color:#777;
                        ">
                            ${escapeHTML(
                                room.type ||
                                "Room"
                            )}
                            •
                            ${money(
                                room.price || 0
                            )}
                        </div>
                    </div>

                    <div style="
                        padding:7px 10px;
                        border-radius:20px;
                        background:${statusBg};
                        color:${statusColor};
                        font-size:12px;
                        font-weight:700;
                        white-space:nowrap;
                    ">
                        ${statusText}
                    </div>
                </div>
            `;
        });

        html += `
            </div>
        `;

        container.innerHTML = html;
    }

    /* =========================================================
       MAIN DASHBOARD UPDATE
       ========================================================= */

    function updateDashboard() {
        try {
            loadRooms();
            loadSettings();
            loadBookings();

            updateStats();
            updateWelcome();
            renderRecentBookings();
            renderRoomOverview();

            if (
                typeof window.updateAppHealth ===
                "function"
            ) {
                try {
                    window.updateAppHealth();
                } catch (ignored) {}
            }

            return true;
        } catch (error) {
            reportError(error);
            return false;
        }
    }

    /* =========================================================
       PUBLIC API
       ========================================================= */

    window.updateDashboard =
        updateDashboard;

    window.refreshDashboard =
        updateDashboard;

    window.getDashboardData =
        function () {
            return {
                version: VERSION,
                rooms: state.rooms,
                bookings: state.bookings,
                settings: state.settings,
                stats: calculateStats()
            };
        };

    /* =========================================================
       PUBLIC EVENTS
       ========================================================= */

    document.addEventListener(
        "royalBookingsLoaded",
        function () {
            updateDashboard();
        }
    );

    document.addEventListener(
        "royalBookingsChanged",
        function () {
            updateDashboard();
        }
    );

    document.addEventListener(
        "royalRoomsChanged",
        function () {
            updateDashboard();
        }
    );

    document.addEventListener(
        "royalSettingsChanged",
        function () {
            updateDashboard();
        }
    );

    document.addEventListener(
        "royalSettingsUpdated",
        function () {
            updateDashboard();
        }
    );

    window.addEventListener(
        "storage",
        function (event) {
            if (
                event.key ===
                    "royal_palace_rooms" ||
                event.key ===
                    "royal_palace_bookings" ||
                event.key ===
                    "royal_palace_settings"
            ) {
                updateDashboard();
            }
        }
    );

    /* =========================================================
       START
       ========================================================= */

    function startDashboard() {
        updateDashboard();
    }

    window.startDashboard =
        startDashboard;

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            startDashboard,
            { once: true }
        );
    } else {
        startDashboard();
    }

})();
  
