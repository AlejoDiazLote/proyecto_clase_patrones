# 🔧 Fix: Eventos No Cargan (Actualización)

## Problema

Después de implementar `forkJoin` para sincronizar la carga de eventos e inscripciones, **los eventos dejaron de aparecer** en el catálogo.

## Causa Raíz

`forkJoin` tiene un comportamiento crítico:

```typescript
forkJoin({
  events: observable1,
  inscripciones: observable2,
});
```

**Regla de forkJoin**: Si CUALQUIER observable falla, TODO el `forkJoin` falla y el bloque `next` **nunca se ejecuta**.

En este caso:

- ✅ Endpoint `/events` funcionaba correctamente
- ❌ Endpoint `/inscripciones/usuario/:userId` podía fallar por:
  - Usuario sin inscripciones previas
  - Token expirado o inválido
  - Problemas de CORS
  - Backend no disponible temporalmente

**Resultado**: Pantalla en blanco, sin eventos, sin mensaje de error claro.

## Solución Implementada

Cambié de **cargas sincronizadas** (forkJoin) a **cargas independientes**:

### Código Anterior (con forkJoin):

```typescript
// ❌ PROBLEMA
ngOnInit(): void {
  this.authService.currentUser$.subscribe((user) => {
    if (user) {
      this.loadDataForUser(user.id);  // usa forkJoin
    }
  });
}

loadDataForUser(userId: string): void {
  forkJoin({
    events: this.eventsService.getAll(filters),
    inscripciones: this.registrationsService.getMisInscripciones(userId, { limit: 200 }),
  }).subscribe({
    next: ({ events, inscripciones }) => {
      // Si inscripciones falla, este bloque NUNCA se ejecuta
      this.events = events.data;  // ❌ No se ejecuta
    }
  });
}
```

### Código Nuevo (cargas independientes):

```typescript
// ✅ SOLUCIÓN
ngOnInit(): void {
  this.currentUser$ = this.authService.currentUser$;
  this.authService.currentUser$.subscribe((user) => {
    this.isLoggedIn = !!user;
    if (user) {
      this.loadEnrolled(user.id);  // ✅ Carga inscripciones en background
    } else {
      this.enrolledEventIds.clear();
      this.userRegistrationsMap.clear();
    }
  });
  // ✅ Cargar eventos SIEMPRE (independiente de usuario)
  this.loadEvents();
}

loadEnrolled(userId: string): void {
  this.registrationsService
    .getMisInscripciones(userId, { limit: 200 })
    .subscribe({
      next: (res) => {
        // Procesar inscripciones
        this.enrolledEventIds = new Set(...);
        // ✅ Forzar detección de cambios
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[EventsCatalog] Error cargando inscripciones:', err);
        // ✅ Fallar silenciosamente - los eventos ya se mostraron
      },
    });
}
```

## Ventajas de la Nueva Solución

| Aspecto                       | forkJoin                          | Cargas Independientes |
| ----------------------------- | --------------------------------- | --------------------- |
| **Eventos se cargan siempre** | ❌ No, si inscripciones falla     | ✅ Sí, siempre        |
| **Resiliencia a errores**     | ❌ Un error rompe todo            | ✅ Errores aislados   |
| **Experiencia de usuario**    | ❌ Todo o nada                    | ✅ Progresiva         |
| **Performance percibida**     | ⚠️ Espera a ambas                 | ✅ Eventos inmediatos |
| **Debugging**                 | ❌ Difícil identificar cuál falló | ✅ Logs separados     |

## Flujo Visual

### Con forkJoin (problema):

```
Usuario abre catálogo
  ↓
Carga eventos + inscripciones en paralelo
  ↓
Inscripciones falla ❌
  ↓
forkJoin entra a bloque error
  ↓
Pantalla en blanco 🚫
```

### Con cargas independientes (solución):

```
Usuario abre catálogo
  ↓
Carga eventos (independiente) ✅
Carga inscripciones (background) ⏳
  ↓
Eventos aparecen inmediatamente 🎉
  ↓
Inscripciones terminan de cargar ✅
  ↓
Badges "¡Ya inscrito!" aparecen 🏷️
```

## Cambios en el Código

### Archivos modificados:

- ✅ `/frontend/src/app/features/events/pages/events-catalog/events-catalog.component.ts`

### Cambios específicos:

1. ✅ Eliminado `forkJoin` de imports
2. ✅ Eliminado método `loadDataForUser()`
3. ✅ Restaurado método `loadEnrolled()` con `cdr.markForCheck()`
4. ✅ Modificado `ngOnInit()` para llamar a `loadEvents()` siempre
5. ✅ Añadido manejo de errores silencioso en `loadEnrolled()`

## Testing

### Caso 1: Usuario sin inscripciones

- ✅ Eventos se cargan correctamente
- ✅ Ningún badge "¡Ya inscrito!"
- ✅ Todos los botones "Inscribirme" visibles

### Caso 2: Usuario con inscripciones

- ✅ Eventos se cargan primero
- ✅ Badges aparecen 1-2 seg después
- ✅ Botones se ocultan donde corresponde

### Caso 3: Usuario no autenticado

- ✅ Eventos se cargan normalmente
- ✅ No intenta cargar inscripciones
- ✅ Solo muestra "Ver detalles"

### Caso 4: Backend de inscripciones caído

- ✅ Eventos se cargan igual
- ✅ Consola muestra error de inscripciones
- ✅ Usuario puede ver y explorar eventos

## Compilación

```bash
npm run build
# ✅ Application bundle generation complete. [8.050 seconds]
```

## Conclusión

La solución final es **más robusta y resiliente**:

- ✅ Eventos siempre se cargan
- ✅ Inscripciones son opcionales
- ✅ Mejor experiencia de usuario
- ✅ Más fácil de debugear
- ✅ Compatible con todos los casos de uso

**Lección aprendida**: `forkJoin` es útil cuando NECESITAS ambos resultados para continuar. En este caso, los eventos pueden mostrarse sin las inscripciones, así que cargas independientes es mejor.

---

**Desarrollado con ❤️ siguiendo las mejores prácticas de Angular 17 y RxJS**

_Última actualización: 3 de Junio, 2026 - 12:15 PM_
