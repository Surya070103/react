export function hasPermission(permissionName) {
    const permissions = JSON.parse(
        localStorage.getItem("permissions") || "[]"
    );
    return permissions.includes(permissionName);
}