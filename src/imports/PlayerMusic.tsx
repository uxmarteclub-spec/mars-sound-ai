import svgPaths from "./svg-1rskmayuh7";
import imgPlayerMusic from "figma:asset/a5fb4564c109688e9da55ace27c2a57ec585d299.png";

export default function PlayerMusic() {
  return (
    <div className="bg-[#1c1315] content-stretch flex gap-[229px] items-center px-[37px] py-[12px] relative size-full" data-name="player-music">
      <div aria-hidden="true" className="absolute border border-[#30292b] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex items-center relative shrink-0" data-name="card-music-player">
        <div className="pointer-events-none relative shrink-0 size-[64px]" data-name="card-destaque-creators">
          <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgPlayerMusic} />
          <div aria-hidden="true" className="absolute border border-[#30292b] border-solid inset-0" />
        </div>
        <div className="content-stretch flex flex-col items-start not-italic px-[18px] py-[12px] relative shrink-0 text-[#bababa] w-[142px]">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] overflow-hidden relative shrink-0 text-[16px] text-ellipsis w-full whitespace-nowrap">Bob brown</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.25] relative shrink-0 text-[12px] w-full">@bobbrown</p>
        </div>
        <button className="block cursor-pointer overflow-clip relative shrink-0 size-[24px]" data-name="fi-rr-heart">
          <div className="absolute inset-[7.99%_-0.02%_4.11%_-0.02%]" data-name="icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.0097 21.096">
              <path d={svgPaths.p3d899000} fill="var(--fill-0, #FF164C)" id="icon" style={{ fill: "color(display-p3 1.0000 0.0863 0.2980)", fillOpacity: "1" }} />
            </svg>
          </div>
        </button>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-[752px]" data-name="control-music-all">
        <div className="content-stretch flex gap-[29px] items-center relative shrink-0" data-name="controls-music">
          <div className="relative shrink-0 size-[33.553px]" data-name="Shuffle">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33.5534 33.5534">
              <g clipPath="url(#clip0_1_38)" id="Shuffle">
                <g id="Vector" />
                <path d={svgPaths.p5cd5200} fill="var(--fill-0, #A19A9B)" id="Vector_2" style={{ fill: "color(display-p3 0.6314 0.6039 0.6078)", fillOpacity: "1" }} />
              </g>
              <defs>
                <clipPath id="clip0_1_38">
                  <rect fill="white" height="33.5534" style={{ fill: "white", fillOpacity: "1" }} width="33.5534" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="relative shrink-0 size-[33.553px]" data-name="Skip previous">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33.5534 33.5534">
              <g clipPath="url(#clip0_1_46)" id="Skip previous">
                <g id="Vector" />
                <path d={svgPaths.p9da1b80} fill="var(--fill-0, #A19A9B)" id="Vector_2" style={{ fill: "color(display-p3 0.6314 0.6039 0.6078)", fillOpacity: "1" }} />
              </g>
              <defs>
                <clipPath id="clip0_1_46">
                  <rect fill="white" height="33.5534" style={{ fill: "white", fillOpacity: "1" }} width="33.5534" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="relative shrink-0 size-[43px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 43 43">
              <g id="Group 1">
                <rect fill="var(--fill-0, black)" height="42" id="Rectangle 7" stroke="var(--stroke-0, #30292B)" style={{ fill: "black", fillOpacity: "1", stroke: "color(display-p3 0.1877 0.1617 0.1669)", strokeOpacity: "1" }} width="42" x="0.5" y="0.5" />
                <path d={svgPaths.p352ddef0} fill="var(--fill-0, #FF164C)" id="Polygon 1" style={{ fill: "color(display-p3 1.0000 0.0863 0.2980)", fillOpacity: "1" }} />
              </g>
            </svg>
          </div>
          <div className="relative shrink-0 size-[33.553px]" data-name="Skip next">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33.5534 33.5534">
              <g clipPath="url(#clip0_1_32)" id="Skip next">
                <g id="Vector" />
                <path d={svgPaths.p251da300} fill="var(--fill-0, #A19A9B)" id="Vector_2" style={{ fill: "color(display-p3 0.6314 0.6039 0.6078)", fillOpacity: "1" }} />
              </g>
              <defs>
                <clipPath id="clip0_1_32">
                  <rect fill="white" height="33.5534" style={{ fill: "white", fillOpacity: "1" }} width="33.5534" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="relative shrink-0 size-[33.553px]" data-name="Repeat">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33.5534 33.5534">
              <g clipPath="url(#clip0_1_26)" id="Repeat">
                <g id="Vector" />
                <path d={svgPaths.pf5e8780} fill="var(--fill-0, #A19A9B)" id="Vector_2" style={{ fill: "color(display-p3 0.6314 0.6039 0.6078)", fillOpacity: "1" }} />
              </g>
              <defs>
                <clipPath id="clip0_1_26">
                  <rect fill="white" height="33.5534" style={{ fill: "white", fillOpacity: "1" }} width="33.5534" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        <div className="content-stretch flex gap-[14px] items-center relative shrink-0 w-full" data-name="barra-progresso">
          <p className="font-['Raleway:Regular',sans-serif] font-normal leading-[1.7] relative shrink-0 text-[#a19a9b] text-[13px] whitespace-nowrap">00:00</p>
          <div className="h-[4px] relative shrink-0 w-[657px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 657 4">
              <g id="Group 4">
                <path d="M657 0V4H0V0H657Z" fill="var(--fill-0, #5B4F51)" id="Vector 3 (Stroke)" style={{ fill: "color(display-p3 0.3569 0.3098 0.3176)", fillOpacity: "1" }} />
                <path d="M255 0V4H0V0H255Z" fill="var(--fill-0, #FF164C)" id="Vector 4 (Stroke)" style={{ fill: "color(display-p3 1.0000 0.0863 0.2980)", fillOpacity: "1" }} />
              </g>
            </svg>
          </div>
          <p className="font-['Raleway:Regular',sans-serif] font-normal leading-[1.7] relative shrink-0 text-[#a19a9b] text-[13px] whitespace-nowrap">06:32</p>
        </div>
      </div>
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="volume">
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="fi-rr-volume">
          <div className="absolute inset-[0.77%_0.02%_0.76%_0]" data-name="icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9952 23.6335">
              <g id="icon">
                <path d={svgPaths.p4c38800} fill="var(--fill-0, #5B4F51)" style={{ fill: "color(display-p3 0.3569 0.3098 0.3176)", fillOpacity: "1" }} />
                <path d={svgPaths.p52e380} fill="var(--fill-0, #5B4F51)" style={{ fill: "color(display-p3 0.3569 0.3098 0.3176)", fillOpacity: "1" }} />
                <path d={svgPaths.p2abb5600} fill="var(--fill-0, #5B4F51)" style={{ fill: "color(display-p3 0.3569 0.3098 0.3176)", fillOpacity: "1" }} />
              </g>
            </svg>
          </div>
        </div>
        <div className="h-[4px] relative shrink-0 w-[105px]">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 105 4">
            <g id="Group 4">
              <path d="M105 0V4H0V0H105Z" fill="var(--fill-0, #5B4F51)" id="Vector 3 (Stroke)" style={{ fill: "color(display-p3 0.3569 0.3098 0.3176)", fillOpacity: "1" }} />
              <path d="M40.7534 0V4H0V0H40.7534Z" fill="var(--fill-0, #FF164C)" id="Vector 4 (Stroke)" style={{ fill: "color(display-p3 1.0000 0.0863 0.2980)", fillOpacity: "1" }} />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}