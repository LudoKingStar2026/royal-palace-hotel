(function () {
    "use strict";

    /*
     * =========================================================
     * ROYAL PALACE HOTEL
     * ROOM MANAGEMENT
     * CLOUD VERSION 10.0
     *
     * Admin Room Management
     *        ↓
     * Supabase hotel_rooms
     *        ↓
     * User Website
     * =========================================================
     */

    const VERSION = "10.0";

    const STORAGE_KEY =
        "royal_palace_rooms";

    const CLOUD_INIT_KEY =
        "royal_palace_rooms_cloud_initialized_v10";

    const SUPABASE_URL =
        "https://mvvfqkcgaxcipjkiyuae.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_YbyO8KHdQxXyv6afqJZfWg_Eu2aw57x";

    let rooms = [];
    let editingRoomId = null;
    let supabaseClient = null;
    let cloudReady = false;
    let cloudLoading = false;

    /*
     * ---------------------------------------------------------
     * DEFAULT ROOMS
     * ---------------------------------------------------------
     */

    const DEFAULT_ROOMS = [
        {
            id: "ROOM001",
            number: "101",
            name: "Premium Room 101",
            type: "Premium",
            price: 2500,
            status: "available"
        },
        {
            id: "ROOM002",
            number: "102",
            name: "Premium Room 102",
            type: "Premium",
            price: 2500,
            status: "booked"
        },
        {
            id: "ROOM003",
            number: "103",
            name: "Deluxe Room 103",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },
        {
            id: "ROOM004",
            number: "104",
            name: "Deluxe Room 104",
            type: "Deluxe",
            price: 3000,
            status: "available"
        },
        {
            id: "ROOM005",
            number: "201",
            name: "Royal Suite 201",
            type: "Suite",
            price: 4500,
            status: "booked"
        },
        {
            id: "ROOM006",
            number: "202",
            name: "Royal Suite 202",
            type: "Suite",
            price: 4500,
            status: "available"
        },
        {
            id: "ROOM007",
            number: "301",
            name: "Royal Palace Suite 301",
            type: "Suite",
            price: 6500,
            status: "available"
        },
        {
            id: "ROOM008",
            number: "302",
            name: "Royal Palace Suite 302",
            type: "Suite",
            price: 6500,
            status: "booked"
        }
    ];

    /*
     * ---------------------------------------------------------
     * HELPERS
     * ---------------------------------------------------------
     */

    function reportError(error) {
        console.error(
            "[Royal Rooms]",
            error
        );

        try {
            if (
                typeof window.reportAppError ===
                "function"
            ) {
                window.reportAppError(
                    "ROOMS",
                    error &&
                    error.message
                        ? error.message
                        : String(error),
                    "rooms.js"
                );
            }
        } catch (ignored) {}
    }

    function escapeHTML(value) {
        return String(
            value == null ? "" : value
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function money(value) {
        const n =
            Number(value) || 0;

        try {
            return (
                "₹" +
                n.toLocaleString(
                    "en-IN"
                )
            );
        } catch (e) {
            return "₹" + n;
        }
    }

    function getRoomId(room) {
        return String(
            room.id ||
            room.room_id ||
            room.roomId ||
            ""
        );
    }

    function getRoomNumber(room) {
        return String(
            room.number ||
            room.room_number ||
            room.roomNumber ||
            ""
        );
    }

    function getRoomName(room) {
        return String(
            room.name ||
            room.room_name ||
            room.room ||
            "Room"
        );
    }

    function getRoomType(room) {
        return String(
            room.type ||
            room.room_type ||
            "Standard"
        );
    }

    function getRoomPrice(room) {
        return (
            Number(
                room.price ??
                room.price_per_night ??
                room.rate ??
                0
            ) || 0
        );
    }

    function getRoomStatus(room) {
        const value =
            String(
                room.status ||
                "available"
            ).toLowerCase();

        return value === "booked"
            ? "booked"
            : "available";
    }

    function normalizeRoom(
        room,
        index
    ) {
        return {
            id:
                getRoomId(room) ||
                "ROOM" +
                    String(
                        index + 1
                    ).padStart(3, "0"),

            number:
                getRoomNumber(room) ||
                String(
                    index + 101
                ),

            name:
                getRoomName(room),

            type:
                getRoomType(room),

            price:
                getRoomPrice(room),

            status:
                getRoomStatus(room)
        };
    }

    /*
     * ---------------------------------------------------------
     * SUPABASE CLIENT
     * ---------------------------------------------------------
     */

    async function loadSupabaseSDK() {

        if (
            window.supabase &&
            typeof window.supabase
                .createClient ===
                "function"
        ) {
            return true;
        }

        return new Promise(
            function (resolve) {

                const old =
                    document.querySelector(
                        'script[data-royal-supabase="1"]'
                    );

                if (old) {
                    old.addEventListener(
                        "load",
                        function () {
                            resolve(
                                !!(
                                    window.supabase &&
                                    window.supabase
                                        .createClient
                                )
                            );
                        },
                        {
                            once: true
                        }
                    );

                    old.addEventListener(
                        "error",
                        function () {
                            resolve(false);
                        },
                        {
                            once: true
                        }
                    );

                    return;
                }

                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

                script.async = true;

                script.dataset.royalSupabase =
                    "1";

                script.onload =
                    function () {
                        resolve(
                            !!(
                                window.supabase &&
                                window.supabase
                                    .createClient
                            )
                        );
                    };

                script.onerror =
                    function () {
                        resolve(false);
                    };

                document.head.appendChild(
                    script
                );
            }
        );
    }

    async function getSupabase() {

        if (supabaseClient) {
            return supabaseClient;
        }

        try {

            const loaded =
                await loadSupabaseSDK();

            if (!loaded) {
                return null;
            }

            supabaseClient =
                window.supabase
                    .createClient(
                        SUPABASE_URL,
                        SUPABASE_KEY
                    );

            return supabaseClient;

        } catch (error) {

            reportError(error);

            return null;
        }
    }

    /*
     * ---------------------------------------------------------
     * LOCAL STORAGE
     * ---------------------------------------------------------
     */

    function getLocalRooms() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (saved) {

                const parsed =
                    JSON.parse(saved);

                if (
                    Array.isArray(parsed)
                ) {

                    return parsed.map(
                        normalizeRoom
                    );
                }
            }

        } catch (error) {
            reportError(error);
        }

        return DEFAULT_ROOMS.map(
            function (room) {
                return Object.assign(
                    {},
                    room
                );
            }
        );
    }

    function saveLocalRooms() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    rooms
                )
            );

        } catch (error) {
            reportError(error);
        }
    }

    /*
     * ---------------------------------------------------------
     * CLOUD READ
     * ---------------------------------------------------------
     */

    async function loadRoomsFromCloud() {

        const db =
            await getSupabase();

        if (!db) {
            return null;
        }

        try {

            const result =
                await db
                    .from(
                        "hotel_rooms"
                    )
                    .select(
                        "room_id,room_number,room_name,room_type,price,status,image_url,description"
                    )
                    .order(
                        "room_number",
                        {
                            ascending:
                                true
                        }
                    );

            if (result.error) {
                throw result.error;
            }

            const data =
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];

            return data.map(
                function (row) {

                    return normalizeRoom(
                        {
                            id:
                                row.room_id,

                            number:
                                row.room_number,

                            name:
                                row.room_name,

                            type:
                                row.room_type,

                            price:
                                row.price,

                            status:
                                row.status
                        }
                    );
                }
            );

        } catch (error) {

            reportError(error);

            return null;
        }
    }

    /*
     * ---------------------------------------------------------
     * CLOUD WRITE
     * ---------------------------------------------------------
     */

    async function upsertRoomToCloud(room) {
    const db = await getSupabase();

    if (!db) {
        reportError(new Error("Supabase client not available"));
        return false;
    }

    try {
        const row = {
            room_id: getRoomId(room),
            room_number: getRoomNumber(room),
            room_name: getRoomName(room),
            room_type: getRoomType(room),
            price: getRoomPrice(room),
            status: getRoomStatus(room)
        };

        const result = await db
            .from("hotel_rooms")
            .upsert(row, {
                onConflict: "room_id"
            })
            .select();

        if (result.error) {
            throw result.error;
        }

        console.log(
            "[Royal Rooms] Cloud room saved:",
            row.room_id
        );

        return true;

    } catch (error) {
        reportError(error);

        showRoomToast(
            "Cloud save failed: " +
            (
                error && error.message
                    ? error.message
                    : "Please check Supabase access."
            )
        );

        return false;
    }
    }

    async function deleteRoomFromCloud(
        roomId
    ) {

        const db =
            await getSupabase();

        if (!db) {
            return false;
        }

        try {

            const result =
                await db
                    .from(
                        "hotel_rooms"
                    )
                    .delete()
                    .eq(
                        "room_id",
                        String(
                            roomId
                        )
                    );

            if (result.error) {
                throw result.error;
            }

            return true;

        } catch (error) {

            reportError(error);

            return false;
        }
    }

    async function saveAllRoomsToCloud() {

        const db =
            await getSupabase();

        if (!db) {
            return false;
        }

        try {

            const rows =
                rooms.map(
                    function (room) {

                        return {
                            room_id:
                                getRoomId(
                                    room
                                ),

                            room_number:
                                getRoomNumber(
                                    room
                                ),

                            room_name:
                                getRoomName(
                                    room
                                ),

                            room_type:
                                getRoomType(
                                    room
                                ),

                            price:
                                getRoomPrice(
                                    room
                                ),

                            status:
                                getRoomStatus(
                                    room
                                )
                        };
                    }
                );

            if (!rows.length) {
                return true;
            }

            const result =
                await db
                    .from(
                        "hotel_rooms"
                    )
                    .upsert(
                        rows,
                        {
                            onConflict:
                                "room_id"
                        }
                    );

            if (result.error) {
                throw result.error;
            }

            return true;

        } catch (error) {

            reportError(error);

            return false;
        }
    }

    /*
     * ---------------------------------------------------------
     * INITIAL CLOUD MIGRATION
     *
     * Existing local rooms are preserved.
     * This is important because your Admin currently
     * has more rooms than the original 8.
     * ---------------------------------------------------------
     */

    async function syncInitialRooms() {

        if (cloudLoading) {
            return;
        }

        cloudLoading = true;

        try {

            const cloudRooms =
                await loadRoomsFromCloud();

            const localRooms =
                getLocalRooms();

            /*
             * If cloud has no rooms,
             * upload current local rooms.
             */

            if (
                Array.isArray(
                    cloudRooms
                ) &&
                cloudRooms.length === 0
            ) {

                rooms =
                    localRooms.length
                        ? localRooms
                        : DEFAULT_ROOMS.map(
                              function (
                                  room
                              ) {
                                  return Object.assign(
                                      {},
                                      room
                                  );
                              }
                          );

                saveLocalRooms();

                const ok =
                    await saveAllRoomsToCloud();

                if (ok) {

                    localStorage.setItem(
                        CLOUD_INIT_KEY,
                        "1"
                    );

                    cloudReady = true;

                    showRoomToast(
                        "Rooms connected to cloud."
                    );
                }

                return;
            }

            /*
             * If local has more rooms than cloud,
             * preserve those rooms and upload them.
             *
             * This protects the rooms already created
             * in your Admin Panel.
             */

            const cloudIds =
                new Set(
                    (
                        cloudRooms ||
                        []
                    ).map(
                        function (room) {
                            return getRoomId(
                                room
                            );
                        }
                    )
                );

            let merged =
                Array.isArray(
                    cloudRooms
                )
                    ? cloudRooms.slice()
                    : [];

            let changed =
                false;

            localRooms.forEach(
                function (localRoom) {

                    const id =
                        getRoomId(
                            localRoom
                        );

                    if (!id) {
                        return;
                    }

                    if (
                        !cloudIds.has(id)
                    ) {

                        merged.push(
                            localRoom
                        );

                        changed = true;

                    } else {

                        /*
                         * On first migration,
                         * existing local room data
                         * wins so current Admin data
                         * is not silently lost.
                         */

                    
const index =
    merged.findIndex(
        function (room) {
            return (
                getRoomId(
                    room
                ) === id
            );
        }
    );
                        
                               if (
                                old !==
                                next
                            ) {

                                merged[
                                    index
                                ] =
                                    localRoom;

                                changed =
                                    true;
                            }
                        }
                    }
            );

            rooms =
                merged.map(
                    normalizeRoom
                );

            saveLocalRooms();

            /*
             * Upload merged current rooms.
             */

            if (
                !localStorage.getItem(
                    CLOUD_INIT_KEY
                ) ||
                changed
            ) {

                await saveAllRoomsToCloud();

                localStorage.setItem(
                    CLOUD_INIT_KEY,
                    "1"
                );
            }

            /*
             * Now cloud becomes source of truth.
             */

            const freshCloud =
                await loadRoomsFromCloud();

            if (
                Array.isArray(
                    freshCloud
                ) &&
                freshCloud.length
            ) {

                rooms =
                    freshCloud;

                saveLocalRooms();
            }

            cloudReady = true;

        } catch (error) {

            reportError(error);

        } finally {

            cloudLoading = false;

            renderRooms();

            updateRoomCounters();
        }
    }

    /*
     * ---------------------------------------------------------
     * MODAL HELPERS
     * ---------------------------------------------------------
     */

    function findElement(
        ids
    ) {

        for (
            let i = 0;
            i < ids.length;
            i++
        ) {

            const el =
                document.getElementById(
                    ids[i]
                );

            if (el) {
                return el;
            }
        }

        return null;
    }

    function getRoomIdInput() {
        return findElement([
            "roomId",
            "roomEditId"
        ]);
    }

    function getRoomNumberInput() {
        return findElement([
            "roomNumber",
            "roomNo"
        ]);
    }

    function getRoomNameInput() {
        return findElement([
            "roomName"
        ]);
    }

    function getRoomTypeInput() {
        return findElement([
            "roomType"
        ]);
    }

    function getRoomPriceInput() {
        return findElement([
            "roomPrice"
        ]);
    }

    function getRoomStatusInput() {
        return findElement([
            "roomStatus"
        ]);
    }

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

    function generateRoomId() {

        let number = 1;

        while (
            rooms.some(
                function (room) {

                    return (
                        getRoomId(
                            room
                        ) ===
                        "ROOM" +
                            String(
                                number
                            ).padStart(
                                3,
                                "0"
                            )
                    );
                }
            )
        ) {
            number++;
        }

        return (
            "ROOM" +
            String(
                number
            ).padStart(
                3,
                "0"
            )
        );
    }

    function generateRoomNumber() {

        let number = 101;

        while (
            rooms.some(
                function (room) {

                    return (
                        getRoomNumber(
                            room
                        ) ===
                        String(number)
                    );
                }
            )
        ) {
            number++;
        }

        return String(
            number
        );
    }
