#!/usr/bin/env python3
"""
Script pour créer un compte admin dans la base de données
Usage: python create_admin.py
"""

import bcrypt
import sys
from config import config
from mysql.connector import pooling
from datetime import datetime

def create_admin_user():
    """Crée un compte admin dans la base de données"""
    
    # Créer le connection pool
    connection_pool = pooling.MySQLConnectionPool(**config.MYSQL_CONFIG)
    
    print("=== Création d'un compte Admin ===\n")
    
    # Entrées utilisateur
    email = input("Email de l'admin: ").strip().lower()
    name = input("Nom complet: ").strip()
    password = input("Mot de passe: ").strip()
    password_confirm = input("Confirmer le mot de passe: ").strip()
    
    # Validations
    if not email or "@" not in email:
        print("❌ Email invalide")
        return False
    
    if not name:
        print("❌ Nom requis")
        return False
    
    if len(password) < 8:
        print("❌ Le mot de passe doit avoir au moins 8 caractères")
        return False
    
    if password != password_confirm:
        print("❌ Les mots de passe ne correspondent pas")
        return False
    
    # Hasher le mot de passe avec bcrypt
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    # Connexion à la base
    conn = connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Vérifier si l'email existe déjà
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            print(f"❌ Un utilisateur avec l'email '{email}' existe déjà")
            cursor.close()
            conn.close()
            return False
        
        # Insérer l'admin
        now = datetime.now()
        cursor.execute("""
            INSERT INTO users (email, name, provider, password_hash, role, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (email, name, 'email', password_hash, 'admin', True, now, now))
        
        conn.commit()
        
        user_id = cursor.lastrowid
        print(f"\n✅ Admin créé avec succès!")
        print(f"   ID: {user_id}")
        print(f"   Email: {email}")
        print(f"   Name: {name}")
        print(f"\n📍 Vous pouvez maintenant vous connecter sur: http://localhost:5173/admin/login")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    try:
        if create_admin_user():
            sys.exit(0)
        else:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n❌ Annulé par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}")
        sys.exit(1)
