import {
  Users,
  CheckCircle,
  MapPin,
  ArrowUpRight,
} from "@phosphor-icons/react";

export interface YcCompanyData {
  id: number;
  ycId: number;
  name: string;
  slug: string;
  smallLogoThumbUrl: string | null;
  website: string | null;
  oneLiner: string | null;
  teamSize: number;
  batch: string;
  status: string;
  industries: string[];
  regions: string[];
  url: string;
  isHiring: boolean;
  topCompany?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function YcOssCard({ company }: { company: YcCompanyData }) {
  return (
    <a
      href={company.website || company.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-2 p-4 border border-border/60 rounded-none bg-card max-w-full font-geist transition-colors hover:border-foreground/20 hover:bg-accent/30"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-none border border-border/60 bg-background">
            {company.smallLogoThumbUrl ? (
              <img
                src={company.smallLogoThumbUrl}
                alt={company.name}
                className="size-12 rounded-none object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {company.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="block text-sm font-bold tracking-tight text-foreground line-clamp-1">
              {company.name}
            </span>
            <p className="text-xs leading-tight text-muted-foreground line-clamp-2">
              {company.oneLiner || "No description provided."}
            </p>
          </div>
        </div>
        <ArrowUpRight
          className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          weight="bold"
        />
      </div>

      <div className="flex h-5 w-full flex-nowrap items-center gap-2 overflow-hidden whitespace-nowrap">
        <span className="flex h-5 items-center gap-1 rounded-none border border-orange-500 bg-orange-500 px-2 text-[11px] text-white font-medium">
          {company.batch}
        </span>
        <span className="flex h-5 items-center rounded-none border border-border/60 bg-white px-2 text-[11px] text-black dark:bg-black dark:text-white">
          {company.status}
        </span>
        {company.isHiring && (
          <span className="flex h-5 items-center gap-1 rounded-none border border-green-500 bg-green-500 px-2 text-[11px] text-white font-medium">
            <CheckCircle className="size-3" weight="fill" />
            Hiring
          </span>
        )}
      </div>

      {company.industries.length > 0 && (
        <div className="flex h-5 w-full flex-nowrap items-center gap-2 overflow-hidden whitespace-nowrap">
          {company.industries.slice(0, 3).map((industry) => (
            <span
              key={industry}
              className="flex h-5 items-center rounded-none border border-border/60 bg-white px-2 text-[11px] text-black dark:bg-black dark:text-white"
            >
              {industry}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2">
        <span className="flex items-center gap-1" title="Team Size">
          <Users className="size-4" weight="fill" />
          {company.teamSize}
        </span>

        {company.regions.length > 0 && (
          <span className="flex items-center gap-1 ml-auto" title="Location">
            <MapPin className="size-4" weight="fill" />
            {company.regions[0]}
          </span>
        )}
      </div>
    </a>
  );
}
