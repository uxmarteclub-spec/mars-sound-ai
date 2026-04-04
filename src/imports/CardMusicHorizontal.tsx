import svgPaths from "./svg-smzl7lgsqk";
import imgCardDestaqueCreators from "figma:asset/b6fa0d201f9ec64c5f0a983eee403861c850233c.png";

function Play() {
  return (
    <div className="content-stretch flex gap-[2px] items-end justify-center p-[8px] relative shrink-0 w-[42px]" data-name="play">
      <div className="bg-[#ff164c] h-[26px] shrink-0 w-[8px]" />
      <div className="bg-[#ff164c] h-[14px] shrink-0 w-[8px]" />
      <div className="bg-[#ff164c] h-[20px] shrink-0 w-[8px]" />
    </div>
  );
}

function CardDestaqueCreators() {
  return (
    <div className="pointer-events-none relative shrink-0 size-[64px]" data-name="card-destaque-creators">
      <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgCardDestaqueCreators} />
      <div aria-hidden="true" className="absolute border border-[#ff164c] border-solid inset-0" />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start not-italic px-[18px] py-[12px] relative shrink-0 text-[#bababa] w-[142px]">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] overflow-hidden relative shrink-0 text-[16px] text-ellipsis w-full whitespace-nowrap">Bob brown</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.25] relative shrink-0 text-[12px] w-full">@bobbrown</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center px-[12px] relative shrink-0">
      <Play />
      <CardDestaqueCreators />
      <Frame />
    </div>
  );
}

export default function CardMusicHorizontal() {
  return (
    <div className="content-stretch flex items-center justify-between pr-[12px] relative size-full" data-name="card-music-horizontal">
      <div aria-hidden="true" className="absolute border border-[#ff164c] border-solid inset-0 pointer-events-none" />
      <Frame1 />
      <button className="block cursor-pointer overflow-clip relative shrink-0 size-[24px]" data-name="fi-rr-heart">
        <div className="absolute inset-[7.99%_-0.02%_4.11%_-0.02%]" data-name="icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.0097 21.096">
            <path d={svgPaths.p3d899000} fill="var(--fill-0, #FF164C)" id="icon" style={{ fill: "color(display-p3 1.0000 0.0863 0.2980)", fillOpacity: "1" }} />
          </svg>
        </div>
      </button>
    </div>
  );
}