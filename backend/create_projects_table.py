#!/usr/bin/env python3
"""
Script pour créer la table generated_projects dans la base de données
"""
import mysql.connector
from config import config
import os

def create_projects_table():
    """Crée la table generated_projects si elle n'existe pas"""
    try:
        # Connexion à la base de données
        conn = mysql.connector.connect(**config.MYSQL_CONFIG)
        cursor = conn.cursor()

        print("🔌 Connecté à la base de données MySQL")

        # SQL directement dans le code
        sql = """
        CREATE TABLE IF NOT EXISTS generated_projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            project_name VARCHAR(255) NOT NULL,
            description TEXT,
            framework VARCHAR(50) NOT NULL,
            prompt TEXT,
            files_count INT DEFAULT 0,
            files_data LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """

        # Exécuter la requête
        cursor.execute(sql)
        conn.commit()

        print("✅ Table 'generated_projects' créée avec succès!")

        # Vérifier que la table existe
        cursor.execute("SHOW TABLES LIKE 'generated_projects'")
        result = cursor.fetchone()

        if result:
            print("✅ Vérification: La table existe bien")

            # Afficher la structure
            cursor.execute("DESCRIBE generated_projects")
            columns = cursor.fetchall()
            print("\n📋 Structure de la table:")
            for col in columns:
                print(f"   - {col[0]} ({col[1]})")

        cursor.close()
        conn.close()

    except mysql.connector.Error as e:
        print(f"❌ Erreur MySQL: {e}")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

    return True

if __name__ == "__main__":
    print("🚀 Création de la table generated_projects...")
    if create_projects_table():
        print("\n🎉 Migration terminée avec succès!")
    else:
        print("\n❌ La migration a échoué")
