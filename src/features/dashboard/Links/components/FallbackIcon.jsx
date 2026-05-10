function FallbackIcon({ url }) {
  return (
    <div style={{ width:40,height:40,borderRadius:8,background:"#e8f4fb",border:"1.5px solid #b8ddf0",
      display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#0077b7" }}>
      {url ? url.replace(/https?:\/\/(www\.)?/,"").charAt(0).toUpperCase() : "?"}
    </div>
  );
}

export default FallbackIcon;