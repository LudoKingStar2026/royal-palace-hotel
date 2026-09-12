(function () {
    "use strict";

    /* =========================================================
       ROYAL PALACE HOTEL
       ROOM MANAGEMENT MODULE V8.0
       ========================================================= */

    const VERSION = "8.0";
    const STORAGE_KEY = "royal_palace_rooms";

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

    let rooms = [];

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
            return "₹" + number.toLocaleString("en-IN");
        } catch (error) {
            return "₹" + number;
        }
    }

    function reportError(error) {
        console.error("[Rooms]", error);

        try {
            if (typeof window.reportAppError === "function") {
                window.reportAppError(error, "Rooms");
            }
        } catch (ignored) {}
    }

    function getRoomId(room) {
        return room.id || room.room_id || room.roomId || "";
    }

    function getRoomName(room) {
        return (
            room.name ||
            room.room ||
            room.room_name ||
            getRoomId(room) ||
            "Room"
        );
    }

    function getRoomType(room) {
        return (
            room.type ||
            room.room_type ||
            "Standard"
        );
    }

    function getRoomPrice(room) {
        return Number(
            room.price ||
            room.price_per_night ||
            room.rate ||
            0
        ) || 0;
    }

    function getRoomStatus(room) {
        return String(
            room.status || "available"
        ).toLowerCase();
    }

    /* =========================================================
       STORAGE
       ========================================================= */

    function loadRooms() {
        try {
            const saved =
                localStorage.getItem(STORAGE_KEY);

            if (saved) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    rooms = parsed;
                    return rooms;
                }
            }
        } catch (error) {
            reportError(error);
        }

        rooms = DEFAULT_ROOMS.map(function (room) {
            return Object.assign({}, room);
        });

        saveRooms(false);

        return rooms;
    }

    function saveRooms(dispatchEvent) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(rooms)
            );
        } catch (error) {
            reportError(error);
        }

        if (dispatchEvent !== false) {
            try {
                document.dispatchEvent(
                    new CustomEvent(
                        "royalRoomsChanged",
                        {
                            detail: {
                                rooms: rooms
                            }
                        }
                    )
                );
            } catch (ignored) {}
        }

        try {
            if (
                typeof window.updateDashboard ===
                "function"
            ) {
                window.updateDashboard();
            }
        } catch (ignored) {}
    }

    /* =========================================================
       ROOM MODAL
       ========================================================= */

    function getModal() {
        return (
            document.getElementById(
                "roomModal"
            ) ||
            document.getElementById(
                "addRoomModal"
            )
        );
    }

    function openRoomModal(roomId) {
        const modal = getModal();

        if (!modal) {
            console.warn(
                "Room modal not found."
            );
            return;
        }

        const title =
            document.getElementById(
                "roomModalTitle"
            );

        const idInput =
            document.getElementById(
                "roomId"
            );

        const nameInput =
            document.getElementById(
                "roomName"
            );

        const typeInput =
            document.getElementById(
                "roomType"
            );

        const priceInput =
            document.getElementById(
                "roomPrice"
            );

        const statusInput =
            document.getElementById(
                "roomStatus"
            );

        if (roomId) {
            const room =
                rooms.find(function (item) {
                    return (
                        getRoomId(item) ===
                        roomId
                    );
                });

            if (!room) return;

            if (title) {
                title.textContent =
                    "Edit Room";
            }

            if (idInput) {
                idInput.value =
                    getRoomId(room);
                idInput.readOnly = true;
            }

            if (nameInput) {
                nameInput.value =
                    getRoomName(room);
            }

            if (typeInput) {
                typeInput.value =
                    getRoomType(room);
            }

            if (priceInput) {
                priceInput.value =
                    getRoomPrice(room);
            }

            if (statusInput) {
                statusInput.value =
                    getRoomStatus(room);
            }
        } else {
            if (title) {
                title.textContent =
                    "Add New Room";
            }

            if (idInput) {
                idInput.value =
                    generateRoomId();
                idInput.readOnly = false;
            }

            if (nameInput) {
                nameInput.value = "";
            }

            if (typeInput) {
                typeInput.value =
                    "Premium";
            }

            if (priceInput) {
                priceInput.value = "";
            }

            if (statusInput) {
                statusInput.value =
                    "available";
            }
        }

        modal.classList.add(
            "modal-open"
        );

        modal.style.display = "flex";
    }

    function closeRoomModal() {
        const modal = getModal();

        if (!modal) return;

        modal.classList.remove(
            "modal-open"
        );

        modal.style.display = "none";
    }

    function closeRoomModalOnOverlay(event) {
        const modal = getModal();

        if (
            modal &&
            event.target === modal
        ) {
            closeRoomModal();
        }
    }

    /* =========================================================
       ID GENERATOR
       ========================================================= */

    function generateRoomId() {
        let number = rooms.length + 1;
        let id = "";

        do {
            id =
                "ROOM" +
                String(number).padStart(
                    3,
                    "0"
                );

            number++;
        } while (
            rooms.some(function (room) {
                return (
                    getRoomId(room) === id
                );
            })
        );

        return id;
    }

    /* =========================================================
       SAVE / UPDATE ROOM
       ========================================================= */

    function saveRoom() {
        try {
            const idInput =
                document.getElementById(
                    "roomId"
                );

            const nameInput =
                document.getElementById(
                    "roomName"
                );

            const typeInput =
                document.getElementById(
                    "roomType"
                );

            const priceInput =
                document.getElementById(
                    "roomPrice"
                );

            const statusInput =
                document.getElementById(
                    "roomStatus"
                );

            const id =
                idInput &&
                idInput.value.trim()
                    ? idInput.value.trim()
                    : generateRoomId();

            const name =
                nameInput &&
                nameInput.value.trim();

            const type =
                typeInput &&
                typeInput.value.trim()
                    ? typeInput.value.trim()
                    : "Standard";

            const price =
                Number(
                    priceInput &&
                    priceInput.value
                ) || 0;

            const status =
                statusInput &&
                statusInput.value
                    ? statusInput.value
                    : "available";

            if (!name) {
                alert(
                    "Please enter room name."
                );
                return false;
            }

            const existingIndex =
                rooms.findIndex(
                    function (room) {
                        return (
                            getRoomId(room) ===
                            id
                        );
                    }
                );

            const room = {
                id: id,
                name: name,
                type: type,
                price: price,
                status:
                    String(status)
                        .toLowerCase()
                        === "booked"
                        ? "booked"
                        : "available"
            };

            if (existingIndex >= 0) {
                rooms[existingIndex] =
                    room;
            } else {
                rooms.push(room);
            }

            saveRooms(true);
            renderRooms();

            closeRoomModal();

            return true;
        } catch (error) {
            reportError(error);
            return false;
        }
    }

    /* =========================================================
       EDIT ROOM
       ========================================================= */

    function editRoom(roomId) {
        openRoomModal(roomId);
    }

    /* =========================================================
       TOGGLE ROOM STATUS
       ========================================================= */

    function toggleRoomStatus(roomId) {
        const index =
            rooms.findIndex(
                function (room) {
                    return (
                        getRoomId(room) ===
                        roomId
                    );
                }
            );

        if (index < 0) return;

        const current =
            getRoomStatus(
                rooms[index]
            );

        rooms[index].status =
            current === "booked"
                ? "available"
                : "booked";

        saveRooms(true);
        renderRooms();
    }

    /* =========================================================
       DELETE ROOM
       ========================================================= */

    function deleteRoom(roomId) {
        const room =
            rooms.find(function (item) {
                return (
                    getRoomId(item) ===
                    roomId
                );
            });

        if (!room) return;

        const confirmed =
            window.confirm(
                "Delete " +
                    getRoomName(room) +
                    "?"
            );

        if (!confirmed) return;

        rooms =
            rooms.filter(
                function (item) {
                    return (
                        getRoomId(item) !==
                        roomId
                    );
                }
            );

        saveRooms(true);
        renderRooms();
    }

    /* =========================================================
       SEARCH
       ========================================================= */

    function searchRooms(value) {
        const search =
            String(value || "")
                .trim()
                .toLowerCase();

        const filtered =
            rooms.filter(
                function (room) {
                    if (!search) {
                        return true;
                    }

                    const text =
                        [
                            getRoomId(room),
                            getRoomName(room),
                            getRoomType(room),
                            getRoomStatus(room),
                            getRoomPrice(room)
                        ]
                            .join(" ")
                            .toLowerCase();

                    return text.includes(
                        search
                    );
                }
            );

        renderRooms(filtered);
    }

    /* =========================================================
       ROOM CARD
       ========================================================= */

    function createRoomCard(room) {
        const id =
            getRoomId(room);

        const name =
            getRoomName(room);

        const type =
            getRoomType(room);

        const price =
            getRoomPrice(room);

        const status =
            getRoomStatus(room);

        const isBooked =
            status === "booked";

        const statusText =
            isBooked
                ? "Booked"
                : "Available";

        const statusBg =
            isBooked
                ? "#fff1f2"
                : "#ecfdf5";

        const statusColor =
            isBooked
                ? "#e11d48"
                : "#16a34a";

        return `
            <div
                class="room-card"
                data-room-id="${escapeHTML(id)}"
                style="
                    background:#fff;
                    border:1px solid #eee;
                    border-radius:16px;
                    padding:18px;
                    margin-bottom:15px;
                    box-shadow:0 4px 14px rgba(0,0,0,.05);
                "
            >

                <div style="
                    display:flex;
                    align-items:flex-start;
                    justify-content:space-between;
                    gap:12px;
                ">

                    <div style="
                        min-width:0;
                        flex:1;
                    ">

                        <div style="
                            font-size:17px;
                            font-weight:700;
                            color:#222;
                        ">
                            ${escapeHTML(name)}
                        </div>

                        <div style="
                            margin-top:5px;
                            color:#777;
                            font-size:13px;
                        ">
                            ${escapeHTML(id)}
                        </div>

                    </div>

                    <span style="
                        padding:7px 11px;
                        border-radius:20px;
                        background:${statusBg};
                        color:${statusColor};
                        font-size:12px;
                        font-weight:700;
                        white-space:nowrap;
                    ">
                        ${statusText}
                    </span>

                </div>

                <div style="
                    display:grid;
                    grid-template-columns:
                        repeat(2,minmax(0,1fr));
                    gap:10px;
                    margin-top:18px;
                ">

                    <div style="
                        padding:12px;
                        background:#f8f7ff;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:11px;
                            color:#777;
                        ">
                            Room Type
                        </div>

                        <strong style="
                            display:block;
                            margin-top:4px;
                            color:#333;
                        ">
                            ${escapeHTML(type)}
                        </strong>
                    </div>

                    <div style="
                        padding:12px;
                        background:#f8f7ff;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:11px;
                            color:#777;
                        ">
                            Price / Night
                        </div>

                        <strong style="
                            display:block;
                            margin-top:4px;
                            color:#333;
                        ">
                            ${money(price)}
                        </strong>
                    </div>

                </div>

                <div style="
                    display:flex;
                    flex-wrap:wrap;
                    gap:8px;
                    margin-top:15px;
                ">

                    <button
                        type="button"
                        onclick="editRoom('${escapeHTML(id)}')"
                        style="
                            border:0;
                            background:#f3f0ff;
                            color:#6d28d9;
                            padding:9px 12px;
                            border-radius:9px;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        onclick="toggleRoomStatus('${escapeHTML(id)}')"
                        style="
                            border:0;
       background:#f1f5f9;
        color:#334155;
        padding:9px 12px;
        border-radius:9px;
        font-weight:700;
        cursor:pointer;
    "
>
    🔄 Status
</button>

<button
    type="button"
    onclick="deleteRoom('${escapeHTML(id)}')"
    style="
        border:0;
        background:#fff1f2;
        color:#e11d48;
        padding:9px 12px;
        border-radius:9px;
        font-weight:700;
        cursor:pointer;
    "
>
    🗑️ Delete
</button>

</div>

</div>
`;
}

