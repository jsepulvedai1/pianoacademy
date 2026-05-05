REQUERIMIENTOS PROGRAMACIÓNREQUERIMIENTOS PROGRAMACIÓN 
Objetivo general
Necesito una plataforma web conectada a un sistema interno de gestión que me permita ordenar y centralizar toda la operación de la academia.
Hoy todo está distribuido en distintas planillas, y la idea es dejar de depender de eso para pasar a un sistema más sólido, más claro y que pueda crecer sin desordenarse.
Este sistema debería integrar, en un solo lugar:
captación de prospectos (leads)
seguimiento comercial y conversión
reservas y pre-reservas
administración de horarios
gestión de alumnos
control de packs de clases
asistencia y progreso
pagos y cobranza
automatizaciones
reportes
La idea no es solo ordenar, sino optimizar cómo funciona todo.
Alcance del proyecto
Esto se divide en dos partes que tienen que conversar entre sí, sí o sí:
A. Plataforma web (cara visible) B. Sistema interno (backoffice)
PLATAFORMA WEBPLATAFORMA WEB
Objetivo
La web no es solo informativa. Tiene que convertir. Debe guiar a la persona desde que llega, hasta que toma acción (contacto o reserva), y toda esa información tiene que pasar directo al sistema interno.
1. Home
propuesta clara (qué hacemos y por qué somos distintos)
explicación del método (no clases sueltas, sino proceso)
programas principales
ubicación (importante reforzar cercanía) MAPA
llamados a la acción claros
testimonios o validación
Redes Sociales (Para que puedan ver fotos y/o videos de clases y academia)
2. Landings por servicio
Piano niños
Piano adultos
Canto
Clases grupales
Clase de prueba (EN ALGUN MOMENTO SERAN MÁS OPCIONES)
Cada una debería tener:
problema del usuario
propuesta de solución
beneficios reales
cómo funciona
Invitación a agendar clase de prueba
3. Página de reserva / clase de prueba
formulario completo   	

Todo esto debe guardarse automáticamente en el sistema interno.
aceptación de reglamento (Check Box ‘’Acepta Términos y condiciones) REGLAMENTO INTERNO DE ALUMNOS PARA RECEPCIÓN - ACADEMIA DETACHÉ.pdf
conexión con sistema interno
opción de pago o contacto
Integraciones
WhatsApp (con mensaje prearmado)
seguimiento de campañas (UTM)
conexión directa con CRM
(LA CLASE DE PRUEBA SE DEJA CON PRE-RESERVA HASTA LAS 20:00, PASADO ESE PLAZO, SI NO PAGA SE LIBERA + CORREO DE LIBERACIÓN AUTOMÁTICO) IDEAL: Que además al final de toda la reserva salga la direccion para la cual se tomó la clase (Esto pensando que en algun momento podria existir otra sede)
4. Contacto
WhatsApp
correo
ubicación + mapa
5. Reglamento / Condiciones
SISTEMA INTERNO (BACKOFFICE)SISTEMA INTERNO (BACKOFFICE)
Objetivo
Tener todo en un solo lugar. Eliminar planillas y reducir el margen de error humano.
Módulos necesarios
CRM de prospectos
Reservas
Agenda y horarios
Base de alumnos
Packs / cursos
Asistencia y progreso (HORARIOS POR PROFESOR)
Pagos
Seguimiento / archivo
Reportes
Automatizaciones
Usuarios y permisos
PROSPECTOS
Funcionalidades:
ingreso automático desde la web
ingreso manual
pipeline de estados
notas
historial de contacto
filtros
Estados sugeridos:
Nuevo lead
Contactado
Seguimiento (Cuando ya se le envio mensaje)
Pre-reserva
Reserva confirmada
No concretado
Sin Respuesta
Lista de espera
Concretado
Automatizaciones:
cambios de estado automáticos
alertas por falta de seguimiento
control de vencimiento de pre-reservas
RESERVAS
creación de pre-reserva
asignación de horario y profesor
fecha de vencimiento
registro de pago
confirmación
liberación automática si no se concreta
paso a alumno activo   NO PUEDE EXISTIR DUPLICACIÓN DE HORARIOS
AGENDA Y HORARIOS
vista semanal 
vista por cada profesor
vista general (Semanal)
bloques fijos
control de disponibilidad
duplicación de semanas 
historial  (EN EL DOCS DE HORARIOS PUEDES VER UN EJEMPLO DE HORARIO, EN EL HORARIO QUE TENEMOS SE PUEDE VER LA SEMANA PASADA, LA ACTUAL Y LA SIGUIENTE. CADA VIERNES SE CREA UNA NUEVA SEMANA PARA QUE ALUMNOS PUEDAN TOMAR SUS CLASES RECUPERATIVAS O ROTATIVAS)
Estados de clase:



El sistema debe calcular automáticamente:
clases tomadas 
clases restantes 
avance del pack    BASE DE ALUMNOS
Cada alumno debe tener su ficha completa:
ID
nombre
RUT
edad
Fecha de cumpleaños
apoderado ( solo si aplica)
contacto de apoderado (solo si aplica)
profesor
instrumento
modalidad
estado
pack actual
progreso
fecha de inicio
observaciones
firma de reglamento
libros entregados (¿Cuales? )
Historial:
reservas
pagos
clases
cambios
notas

PACKS / CURSOS
creación de packs (4, 12, 24, 40)
asignación
descuento automático de clases
visualización de avance
control de vigencia
cierre de curso
PAGOS Y COBRANZA
registro de pagos
asociación a alumno/reserva
control de deuda
medio de pago
historial
planilla que avise a quien hay que llamar para darle el recordatorio
Automatizaciones:
recordatorios
alertas
confirmaciones
COMUNICACIONES Plantillas para:
respuesta inicial
envío de info
pre-reserva
recordatorio de pago
confirmación
seguimiento
liberación de cupo
Ideal: integración con WhatsApp y/o correo.
Comerciales
leads
conversión
origen
Operativos
ocupación
alumnos activos
reservas
Financieros
ingresos
deudas
ticket promedio
USUARIOS Y PERMISOS
Roles:
Administrador
Recepción / ventas
Profesor
Dirección
Cada uno con acceso según lo que realmente necesita.
REQUERIMIENTOS TÉCNICOS
El sistema debe ser:
rápido
estable
seguro
con respaldo de datos
con historial de cambios (Ojala saber QUIEN hizo el cambio)
escalable
Además:
panel de administración
documentación
código mantenible
sistema de backups
