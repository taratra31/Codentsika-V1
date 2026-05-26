# backend/auth/aibackend.py (fanitsiana)

import os
import json
import re
import httpx
from typing import List, Dict, Any
from config import config

class AIPipeline:
    """
    Pipeline 5 étapes pour générer un projet backend complet:
    1. Architecture
    2. Liste des fichiers JSON
    3. Génération fichier par fichier
    4. Vérification finale
    5. README.md
    """

    def __init__(self, framework: str, user_prompt: str, tables: List[Dict], relations: List[Dict], options: Dict):
        self.framework = "fastapi"  # Force fastapi
        self.user_prompt = user_prompt
        self.tables = tables
        self.relations = relations
        self.options = options
        self.api_key = config.NVIDIA_API_KEY
        self.api_url = config.NVIDIA_API_URL
        self.model = config.NVIDIA_MODEL

    def _project_name_slug(self) -> str:
        raw_prompt = (self.user_prompt or 'backend-api').split('\n\nSchéma de base de données:')[0]
        base = re.sub(r'[^a-zA-Z0-9]+', '-', raw_prompt.lower()).strip('-')
        return base[:50] or 'backend-api'

    def _singularize(self, name: str) -> str:
        if name.endswith('ies'):
            return name[:-3] + 'y'
        if name.endswith('s') and not name.endswith('ss'):
            return name[:-1]
        return name

    def _pascal_case(self, name: str) -> str:
        return ''.join(part.capitalize() for part in re.split(r'[_\-\s]+', name) if part)

    def _py_type(self, field_type: str) -> str:
        mapping = {
            'bigint': 'int', 'integer': 'int', 'foreignId': 'int',
            'string': 'str', 'text': 'str', 'boolean': 'bool',
            'decimal': 'float', 'date': 'str', 'datetime': 'datetime',
            'timestamps': 'datetime'
        }
        return mapping.get(field_type, 'str')

    def _sa_type(self, field_type: str) -> str:
        mapping = {
            'bigint': 'Integer', 'integer': 'Integer', 'foreignId': 'Integer',
            'string': 'String(255)', 'text': 'Text', 'boolean': 'Boolean',
            'decimal': 'Float', 'date': 'Date', 'datetime': 'DateTime'
        }
        return mapping.get(field_type, 'String(255)')

    def _fallback_architecture(self) -> str:
        return (
            f"Architecture locale de secours pour un projet {self.framework}. "
            f"Tables: {', '.join(t.get('name', 'table') for t in self.tables) or 'aucune'}. "
            f"Structure standard API REST avec routes, modèles, schémas, base de données et README."
        )

    def _fallback_files_list(self) -> List[Dict]:
        if self.framework == 'fastapi':
            files = [
                {'path': 'app/__init__.py', 'description': 'Package app', 'generation_order': 1},
                {'path': 'app/main.py', 'description': 'Point d’entrée FastAPI', 'generation_order': 2},
                {'path': 'app/database.py', 'description': 'Connexion base de données', 'generation_order': 3},
                {'path': 'app/models.py', 'description': 'Modèles SQLAlchemy', 'generation_order': 4},
                {'path': 'app/schemas.py', 'description': 'Schémas Pydantic', 'generation_order': 5},
                {'path': 'app/crud.py', 'description': 'CRUD de base', 'generation_order': 6},
                {'path': 'app/routers.py', 'description': 'Routes API', 'generation_order': 7},
                {'path': 'requirements.txt', 'description': 'Dépendances Python', 'generation_order': 8},
                {'path': 'README.md', 'description': 'Documentation', 'generation_order': 9},
            ]
        else:
            files = [
                {'path': 'routes/api.php', 'description': 'Routes API Laravel', 'generation_order': 1},
                {'path': 'app/Models/BaseModel.php', 'description': 'Base model', 'generation_order': 2},
                {'path': 'app/Http/Controllers/ApiController.php', 'description': 'Base controller', 'generation_order': 3},
                {'path': 'composer.json', 'description': 'Dépendances PHP', 'generation_order': 4},
                {'path': 'README.md', 'description': 'Documentation', 'generation_order': 5},
            ]
        return files

    def _build_fastapi_fallback_result(self) -> Dict[str, Any]:
        from datetime import datetime

        project_name = self._project_name_slug()
        tables = self.tables or [
            {'name': 'users', 'fields': [{'name': 'id', 'type': 'bigint', 'primary': True}, {'name': 'name', 'type': 'string'}]}
        ]

        imports = ['from datetime import datetime']
        imports.append('from sqlalchemy import Column, Integer, String, Text, Boolean, Float, Date, DateTime, ForeignKey')
        imports.append('from sqlalchemy.orm import declarative_base')
        imports.append('')
        imports.append('Base = declarative_base()')
        imports.append('')
        model_lines = imports

        schema_lines = ['from datetime import datetime', 'from pydantic import BaseModel', '', '']
        crud_lines = ['from sqlalchemy.orm import Session', 'from app import models, schemas', '', '']
        router_lines = [
            'from fastapi import APIRouter, Depends',
            'from sqlalchemy.orm import Session',
            'from app.database import SessionLocal',
            'from app import crud, schemas',
            '',
            'router = APIRouter()',
            '',
            'def get_db():',
            '    db = SessionLocal()',
            '    try:',
            '        yield db',
            '    finally:',
            '        db.close()',
            ''
        ]

        for table in tables:
            table_name = table.get('name', 'items')
            model_name = self._pascal_case(self._singularize(table_name))
            fields = table.get('fields', [])

            model_lines.append(f'class {model_name}(Base):')
            model_lines.append(f'    __tablename__ = "{table_name}"')
            has_id = False
            for field in fields:
                fname = field.get('name', 'field')
                ftype = field.get('type', 'string')
                primary = field.get('primary', False)
                nullable = field.get('nullable', False)
                unique = field.get('unique', False)
                if fname == 'timestamps' or ftype == 'timestamps':
                    model_lines.append('    created_at = Column(DateTime, default=datetime.utcnow)')
                    model_lines.append('    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)')
                    continue
                column_type = self._sa_type(ftype)
                args = [column_type]
                if ftype == 'foreignId':
                    args = ['Integer']
                kwargs = []
                if primary:
                    kwargs.append('primary_key=True')
                    has_id = True
                if unique:
                    kwargs.append('unique=True')
                if nullable:
                    kwargs.append('nullable=True')
                if ftype == 'foreignId' and fname.endswith('_id'):
                    target = fname[:-3] + 's'
                    args.append(f'ForeignKey("{target}.id")')
                model_lines.append(f'    {fname} = Column({", ".join(args + kwargs)})')
            if not has_id:
                model_lines.append('    id = Column(Integer, primary_key=True, index=True)')
            model_lines.append('')

            create_fields = []
            response_fields = []
            for field in fields:
                fname = field.get('name', 'field')
                ftype = field.get('type', 'string')
                if fname == 'timestamps' or ftype == 'timestamps':
                    continue
                py_type = self._py_type(ftype)
                if not field.get('primary', False):
                    create_fields.append(f'    {fname}: {py_type}')
                response_fields.append(f'    {fname}: {py_type}')
            if not any(f.get('primary') for f in fields):
                response_fields.insert(0, '    id: int')

            schema_lines.append(f'class {model_name}Create(BaseModel):')
            schema_lines.extend(create_fields or ['    pass'])
            schema_lines.append('')
            schema_lines.append(f'class {model_name}Response(BaseModel):')
            schema_lines.extend(response_fields or ['    id: int'])
            schema_lines.append('')
            schema_lines.append('    class Config:')
            schema_lines.append('        from_attributes = True')
            schema_lines.append('')

            crud_lines.append(f'def list_{table_name}(db: Session):')
            crud_lines.append(f'    return db.query(models.{model_name}).all()')
            crud_lines.append('')
            crud_lines.append(f'def create_{self._singularize(table_name)}(db: Session, payload: schemas.{model_name}Create):')
            crud_lines.append(f'    item = models.{model_name}(**payload.model_dump())')
            crud_lines.append('    db.add(item)')
            crud_lines.append('    db.commit()')
            crud_lines.append('    db.refresh(item)')
            crud_lines.append('    return item')
            crud_lines.append('')

            route_name = self._singularize(table_name)
            router_lines.append(f'@router.get("/{table_name}", response_model=list[schemas.{model_name}Response])')
            router_lines.append(f'def get_{table_name}(db: Session = Depends(get_db)):')
            router_lines.append(f'    return crud.list_{table_name}(db)')
            router_lines.append('')
            router_lines.append(f'@router.post("/{table_name}", response_model=schemas.{model_name}Response)')
            router_lines.append(f'def create_{route_name}(payload: schemas.{model_name}Create, db: Session = Depends(get_db)):')
            router_lines.append(f'    return crud.create_{route_name}(db, payload)')
            router_lines.append('')

        database_py = '\n'.join([
            'from sqlalchemy import create_engine',
            'from sqlalchemy.orm import sessionmaker',
            '',
            'DATABASE_URL = "sqlite:///./app.db"',
            'engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})',
            'SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)',
        ])

        main_py = '\n'.join([
            'from fastapi import FastAPI',
            'from fastapi.middleware.cors import CORSMiddleware',
            'from app.database import engine',
            'from app.models import Base',
            'from app.routers import router',
            '',
            f'app = FastAPI(',
            f'    title="{project_name}",',
            '    description="API backend générée par Codentsika",',
            '    version="1.0.0",',
            '    docs_url="/docs",',
            '    redoc_url="/redoc",',
            '    openapi_url="/openapi.json",',
            ')',
            'app.add_middleware(',
            '    CORSMiddleware,',
            '    allow_origins=["*"],',
            '    allow_credentials=True,',
            '    allow_methods=["*"],',
            '    allow_headers=["*"],',
            ')',
            'Base.metadata.create_all(bind=engine)',
            'app.include_router(router, prefix="/api")',
            '',
            '@app.get("/", tags=["System"])',
            'def root():',
            '    return {',
            '        "message": "API generated successfully",',
            '        "docs": "/docs",',
            '        "redoc": "/redoc",',
            '        "openapi": "/openapi.json"',
            '    }',
            '',
            '@app.get("/health", tags=["System"])',
            'def health():',
            '    return {"status": "ok"}',
        ])

        requirements_txt = '\n'.join([
            'fastapi>=0.110.0',
            'uvicorn[standard]>=0.29.0',
            'sqlalchemy>=2.0.0',
            'pydantic>=2.0.0',
        ])

        readme = f'''# {project_name}\n\nProjet FastAPI généré via le fallback local de Codentsika.\n\n## Lancer\n\n```bash\npip install -r requirements.txt\nuvicorn app.main:app --reload\n```\n\n## Documentation Swagger\n\n- Swagger UI: `http://127.0.0.1:8000/docs`\n- ReDoc: `http://127.0.0.1:8000/redoc`\n- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`\n\n## Endpoints\n\n- `GET /`\n- `GET /health`\n- `GET /api/...`\n- `POST /api/...`\n'''

        files = {
            'app/__init__.py': '',
            'app/main.py': main_py,
            'app/database.py': database_py,
            'app/models.py': '\n'.join(model_lines),
            'app/schemas.py': '\n'.join(schema_lines),
            'app/crud.py': '\n'.join(crud_lines),
            'app/routers.py': '\n'.join(router_lines),
            'requirements.txt': requirements_txt,
            'README.md': readme,
        }

        return {
            'project_name': project_name,
            'description': 'Projet fastapi généré localement (fallback sans IA)',
            'files': [{'path': path, 'content': content} for path, content in files.items()]
        }

    def _build_laravel_fallback_result(self) -> Dict[str, Any]:
        project_name = self._project_name_slug()
        files = {
            'routes/api.php': '<?php\n\nuse Illuminate\\Support\\Facades\\Route;\n\nRoute::get("/health", function () {\n    return response()->json(["status" => "ok"]);\n});\n',
            'app/Http/Controllers/ApiController.php': '<?php\n\nnamespace App\\Http\\Controllers;\n\nuse Illuminate\\Http\\Request;\n\nclass ApiController extends Controller\n{\n    public function index()\n    {\n        return response()->json(["message" => "Laravel fallback project generated successfully"]);\n    }\n}\n',
            'app/Models/BaseModel.php': '<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Model;\n\nclass BaseModel extends Model\n{\n    protected $guarded = [];\n}\n',
            'composer.json': json.dumps({
                'name': project_name,
                'type': 'project',
                'require': {'php': '^8.2', 'laravel/framework': '^11.0'}
            }, indent=2),
            'README.md': f'# {project_name}\n\nProjet Laravel généré localement (fallback sans IA).\n'
        }
        return {
            'project_name': project_name,
            'description': 'Projet laravel généré localement (fallback sans IA)',
            'files': [{'path': path, 'content': content} for path, content in files.items()]
        }

    def build_fallback_result(self) -> Dict[str, Any]:
        """Résultat minimal si l'IA échoue"""
        return self._build_fastapi_fallback_result()

    def _call_llm(self, messages: List[Dict], temperature: float = 0.2, timeout_seconds: float = 90.0, max_tokens: int = 4096) -> str:
        """Appel API NVIDIA avec gestion d'erreur et timeout court pour éviter les blocages."""
        url = f"{self.api_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": 0.9,
        }

        try:
            timeout = httpx.Timeout(timeout_seconds, connect=20.0)
            with httpx.Client(timeout=timeout, verify=False) as client:
                response = client.post(url, json=payload, headers=headers)
                if response.status_code != 200:
                    raise Exception(f"HTTP {response.status_code}: {response.text[:200]}")
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            raise Exception(f"Erreur LLM: {str(e)}")

    def step1_architecture(self) -> str:
        """Prompt 1: Génération de l'architecture"""
        system = f"""Tu es un architecte backend senior spécialisé en {self.framework}.

Je veux générer un projet backend complet avec {self.framework}.
Type de projet : API REST
Base de données : MySQL
Authentification : {'Oui (JWT/Sanctum)' if self.options.get('auth') else 'Non'}
Fonctionnalités principales : {self.user_prompt}

Voici le schéma de base de données à implémenter:
Tables: {json.dumps(self.tables, indent=2)}
Relations: {json.dumps(self.relations, indent=2)}

Donne uniquement l'architecture du projet :
- dossiers
- fichiers
- rôle de chaque fichier
- endpoints API
- modèles de données
- ordre de génération des fichiers

Ne génère pas encore le code."""

        response = self._call_llm([
            {"role": "system", "content": "Tu es un architecte backend senior. Réponds de manière structurée sans markdown inutile."},
            {"role": "user", "content": system}
        ], temperature=0.3, timeout_seconds=25.0, max_tokens=3000)
        return response

    def step2_files_list(self, architecture: str) -> List[Dict]:
        """Prompt 2: Génération de la liste JSON des fichiers"""
        system = f"""À partir de cette architecture, retourne uniquement un JSON valide.

Architecture:
{architecture}

Format obligatoire :
{{
  "project_name": "nom-du-projet",
  "framework": "{self.framework}",
  "files": [
    {{
      "path": "chemin/du/fichier",
      "description": "rôle du fichier",
      "generation_order": 1
    }}
  ]
}}

RÈGLES:
- Ne mets aucune explication
- Ne mets pas de markdown
- Retourne UNIQUEMENT le JSON
- Les chemins doivent être relatifs (ex: app/Models/User.py ou app/Models/User.php)"""

        response = self._call_llm([
            {"role": "system", "content": "Tu es un générateur de structure de projet. Retourne UNIQUEMENT du JSON valide sans texte autour."},
            {"role": "user", "content": system}
        ], temperature=0.2, timeout_seconds=20.0, max_tokens=2000)

        # Nettoyage du markdown
        response = re.sub(r'```json\s*', '', response)
        response = re.sub(r'```\s*', '', response)

        try:
            data = json.loads(response)
            return data.get("files", [])
        except json.JSONDecodeError as e:
            raise Exception(f"Erreur parsing JSON: {e}\nRéponse: {response[:500]}")

    def step3_generate_file(self, file_info: Dict, architecture: str, previous_files: Dict[str, str]) -> str:
        """Prompt 3: Génération d'un fichier spécifique"""
        try:
            context_files = ""
            # Ajouter le contexte des fichiers déjà générés (max 5)
            for path, content in list(previous_files.items())[-5:]:
                context_files += f"\n### {path}\n{content[:500]}...\n"

            system = f"""Tu es un développeur backend senior.

Génère uniquement le contenu complet du fichier suivant :

Framework : {self.framework}
Projet : {file_info.get('project_name', 'backend-api')}
Fichier à générer : {file_info['path']}
Description : {file_info.get('description', '')}

Contexte architecture :
{architecture[:2000]}

Contexte fichiers déjà générés :
{context_files}

Règles ABSOLUES :
- retourne uniquement le code du fichier
- pas d'explication
- pas de markdown (pas de ```)
- code propre, sécurisé et prêt à exécuter
- respecte les imports et dépendances du projet
- code 100% complet, pas de TODO, pas de placeholder"""

            response = self._call_llm([
                {"role": "system", "content": "Tu es un développeur backend senior. Retourne UNIQUEMENT le code source, sans commentaires explicatifs ni markdown."},
                {"role": "user", "content": system}
            ], temperature=0.2, timeout_seconds=15.0, max_tokens=2200)

            # Nettoyer les éventuels blocs markdown
            response = re.sub(r'^```[\w]*\n', '', response)
            response = re.sub(r'\n```$', '', response)

            if not response or len(response.strip()) < 10:
                raise ValueError("Réponse LLM vide ou trop courte")

            return response
        except Exception as e:
            print(f"  ⚠️ Création fichier placeholder pour {file_info['path']}: {str(e)[:80]}")
            # Créer un fichier placeholder plutôt que de laisser vide
            path = file_info['path']
            if path.endswith('.py'):
                return f"# {path}\n# TODO: Cette section a échoué à générer\n# Message: {str(e)[:100]}\n"
            elif path.endswith('.php'):
                return f"<?php\n// {path}\n// TODO: Cette section a échoué à générer\n// Message: {str(e)[:100]}\n"
            elif path.endswith('.json'):
                return '{"error": "Generation failed", "message": "' + str(e)[:100] + '"}'
            elif path.endswith('.md'):
                return f"# {path}\n\n_TODO: Cette section a échoué à générer_\n\n```\n{str(e)[:200]}\n```"
            else:
                return f"# File: {path}\n# Generation failed: {str(e)[:100]}\n"

    def step4_verification(self, files: Dict[str, str]) -> Dict:
        """Prompt 4: Vérification finale du projet complet"""
        files_summary = []
        for path, content in list(files.items())[:20]:  # Limite pour le contexte
            files_summary.append({
                "path": path,
                "size": len(content),
                "first_lines": content[:200]
            })

        system = f"""Tu es un reviewer backend senior.

Voici la liste des fichiers générés pour un projet {self.framework}:
{json.dumps(files_summary, indent=2)}

Vérifie :
- imports manquants
- routes incorrectes
- dépendances manquantes
- erreurs de structure
- fichiers manquants
- instructions d'installation

Retourne uniquement un JSON :
{{
  "status": "ok" ou "needs_fix",
  "missing_files": [],
  "errors": [],
  "fixes": [],
  "run_commands": []
}}"""

        response = self._call_llm([
            {"role": "system", "content": "Tu es un reviewer backend senior. Retourne UNIQUEMENT du JSON valide."},
            {"role": "user", "content": system}
        ], temperature=0.2, timeout_seconds=10.0, max_tokens=1200)

        response = re.sub(r'```json\s*', '', response)
        response = re.sub(r'```\s*', '', response)

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"status": "ok", "missing_files": [], "errors": [], "fixes": [], "run_commands": []}

    def step5_readme(self, files: Dict[str, str], verification: Dict) -> str:
        """Prompt 5: Génération du README.md"""
        endpoints = []
        # Extraire les endpoints des fichiers de routes
        for path, content in files.items():
            if "routes" in path or "router" in path:
                endpoints.append(content[:500])

        system = f"""Génère un README.md professionnel pour ce projet {self.framework}.

Projet : API Backend
Base de données : MySQL
Authentification : {'Activée' if self.options.get('auth') else 'Non activée'}
Options incluses : {json.dumps(self.options)}

Il doit contenir :
- présentation du projet
- stack utilisée ({self.framework}, MySQL, etc.)
- installation (clone, dépendances)
- configuration .env (toutes les variables)
- migration base de données
- lancement du serveur
- endpoints principaux (avec exemples)
- authentification (si présente)
- exemples de requêtes API (curl)

Retourne uniquement le contenu du README.md."""

        response = self._call_llm([
            {"role": "system", "content": "Tu es un rédacteur technique. Retourne UNIQUEMENT le contenu du README.md, sans texte autour."},
            {"role": "user", "content": system}
        ], temperature=0.3, timeout_seconds=10.0, max_tokens=1800)

        # Nettoyer les markdown du README lui-même
        response = re.sub(r'^```markdown\n', '', response)
        response = re.sub(r'\n```$', '', response)

        return response

    def run_pipeline(self) -> Dict[str, Any]:
        """Exécute le pipeline complet 5 étapes"""
        try:
            print("\n" + "="*60)
            print("🚀 DÉMARRAGE DU PIPELINE DE GÉNÉRATION")
            print("="*60)

            print("\n🚀 Étape 1/5: Génération de l'architecture...")
            try:
                architecture = self.step1_architecture()
                print(f"✅ Architecture générée ({len(architecture)} chars)")
            except Exception as e:
                print(f"⚠️ Échec étape 1 IA: {str(e)[:120]}")
                print("🛟 Bascule vers le générateur local de secours...")
                return self.build_fallback_result()

            print("\n📋 Étape 2/5: Génération de la liste des fichiers...")
            try:
                files_list = self.step2_files_list(architecture)
                print(f"✅ {len(files_list)} fichiers identifiés")
            except Exception as e:
                print(f"⚠️ Échec étape 2 IA: {str(e)[:120]}")
                print("🛟 Bascule vers le générateur local de secours...")
                return self.build_fallback_result()

            if not files_list:
                print("⚠️ Aucun fichier identifié par l'IA")
                print("🛟 Bascule vers le générateur local de secours...")
                return self.build_fallback_result()

            # Trier par ordre de génération
            files_list.sort(key=lambda x: x.get("generation_order", 999))

            # Limiter le nombre de fichiers pour éviter les timeouts
            MAX_FILES = 10
            if len(files_list) > MAX_FILES:
                print(f"⚠️ Limitation à {MAX_FILES} fichiers principaux pour éviter timeout")
                files_list = files_list[:MAX_FILES]

            print(f"\n📁 Génération de {len(files_list)} fichiers...")

            generated_files = {}
            project_name = "backend-api"

            # Étape 3: Génération fichier par fichier
            for idx, file_info in enumerate(files_list, 1):
                try:
                    if "path" not in file_info:
                        print(f"⚠️ Fichier #{idx} sans path: {file_info}")
                        continue

                    print(f"  ✍️ [{idx}/{len(files_list)}] {file_info['path']}...", end="", flush=True)

                    # Ajouter le nom du projet si manquant
                    if "project_name" not in file_info:
                        file_info["project_name"] = project_name

                    content = self.step3_generate_file(file_info, architecture, generated_files)
                    generated_files[file_info["path"]] = content
                    project_name = file_info.get("project_name", project_name)
                    print(" ✅")
                except Exception as e:
                    print(f" ❌ Erreur: {str(e)[:80]}")
                    # Continuer avec le fichier suivant
                    continue

            if not generated_files:
                print("❌ ERREUR: Aucun fichier n'a été généré avec succès")
                raise ValueError("Aucun fichier n'a été généré")

            print(f"\n🔍 Étape 4/5: Vérification finale...")
            verification = self.step4_verification(generated_files)
            print(f"✅ Vérification terminée")

            print(f"\n📖 Étape 5/5: Génération du README.md...")
            readme_content = self.step5_readme(generated_files, verification)

            # Ajouter le README s'il n'existe pas déjà
            if "README.md" not in generated_files:
                generated_files["README.md"] = readme_content
            print(f"✅ README généré")

            print("\n" + "="*60)
            print(f"✅ PIPELINE TERMINÉ: {len(generated_files)} fichiers générés")
            print("="*60 + "\n")

            result = {
                "project_name": project_name,
                "description": f"Projet {self.framework} généré automatiquement",
                "files": [{"path": path, "content": content} for path, content in generated_files.items()]
            }

            # Vérifier que le résultat est sérialisable en JSON
            import json
            try:
                json.dumps(result)
                print("✅ Résultat validé et prêt à être envoyé")
            except Exception as e:
                print(f"❌ ERREUR: Résultat non sérialisable: {str(e)}")
                raise

            return result

        except Exception as e:
            print("\n" + "="*60)
            print(f"❌ ERREUR CRITIQUE DANS LE PIPELINE")
            print("="*60)
            print(f"Type: {type(e).__name__}")
            print(f"Message: {str(e)}")
            import traceback
            print("\nTraceback complet:")
            print(traceback.format_exc())
            print("="*60 + "\n")
            raise


