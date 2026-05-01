function Toggle({ on, onChange, disabled }) {
  return (
    <button onClick={() => !disabled && onChange(!on)} style={{
      width:44,height:24,borderRadius:12,border:"none",
      background:disabled?"#e5e7eb":on?"#0ea5e9":"#d1d5db",
      position:"relative",cursor:disabled?"not-allowed":"pointer",
      transition:"background .2s",flexShrink:0,opacity:disabled?.6:1,
    }}>
      <span style={{ position:"absolute",top:3,left:on?22:3,width:18,height:18,
        borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.18)" }}/>
    </button>
  );
}

export default Toggle;