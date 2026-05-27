const API_URL = "https://codentsika-v1.onrender.com";

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
