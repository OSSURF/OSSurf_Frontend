import { Container } from "../../../components/container.tsx";
import Logo from "../../../components/Logo.tsx";
import { FluidGradientText } from "../../../components/fluid-gradient-text";

export function FooterSection() {
  return (
    <footer className="bg-background text-foreground font-geist flex flex-col">
      <Container className="border-x border-t border-dashed border-border w-full mb-0">
        {/* Top Section: Info & Find Us On */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-6 pt-12 pb-8">

          {/* Logo & Description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Logo className="size-6 text-foreground" />
              <span className="font-geist font-bold tracking-wider text-sm text-foreground uppercase">
                OSSurf
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-geist-mono max-w-xs leading-relaxed">
              Discover, track, and contribute to open source projects in seconds.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-2">
              {/* GitHub */}
              <a
                href="https://github.com/orgs/OSSURF"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:opacity-80 transition-opacity"
                title="GitHub"
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-[18px] h-[18px] fill-current"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/g-harsha-vardhan/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0077b5] hover:opacity-80 transition-opacity"
                title="LinkedIn"
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-[18px] h-[18px] fill-current"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Find Us On Column */}
          <div className="flex flex-col gap-2 md:items-end font-geist-mono">
            <span className="font-geist-mono text-xs text-muted-foreground uppercase tracking-widest font-semibold block mb-1">
              Find Us On
            </span>
            <div className="flex flex-col gap-2 md:items-end font-geist-mono text-[13px] text-muted-foreground">
              <a href="https://github.com/orgs/OSSURF" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/g-harsha-vardhan/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-border"></div>

        {/* Middle Row: Copyright & Status Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 px-6 gap-4">
          <p className="font-geist-mono text-[11px] text-muted-foreground tracking-wider">
            © 2026 • OSSURF INC.
          </p>

          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="font-geist-mono text-[11px] font-medium tracking-widest text-foreground/80">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>

      </Container>

      {/* Bottom Fluid Gradient text (Full Width) */}
      <div className="w-full h-44 md:h-72 border-t border-dashed border-border overflow-hidden mt-0">
        <FluidGradientText text="OSSURF" svgViewBoxHeight={260} svgViewBoxWidth={1000} />
      </div>
    </footer>
  );
}