/* =====================================================
   ROOM CARD RENDERING
===================================================== */

function createRoomCard(room) {
    try {
        const id = getRoomId(room);
        const name = getRoomName(room) || "Room";
        const number = getRoomNumber(room) || "";
        const type = getRoomType(room) || "Premium";
        const price = Number(getRoomPrice(room) || 0);
        const status = getRoomStatus(room) || "available";

        const statusText =
            status === "booked"
                ? "Booked"
                : status === "maintenance"
                    ? "Maintenance"
                    : "Available";

        const image =
            room && room.image
                ? String(room.image)
                : "";

        const card = document.createElement("div");
        card.className = "room-card";

        const imageBox = document.createElement("div");
        imageBox.className = "room-image";

        if (image) {
            const img = document.createElement("img");

            img.src = image;
            img.alt = name;

            img.onerror = function () {
                this.style.display = "none";

                const placeholder =
                    document.createElement("div");

                placeholder.className =
                    "room-placeholder";

                placeholder.textContent = "🏨";

                imageBox.appendChild(
                    placeholder
                );
            };

            imageBox.appendChild(img);
        } else {
            const placeholder =
                document.createElement("div");

            placeholder.className =
                "room-placeholder";

            placeholder.textContent = "🏨";

            imageBox.appendChild(
                placeholder
            );
        }

        const info = document.createElement("div");
        info.className = "room-info";

        const title =
            document.createElement("h3");

        title.textContent = name;

        const description =
            document.createElement("p");

        description.textContent =
            "Room " +
            number +
            " • " +
            type;

        const footer =
            document.createElement("div");

        footer.className = "room-footer";

        const priceBox =
            document.createElement("span");

        priceBox.className = "price";

        priceBox.textContent =
            "₹" +
            price.toLocaleString("en-IN") +
            "/night";

        const badge =
            document.createElement("span");

        badge.className =
            "room-badge" +
            (
                status === "booked"
                    ? " booked"
                    : ""
            );

        badge.textContent =
            statusText;

        footer.appendChild(priceBox);
        footer.appendChild(badge);

        const actions =
            document.createElement("div");

        actions.style.marginTop = "12px";
        actions.style.display = "flex";
        actions.style.gap = "7px";
        actions.style.flexWrap = "wrap";

        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.className =
            "secondary-btn";

        editButton.style.padding =
            "7px 10px";

        editButton.style.fontSize =
            "11px";

        editButton.textContent =
            "✏ Edit";

        editButton.onclick = function () {
            editRoom(id);
        };

        const statusButton =
            document.createElement("button");

        statusButton.type = "button";
        statusButton.className =
            "secondary-btn";

        statusButton.style.padding =
            "7px 10px";

        statusButton.style.fontSize =
            "11px";

        statusButton.textContent =
            status === "booked"
                ? "✓ Available"
                : "🔴 Booked";

        statusButton.onclick = function () {
            toggleRoomStatus(id);
        };

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className =
            "danger-btn";

        deleteButton.style.padding =
            "7px 10px";

        deleteButton.style.fontSize =
            "11px";

        deleteButton.textContent =
            "🗑 Delete";

        deleteButton.onclick = function () {
            deleteRoom(id);
        };

        actions.appendChild(editButton);
        actions.appendChild(statusButton);
        actions.appendChild(deleteButton);

        info.appendChild(title);
        info.appendChild(description);
        info.appendChild(footer);
        info.appendChild(actions);

        card.appendChild(imageBox);
        card.appendChild(info);

        return card;

    } catch (error) {
        try {
            reportError(error);
        } catch (e) {}

        return null;
    }
}


