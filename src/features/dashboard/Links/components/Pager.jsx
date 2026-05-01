function Pager({ total, page, perPage, onChange }) {
  const pages = Math.max(1, Math.ceil(total/perPage));
  const s = active => ({
    width:32,height:32,borderRadius:6,fontWeight:600,fontSize:13,cursor:"pointer",
    border:`1px solid ${active?"#0077b7":"#d1d5db"}`,
    background:active?"#0077b7":"#fff",color:active?"#fff":"#374151",
    display:"flex",alignItems:"center",justifyContent:"center",
  });
  return (
    <div style={{ display:"flex",gap:5,justifyContent:"center" }}>
      <button style={{ ...s(false),opacity:page===1?.4:1 }} disabled={page===1} onClick={()=>onChange(1)}>«</button>
      {Array.from({length:pages},(_,i)=>i+1).map(n=>(
        <button key={n} style={s(n===page)} onClick={()=>onChange(n)}>{n}</button>
      ))}
      <button style={{ ...s(false),opacity:page===pages?.4:1 }} disabled={page===pages} onClick={()=>onChange(pages)}>»</button>
    </div>
  );
}

export default Pager;