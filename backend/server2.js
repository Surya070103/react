const http = require("http");
const { randomUUID } = require("crypto");
const db = require("./db.js");


const PORT = 4000;
let slotAssignment = Promise.resolve();
const sessions = new Map();



function getSessionToken(req) {
    const match = req.headers.authorization?.match(/^Bearer\s+(.+)$/i);
    return match?.[1] || null;
}

function getSession(req) {
    const token = getSessionToken(req);
    const session = token ? sessions.get(token) : null;
    if (!session || session.expiresAt <= Date.now()) {
        if (token) sessions.delete(token);
        return null;
    }
    return { token, ...session };
}

async function requireManager(req, res, permissionName = "VIEW_PARKING_RECORDS") {
    const session = getSession(req);
    if (!session) {
        send(res, 401, { error: "Please sign in to view parking records" });
        return false;
    }

    const [rows] = await db.query(
        `SELECT users.id
        FROM users
        JOIN roles ON roles.id = users.role_id
        JOIN role_permissions ON role_permissions.role_id = roles.id
        JOIN permissions ON permissions.id = role_permissions.permission_id
        WHERE users.id = ?
            AND roles.roles_name = 'Manager'
            AND permissions.permission_name = ?
        LIMIT 1`,
        [session.userId, permissionName]
    );
    if (rows.length === 0) {
        send(res, 403, { error: "Parking records are only available to Managers" });
        return false;
    }
    return true;
}

async function userHasPermission(userId, permissionName) {
    const [rows] = await db.query(
        `SELECT permissions.id
        FROM users
        JOIN role_permissions ON role_permissions.role_id = users.role_id
        JOIN permissions ON permissions.id = role_permissions.permission_id
        WHERE users.id = ?
            AND REPLACE(UPPER(permissions.permission_name), ' ', '_') = ?
        LIMIT 1`,
        [userId, permissionName]
    );
    return rows.length > 0;
}

function withSlotAssignmentLock(operation) {
    const currentOperation = slotAssignment.then(operation, operation);
    slotAssignment = currentOperation.catch(() => { });
    return currentOperation;
}

