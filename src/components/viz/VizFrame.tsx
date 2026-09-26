import { Prose } from "../blocks/Inline";
import { FullscreenFigure } from "../ui/FullscreenFigure";
import { VizSlot } from "./VizSlot";

export function VizFrame({ section, id, title, caption }: { section: string; id: string; title: string; caption?: string }) {
  return (
    <FullscreenFigure
      icon="viz"
      title={title}
      badge="інтерактив"
      footer={
        caption && (
          <figcaption className="border-t border-separator px-5 py-3 text-label-2">
            <Prose md={caption} className="!text-[14px] !text-label-2" />
          </figcaption>
        )
      }
    >
      <VizSlot section={section} id={id} />
    </FullscreenFigure>
  );
}
