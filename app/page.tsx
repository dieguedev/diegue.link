import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] justify-center items-center bg-[linear-gradient(to_right,#8080804D_1px,transparent_1px),linear-gradient(to_bottom,#80808090_1px,transparent_1px)] bg-[size:70px_70px]">
      <div className="flex flex-col gap-2 container mx-auto px-4">
        <Input type="text" placeholder="Introduce tu enlace a acortar" />
        <Button>Crear enlace</Button>
      </div>
    </main>

  );
}