function send(res, statusCode, data) {
    res.writeHead(statusCode, {
        "content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    res.end(JSON.stringify(data));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}


function getParkingAmount(vehicleType) {
    const type = String(vehicleType).trim().toLowerCase();
    if (type === "car") return 30;
    if (type === "bike") return 20;
    return null;
}

function normalizePermission(permission) {
    const normalized = String(permission).trim().toUpperCase().replace(/\s+/g, "_");
    const aliases = {
        PARKING_VIEW: "VIEW_PARKING",
        PARKING_RECORD_VIEW: "VIEW_PARKING_RECORDS",
        MANAGE_ROLES: "VIEW_ROLES",
    };
    return aliases[normalized] || normalized;
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    console.log("METHOD:", req.method);
    console.log("PATH:", parsedUrl.pathname);


    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
            "access-control-allow-headers": "Content-Type, Authorization"
        });
        res.end();
        return;
    }
    async function findAvailableSlot() {
        const sections = ["A", "B", "C", "D"];
        for (const section of sections) {
            for (let number = 1; number <= 10; number++) {
                const slotNumber = section + String(number).padStart(2, "0");
                const [rows] = await db.query(
                    "SELECT slot_number FROM parking WHERE slot_number = ? AND status = 'PARKED' AND exit_time IS NULL", [slotNumber]
                );
                if (rows.length === 0) {
                    return { section, slot_number: slotNumber };
                };
            }
        }
    };
    if (req.method === "POST" && parsedUrl.pathname === "/login") {
        try {
            const body = await readBody(req);
            const { email, password } = body;
            const [rows] = await db.query(
                "SELECT id, name, email, role_id, age FROM users WHERE email = ? AND password = ?",
                [email, password]
            );
            if (rows.length === 0) {
                return send(res, 401, { error: "Invalid email or password" });
            }
            const token = randomUUID();
            sessions.set(token, {
                userId: rows[0].id,
                expiresAt: Date.now() + SESSION_TTL_MS,
            });
            return send(res, 200, { message: "Login successful", token, user: rows[0] });
        } catch (error) {
            console.error(error);
            return send(res, 500, { error: "Server error" });
        }
    }
    if (req.method === "POST" && parsedUrl.pathname === "/logout") {
        const token = getSessionToken(req);
        if (token) sessions.delete(token);
        send(res, 200, { message: "Logged out" });
        return;
    }
    const isRoleManagementRequest = parsedUrl.pathname === "/permissions"
        || /^\/roles(?:\/\d+(?:\/(?:permissions|active))?)?$/.test(parsedUrl.pathname);
    if (isRoleManagementRequest && !await requireManager(req, res, "VIEW_ROLES")) return;

    if (req.method === "GET" && parsedUrl.pathname === "/roles") {
        try {
            const [rows] = await db.query(
                "SELECT id, roles_name AS role_name, is_active FROM roles ORDER BY id DESC"
            );
            send(res, 200, rows.map((role) => ({
                ...role,
                is_active: Boolean(role.is_active),
            })));
            return;
        } catch (error) {
            console.error("GET /roles error:", error);
            send(res, 500, { error: "Could not load roles" });
            return;
        }
    }
    if (req.method === "GET" && parsedUrl.pathname === "/permissions") {
        try {
            const [rows] = await db.query(
                "SELECT id, permission_name FROM permissions ORDER BY permission_name"
            );
            send(res, 200, rows);
            return;
        } catch (error) {
            console.error("GET /permissions error:", error);
            send(res, 500, { error: "Could not load permissions" });
            return;
        }
    }
    if (req.method === "POST" && parsedUrl.pathname === "/roles") {
        try {
            const body = await readBody(req);
            const roleName = String(body.role_name ?? "").trim();
            if (!roleName || roleName.length > 80) {
                send(res, 400, { error: "Role name is required and must be 80 characters or fewer" });
                return;
            }
            const [result] = await db.query(
                "INSERT INTO roles (roles_name) VALUES (?)",
                [roleName]
            );
            send(res, 201, { id: result.insertId, role_name: roleName, is_active: true });
            return;
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                send(res, 409, { error: "A role with that name already exists" });
                return;
            }
            console.error("POST /roles error:", error);
            send(res, 500, { error: "Could not create role" });
            return;
        }
    }
    const roleMatch = parsedUrl.pathname.match(/^\/roles\/(\d+)$/);
    if (req.method === "PUT" && roleMatch) {
        try {
            const roleId = Number(roleMatch[1]);
            const body = await readBody(req);
            const roleName = String(body.role_name ?? "").trim();
            if (!roleName || roleName.length > 80) {
                send(res, 400, { error: "Role name is required and must be 80 characters or fewer" });
                return;
            }
            const [existing] = await db.query("SELECT id FROM roles WHERE id = ?", [roleId]);
            if (existing.length === 0) {
                send(res, 404, { error: "Role not found" });
                return;
            }
            await db.query("UPDATE roles SET roles_name = ? WHERE id = ?", [roleName, roleId]);
            send(res, 200, { message: "Role updated" });
            return;
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                send(res, 409, { error: "A role with that name already exists" });
                return;
            }
            console.error("PUT /roles/:id error:", error);
            send(res, 500, { error: "Could not update role" });
            return;
        }
    }
    const activeRoleMatch = parsedUrl.pathname.match(/^\/roles\/(\d+)\/active$/);
    if (req.method === "PUT" && activeRoleMatch) {
        try {
            const roleId = Number(activeRoleMatch[1]);
            const body = await readBody(req);
            if (typeof body.is_active !== "boolean") {
                send(res, 400, { error: "is_active must be a boolean" });
                return;
            }
            const [result] = await db.query(
                "UPDATE roles SET is_active = ? WHERE id = ?",
                [body.is_active, roleId]
            );
            if (result.affectedRows === 0) {
                const [existing] = await db.query("SELECT id FROM roles WHERE id = ?", [roleId]);
                if (existing.length === 0) {
                    send(res, 404, { error: "Role not found" });
                    return;
                }
            }
            send(res, 200, { message: "Role status updated", is_active: body.is_active });
            return;
        } catch (error) {
            console.error("PUT /roles/:id/active error:", error);
            send(res, 500, { error: "Could not update role status" });
            return;
        }
    }
    if (req.method === "DELETE" && roleMatch) {
        try {
            const roleId = Number(roleMatch[1]);
            const [roles] = await db.query("SELECT roles_name FROM roles WHERE id = ?", [roleId]);
            if (roles.length === 0) {
                send(res, 404, { error: "Role not found" });
                return;
            }
            const [users] = await db.query(
                "SELECT id FROM users WHERE role_id = ? LIMIT 1",
                [roleId]
            );
            if (users.length > 0) {
                send(res, 409, { error: "This role is assigned to users and cannot be deleted" });
                return;
            }
            await db.query("DELETE FROM roles WHERE id = ?", [roleId]);
            send(res, 200, { message: "Role deleted" });
            return;
        } catch (error) {
            console.error("DELETE /roles/:id error:", error);
            send(res, 500, { error: "Could not delete role" });
            return;
        }
    }
    const userMatch = parsedUrl.pathname.match(/^\/users\/(\d+)$/);
    if (req.method === "GET" && userMatch) {
        try {
            const id = Number(userMatch[1]);
            const [rows] = await db.query(
                `SELECT users.id, users.name, users.email, users.role_id, users.age,
                    roles.roles_name AS role_name
                FROM users
                LEFT JOIN roles ON roles.id = users.role_id
                WHERE users.id = ?`,
                [id]
            );
            if (rows.length === 0) {
                send(res, 404, { error: "User not found" });
                return;
            }
            const [permissions] = rows[0].role_id
                ? await db.query(
                    `SELECT permissions.permission_name AS permission
                    FROM role_permissions
                    JOIN permissions ON permissions.id = role_permissions.permission_id
                    WHERE role_permissions.role_id = ?`,
                    [rows[0].role_id]
                )
                : [[]];
            send(res, 200, {
                ...rows[0],
                permissions: permissions.map((item) => normalizePermission(item.permission)),
            });
            return;
        } catch (error) {
            console.error("GET /users error:", error);
            send(res, 500, { error: "Server error" });
            return;
        }
    }
    const rolePermissionsMatch = parsedUrl.pathname.match(/^\/roles\/(\d+)\/permissions$/);
    if (req.method === "GET" && rolePermissionsMatch) {
        try {
            const roleId = Number(rolePermissionsMatch[1]);
            const [rows] = await db.query(
                `SELECT permissions.id, permissions.permission_name
                FROM role_permissions
                JOIN permissions ON permissions.id = role_permissions.permission_id
                WHERE role_permissions.role_id = ?`,
                [roleId]
            );
            send(res, 200, rows);
            return;
        } catch (error) {
            console.error("GET /roles error:", error);
            send(res, 500, { error: "Server error" });
            return;
        }
    }
    if (req.method === "PUT" && rolePermissionsMatch) {
        let connection;
        try {
            const roleId = Number(rolePermissionsMatch[1]);
            const body = await readBody(req);
            if (!Array.isArray(body.permissionIds)) {
                send(res, 400, { error: "permissionIds must be an array" });
                return;
            }
            const permissionIds = [...new Set(body.permissionIds.map(Number))];
            if (permissionIds.some((id) => !Number.isInteger(id) || id < 1)) {
                send(res, 400, { error: "permissionIds must contain valid IDs" });
                return;
            }

            connection = await db.getConnection();
            await connection.beginTransaction();
            const [roles] = await connection.query("SELECT id, roles_name FROM roles WHERE id = ? FOR UPDATE", [roleId]);
            if (roles.length === 0) {
                await connection.rollback();
                send(res, 404, { error: "Role not found" });
                return;
            }
            if (roles[0].roles_name === "Parker" && permissionIds.length > 0) {
                const placeholders = permissionIds.map(() => "?").join(",");
                const [restrictedPermissions] = await connection.query(
                    `SELECT id FROM permissions
                    WHERE permission_name IN ('VIEW_PARKING_RECORDS', 'PARKING_RECORD_VIEW')
                        AND id IN (${placeholders})`,
                    permissionIds
                );
                if (restrictedPermissions.length > 0) {
                    await connection.rollback();
                    send(res, 403, { error: "Parking records access is reserved for Managers" });
                    return;
                }
            }
            if (permissionIds.length > 0) {
                const placeholders = permissionIds.map(() => "?").join(",");
                const [existingPermissions] = await connection.query(
                    `SELECT id FROM permissions WHERE id IN (${placeholders})`,
                    permissionIds
                );
                if (existingPermissions.length !== permissionIds.length) {
                    await connection.rollback();
                    send(res, 400, { error: "One or more permissions do not exist" });
                    return;
                }
            }
            await connection.query("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);
            if (permissionIds.length > 0) {
                const values = permissionIds.map(() => "(?, ?)").join(",");
                const parameters = permissionIds.flatMap((permissionId) => [roleId, permissionId]);
                await connection.query(
                    `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`,
                    parameters
                );
            }
            await connection.commit();
            send(res, 200, { message: "Role permissions updated" });
            return;
        } catch (error) {
            if (connection) await connection.rollback();
            console.error("PUT /roles/:id/permissions error:", error);
            send(res, 500, { error: "Could not update role permissions" });
            return;
        } finally {
            if (connection) connection.release();
        }
    }
    if (req.method === "GET" && parsedUrl.pathname === "/parking-records") {
        try {
            const session = getSession(req);
            if (!session) {
                send(res, 401, { error: "Please sign in to view parking records" });
                return;
            }
            const [users] = await db.query(
                `SELECT roles.roles_name
                FROM users
                JOIN roles ON roles.id = users.role_id
                WHERE users.id = ?`,
                [session.userId]
            );
            if (users.length === 0) {
                send(res, 401, { error: "User session is no longer valid" });
                return;
            }
            const isManager = users[0].roles_name === "Manager";
            const requiredPermission = isManager
                ? "VIEW_PARKING_RECORDS"
                : "VIEW_OWN_PARKING_RECORDS";
            if (!await userHasPermission(session.userId, requiredPermission)) {
                send(res, 403, { error: "You are not allowed to view parking records" });
                return;
            }
            const query = `
                SELECT id, vehicle_number, vehicle_type, section, slot_number,
                    entry_time, exit_time, status,
                    CASE vehicle_type WHEN 'Car' THEN 30 WHEN 'Bike' THEN 20 END AS amount
                FROM parking
                ${isManager ? "" : "WHERE user_id = ?"}
                ORDER BY id DESC
            `;
            const [rows] = isManager
                ? await db.query(query)
                : await db.query(query, [session.userId]);
            send(res, 200, rows);
            return;
        } catch (error) {
            console.error("GET /parking error:", error);
            send(res, 500, {
                error: "Server error"
            });
            return;
        }
    }

    if (req.method === "GET" && parsedUrl.pathname === "/parking") {
        try {
            const [rows] = await db.query(`
                SELECT DISTINCT slot_number
                FROM parking
                WHERE status = 'PARKED' AND exit_time IS NULL
            `);
            send(res, 200, rows);
            return;
        } catch (error) {
            console.error("GET /parking error:", error);
            send(res, 500, { error: "Server error" });
            return;
        }
    }

    if (req.method === "POST" && parsedUrl.pathname === "/parking") {
        try {
            const session = getSession(req);
            if (!session) {
                send(res, 401, { error: "Please sign in to park a vehicle" });
                return;
            }
            if (!await userHasPermission(session.userId, "ADD_PARKING")) {
                send(res, 403, { error: "You are not allowed to park vehicles" });
                return;
            }
            const data = await readBody(req);
            const vehicle_number = String(data.vehicle_number ?? "").trim().toUpperCase();
            const vehicle_type = String(data.vehicle_type ?? "").trim();

            if (!vehicle_number || !vehicle_type) {
                send(res, 400, {
                    error: "Vehicle number and type are required"
                });
                return;
            }

            if (!/^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/.test(vehicle_number)) {
                send(res, 400, {
                    error: "enter a valid vehicle number"
                });
                return;
            }

            if (getParkingAmount(vehicle_type) === null) {
                send(res, 400, {
                    error: "vehicle type must be car or bike"
                });
                return;
            }
            const vehicleTypeForDb = vehicle_type.toLowerCase() === "car" ? "Car" : "Bike";

            const [existingvehicle] = await db.query(
                "SELECT id FROM parking WHERE vehicle_number = ? AND exit_time IS NULL",
                [vehicle_number]
            );
            if (existingvehicle.length > 0) {
                send(res, 400, {
                    error: "Vehicle is already parked"
                });
                return;
            }

            const assignment = await withSlotAssignmentLock(async () => {
                const slot = await findAvailableSlot();
                if (!slot) return null;

                const [result] = await db.query(
                    `INSERT INTO parking (slot_number, section, vehicle_number, vehicle_type, entry_time, status, user_id) VALUES (?, ?, ?, ?, NOW(), 'PARKED', ?)`,
                    [slot.slot_number, slot.section, vehicle_number, vehicleTypeForDb, session.userId]
                );
                return { slot, parkingId: result.insertId };
            });
            if (!assignment) {
                send(res, 400, { error: "No available slots" });
                return;
            }

            send(res, 201, {
                message: "Vehicle parked successfully",
                section: assignment.slot.section,
                slot_number: assignment.slot.slot_number,
                parkingId: assignment.parkingId,
            });
            return;
        } catch (error) {
            console.log(error);
            send(res, 500, {
                error: "Server error"
            });
            return;
        }
    }

    const exitMatch = parsedUrl.pathname.match(/^\/parking\/(\d+)\/exit$/);
    if (req.method === "POST" && exitMatch) {
        try {
            const session = getSession(req);
            if (!session) {
                send(res, 401, { error: "Please sign in to exit a vehicle" });
                return;
            }
            if (!await userHasPermission(session.userId, "EXIT_PARKING")) {
                send(res, 403, { error: "You are not allowed to exit vehicles" });
                return;
            }
            const parkingId = Number(exitMatch[1]);
            const [rows] = await db.query(
                `SELECT parking.vehicle_type, parking.exit_time, parking.user_id, roles.roles_name
                FROM parking
                JOIN users ON users.id = ?
                JOIN roles ON roles.id = users.role_id
                WHERE parking.id = ?`,
                [session.userId, parkingId]
            );
            if (rows.length === 0) {
                send(res, 404, { error: "Parking record not found" });
                return;
            }
            if (rows[0].roles_name !== "Manager" && rows[0].user_id !== session.userId) {
                send(res, 403, { error: "You can only exit your own vehicles" });
                return;
            }
            if (rows[0].exit_time !== null) {
                send(res, 400, { error: "Vehicle has already exited" });
                return;
            }
            const normalizedVehicleType = String(rows[0].vehicle_type).trim().toLowerCase();
            if (
                normalizedVehicleType !== "car" &&
                normalizedVehicleType !== "bike"
            ) {
                send(res, 400, { error: "vehicle type must be 'Car' or 'Bike'" });
                return;
            }
            const amount = getParkingAmount(normalizedVehicleType);
            await db.query(
                "UPDATE parking SET exit_time = NOW(), status = 'EXITED' WHERE id = ? AND exit_time IS NULL",
                [parkingId]
            );
            const [updatedRows] = await db.query(
                "SELECT exit_time FROM parking WHERE id = ?",
                [parkingId]
            );
            send(res, 200, { message: "Vehicle exit recorded", amount, exit_time: updatedRows[0].exit_time, status: "EXITED" });
            return;
        } catch (error) {
            console.error("POST /parking/:id/exit error:", error);
            send(res, 500, { error: "Server error" });
            return;
        }
    }

    send(res, 404, {
        error: "API not found"
    });
});

server.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});