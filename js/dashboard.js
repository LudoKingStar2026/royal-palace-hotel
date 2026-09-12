/* =========================================================
   ROYAL PALACE HOTEL
   DASHBOARD SYSTEM
   CENTRAL CONNECTED VERSION
   VERSION: 7.0
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const DASHBOARD_VERSION = "7.0";

    const ROOMS_KEY =
        "royal_palace_rooms";

    const SETTINGS_KEY =
        "royal_palace_settings";

    /* =====================================================
       STATE
    ===================================================== */

    const state = {
        bookings: [],
        rooms: [],
        settings: {},
        loaded: false
    };

    window.__ROYAL_DASHBOARD_SCRIPT_LOADED__ = true;
    window.__ROYAL_DASHBOARD_VERSION__ =
        DASHBOARD_VERSION;

    /* =====================================================
       DEFAULT ROOMS
    ===================================================== */

    const DEFAULT_ROOMS = [

        {
            id: "ROOM001",
            name: "Premium Room",
            number: "101",
            type: "Premium",
            price: 2500,
            status: "available"
        },

        {
            id: "ROOM002",
            name: "Premium Room",
            number: "102",
            type: "Premium",
            price: 2500,
            status: "booked"
        },

        {
            id: "ROOM003",
            name: "Deluxe Room",
            number: "103",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },

        {
            id: "ROOM004",
            name: "Deluxe Room",
            number: "104",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },

        {
            id: "ROOM005",
            name: "Royal Suite",
            number: "201",
            type: "Suite",
            price: 4500,
            status: "booked"
        },

        {
            id: "ROOM006",
            name: "Royal Suite",
            number: "202",
            type: "Suite",
            price: 4500,
            status: "available"
        },

        {
            id: "ROOM007",
            name: "Royal Palace Suite",
            number: "301",
            type: "Suite",
            price: 6500,
            status: "available"
        },

        {
            id: "ROOM008",
            name: "Royal Palace Suite",
            number: "302",
            type: "Suite",
            price: 6500,
            status: "booked"
        }

    ];

    /* =====================================================
       HELPERS
    ===================================================== */

    function money(value) {

        const number =
            Number(value || 0);

        return (
            "₹" +
            number.toLocaleString(
                "en-IN"
            )
        );
    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getBookingId(booking) {

        return String(
            booking.booking_id ||
            booking.id ||
            booking.bookingId ||
            ""
        );
    }

    function getGuestName(booking) {

        return (
            booking.guest_name ||
            booking.guestName ||
            "-"
        );
    }

    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            isNaN(
                date.getTime()
            )
        ) {
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

    /* =====================================================
       ERROR REPORT
    ===================================================== */

    function reportDashboardError(
        type,
        message,
        extra
    ) {

        console.error(
            "[ROYAL DASHBOARD]",
            type,
            message,
            extra || ""
        );

        if (
            typeof window.reportAppError ===
            "function"
        ) {

            window.reportAppError(
                type,
                message,
                "js/dashboard.js",
                extra || {}
            );
        }
    }

    /* =====================================================
       LOAD ROOMS
    ===================================================== */

    function loadRooms() {

        try {

            const saved =
                localStorage.getItem(
                    ROOMS_KEY
                );

            if (!saved) {

                state.rooms =
                    DEFAULT_ROOMS.map(
                        function (room) {
                            return {
                                ...room
                            };
                        }
                    );

                localStorage.setItem(
                    ROOMS_KEY,
                    JSON.stringify(
                        state.rooms
                    )
                );

                return;
            }

            const rooms =
                JSON.parse(saved);

            if (
                Array.isArray(rooms)
            ) {

                state.rooms = rooms;

            } else {

                state.rooms =
                    DEFAULT_ROOMS.map(
                        function (room) {
                            return {
                                ...room
                            };
                        }
                    );
            }

        } catch (error) {

            reportDashboardError(
                "ROOM_DATA_ERROR",
                error?.message ||
                "Room data could not be loaded."
            );

            state.rooms =
                DEFAULT_ROOMS.map(
                    function (room) {
                        return {
                            ...room
                        };
                    }
                );
        }
    }

    /* =====================================================
       LOAD SETTINGS
    ===================================================== */

    function loadSettings() {

        const defaults = {

            adminName: "Admin",

            adminRole:
                "Administrator",

            hotelName:
                "Royal Palace Hotel"

        };

        try {

            const saved =
                localStorage.getItem(
                    SETTINGS_KEY
                );

            if (saved) {

                const parsed =
                    JSON.parse(saved);

                state.settings = {
                    ...defaults,
                    ...(parsed || {})
                };

            } else {

                state.settings =
                    defaults;
            }

        } catch (error) {

            state.settings =
                defaults;

            reportDashboardError(
                "SETTINGS_DATA_ERROR",
                error?.message ||
                "Settings could not be loaded."
            );
        }
    }

    /* =====================================================
       GET BOOKINGS
    ===================================================== */

    function loadBookingsFromSystem() {

        try {

            if (
                typeof window.getBookings ===
                "function"
            ) {

                const bookings =
                    window.getBookings();

                if (
                    Array.isArray(bookings)
                ) {

                    state.bookings =
                        bookings;

                    return;
                }
            }

            /*
             * Fallback:
             * If bookings.js has not loaded yet,
             * dashboard waits for the booking event.
             */

            state.bookings = [];

        } catch (error) {

            state.bookings = [];

            reportDashboardError(
                "BOOKING_DATA_ERROR",
                error?.message ||
                "Booking data could not be read."
            );
        }
    }

    /* =====================================================
       CALCULATE STATS
    ===================================================== */

    function calculateStats() {

        const totalRooms =
            state.rooms.length;

        const totalBookings =
            state.bookings.length;

        const confirmedBookings =
            state.bookings.filter(
                function (booking) {

                    return String(
                        booking.status ||
                        ""
                    ).toLowerCase() ===
                    "confirmed";
                }
            );

        const confirmedCount =
            confirmedBookings.length;

        const revenue =
            confirmedBookings.reduce(
                function (
                    total,
                    booking
                ) {

                    return (
                        total +
                        Number(
                            booking.total ||
                            0
                        )
                    );

                },
                0
            );

        return {
            totalRooms:
                totalRooms,

            totalBookings:
                totalBookings,

            confirmed:
                confirmedCount,

            revenue:
                revenue
        };
    }

    /* =====================================================
       UPDATE STAT CARDS
    ===================================================== */

    function updateStats() {

        const stats =
            calculateStats();

        const rooms =
            document.getElementById(
                "statRooms"
            );

        const bookings =
            document.getElementById(
                "statBookings"
            );

        const confirmed =
            document.getElementById(
                "statConfirmed"
            );

        const revenue =
            document.getElementById(
                "statRevenue"
            );

        if (rooms) {

            rooms.textContent =
                stats.totalRooms;
        }

        if (bookings) {

            bookings.textContent =
                stats.totalBookings;
        }

        if (confirmed) {

            confirmed.textContent =
                stats.confirmed;
        }

        if (revenue) {

            revenue.textContent =
                money(
                    stats.revenue
                );
        }
    }

    /* =====================================================
       UPDATE WELCOME AREA
    ===================================================== */

    function updateWelcome() {

        const adminName =
            document.getElementById(
                "welcomeAdminName"
            );

        const hotelName =
            document.getElementById(
                "welcomeHotelName"
            );

        const topName =
            document.getElementById(
                "topAdminName"
            );

        const topRole =
            document.getElementById(
                "topAdminRole"
            );

        const avatar =
            document.getElementById(
                "topProfileAvatar"
            );

        if (adminName) {

            adminName.textContent =
                state.settings.adminName ||
                "Admin";
        }

        if (hotelName) {

            hotelName.textContent =
                state.settings.hotelName ||
                "Royal Palace Hotel";
        }

        if (topName) {

            topName.textContent =
                state.settings.adminName ||
                "Admin";
        }

        if (topRole) {

            topRole.textContent =
                state.settings.adminRole ||
                "Administrator";
        }

        if (avatar) {

            const name =
                state.settings.adminName ||
                "Admin";

            avatar.textContent =
                name
                    .trim()
                    .charAt(0)
                    .toUpperCase() ||
                "A";
        }
    }

    /* =====================================================
       RECENT BOOKINGS
    ===================================================== */

    function renderRecentBookings() {

        const box =
            document.getElementById(
                "recentBookings"
            );

        if (!box) {
            return;
        }

        const recent =
            [...state.bookings]
                .slice()
                .sort(
                    function (a, b) {

                        const dateA =
                            new Date(
                                a.created_at ||
                                a.checkin ||
                                0
                            ).getTime();

                        const dateB =
                            new Date(
                                b.created_at ||
                                b.checkin ||
                                0
                            ).getTime();

                        return dateB - dateA;
                    }
                )
                .slice(0, 5);

        if (!recent.length) {

            box.innerHTML = `
                <div style="
                    padding:30px;
                    text-align:center;
                    color:#777;
                ">

                    <div style="
                        font-size:35px;
                    ">
                        📭
                    </div>

                    <p>
                        No bookings available.
                    </p>

                </div>
            `;

            return;
        }

        let html = "";

        recent.forEach(
            function (booking) {

                const status =
                    booking.status ||
                    "Pending";

                const statusClass =
                    String(status)
                        .toLowerCase();

                html += `

                    <div style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:15px;
                        padding:15px 0;
                        border-bottom:1px solid #eee;
                    ">

                        <div style="
                            min-width:0;
                            flex:1;
                        ">

                            <div style="
                                font-weight:800;
                                color:#111827;
                            ">
                                ${escapeHTML(
                                    getGuestName(
                                        booking
                                    )
                                )}
                            </div>

                            <div style="
                                margin-top:4px;
                                font-size:13px;
                                color:#777;
                            ">
                                ${escapeHTML(
                                    booking.room ||
                                    "-"
                                )}
                                •
                                ${formatDate(
                                    booking.checkin
                                )}
                            </div>

                        </div>

                        <div style="
                            text-align:right;
                            white-space:nowrap;
                        ">

                            <div style="
                                font-weight:800;
                            ">
                                ${money(
                                    booking.total
                                )}
                            </div>

                            <span class="
                                status-badge
                                ${statusClass}
                            ">
                                ${escapeHTML(
                                    status
                                )}
                            </span>

                        </div>

                    </div>
                `;
            }
        );

        box.innerHTML =
            html;
    }

    /* =====================================================
       ROOM OVERVIEW
    ===================================================== */

    function renderRoomOverview() {

        const box =
            document.getElementById(
                "roomOverview"
            );

        if (!box) {
            return;
        }

        if (!state.rooms.length) {

            box.innerHTML = `
                <div style="
                    padding:30px;
                    text-align:center;
                    color:#777;
                ">
                    🏨 No rooms available.
                </div>
            `;

            return;
        }

        const total =
            state.rooms.length;

        const available =
            state.rooms.filter(
                function (room) {

                    return String(
                        room.status ||
                        ""
                    ).toLowerCase() ===
                    "available";
                }
            ).length;

        const booked =
            total - available;

        box.innerHTML = `

            <div style="
                display:grid;
                grid-template-columns:
                    repeat(3,1fr);
                gap:12px;
                margin-bottom:18px;
            ">

                <div style="
                    padding:15px;
                    background:#f8fafc;
                    border-radius:12px;
                    text-align:center;
                ">

                    <div style="
                        font-size:12px;
                        color:#777;
                    ">
                        Total
                    </div>

                    <strong style="
                        display:block;
                        margin-top:5px;
                        font-size:22px;
                    ">
                        ${total}
                    </strong>

                </div>

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
  