# Fonction principale modifiée
def call_ai_project_builder(framework: str, user_prompt: str, tables: List[Dict] = None, relations: List[Dict] = None, options: Dict = None) -> dict:
    """
    Génère un projet backend COMPLET via pipeline 5 étapes.

    Args:
        framework: "laravel" ou "fastapi"
        user_prompt: Description du projet par l'utilisateur
        tables: Liste des tables du schéma (optionnel)
        relations: Liste des relations (optionnel)
        options: Options sélectionnées (auth, docker, etc.)

    Returns:
        dict: { project_name, description, files: [{path, content}] }
    """
    api_key = config.NVIDIA_API_KEY
    if not api_key:
        raise Exception("Clé d'API NVIDIA non configurée dans le .env.")

    # Valeurs par défaut
    tables = tables or []
    relations = relations or []
    options = options or {"auth": True, "docker": False, "docs": True, "cors": True}

    # Créer le prompt utilisateur enrichi avec le schéma
    schema_context = ""
    if tables:
        schema_context = f"\n\nSchéma de base de données:\nTables: {json.dumps(tables, indent=2)}\nRelations: {json.dumps(relations, indent=2)}"

    full_prompt = f"{user_prompt}{schema_context}"

    # Exécuter le pipeline
    pipeline = AIPipeline(framework, full_prompt, tables, relations, options)
    result = pipeline.run_pipeline()

    # Validation de la structure
    if not result.get("files"):
        raise ValueError("Aucun fichier généré par le pipeline")

    return result


# Version simplifiée pour garder la compatibilité avec le code existant
def call_ai_project_builder_simple(framework: str, user_prompt: str) -> dict:
    """Version simplifiée pour compatibilité"""
    return call_ai_project_builder(framework, user_prompt, [], [], {})