function renderRooms(list) {
    try {
        const grid =
            document.getElementById("roomsGrid");

        if (!grid) {
            return;
        }

        const data =
            Array.isArray(list)
                ? list
                : rooms;

        grid.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            const empty =
                document.createElement("div");

            empty.className = "empty";

            empty.style.gridColumn =
                "1 / -1";

            empty.textContent =
                "No rooms found. Add a new room to get started.";

            grid.appendChild(empty);

            return;
        }

        data.forEach(function (room) {
            const card =
                createRoomCard(room);

            if (card) {
                grid.appendChild(card);
            }
        });

    } catch (error) {
        try {
            reportError(error);
        } catch (e) {
            console.error(error);
        }
    }
}
    function openRoomModal(
        roomId
    ) {

        const modal =
            getModal();

        if (!modal) {
            return;
        }

        editingRoomId =
            roomId
                ? String(roomId)
                : null;

        const title =
            document.getElementById(
                "roomModalTitle"
            );

        const idInput =
            getRoomIdInput();

        const numberInput =
            getRoomNumberInput();

        const nameInput =
            getRoomNameInput();

        const typeInput =
            getRoomTypeInput();

        const priceInput =
            getRoomPriceInput();

        const statusInput =
            getRoomStatusInput();

        if (editingRoomId) {

            const room =
                rooms.find(
                    function (item) {

                        return (
                            getRoomId(
                                item
                            ) ===
                            editingRoomId
                        );
                    }
                );

            if (!room) {
                return;
            }

            if (title) {
                title.textContent =
                    "Edit Room";
            }

            if (idInput) {
                idInput.value =
                    getRoomId(
                        room
                    );

                idInput.readOnly =
                    true;
            }

            if (numberInput) {
                numberInput.value =
                    getRoomNumber(
                        room
                    );
            }

            if (nameInput) {
                nameInput.value =
                    getRoomName(
                        room
                    );
            }

            if (typeInput) {
                typeInput.value =
                    getRoomType(
                        room
                    );
            }

            if (priceInput) {
                priceInput.value =
                    getRoomPrice(
                        room
                    );
            }

            if (statusInput) {
                statusInput.value =
                    getRoomStatus(
                        room
                    );
            }

        } else {

            if (title) {
                title.textContent =
                    "Add New Room";
            }

            if (idInput) {
                idInput.value =
                    generateRoomId();

                idInput.readOnly =
                    false;
            }

            if (numberInput) {
                numberInput.value =
                    generateRoomNumber();
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

        modal.style.display =
            "flex";

        modal.classList.add(
            "modal-open"
        );

        document.body.classList.add(
            "room-modal-active"
        );
    }

    function closeRoomModal() {

        const modal =
            getModal();

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "modal-open"
        );

        modal.style.display =
            "none";

        document.body.classList.remove(
            "room-modal-active"
        );

        editingRoomId = null;
    }

    function closeRoomModalOnOverlay(
        event
    ) {

        const modal =
            getModal();

        if (
            modal &&
            event.target === modal
        ) {
            closeRoomModal();
        }
                  }    
     /*
     * ---------------------------------------------------------
     * SAVE ROOM
     * ---------------------------------------------------------
     */

    async function saveRoom(
        event
    ) {

        if (event) {
            event.preventDefault();
        }

        const idInput =
            getRoomIdInput();

        const numberInput =
            getRoomNumberInput();

        const nameInput =
            getRoomNameInput();

        const typeInput =
            getRoomTypeInput();

        const priceInput =
            getRoomPriceInput();

        const statusInput =
            getRoomStatusInput();

        let id =
            idInput
                ? String(
                      idInput.value ||
                          ""
                  ).trim()
                : "";

        let number =
            numberInput
                ? String(
                      numberInput.value ||
                          ""
                  ).trim()
                : "";

        const name =
            nameInput
                ? String(
                      nameInput.value ||
                          ""
                  ).trim()
                : "";

        const type =
            typeInput
                ? String(
                      typeInput.value ||
                          ""
                  ).trim()
                : "Standard";

        const price =
            Number(
                priceInput
                    ? priceInput.value
                    : 0
            ) || 0;

        const status =
            statusInput
                ? String(
                      statusInput.value ||
                          "available"
                  ).toLowerCase()
                : "available";

        if (!id) {
            id =
                editingRoomId ||
                generateRoomId();
        }

        if (!number) {
            number =
                generateRoomNumber();
        }

        if (!name) {
            alert(
                "Please enter room name."
            );
            return false;
        }

        if (price <= 0) {
            alert(
                "Please enter a valid room price."
            );
            return false;
        }

        const duplicate =
            rooms.find(
                function (room) {

                    return (
                        getRoomNumber(
                            room
                        ) ===
                            number &&
                        getRoomId(
                            room
                        ) !== id
                    );
                }
            );

        if (duplicate) {
            alert(
                "Room number " +
                    number +
                    " already exists."
            );
            return false;
        }

        const room = {
            id: id,
            number: number,
            name: name,
            type:
                type ||
                "Standard",
            price: price,
            status:
                status ===
                "booked"
                    ? "booked"
                    : "available"
        };

        const existingIndex =
            rooms.findIndex(
                function (item) {

                    return (
                        getRoomId(
                            item
                        ) === id
                    );
                }
            );

        const wasEditing =
            !!editingRoomId;

        if (
            existingIndex >= 0
        ) {

            rooms[
                existingIndex
            ] = room;

        } else {

            rooms.push(room);
        }

        saveLocalRooms();

        renderRooms();

        updateRoomCounters();

        closeRoomModal();

        showRoomToast(
            "Saving room..."
        );

        const cloudSaved =
            await upsertRoomToCloud(
                room
            );

        if (cloudSaved) {

            cloudReady = true;

            localStorage.setItem(
                CLOUD_INIT_KEY,
                "1"
            );

            showRoomToast(
                wasEditing
                    ? "Room updated on cloud."
                    : "Room added to cloud."
            );

        } else {

            showRoomToast(
                "Saved locally. Cloud save failed."
            );
        }

        dispatchRoomsChanged();

        return true;
    }

    /*
     * ---------------------------------------------------------
     * EDIT
     * ---------------------------------------------------------
     */

    function editRoom(
        roomId
    ) {

        openRoomModal(
            String(roomId)
        );
    }

    /*
     * ---------------------------------------------------------
     * STATUS
     * ---------------------------------------------------------
     */

    async function toggleRoomStatus(
        roomId
    ) {

        const id =
            String(roomId);

        const index =
            rooms.findIndex(
                function (room) {

                    return (
                        getRoomId(
                            room
                        ) === id
                    );
                }
            );

        if (index < 0) {
            return;
        }

        rooms[index].status =
            getRoomStatus(
                rooms[index]
            ) === "booked"
                ? "available"
                : "booked";

        saveLocalRooms();

        renderRooms();

        updateRoomCounters();

        showRoomToast(
            "Updating room..."
        );

        const ok =
            await upsertRoomToCloud(
                rooms[index]
            );

        if (ok) {

            showRoomToast(
                rooms[index]
                    .status ===
                    "booked"
                    ? "Room booked."
                    : "Room available."
            );

        } else {

            showRoomToast(
                "Saved locally. Cloud update failed."
            );
        }

        dispatchRoomsChanged();
    }

    /*
     * ---------------------------------------------------------
     * DELETE
     * ---------------------------------------------------------
     */

    async function deleteRoom(
        roomId
    ) {

        const id =
            String(roomId);

        const room =
            rooms.find(
                function (item) {

                    return (
                        getRoomId(
                            item
                        ) === id
                    );
                }
            );

        if (!room) {
            return;
        }

        const confirmed =
            window.confirm(
                "Delete " +
                    getRoomName(
                        room
                    ) +
                    "?"
            );

        if (!confirmed) {
            return;
        }

        rooms =
            rooms.filter(
                function (item) {

                    return (
                        getRoomId(
                            item
                        ) !== id
                    );
                }
            );

        saveLocalRooms();

        renderRooms();

        updateRoomCounters();

        showRoomToast(
            "Deleting room..."
        );

        const ok =
            await deleteRoomFromCloud(
                id
            );

        if (ok) {

            showRoomToast(
                "Room deleted successfully."
            );

        } else {

            showRoomToast(
                "Deleted locally. Cloud delete failed."
            );
        }

        dispatchRoomsChanged();
    }

    /*
     * ---------------------------------------------------------
     * SEARCH
     * ---------------------------------------------------------
     */

    function searchRooms(
        value
    ) {

        const search =
            String(
                value || ""
            )
                .trim()
                .toLowerCase();

        if (!search) {
            renderRooms();
            return;
        }

        const filtered =
            rooms.filter(
                function (room) {

                    const text =
                        [
                            getRoomId(
                                room
                            ),
                            getRoomNumber(
                                room
                            ),
                            getRoomName(
                                room
                            ),
                            getRoomType(
                                room
                            ),
                            getRoomStatus(
                                room
                            ),
                            getRoomPrice(
                                room
                            )
                        ]
                            .join(" ")
                            .toLowerCase();

                    return text.includes(
                        search
                    );
                }
            );

        renderRooms(
            filtered
        );
    }

    /*
     * ---------------------------------------------------------
     * TOAST
     * ---------------------------------------------------------
     */

    function showRoomToast(
        message
    ) {

        try {

            let toast =
                document.getElementById(
                    "roomToast"
                );

        if (!toast) {

                toast =
                    document.createElement(
                        "div"
                    );

                toast.id =
                    "roomToast";

                toast.style.position =
                    "fixed";

                toast.style.left =
                    "50%";

                toast.style.bottom =
                    "25px";

                toast.style.transform =
                    "translateX(-50%)";

                toast.style.zIndex =
                    "999999";

                toast.style.padding =
                    "12px 20px";

                toast.style.borderRadius =
                    "14px";

                toast.style.background =
                    "linear-gradient(135deg,#6d28d9,#2563eb)";

                toast.style.color =
                    "#fff";

                toast.style.fontWeight =
                    "700";

                toast.style.fontSize =
                    "14px";

                toast.style.boxShadow =
                    "0 10px 30px rgba(0,0,0,.25)";

                toast.style.transition =
                    "opacity .3s ease";

                document.body.appendChild(
                    toast
                );
            }

            toast.textContent =
                message;

            toast.style.opacity =
                "1";

            clearTimeout(
                toast._timer
            );

            toast._timer =
                setTimeout(
                    function () {
                        toast.style.opacity =
                            "0";
                    },
                    2500
                );

        } catch (error) {

            reportError(error);
        }
    }

    /*
     * ---------------------------------------------------------
     * COUNTERS
     * ---------------------------------------------------------
     */

    function updateRoomCounters() {

        try {

            const total =
                rooms.length;

            const available =
                rooms.filter(
                    function (room) {

                        return (
                            getRoomStatus(
                                room
                            ) ===
                            "available"
                        );
                    }
                ).length;

            const booked =
                rooms.filter(
                    function (room) {

                        return (
                            getRoomStatus(
                                room
                            ) ===
                            "booked"
                        );
                    }
                ).length;

            const totalPrice =
                rooms.reduce(
                    function (
                        sum,
                        room
                    ) {

                        return (
                            sum +
                            getRoomPrice(
                                room
                            )
                        );
                    },
                    0
                );

            const average =
                total
                    ? Math.round(
                          totalPrice /
                              total
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
                totalEl.textContent =
                    total;
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
                    money(
                        average
                    );
            }

        } catch (error) {

            reportError(error);
        }
                                  }
      /*
     * ---------------------------------------------------------
     * PUBLIC FUNCTIONS
     * ---------------------------------------------------------
     */

    window.openRoomModal =
        openRoomModal;

    window.closeRoomModal =
        closeRoomModal;

    window.closeRoomModalOnOverlay =
        closeRoomModalOnOverlay;

    window.saveRoom =
        saveRoom;

    window.editRoom =
        editRoom;

    window.deleteRoom =
        deleteRoom;

    window.toggleRoomStatus =
        toggleRoomStatus;

    window.searchRooms =
        searchRooms;

    window.updateRoomCounters =
        updateRoomCounters;

    window.renderRooms =
        renderRooms;

    window.loadRooms =
        loadRooms;

    window.syncInitialRooms =
        syncInitialRooms;

    /*
     * ---------------------------------------------------------
     * INITIAL LOAD
     * ---------------------------------------------------------
     */

    async function startRooms() {

        try {

            await syncInitialRooms();

        } catch (error) {

            reportError(error);

            loadRooms();

            renderRooms();

            updateRoomCounters();
        }
    }

    /*
     * ---------------------------------------------------------
     * EVENTS
     * ---------------------------------------------------------
     */

    document.addEventListener(
        "royalAppReady",
        function () {

            startRooms();

        },
        {
            once: true
        }
    );

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            startRooms();

        },
        {
            once: true
        }
    );

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                STORAGE_KEY
            ) {

                loadRooms();

                renderRooms();

                updateRoomCounters();
            }

        }
    );

    /*
     * ---------------------------------------------------------
     * FALLBACK START
     * ---------------------------------------------------------
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                startRooms();

            },
            {
                once: true
            }
        );

    } else {

        startRooms();

    }

})();
