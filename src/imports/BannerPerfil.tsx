import svgPaths from "./svg-opmzsyvo1j";
import imgFrame93 from "figma:asset/1ff0fd371e6317f8995f6626691775855756bce5.png";
import imgCardDestaqueCreators from "figma:asset/2b9669d4caae7e0131df172e452df996b054e84b.png";

function Frame2() {
  return (
    <div className="content-stretch flex items-start justify-end relative shrink-0 w-full">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="fi-rr-menu-dots-vertical">
        <div className="absolute inset-[0_41.67%]" data-name="icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.99999 23.9997">
            <g id="icon">
              <path d={svgPaths.p3e437000} fill="var(--fill-0, #766C6E)" style={{ fill: "color(display-p3 0.4627 0.4235 0.4314)", fillOpacity: "1" }} />
              <path d={svgPaths.p3c0f6500} fill="var(--fill-0, #766C6E)" style={{ fill: "color(display-p3 0.4627 0.4235 0.4314)", fillOpacity: "1" }} />
              <path d={svgPaths.p378d9170} fill="var(--fill-0, #766C6E)" style={{ fill: "color(display-p3 0.4627 0.4235 0.4314)", fillOpacity: "1" }} />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="h-[324px] mb-[-79px] relative shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFrame93} />
      <div className="flex flex-col items-end size-full">
        <div className="content-stretch flex flex-col items-end p-[32px] relative size-full">
          <Frame2 />
        </div>
      </div>
    </div>
  );
}

function CardDestaqueCreators() {
  return (
    <div className="pointer-events-none relative shrink-0 size-[200px]" data-name="card-destaque-creators">
      <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgCardDestaqueCreators} />
      <div aria-hidden="true" className="absolute border-2 border-[#ff164c] border-solid inset-0" />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.25] not-italic overflow-hidden relative shrink-0 text-[#bababa] text-[36px] text-ellipsis whitespace-nowrap">Renata creator</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full whitespace-nowrap">
      <p className="leading-[1.25] relative shrink-0 text-[12px]">@renata1234</p>
      <p className="leading-[0] relative shrink-0 text-[0px]">
        <span className="font-['Inter:Bold',sans-serif] font-bold leading-[1.25] text-[#ff164c] text-[12px]">433</span>
        <span className="leading-[1.25] text-[12px]">{` Seguidores`}</span>
      </p>
      <p className="leading-[0] relative shrink-0 text-[0px]">
        <span className="font-['Inter:Bold',sans-serif] font-bold leading-[1.25] text-[#ff164c] text-[12px]">121</span>
        <span className="leading-[1.25] text-[12px]">{` Seguindo`}</span>
      </p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[12px] items-start not-italic relative shrink-0 text-[#bababa] w-[277px]">
      <Frame6 />
      <p className="leading-[1.25] relative shrink-0 text-[12px] w-full">Gosto de músicas eletrônicos, clássica e jazz.</p>
    </div>
  );
}

function InfoPlaylist() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start py-[12px] relative shrink-0" data-name="info-playlist">
      <Frame />
      <Frame5 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[16px] items-end relative shrink-0">
      <CardDestaqueCreators />
      <InfoPlaylist />
    </div>
  );
}

function Frame4() {
  return (
    <div className="h-full relative shrink-0">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] h-full items-center pt-[32px] relative">
          <button className="bg-gradient-to-r content-stretch cursor-pointer flex from-[#ff164c] from-[57.214%] gap-[12px] items-center justify-center px-[16px] py-[8px] relative shrink-0 to-[#ea5858]" data-name="btn-system">
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#f8f8f8] text-[16px] text-left whitespace-nowrap">Seguir perfil</p>
          </button>
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[12px] relative shrink-0" data-name="btn-system">
            <div aria-hidden="true" className="absolute border border-[#ff164c] border-solid inset-0 pointer-events-none" />
            <div className="relative shrink-0 size-[16px]" data-name="fi-rr-share">
              <div className="absolute inset-[0_0_-0.01%_-0.11%]" data-name="icon">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.0184 16.0008">
                  <path d={svgPaths.p35d1f880} fill="var(--fill-0, #F8F8F8)" id="icon" style={{ fill: "color(display-p3 0.9725 0.9725 0.9725)", fillOpacity: "1" }} />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardPlaylistOpen() {
  return (
    <div className="mb-[-79px] relative shrink-0 w-full" data-name="card-playlist-open">
      <div className="flex flex-row items-end size-full">
        <div className="content-stretch flex items-end justify-between px-[32px] relative w-full">
          <Frame3 />
          <div className="flex flex-row items-end self-stretch">
            <Frame4 />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BannerPerfil() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[79px] relative size-full" data-name="banner-perfil">
      <Frame1 />
      <CardPlaylistOpen />
    </div>
  );
}