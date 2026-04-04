import logoImg from "@/assets/logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="VaaniScript logo" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold text-foreground">VaaniScript</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VaaniScript. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