/* =========================================================
   RENDER ROOMS
   ========================================================= */

function renderRooms(list) {
    const container =
        document.getElementById("roomsList") ||
        document.getElementById("roomList") ||
        document.getElementById("roomsContainer");

    if (!container) {
        return;
    }

    const data =
        Array.isArray(list)
            ? list
            : rooms;

    if (!data.length) {
        container.innerHTML = `
            <div style="
                padding:35px;
                text-align:center;
                color:#777;
            ">
                No rooms found.
            </div>
        `;

        updateRoomCounters();
        return;
    }

    let html = "";

    data.forEach(function (room) {
        html += createRoomCard(room);
    });

    container.innerHTML = html;

    updateRoomCounters();
}

/* =========================================================
   COUNTERS
   ========================================================= */

function updateRoomCounters() {
    const total = rooms.length;

    const available =
        rooms.filter(function (room) {
            return getRoomStatus(room) !== "booked";
        }).length;

    const booked =
        rooms.filter(function (room) {
            return getRoomStatus(room) === "booked";
        }).length;

    const totalEl =
        document.getElementById("totalRooms") ||
        document.getElementById("roomCount");

    const availableEl =
        document.getElementById("availableRooms");

    const bookedEl =
        document.getElementById("bookedRooms");

    if (totalEl) {
        totalEl.textContent = total;
    }

    if (availableEl) {
        availableEl.textContent = available;
    }

    if (bookedEl) {
        bookedEl.textContent = booked;
    }
}

