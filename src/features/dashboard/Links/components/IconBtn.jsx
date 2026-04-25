import { useState } from "react";

function IconBtn({ onClick, disabled, title, bg, hbg, bc, children }) {
  const [h,setH] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:30,height:30,borderRadius:7,border:`1px solid ${bc}`,
        background:h&&!disabled?hbg:bg,cursor:disabled?"not-allowed":"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",
        opacity:disabled?.4:1,transition:"background .15s",flexShrink:0 }}>
      {children}
    </button>
  );
}

export default IconBtn;