import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-fill-tertiary text-label-secondary">
        <Icon name="magnifier" size={26} />
      </span>

      <h1 className="text-title-1 text-label">Not on the shelf</h1>
      <p className="mt-2 text-body text-label-secondary">
        That page or prompt does not exist. Private drafts live only in the browser that created them.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/browse" variant="filled" icon="magnifier">
          Browse prompts
        </ButtonLink>
        <ButtonLink href="/types" variant="gray">
          Prompt types
        </ButtonLink>
      </div>
    </div>
  );
}
