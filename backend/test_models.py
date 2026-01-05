"""
Script de testing para los modelos de datos
Verifica que todos los modelos de Pydantic funcionen correctamente
"""
import sys
from datetime import datetime
from pydantic import ValidationError

# Importar modelos
from models.user import (
    UserCreate,
    UserUpdate,
    UserInDB,
    UserResponse,
    UserLogin,
    UserProgress,
    UserSettings,
    GoogleAuthRequest,
    PasswordResetRequest
)

from models.progress import (
    ModuleProgressUpdate,
    SubtaskProgressUpdate,
    NoteUpdate,
    ProgressSync,
    ProgressResponse,
    BadgeAdd,
    XPAdd,
    ProgressStats
)

def test_user_models():
    """Test de modelos de usuario"""
    print("\n" + "="*60)
    print("🧪 TESTING MODELOS DE USUARIO")
    print("="*60)
    
    tests_passed = 0
    tests_failed = 0
    
    # Test 1: UserCreate válido
    try:
        user_create = UserCreate(
            email="test@example.com",
            display_name="Test User",
            password="Password123"
        )
        print("✅ Test 1: UserCreate válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 1: UserCreate válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 2: UserCreate con contraseña débil
    try:
        user_create = UserCreate(
            email="test@example.com",
            display_name="Test User",
            password="weak"
        )
        print("❌ Test 2: UserCreate contraseña débil - FAILED (debería fallar)")
        tests_failed += 1
    except ValidationError:
        print("✅ Test 2: UserCreate contraseña débil - PASSED (validación correcta)")
        tests_passed += 1
    
    # Test 3: UserSettings válido
    try:
        settings = UserSettings(
            notifications=True,
            theme="dark",
            language="es"
        )
        print("✅ Test 3: UserSettings válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 3: UserSettings válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 4: UserSettings con tema inválido
    try:
        settings = UserSettings(
            theme="invalid_theme"
        )
        print("❌ Test 4: UserSettings tema inválido - FAILED (debería fallar)")
        tests_failed += 1
    except ValidationError:
        print("✅ Test 4: UserSettings tema inválido - PASSED (validación correcta)")
        tests_passed += 1
    
    # Test 5: UserProgress
    try:
        progress = UserProgress(
            modules={"1": True, "2": False},
            subtasks={"1-0": True, "1-1": False},
            notes={"1": "Test note"},
            badges=["core", "technical"],
            xp=150
        )
        print("✅ Test 5: UserProgress válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 5: UserProgress válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 6: UserLogin
    try:
        login = UserLogin(
            email="user@example.com",
            password="Password123"
        )
        print("✅ Test 6: UserLogin válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 6: UserLogin válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 7: UserUpdate parcial
    try:
        update = UserUpdate(
            display_name="Updated Name"
        )
        print("✅ Test 7: UserUpdate parcial - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 7: UserUpdate parcial - FAILED: {e}")
        tests_failed += 1
    
    print(f"\n📊 Resultado: {tests_passed} passed, {tests_failed} failed")
    return tests_passed, tests_failed


def test_progress_models():
    """Test de modelos de progreso"""
    print("\n" + "="*60)
    print("🧪 TESTING MODELOS DE PROGRESO")
    print("="*60)
    
    tests_passed = 0
    tests_failed = 0
    
    # Test 1: ModuleProgressUpdate válido
    try:
        module_update = ModuleProgressUpdate(
            module_id="1",
            is_completed=True
        )
        print("✅ Test 1: ModuleProgressUpdate válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 1: ModuleProgressUpdate válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 2: ModuleProgressUpdate con ID inválido
    try:
        module_update = ModuleProgressUpdate(
            module_id="invalid",
            is_completed=True
        )
        print("❌ Test 2: ModuleProgressUpdate ID inválido - FAILED (debería fallar)")
        tests_failed += 1
    except ValidationError:
        print("✅ Test 2: ModuleProgressUpdate ID inválido - PASSED (validación correcta)")
        tests_passed += 1
    
    # Test 3: SubtaskProgressUpdate válido
    try:
        subtask_update = SubtaskProgressUpdate(
            module_id="1",
            task_index=0,
            is_completed=True
        )
        assert subtask_update.subtask_key == "1-0"
        print("✅ Test 3: SubtaskProgressUpdate válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 3: SubtaskProgressUpdate válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 4: NoteUpdate válido
    try:
        note = NoteUpdate(
            module_id="1",
            note_text="Este es un texto de nota válido"
        )
        print("✅ Test 4: NoteUpdate válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 4: NoteUpdate válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 5: NoteUpdate con texto vacío
    try:
        note = NoteUpdate(
            module_id="1",
            note_text="   "
        )
        print("❌ Test 5: NoteUpdate texto vacío - FAILED (debería fallar)")
        tests_failed += 1
    except ValidationError:
        print("✅ Test 5: NoteUpdate texto vacío - PASSED (validación correcta)")
        tests_passed += 1
    
    # Test 6: ProgressSync válido
    try:
        sync = ProgressSync(
            modules={"1": True, "2": False},
            subtasks={"1-0": True, "1-1": True},
            notes={"1": "Note 1"},
            badges=["core", "technical", "core"],  # Duplicado
            xp=250
        )
        # Los badges duplicados deberían ser removidos
        assert len(sync.badges) == 2
        print("✅ Test 6: ProgressSync válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 6: ProgressSync válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 7: BadgeAdd válido
    try:
        badge = BadgeAdd(badge_name="advanced-qa")
        assert badge.badge_name == "advanced-qa"
        print("✅ Test 7: BadgeAdd válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 7: BadgeAdd válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 8: XPAdd válido
    try:
        xp_add = XPAdd(
            amount=50,
            reason="Completó módulo 1"
        )
        print("✅ Test 8: XPAdd válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 8: XPAdd válido - FAILED: {e}")
        tests_failed += 1
    
    # Test 9: XPAdd con cantidad inválida
    try:
        xp_add = XPAdd(amount=-10)
        print("❌ Test 9: XPAdd cantidad negativa - FAILED (debería fallar)")
        tests_failed += 1
    except ValidationError:
        print("✅ Test 9: XPAdd cantidad negativa - PASSED (validación correcta)")
        tests_passed += 1
    
    # Test 10: ProgressStats
    try:
        stats = ProgressStats(
            total_modules=10,
            completed_modules=3,
            completion_percentage=30.0,
            total_xp=450
        )
        print("✅ Test 10: ProgressStats válido - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 10: ProgressStats válido - FAILED: {e}")
        tests_failed += 1
    
    print(f"\n📊 Resultado: {tests_passed} passed, {tests_failed} failed")
    return tests_passed, tests_failed


def test_validators():
    """Test de validadores"""
    print("\n" + "="*60)
    print("🧪 TESTING VALIDADORES")
    print("="*60)
    
    from utils.validators import (
        validate_email_format,
        validate_password_strength,
        validate_display_name,
        validate_module_id,
        validate_badge_name,
        validate_xp_amount,
        sanitize_text
    )
    
    tests_passed = 0
    tests_failed = 0
    
    # Test 1: Email válido
    is_valid, error = validate_email_format("test@example.com")
    if is_valid:
        print("✅ Test 1: Email válido - PASSED")
        tests_passed += 1
    else:
        print(f"❌ Test 1: Email válido - FAILED: {error}")
        tests_failed += 1
    
    # Test 2: Email inválido
    is_valid, error = validate_email_format("invalid-email")
    if not is_valid:
        print("✅ Test 2: Email inválido - PASSED")
        tests_passed += 1
    else:
        print("❌ Test 2: Email inválido - FAILED (debería fallar)")
        tests_failed += 1
    
    # Test 3: Contraseña válida
    is_valid, error = validate_password_strength("Password123")
    if is_valid:
        print("✅ Test 3: Contraseña válida - PASSED")
        tests_passed += 1
    else:
        print(f"❌ Test 3: Contraseña válida - FAILED: {error}")
        tests_failed += 1
    
    # Test 4: Contraseña débil
    is_valid, error = validate_password_strength("weak")
    if not is_valid:
        print("✅ Test 4: Contraseña débil - PASSED")
        tests_passed += 1
    else:
        print("❌ Test 4: Contraseña débil - FAILED (debería fallar)")
        tests_failed += 1
    
    # Test 5: Nombre válido
    is_valid, error = validate_display_name("Juan Pérez")
    if is_valid:
        print("✅ Test 5: Nombre válido - PASSED")
        tests_passed += 1
    else:
        print(f"❌ Test 5: Nombre válido - FAILED: {error}")
        tests_failed += 1
    
    # Test 6: Module ID válido
    is_valid, error = validate_module_id("5")
    if is_valid:
        print("✅ Test 6: Module ID válido - PASSED")
        tests_passed += 1
    else:
        print(f"❌ Test 6: Module ID válido - FAILED: {error}")
        tests_failed += 1
    
    # Test 7: Badge válido
    is_valid, error = validate_badge_name("advanced-qa")
    if is_valid:
        print("✅ Test 7: Badge válido - PASSED")
        tests_passed += 1
    else:
        print(f"❌ Test 7: Badge válido - FAILED: {error}")
        tests_failed += 1
    
    # Test 8: XP válido
    is_valid, error = validate_xp_amount(500)
    if is_valid:
        print("✅ Test 8: XP válido - PASSED")
        tests_passed += 1
    else:
        print(f"❌ Test 8: XP válido - FAILED: {error}")
        tests_failed += 1
    
    # Test 9: Sanitize text
    sanitized = sanitize_text("  Texto con espacios  ")
    if sanitized == "Texto con espacios":
        print("✅ Test 9: Sanitize text - PASSED")
        tests_passed += 1
    else:
        print(f"❌ Test 9: Sanitize text - FAILED")
        tests_failed += 1
    
    print(f"\n📊 Resultado: {tests_passed} passed, {tests_failed} failed")
    return tests_passed, tests_failed


def main():
    """Ejecutar todos los tests"""
    print("\n" + "="*60)
    print("🚀 INICIANDO TESTS DE MODELOS")
    print("="*60)
    
    total_passed = 0
    total_failed = 0
    
    # Test modelos de usuario
    passed, failed = test_user_models()
    total_passed += passed
    total_failed += failed
    
    # Test modelos de progreso
    passed, failed = test_progress_models()
    total_passed += passed
    total_failed += failed
    
    # Test validadores
    passed, failed = test_validators()
    total_passed += passed
    total_failed += failed
    
    # Resumen final
    print("\n" + "="*60)
    print("📊 RESUMEN FINAL")
    print("="*60)
    print(f"✅ Tests exitosos: {total_passed}")
    print(f"❌ Tests fallidos: {total_failed}")
    print(f"📈 Total: {total_passed + total_failed}")
    
    if total_failed == 0:
        print("\n🎉 ¡TODOS LOS TESTS PASARON!")
        print("="*60 + "\n")
        return 0
    else:
        print("\n⚠️ Algunos tests fallaron")
        print("="*60 + "\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
