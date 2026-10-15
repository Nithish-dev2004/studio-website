import SivagangaiSignBoardLanding from "@/components/brands/SivagangaiSignBoardLanding";
import { subBrands } from "@/data/site";
import { createMetadata } from "@/lib/metadata";

const brand = subBrands[3];

export const metadata = createMetadata({
  title: `${brand.name} | 3D LED Letters, ACP Cladding & Architectural Signages`,
  description:
    "Leading signboard manufacturer in Sivagangai & Madurai. Custom 3D acrylic LED channel letters, architectural ACP facades, brass nameplates, and neon flex displays.",
  path: "/brands/sign-board",
});

export default function SignBoardPage() {
  return <SivagangaiSignBoardLanding />;
}
