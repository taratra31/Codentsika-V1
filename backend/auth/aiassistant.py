# backend/auth/aiassistant.py
import os
import json
import re
import httpx
from config import config

# System prompt optimisé pour rendre l'IA ultra performante et généraliste (style DeepSeek-R1)
SYSTEM_PROMPT = (
    "Tu es Codentsika AI, un assistant IA généraliste et de programmation de pointe, conçu pour égaler les performances de modèles de raisonnement avancés comme DeepSeek-R1. "
    "Tu es un expert absolu dans tous les domaines de la connaissance générale, de l'explication conceptuelle, ainsi que de la conception d'architectures logicielles, du développement backend (FastAPI, Python), les bases de données (MySQL, PostgreSQL, Redis) et la création d'APIs.\n\n"
    "Consignes de réponse :\n"
    "1. **Polyvalence** : Réponds avec précision et profondeur à TOUTES les requêtes de l'utilisateur, qu'il s'agisse de programmation, de culture générale, d'explications techniques, ou de simples discussions de la vie quotidienne. Ne te limite pas uniquement au code.\n"
    "2. **Raisonnement Analytique** : Explique brièvement ta logique de réflexion. Si la question ou le problème est complexe, décompose-le en étapes claires et structurées (comme le fait DeepSeek-R1).\n"
    "3. **Qualité de code irréprochable** : Si du code est requis, fournis du code moderne, propre, sécurisé et prêt pour la production (pas de placeholders incomplets). Gère les exceptions et commente les parties critiques.\n"
    "4. **Formatage Premium** : Structure tes réponses de manière esthétique avec le format Markdown (titres, listes à puces, blocs de code colorés, etc.)."
)

def call_ai_chat(chat_messages: list) -> dict:
    """
    Envoie l'historique des messages à l'API NVIDIA AI en utilisant httpx.
    Gère le contournement SSL pour macOS avec verify=False et supporte des temps de réponse longs.
    """
    api_key = config.NVIDIA_API_KEY
    api_url = config.NVIDIA_API_URL
    model = config.NVIDIA_MODEL

    if not api_key:
        return {
            "role": "assistant",
            "content": "Erreur : La clé d'API NVIDIA (NVIDIA_API_KEY) n'est pas configurée dans le fichier .env du backend."
        }

    # Formater les messages pour l'API
    formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in chat_messages:
        # Prendre en charge les objets BaseModel ou dictionnaires simples
        if hasattr(msg, "role") and hasattr(msg, "content"):
            role = msg.role
            content = msg.content
        else:
            role = msg.get("role", "user")
            content = msg.get("content", "")

        if role not in ["user", "assistant", "system"]:
            role = "user"

        formatted_messages.append({"role": role, "content": content})

    url = f"{api_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": formatted_messages,
        "temperature": 0.5,
        "max_tokens": 2048
    }

    try:
        with httpx.Client(verify=False) as client:
            response = client.post(url, json=payload, headers=headers, timeout=180.0)
            if response.status_code == 200:
                res_body = response.json()
                ai_content = res_body["choices"][0]["message"]["content"]
                return {
                    "role": "assistant",
                    "content": ai_content
                }
            else:
                err_detail = response.text
                try:
                    err_json = response.json()
                    err_detail = err_json.get("detail", response.text)
                except Exception:
                    pass
                raise Exception(f"Erreur de l'API NVIDIA (Code {response.status_code}) : {err_detail}")
    except Exception as e:
        raise Exception(f"Erreur de communication avec l'IA (NVIDIA API) : {str(e)}")


async def stream_ai_chat(chat_messages: list):
    """
    Génère un flux de tokens (streaming) depuis l'API NVIDIA en temps réel de façon asynchrone.
    Gère le contournement SSL pour macOS avec verify=False et httpx.AsyncClient.
    """
    api_key = config.NVIDIA_API_KEY
    api_url = config.NVIDIA_API_URL
    model = config.NVIDIA_MODEL

    if not api_key:
        yield "Erreur : La clé d'API NVIDIA (NVIDIA_API_KEY) n'est pas configurée dans le fichier .env du backend."
        return

    formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in chat_messages:
        if hasattr(msg, "role") and hasattr(msg, "content"):
            role = msg.role
            content = msg.content
        else:
            role = msg.get("role", "user")
            content = msg.get("content", "")

        if role not in ["user", "assistant", "system"]:
            role = "user"

        formatted_messages.append({"role": role, "content": content})

    url = f"{api_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": formatted_messages,
        "temperature": 0.5,
        "max_tokens": 2048,
        "stream": True
    }

    try:
        async with httpx.AsyncClient(verify=False) as client:
            async with client.stream("POST", url, json=payload, headers=headers, timeout=90.0) as response:
                if response.status_code != 200:
                    yield f"Erreur de l'API NVIDIA (Code {response.status_code})"
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            data_json = json.loads(data_str)
                            delta = data_json["choices"][0]["delta"]
                            content = delta.get("content", "")
                            if content:
                                yield content
                        except Exception:
                            pass
    except Exception as e:
        yield f"Erreur de communication avec l'IA (Streaming) : {str(e)}"