/* =========================================================
   UPDATE ROOM PAGE
   ========================================================= */

function updateRoomsPage() {
    loadRooms();
    renderRooms();
    updateRoomCounters();
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initRoomEvents() {
    const searchInput =
        document.getElementById("roomSearch");

    if (
        searchInput &&
        !searchInput.dataset.roomsBound
    ) {
        searchInput.dataset.roomsBound = "true";

        searchInput.addEventListener(
            "input",
            function () {
                searchRooms(this.value);
            }
        );
    }

    const modal = getModal();

    if (
        modal &&
        !modal.dataset.overlayBound
    ) {
        modal.dataset.overlayBound = "true";

        modal.addEventListener(
            "click",
            closeRoomModalOnOverlay
        );
    }
}

/* =========================================================
   PUBLIC API
   ========================================================= */

window.openRoomModal = openRoomModal;
window.closeRoomModal = closeRoomModal;
window.closeRoomModalOnOverlay =
    closeRoomModalOnOverlay;

window.saveRoom = saveRoom;
window.editRoom = editRoom;
window.toggleRoomStatus =
    toggleRoomStatus;

window.deleteRoom = deleteRoom;
window.searchRooms = searchRooms;
window.updateRoomsPage =
    updateRoomsPage;

window.renderRooms = renderRooms;

window.getRooms = function () {
    return rooms.slice();
};

window.getRoomById = function (roomId) {
    return (
        rooms.find(function (room) {
            return getRoomId(room) === roomId;
        }) || null
    );
};

window.reloadRooms = function () {
    loadRooms();
    renderRooms();
    updateRoomCounters();
};

window.ROYAL_ROOMS =
    window.ROYAL_ROOMS || {};

window.ROYAL_ROOMS.version =
    VERSION;

window.ROYAL_ROOMS.getAll =
    function () {
        return rooms.slice();
    };

/* =========================================================
   START
   ========================================================= */

function startRooms() {
    loadRooms();
    initRoomEvents();
    renderRooms();
    updateRoomCounters();
}

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        startRooms,
        { once: true }
    );
} else {
    startRooms();
}

})();
                        
       
