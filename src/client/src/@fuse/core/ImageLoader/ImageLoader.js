export default function ImageLoader({ children }) {
  return (
    <img
      height={200}
      srcSet={`${Server.SERVER_URL}/${
        params.row.photo
      }?${Date.now()}?h=200w=248&fit=crop&auto=format`}
      src={`${Server.SERVER_URL}/${
        params.row.photo
      }?${Date.now()}?h=200w=248&fit=crop&auto=format`}
      loading="lazy"
      onLoad={() => console.log(`${params.row._id} loaded`)}
    ></img>
  );
}
