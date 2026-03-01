export function Footer() {
  return (
    <footer className="bg-muted py-12 border-t">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-4">🎹 PianoAcademy</h3>
          <p className="text-sm text-muted-foreground">
            Formando músicos con pasión y excelencia desde 2010.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Academia</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Sobre Nosotros</a></li>
            <li><a href="#" className="hover:text-foreground">Profesores</a></li>
            <li><a href="#" className="hover:text-foreground">Clases</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Términos y Condiciones</a></li>
            <li><a href="#" className="hover:text-foreground">Política de Privacidad</a></li>
            <li><a href="#" className="hover:text-foreground">Política de Cancelación</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>contacto@pianoacademy.com</li>
            <li>+56 9 1234 5678</li>
            <li>Av. Música 123, Santiago</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-muted-foreground/10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} PianoAcademy. Todos los derechos reservados.
      </div>
    </footer>
  );
}
