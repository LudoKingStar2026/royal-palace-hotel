/* =========================================================
   ROYAL PALACE HOTEL
   ROOM MANAGEMENT SYSTEM
   CENTRAL CONNECTED VERSION
   VERSION: 7.0
   ========================================================= */

(function () {
    "use strict";

    const ROOMS_KEY = "royal_palace_rooms";
    const VERSION = "7.0";

    let rooms = [];
    let searchTerm = "";

    window.__ROYAL_ROOMS_SCRIPT_LOADED__ = true;
    window.__ROYAL_ROOMS_VERSION__ = VERSION;

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

    function reportError(type, message, extra) {
        console.error(
            "[ROYAL ROOMS]",
            type,
            message,
            extra || ""
        );

        if (typeof window.reportAppError === "function") {
            window.reportAppError(
                type,
                message,
                "js/rooms.js",
                extra || {}
            );
        }
    }

    function money(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN");
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function createId() {
        return (
            "ROOM" +
            Date.now().toString().slice(-8)
        );
    }

    /* =====================================================
       LOAD ROOMS
    ===================================================== */

    function loadRooms() {
        try {
            const saved =
                localStorage.getItem(ROOMS_KEY);

            if (!saved) {
                rooms = DEFAULT_ROOMS.map(
                    room => ({ ...room })
                );

                saveRooms();
                return;
            }

            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                rooms = parsed;
            } else {
                rooms = DEFAULT_ROOMS.map(
                    room => ({ ...room })
                );
                saveRooms();
            }

        } catch (error) {
            reportError(
                "ROOM_LOAD_ERROR",
                error?.message ||
                "Rooms could not be loaded."
            );

            rooms = DEFAULT_ROOMS.map(
                room => ({ ...room })
            );
        }
    }

    /* =====================================================
       SAVE ROOMS
    ===================================================== */

    function saveRooms() {
        try {
            localStorage.setItem(
                ROOMS_KEY,
                JSON.stringify(rooms)
            );

            document.dispatchEvent(
                new CustomEvent(
                    "royalRoomsUpdated"
                )
            );

        } catch (error) {
            reportError(
                "ROOM_SAVE_ERROR",
                error?.message ||
                "Rooms could not be saved."
            );
        }
    }

    /* =====================================================
       UPDATE ROOM STATS
    ===================================================== */

    function updateRoomStats() {

        const total =
            rooms.length;

        const available =
            rooms.filter(
                room =>
                    String(room.status)
                        .toLowerCase() ===
                    "available"
            ).length;

        const booked =
            rooms.filter(
                room =>
                    String(room.status)
                        .toLowerCase() ===
                    "booked"
            ).length;

        const average =
            total
                ? Math.round(
                    rooms.reduce(
                        (sum, room) =>
                            sum +
                            Number(
                                room.price || 0
                            ),
                        0
                    ) / total
                )
                : 0;

        const totalEl =
            document.getElementById(
                "roomTotal"
            );

        const availableEl =
            document.getElementById(
                "roomAvailable"
            );

        const bookedEl =
            document.getElementById(
                "roomBooked"
            );

        const averageEl =
            document.getElementById(
                "roomAverage"
            );

        if (totalEl) {
            totalEl.textContent = total;
        }

        if (availableEl) {
            availableEl.textContent =
                available;
        }

        if (bookedEl) {
            bookedEl.textContent =
                booked;
        }

        if (averageEl) {
            averageEl.textContent =
                money(average);
        }
    }

    /* =====================================================
       RENDER ROOMS
    ===================================================== */

    function renderRooms() {

        const grid =
            document.getElementById(
                "roomsGrid"
            );

        if (!grid) {
            return;
        }

        const filtered =
            rooms.filter(
                room => {

                    if (!searchTerm) {
                        return true;
                    }

                    const text = [
                        room.name,
                        room.number,
                        room.type,
                        room.status
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return text.includes(
                        searchTerm
                    );
                }
            );

        if (!filtered.length) {

            grid.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    padding:50px;
                    text-align:center;
                    color:#777;
                ">
                    <div style="
                        font-size:42px;
                    ">
                        🔍
                    </div>

                    <h3>
                        No rooms found
                    </h3>

                    <p>
                        Try another room name or number.
                    </p>
                </div>
            `;

            return;
        }

        grid.innerHTML =
            filtered.map(
                function (room) {

                    const booked =
                        String(
                            room.status
                        ).toLowerCase() ===
                        "booked";

                    return `
                        <div class="room-card">

                            <div class="room-card-top">

                                <div class="room-icon">
                                    🏨
                                </div>

                                <span
                                    class="status-badge ${
                                        booked
                                        ? "cancelled"
                                        : "confirmed"
                                    }"
                                >
                                    ${
                                        booked
                                        ? "Booked"
                                        : "Available"
                                    }
                                </span>

                            </div>

                            <h3>
                                ${escapeHTML(
                                    room.name ||
                                    "Room"
                                )}
                            </h3>

                            <p>
                                Room ${
                                    escapeHTML(
                                        room.number ||
                                        "-"
                                    )
                                }
                            </p>

                            <div style="
                                margin-top:14px;
                                font-size:13px;
                                color:#777;
                            ">
                                Type:
                                <strong>
                                    ${escapeHTML(
                                        room.type ||
                                        "-"
                                    )}
                                </strong>
                            </div>

                            <div style="
                                margin-top:8px;
                                font-size:18px;
                                font-weight:800;
                            ">
                                ${money(
                                    room.price
                                )}
                                <span style="
                                    font-size:12px;
                                    color:#777;
                                    font-weight:400;
                                ">
                                    / night
                                </span>
                            </div>

                            <div style="
                                display:flex;
                                gap:8px;
                                margin-top:18px;
                            ">

                                <button
                                    type="button"
                                    class="secondary-btn"
                                    onclick="editRoom('${escapeHTML(
                                        room.id
                                    )}')"
                                    style="
                                        flex:1;
                                    "
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    type="button"
                                    class="secondary-btn"
                                    onclick="toggleRoomStatus('${escapeHTML(
                                        room.id
                                    )}')"
                                    style="
                                        flex:1;
                                    "
                                >
                                    🔄 ${
                                        booked
                                        ? "Available"
                                        : "Booked"
                                    }
                                </button>

                            </div>

                            <button
                                type="button"
                                onclick="deleteRoom('${escapeHTML(
                                    room.id
                                )}')"
                                style="
                                    width:100%;
                                    margin-top:8px;
                                    padding:10px;
                                    border:0;
                                    border-radius:10px;
                                    background:#fee2e2;
                                    color:#b91c1c;
                                    font-weight:700;
                                    cursor:pointer;
                                "
                            >
                                🗑️ Delete Room
                            </button>

                        </div>
                    `;
                }
            ).join("");
    }

    /* =====================================================
       UPDATE PAGE
    ===================================================== */

    function updateRoomsPage() {
        loadRooms();
        updateRoomStats();
        renderRooms();
    }

    /* =====================================================
       SEARCH
    ===================================================== */

    function searchRooms(value) {

        searchTerm =
            String(value || "")
                .trim()
                .toLowerCase();

        renderRooms();
    }

    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openRoomModal(id) {

        const modal =
            document.getElementById(
                "roomModal"
            );

        const form =
            document.getElementById(
                "roomForm"
            );

        if (!modal) {
            return;
        }

        if (form) {
            form.reset();
        }

        const roomId =
            document.getElementById(
                "roomId"
            );

        const title =
            document.getElementById(
                "roomModalTitle"
            );

        if (roomId) {
            roomId.value =
                id || "";
        }

        if (title) {
            title.textContent =
                id
                ? "Edit Room"
                : "Add New Room";
        }

        if (id) {

            const room =
                rooms.find(
                    item =>
                        item.id === id
                );

            if (!room) {
                return;
            }

            const name =
                document.getElementById(
                    "roomName"
                );

            const number =
                document.getElementById(
                    "roomNumber"
                );

            const price =
                document.getElementById(
                    "roomPrice"
                );

            const type =
                document.getElementById(
                    "roomType"
                );

            const status =
                document.getElementById(
                    "roomStatus"
                );

            if (name) {
                name.value =
                    room.name || "";
            }

            if (number) {
                number.value =
                    room.number || "";
            }

            if (price) {
                price.value =
                    room.price || 0;
            }

            if (type) {
                type.value =
                    room.type || "Premium";
            }

            if (status) {
                status.value =
                    room.status ||
                    "available";
            }
        }

        modal.classList.add(
            "modal-open"
        );
    }

    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeRoomModal() {

        const modal =
            document.getElementById(
                "roomModal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "modal-open"
        );
    }

    function closeRoomModalOnOverlay(
        event
    ) {

        if (
            event &&
            event.target ===
            event.currentTarget
        ) {
            closeRoomModal();
        }
    }

    /* =====================================================
       SAVE ROOM
    ===================================================== */

    function saveRoom(event) {

        if (event) {
            event.preventDefault();
        }

        const id =
            document.getElementById(
                "roomId"
            )?.value.trim();

        const name =
            document.getElementById(
                "roomName"
            )?.value.trim();

        const number =
            document.getElementById(
                "roomNumber"
            )?.value.trim();

        const price =
            Number(
                document.getElementById(
                    "roomPrice"
                )?.value || 0
            );

        const type =
            document.getElementById(
                "roomType"
            )?.value ||
            "Premium";

        const status =
            document.getElementById(
                "roomStatus"
            )?.value ||
            "available";

        if (!name || !number) {

            alert(
                "Please enter room name and room number."
            );

            return;
        }

        if (price < 0) {

            alert(
                "Room price cannot be negative."
            );

            return;
        }

        if (id) {

            const room =
                rooms.find(
                    item =>
                        item.id === id
                );

            if (!room) {

                alert(
                    "Room not found."
                );

                return;
            }

            room.name =
                name;

            room.number =
                number;

            room.price =
                price;

            room.type =
                type;

            room.status =
                status;

        } else {

            rooms.push({

                id:
                    createId(),

                name:
                    name,

                number:
                    number,

                type:
                    type,

                price:
                    price,

                status:
                    status
            });
        }

        saveRooms();

        closeRoomModal();

        updateRoomsPage();

        if (
            typeof window.updateDashboard ===
            "function"
        ) {
            window.updateDashboard();
        }
    }

    /* ===============
