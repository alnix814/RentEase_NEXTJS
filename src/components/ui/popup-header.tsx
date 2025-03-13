import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { AlignJustify, CircleUserRound } from "lucide-react";

export default function PopupHeader() {
  return (
    <Popover>
        <PopoverTrigger asChild>
            <button className="border rounded-3xl w-[95px] h-[49px] px-4 hover:shadow-md duration-200">
                <div className="flex gap-3 items-center justify-center">
                    <div><AlignJustify size={28}/></div>
                    <div><CircleUserRound size={30}/></div>
                </div>
            </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              hi
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              hi
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              hi
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              hi
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
