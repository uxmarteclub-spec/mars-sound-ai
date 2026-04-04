import svgPaths from "./svg-fx57zp3ee2";

function Frame() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[615px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.5] not-italic relative shrink-0 text-[#ebe9e9] text-[24px] whitespace-nowrap">Criar playlist</p>
      <button className="block cursor-pointer overflow-clip relative shrink-0 size-[24px]" data-name="fi-rr-cross">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9996 23.9996">
          <path d={svgPaths.p2b31e200} fill="var(--fill-0, #EBE9E9)" id="icon" style={{ fill: "color(display-p3 0.9216 0.9137 0.9137)", fillOpacity: "1" }} />
        </svg>
      </button>
    </div>
  );
}

function Img() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[13px] h-full items-center justify-center min-h-px min-w-px relative" data-name="img">
      <div aria-hidden="true" className="absolute border border-[#30292b] border-solid inset-0 pointer-events-none" />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="fi-rr-picture">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g id="icon">
            <path d={svgPaths.p10ab0370} fill="var(--fill-0, #EBE9E9)" style={{ fill: "color(display-p3 0.9216 0.9137 0.9137)", fillOpacity: "1" }} />
            <path d={svgPaths.p17084a00} fill="var(--fill-0, #EBE9E9)" style={{ fill: "color(display-p3 0.9216 0.9137 0.9137)", fillOpacity: "1" }} />
          </g>
        </svg>
      </div>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] min-w-full not-italic relative shrink-0 text-[#f8f8f8] text-[16px] text-center w-[min-content]">Capa</p>
    </div>
  );
}

function InputName() {
  return (
    <div className="relative shrink-0 w-full" data-name="input-name">
      <div aria-hidden="true" className="absolute border border-[#30292b] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[24px] py-[8px] relative w-full">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic opacity-20 relative shrink-0 text-[#f8f8f8] text-[16px] whitespace-nowrap">Nome da playlist</p>
        </div>
      </div>
    </div>
  );
}

function Discription() {
  return (
    <div className="h-[77px] relative shrink-0 w-full" data-name="discription">
      <div aria-hidden="true" className="absolute border border-[#30292b] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex items-start px-[24px] py-[8px] relative size-full">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic opacity-20 relative shrink-0 text-[#f8f8f8] text-[16px] whitespace-nowrap">Descrição da playlist</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[477px]">
      <InputName />
      <Discription />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-[638px]">
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Img />
      </div>
      <Frame1 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[102px]">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#f8f8f8] text-[16px] text-center whitespace-nowrap">Pública</p>
      <button className="content-stretch cursor-pointer flex items-center pr-[18px] relative shrink-0" data-name="Swtich">
        <div className="bg-[#ff6387] h-[14px] mr-[-18px] rounded-[7px] shrink-0 w-[34px]" />
        <div className="absolute left-[16px] size-[18px] top-[-2px]">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <circle cx="9" cy="9" fill="var(--fill-0, #FF164C)" id="Ellipse 3" r="9" style={{ fill: "color(display-p3 1.0000 0.0863 0.2980)", fillOpacity: "1" }} />
          </svg>
        </div>
      </button>
    </div>
  );
}

function PlaylistPublica() {
  return (
    <div className="content-stretch flex flex-col gap-[11px] items-start justify-center relative shrink-0" data-name="Playlist-publica">
      <Frame3 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.25] not-italic relative shrink-0 text-[#bababa] text-[12px] whitespace-nowrap">Outros usuários poderão ver e ouvir</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[8px] relative shrink-0" data-name="btn-system">
        <div aria-hidden="true" className="absolute border border-[#ff164c] border-solid inset-0 pointer-events-none" />
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#f8f8f8] text-[16px] whitespace-nowrap">Cancelar</p>
      </div>
      <button className="bg-gradient-to-r content-stretch cursor-pointer flex from-[#ff164c] from-[57.214%] gap-[12px] items-center justify-center px-[16px] py-[8px] relative shrink-0 to-[#ea5858]" data-name="btn-system">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#f8f8f8] text-[16px] text-left whitespace-nowrap">Criar playlist</p>
      </button>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <PlaylistPublica />
      <Frame5 />
    </div>
  );
}

export default function ModalPlaylist() {
  return (
    <div className="bg-[#24191b] content-stretch flex flex-col gap-[24px] items-start justify-center p-[24px] relative size-full" data-name="modal-playlist">
      <div aria-hidden="true" className="absolute border border-[#30292b] border-solid inset-0 pointer-events-none" />
      <Frame />
      <div className="h-0 relative shrink-0 w-[639px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 639 1">
            <line id="Line 1" stroke="var(--stroke-0, #766C6E)" style={{ stroke: "color(display-p3 0.4627 0.4235 0.4314)", strokeOpacity: "1" }} x2="639" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame2 />
      <Frame4 />
    </div>
  );
}