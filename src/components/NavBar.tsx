import { Container } from "./container.tsx";
import { Button } from "./Button.tsx";
import { ThemeToggle } from "./ThemeToggle";
import { cva } from "class-variance-authority";
import { useTheme } from "./theme-provider";
import { useNavigate } from "react-router-dom";

const logoOSSVariants = cva("text-3xl font-serif-instrument", {
  variants: {
    theme: {
      light: "text-gray-900",
      dark: "text-white",
    },
  },
});

const logoURFVariants = cva("text-3xl font-serif-instrument", {
  variants: {
    theme: {
      light: "text-gray-600",
      dark: "text-neutral-500",
    },
  },
});

export function NavBar() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <Container>
      <div className="flex justify-between items-center border border-border border-dashed py-4 px-6 font-geist">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex cursor-pointer"
        >
          <span className={logoOSSVariants({ theme })}>OSS</span>
          <span className={logoURFVariants({ theme })}>URF</span>
        </button>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate("/login")}
          >
            LOGIN
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => navigate("/home")}
          >
            SignUp
          </Button>
        </div>
      </div>
    </Container>
  );
}
