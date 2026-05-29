import { Container } from "../../../components/container.tsx";
import { Link } from "react-router-dom";
import { Button } from "../../../components/Button.tsx";
import { ThemeToggle } from "../../../components/ThemeToggle";

export function NavBarSection() {
  return (
    <Container>
      <div className="flex justify-between items-center border border-border border-dashed py-4 px-6 font-geist">
        <a href="#" className="flex">
          <span className="text-3xl font-serif-instrument text-foreground">OSS</span>
          <span className="text-3xl font-serif-instrument text-muted-foreground">URF</span>
        </a>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="primary" size="md">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
