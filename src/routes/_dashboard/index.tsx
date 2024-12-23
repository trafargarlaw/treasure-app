import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetHints } from "@/gen/endpoints/fastAPI";
import { Hint } from "@/gen/models";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Map,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_dashboard/")({
  component: Index,
});

function Index() {
  const [position, setPosition] = useState<{
    x: number | string | undefined;
    y: number | string | undefined;
  }>({
    x: undefined,
    y: undefined,
  });
  const [direction, setDirection] = useState<
    "up" | "down" | "left" | "right" | null
  >(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredHints, setFilteredHints] = useState<Hint[]>([]);

  const { mutateAsync, data, error, isPending } = useGetHints({
    mutation: {
      mutationKey: ["getHints", position.x, position.y, direction],
    },
  });

  const handleGetHints = async (
    newDirection: "up" | "down" | "left" | "right"
  ) => {
    if (position.x === undefined || position.y === undefined) return;
    setDirection(newDirection);
    setFilteredHints([]);

    const response = await mutateAsync({
      data: {
        x: Number(position.x),
        y: Number(position.y),
        direction: newDirection,
      },
    });

    if (!response.data) return;

    const closestHints = Object.values(
      response.data.reduce(
        (acc: Record<string, Hint & { distance: number }>, hint: Hint) => {
          if (position.x === undefined || position.y === undefined) return acc;

          const distance = Math.sqrt(
            Math.pow(hint.posX - Number(position.x), 2) +
              Math.pow(hint.posY - Number(position.y), 2)
          );

          if (!acc[hint.hint_fr] || acc[hint.hint_fr]?.distance > distance) {
            acc[hint.hint_fr] = { ...hint, distance };
          }
          return acc;
        },
        {}
      )
    );

    setFilteredHints(closestHints);
    setDirection(null);
  };

  const handleHintSelect = async (hint: Hint) => {
    const command = `/travel ${hint.posX},${hint.posY}`;
    await navigator.clipboard.writeText(command);

    setPosition({ x: hint.posX, y: hint.posY });
    setValue(hint.hint_fr);
    setOpen(false);
    toast.success("Commande copiée dans le presse-papiers");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100 p-4">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Position Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-emerald-600" />
                Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <div className="flex gap-2 items-center">
                  <Label>X</Label>
                  <div className="flex items-center">
                    <Input
                      value={position?.x}
                      onChange={(e) => {
                        setPosition({ ...position, x: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Y</Label>
                  <div className="flex items-center">
                    <Input
                      value={position?.y}
                      onChange={(e) => {
                        setPosition({ ...position, y: e.target.value });
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto mt-4">
                <div />
                <Button
                  variant="outline"
                  onClick={() => handleGetHints("up")}
                  className={direction === "up" ? "bg-emerald-200" : ""}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  onClick={() => handleGetHints("left")}
                  className={direction === "left" ? "bg-emerald-200" : ""}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Badge variant="secondary" className="place-self-center">
                  {isPending ? "Loading..." : "Ready"}
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => handleGetHints("right")}
                  className={direction === "right" ? "bg-emerald-200" : ""}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  onClick={() => handleGetHints("down")}
                  className={direction === "down" ? "bg-emerald-200" : ""}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <div />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Indice</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-[200px] justify-between"
                >
                  {data
                    ? data.data?.find((hint) => hint.hint_fr === value)?.hint_fr
                    : "Select hint..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command
              filter={(value, search) => {
                // Remove accents and special characters
                const normalizeStr = (str: string) => 
                  str.normalize("NFD")
                     .replace(/[\u0300-\u036f]/g, "")
                     .toLowerCase()
                     .replace(/\s+/g, "");

                const normalizedValue = normalizeStr(value);
                const normalizedSearch = normalizeStr(search);

                // Check if the normalized search is a subsequence of normalized value
                let j = 0;
                for (let i = 0; i < normalizedValue.length && j < normalizedSearch.length; i++) {
                  if (normalizedValue[i] === normalizedSearch[j]) {
                    j++;
                  }
                  }
                  return j === normalizedSearch.length ? 1 : 0;
                }}

                >
                  <CommandInput placeholder="Search hint..." />
                  <CommandList>
                    <CommandEmpty>No hint found.</CommandEmpty>
                    <CommandGroup>
                      {filteredHints.map((hint: Hint) => (
                        <CommandItem
                          key={hint.id}
                          value={hint.hint_fr}
                          onSelect={() => handleHintSelect(hint)}
                        >
                          {hint.hint_fr}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === hint.hint_fr
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              current position: {position.x} {position.y}
              <CopyButton value={`/travel ${position.x} ${position.y}`} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="text-red-500">
            Error loading hints:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        )}
      </div>
    </div>
  );
}
