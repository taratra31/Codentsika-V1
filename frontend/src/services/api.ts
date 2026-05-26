const API_URL = "http://127.0.0.1:8000";

export async function getUsers() {
    const response = await fetch(`${API_URL}/api/users`);

    if (!response.ok) {
        throw new Error("Erreur serveur");
    }

    return response.json();
}

export async function getMessage() {
    const response = await fetch(`${API_URL}/`);

    if (!response.ok) {
        throw new Error("Erreur serveur");
    }

    return response.json();
}