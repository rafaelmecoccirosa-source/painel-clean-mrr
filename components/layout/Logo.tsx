import Link from "next/link";
import CleanPassLogo from "@/components/ui/CleanPassLogo";

interface LogoProps {
  inverted?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: 32, md: 36, lg: 44 };

export default function Logo({ inverted = false, size = "md" }: LogoProps) {
  return (
    <Link href="/" className="flex items-center group">
      <CleanPassLogo
        variant={inverted ? 'dark' : 'light'}
        size={sizeMap[size]}
        showWordmark={true}
        showTagline={false}
      />
    </Link>
  );
}
